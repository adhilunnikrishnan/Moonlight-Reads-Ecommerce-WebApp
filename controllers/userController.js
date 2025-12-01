import { getBooksData } from "./booksController.js";
import { bannerData, publishersData } from "../data/index.js";
import { createUser } from "./userAuth.js";
import connectDB from "../config/db.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import collection from "../config/collection.js";

export const homePage = async (req, res) => {
  console.log(">>>>>>>>>>>home page fuction called");
  try {
    const featuredBooks = await getBooksData({
      sort: "random",
      limit: 12,
    });
    // console.log(">>>>>>>>featuredBooks", featuredBooks)
    const mangaBooks = await getBooksData({
      category: "Manga",
      sort: "latest",
      limit: 10,
    });
    // console.log(">>>>>>>>mangaBooks ", mangaBooks)
    // console.log(">>>>>>>>>>>>manga",mangaBooks)
    const comicBooks = await getBooksData({
      category: "Comics",
      sort: "latest",
      limit: 10,
    });
    // console.log(">>>>>>>>comicBooks ", comicBooks)
    // console.log(">>>>comics",comicBooks)
    const newArrivals = await getBooksData({
      sort: "latest",
      limit: 15,
    });
    // console.log(">>>>>arrvils", newArrivals);

    let user = null;
    const token = req.cookies?.token;
    // console.log(token)
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.log("Invalid JWT:", err.message);
        user = null;
      }
    }
    console.log(user);

    res.render("user/homePage", {
      title: "Home - Moonligth Reads",
      featuredBooks,
      newArrivals,
      comicBooks,
      mangaBooks,
      bannerData: bannerData,
      publishersData: publishersData,
      user,
    });
  } catch (error) {
    res.status(500).send("Error loading home page");
  }
};

export const booksPage = async (req, res) => {
  try {
    // Get logged-in user from JWT
    let user = null;
    const token = req.cookies?.token;

    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        user = null;
      }
    }

    // Fetch latest 20 books
    const books = await getBooksData({
      sort: "latest",
      limit: 20,
    });

    // Add stock status for each book
    const booksWithStock = books.map((book) => ({
      ...book,
      stockStatus: getStockStatus(book.stock), // book.stock is a STRING → handled below
    }));

    // Render the UI
    res.render("user/books", {
      title: "Books List",
      products: booksWithStock, // HBS expects "products"
      user,
    });
  } catch (error) {
    console.error("❌ Error loading books page:", error);
    res.status(500).send("Error loading books page");
  }
};

const getStockStatus = (product) => {
  const stock = parseInt(product.stock, 10); // ensure number

  if (stock > 20) {
    return `🟢 Available (${stock})`;
  } else if (stock > 0 && stock <= 20) {
    return `🟠 Hurry up! Only ${stock} left`;
  } else {
    return `🔴 Currently unavailable`;
  }
};

export const loginPage = async (req, res) => {
  // console.log("Login page route working 🚀");
  try {
    res.render("user/login", { title: "Login - Moonligth Reads" });
  } catch (error) {
    // console.log(error);
  }
};

export const signupPage = async (req, res) => {
  try {
    createUser;
    res.render("user/signup", { title: "Signup - Moonligth Reads" });
  } catch (error) {
    // console.log(error);
  }
};

export const cartPage = async (req, res) => {
  // console.log(">>>>>>>>>>cartpage");
  try {
    const userId = req.loggedInUser?.id; // FIXED
    // console.log(">>>>userId",userId)
    const db = await connectDB(process.env.DATABASE);

    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId }); // FIXED
    // console.log(">>>user",user)

    const userCart = user?.cart || [];
    // console.log(">>>>usercart",userCart)

    const subtotal = userCart.reduce((acc, item) => acc + item.total, 0);

    res.render("user/cart", {
      title: "Your Cart",
      userCart,
      subtotal,
    });
  } catch (error) {
    res.send("Something went wrong",error);
    console.log(error)
  }
};

//add cart
export const addToCart = async (req, res) => {
  // console.log(">>>> add to cart function called", req.body);

  try {
    const userId = req.loggedInUser?.id;
    const { booksId } = req.body;

    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    // Fetch user
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });

    if (!user) return res.redirect("/login");

    // Ensure cart array exists
    if (!user.cart) user.cart = [];

    // Fetch the book using booksId (NOT _id)
    const product = await db
      .collection(collection.BOOKS_COLLECTION)
      .findOne({ booksId });

    if (!product) return res.redirect("back");

    const stock = Number(product.stock);
    const price = Number(product.discountPrice || product.regularPrice);

    // Check existing item
    const existingItem = user.cart.find((item) => item.booksId === booksId);

    const currentQty = existingItem ? existingItem.quantity : 0;

    // Prevent adding more than stock
    if (currentQty + 1 > stock) {
      return res.redirect(`/bookDetails?booksId=${booksId}&error=Out of stock`);
    }

    if (existingItem) {
      // Update quantity
      await db.collection(collection.USERS_COLLECTION).updateOne(
        { userId, "cart.booksId": booksId },
        {
          $inc: {
            "cart.$.quantity": 1,
            "cart.$.total": price,
          },
        }
      );
    } else {
      // Create new cart item
      const newItem = {
        booksId,
        title: product.title,
        price,
        quantity: 1,
        image: product.images?.[0] || "/img/default.png",
        total: price,
        addedAt: new Date(),
      };

      await db
        .collection(collection.USERS_COLLECTION)
        .updateOne({ userId }, { $push: { cart: newItem } });
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.redirect("/cart");
  }
};
