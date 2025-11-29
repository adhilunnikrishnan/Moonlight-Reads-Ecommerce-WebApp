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
    console.log(token)
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.log("Invalid JWT:", err.message);
        user = null;
      }
    }
    console.log(user)

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
  try {
    const userId = req.loggedInUser?.userId; // FIXED

    const db = await connectDB(process.env.DATABASE);

    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId }); // FIXED

    const cart = user?.cart || [];

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

    res.render("user/cart", {
      title: "Your Cart",
      cart,
      subtotal,
    });
  } catch (error) {
    res.send("Something went wrong");
  }
};

//add cart
export const addToCart = async (req, res) => {
  console.log(">>>> add to cart function called", req.body);

  try {
    const userId = req.loggedInUser?.id;
    const { booksId } = req.body; // changed from productId

    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    // Find user
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });

    // Find book using booksId (NOT _id)
    const product = await db
      .collection(collection.BOOKS_COLLECTION)
      .findOne({ booksId });

    if (!product) return res.redirect("back");

    // Convert string price → number
    const price = Number(product.discountPrice || product.regularPrice);

    // Check if item already in cart
    const existingItem = user.cart?.find(
      (item) => item.booksId === booksId
    );

    if (existingItem) {
      // Increase quantity
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
      // Add new item to cart
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
        .updateOne(
          { userId },
          { $push: { cart: newItem } }
        );
    }

    res.redirect("/cart");
  } catch (error) {
    console.log("Add to Cart Error:", error);
    res.redirect("/cart");
  }
};
