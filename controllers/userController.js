import { getBooksData } from "./booksController.js";
import { bannerData, publishersData } from "../data/index.js";
import { createUser } from "./userAuth.js";
import connectDB from "../config/db.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { v7 as uuidv7 } from "uuid";
import bcrypt from "bcrypt";
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

export const booksPage = async (req, res) => {
  // console.log(">>>>>>>>books page fuction called")
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
      books: booksWithStock, // HBS expects "products"
      user,
    });
  } catch (error) {
    console.error("❌ Error loading books page:", error);
    res.status(500).send("Error loading books page");
  }
};

export const loginPage = async (req, res) => {
  console.log("Login page route working 🚀");
  try {
    res.render("user/login", { title: "Login - Moonligth Reads" });
  } catch (error) {
    console.log("Login error:", error);
  }
};

export const signupPage = async (req, res) => {
  console.log("Signup page route working 🚀");
  try {
    createUser;
    res.render("user/signup", { title: "Signup - Moonligth Reads" });
  } catch (error) {
    console.log("Signup error:", error);
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

//clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.loggedInUser?.id;
    if (!userId) {
      return res.redirect("/login");
    }

    const db = await connectDB(process.env.DATABASE);

    // Clear the cart array
    await db
      .collection(collection.USERS_COLLECTION)
      .updateOne({ userId }, { $set: { cart: [] } });

    res.redirect("/cart"); // redirect back to landing page
  } catch (error) {
    // console.log("Error clearing cart:", error);
    res.status(500).send("Something went wrong while clearing the cart");
  }
};

//remove selected product from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.loggedInUser?.id;
    const { booksId } = req.params;

    if (!userId) {
      return res.redirect("/login");
    }

    const db = await connectDB(process.env.DATABASE);

    // Remove the item from the cart array
    await db
      .collection(collection.USERS_COLLECTION)
      .updateOne({ userId }, { $pull: { cart: { booksId: booksId } } });

    res.redirect("/cart"); // Redirect back to landing page
  } catch (error) {
    // console.log("Error removing item from cart:", error);
    res.status(500).send("Something went wrong");
  }
};


export const checkoutPage = async (req, res) => {
  console.log(">>>>called checkout function")
  try {
    const userId = req.loggedInUser?.id;
    if (!userId) {
      return res.redirect("/login");
    }

    const db = await connectDB(process.env.DATABASE);
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });

    const userCart = user.cart || [];
    const addresses = user.addresses || []; // ✅ Get saved addresses

    // Calculate total
    const total = userCart.reduce((acc, item) => acc + item.total, 0);

    res.render("user/checkoutPage", {
      title: "Checkout",
      userCart,
      total,
      addresses, // ✅ Pass to HBS
    });
  } catch (error) {
    // console.error(error);
    res.send("Something went wrong");
  }
};

/// checkout page addresss
export const createAddress = async (req, res) => {
  
  try {
    const userId = req.loggedInUser?.id;
    
    if (!userId) {
      return res.redirect("/login");
    }

    const { billingName, address, landmark, phone } = req.body;

    if (!billingName || !address || !phone) {
      // console.log("❌ Required fields missing");
      return res.status(400).send("All required fields must be filled");
    }

    const db = await connectDB(process.env.DATABASE);
    // console.log("✅ Database connected");

    // ✅ IMPORTANT: Match using userId instead of _id
    const result = await db.collection(collection.USERS_COLLECTION).updateOne(
      { userId: userId },
      {
        $push: {
          addresses: {
            billingName,
            address,
            landmark: landmark || "",
            phone,
            createdAt: new Date(),
          },
        },
      }
    );

    // console.log("Update Result:", {
    //   matched: result.matchedCount,
    //   modified: result.modifiedCount,
    // });

    if (result.modifiedCount === 0) {
      // console.log("⚠️ Address not added. Possible wrong userId match.");
      return res.status(500).send("Failed to add address");
    }

    // console.log("✅ Address added successfully. Redirecting...");
    res.redirect("/user/checkoutPage");
  } catch (error) {
    // console.error("🔥 Error creating address:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const placeOrder = async (req, res) => {

  
  try {
    const userId = req.loggedInUser?.id;
    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });


    if (!user) return res.status(404).send("User not found");

    const userCart = user.cart || [];
    if (userCart.length === 0) return res.redirect("/cart");

    // Handle address
    let orderAddress;
    if (user.addresses?.length && req.body.selectedAddress !== undefined) {
      const index = parseInt(req.body.selectedAddress);
      orderAddress = user.addresses[index];
    } else if (req.body.billingName && req.body.address && req.body.phone) {
      orderAddress = {
        billingName: req.body.billingName,
        address: req.body.address,
        landmark: req.body.landmark || "",
        phone: req.body.phone,
        createdAt: new Date(),
      };
      await db
        .collection(collection.USERS_COLLECTION)
        .updateOne({ userId }, { $push: { addresses: orderAddress } });
    } else {
      return res.status(400).send("Address details missing");
    }

    // ----- STOCK CHECK -----
      for (let item of userCart) {

      const product = await db
        .collection(collection.BOOKS_COLLECTION)
        .findOne({ booksId: item.booksId });

        console.log("???????? Product", product)

      if (!product) {
        return res
          .status(404)
          .send(`Product ${item.title} not found in database`);
      }

      if (product.stock === undefined || product.stock < item.quantity) {
        return res
          .status(400)
          .send(`Not enough stock for product: ${item.name}`);
      }
    }

    // ----- DEDUCT STOCK -----
    for (let item of userCart) {
      await db.collection(collection.BOOKS_COLLECTION).updateOne(
        { _id: new ObjectId(item._id) },
        { $inc: { stock: -item.quantity } } // decrement stock
      );
    }

    // ----- CREATE ORDER -----
    const order = {
      orderId: uuidv7(),
      userId,
      userCart,
      address: orderAddress,
      paymentMethod: req.body.payment_option,
      total: userCart.reduce((acc, item) => acc + item.total, 0),
      status: req.body.payment_option === "COD" ? "Pending" : "Paid",
      createdAt: new Date(),
    };


    const result = await db
      .collection(collection.ORDERS_COLLECTION)
      .insertOne(order);
    const orderId = result.insertedId;

    await db.collection(collection.USERS_COLLECTION).updateOne(
      { userId },
      { $push: { orders: orderId }, $set: { cart: [] } } // add order and clear cart
    );

    res.redirect("/order-success");
  } catch (error) {
    // console.error("🔥 Error placing order:", error);
    res.status(500).send("Something went wrong while placing the order.");
  }
};

export const orderSuccess = async (req, res) => {

  try {
    const userId = req.loggedInUser?.id;
    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    // Fetch the last order for this user
    const lastOrder = await db
      .collection(collection.ORDERS_COLLECTION)
      .findOne({ userId }, { sort: { createdAt: -1 } });

    if (!lastOrder) {
      // console.log("No order found for this user.");
      return res.redirect("/");
    }

    // Ensure each cart item has a total
    const cartWithTotal = lastOrder.userCart.map((item) => ({
      ...item,
      total: item.total || item.price * item.quantity,
    }));

    // Calculate total order amount
    const totalAmount = cartWithTotal.reduce(
      (acc, item) => acc + item.total,
      0
    );

    res.render("user/orderSuccess", {
      orderId: lastOrder._id,
      email: req.loggedInUser.email,
      billingName: lastOrder.address.billingName,
      address: lastOrder.address.address,
      landmark: lastOrder.address.landmark,
      phone: lastOrder.address.phone,
      userCart: cartWithTotal,
      total: totalAmount,
    });
  } catch (error) {
    // console.error("Error rendering order success page:", error);
    res
      .status(500)
      .send("Something went wrong while loading the order success page.");
  }
};

export const getOrderHistory = async (req, res) => {

  try {
    const userId = req.loggedInUser?.id;
    if (!userId) return res.redirect("/login");

    // Connect to database
    const db = await connectDB(process.env.DATABASE);

    // Fetch all orders for this user, newest first
    const orders = await db
      .collection(collection.ORDERS_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    if (!orders || orders.length === 0) {
      // console.log("No orders found for this user.");
      return res.render("user/order-history", { orders: [] });
    }

    // Format orders: add cart totals and full totalAmount per order
    const formattedOrders = orders.map((order) => {
      const cartWithTotal = order.userCart.map((item) => ({
        ...item,
        total: item.total || item.price * item.quantity,
      }));

      const totalAmount = cartWithTotal.reduce(
        (acc, item) => acc + item.total,
        0
      );

      return {
        ...order,
        userCart: cartWithTotal,
        totalAmount,
      };
    });

    // ✅ Render the correct view inside "views/user/order-history.hbs"
    res.render("user/order-history", { orders: formattedOrders });
  } catch (error) {
    // console.error("Error loading order history page:", error);
    res.status(500).send("Something went wrong while loading order history.");
  }
};

export const getAccount = async (req, res) => {
  try {
    const db = await connectDB(process.env.DATABASE);
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId: req.loggedInUser.id });

    res.render("user/account-details", {
      title: "Account Details",
      user, // send user data to prefill form
    });
  } catch (err) {
    // console.error(err);
    res.render("user/account-details", {
      title: "Account Details",
      error: "Failed to load account details.",
    });
  }
};

// POST update account
export const updateAccount = async (req, res) => {
  try {
    const { name, phone, dname, email, password, npassword, cpassword } =
      req.body;
    const userId = req.loggedInUser.id;

    const db = await connectDB(process.env.DATABASE);
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });
    // console.log(">>>>>>>>user",user)
    if (!user) {
      return res.render("user/account-details", {
        title: "Account Details",
        error: "User not found.",
      });
    }

    // ✅ Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.render("user/account-details", {
        title: "Account Details",
        error: "Current password is incorrect.",
        user,
      });
    }

    // ✅ Handle new password (optional)
    let hashedPassword = user.password;
    if (npassword || cpassword) {
      if (npassword !== cpassword) {
        return res.render("user/account-details", {
          title: "Account Details",
          error: "New password and confirm password do not match.",
          user,
        });
      }
      hashedPassword = await bcrypt.hash(npassword, 10);
    }

    // ✅ Update user details
    await db.collection(collection.USERS_COLLECTION).updateOne(
      { userId },
      {
        $set: { name, phone, dname, email, password: hashedPassword },
      }
    );

    const updatedUser = { ...user, name, phone, dname, email };
    res.render("user/account-details", {
      title: "Account Details",
      success: "Account updated successfully!",
      user: updatedUser,
    });

    console.log(updatedUser)

  } catch (err) {
    // console.error(err);
    res.render("user/account-details", {
      title: "Account Details",
      error: "Something went wrong. Please try again later.",
      user: req.body,
    });
  }
};

export const getWishlistPage = async (req, res) => {
  // console.log(">>>>>>wishlist page function called");
  try {
    const userId = req.loggedInUser?.id;
    console.log(">>>>>userId", userId);

    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });

    const wishlistItems = user?.wishlist || [];

    if (!wishlistItems.length)
      return res.render("user/wishlist", { wishlist: [] });

    // Extract booksIds as strings (UUIDs, not ObjectIds)
    const booksIds = wishlistItems.map((item) => item.booksId);

    // Query using string UUIDs instead of ObjectIds
    const products = await db
      .collection(collection.BOOKS_COLLECTION)
      .find({ booksId: { $in: booksIds } })
      .toArray();

    const wishlist = wishlistItems
      .map((item) => {
        const product = products.find(
          (p) => p.booksId === item.booksId // Compare as strings
        );
        if (!product) {
          console.log("⚠ Book deleted from DB:", item.booksId);
          return null;
        }

        return {
          booksId: item.booksId,
          title: product.title,
          publisher: product.publisher,
          price: product.discountPrice || product.price,
          image: product.images?.[0],
          shortDesc: product.shortDesc || "",
          inStock: product.stock > 0,
        };
      })
      .filter(Boolean);

    res.render("user/wishlist", { title: "Your Wishlist", wishlist });

  } catch (err) {
    console.error("❌ Wishlist Page Error:", err);
    res.redirect("/");
  }
};



export const addToWishlist = async (req, res) => {
  try {
    const userId = req.loggedInUser?.id;
    const { booksId } = req.body;

    if (!userId) return res.redirect("/login");

    const db = await connectDB(process.env.DATABASE);

    // Fetch user
    const user = await db
      .collection(collection.USERS_COLLECTION)
      .findOne({ userId });

    // Fetch book details
    const book = await db
      .collection(collection.BOOKS_COLLECTION)
      .findOne({ booksId });

    if (!book) return res.redirect("/wishlist");

    // Check if already exists
    const exists = user.wishlist?.find(
      (item) => item.booksId === booksId
    );


    if (!exists) {
      const wishlistItem = {
        booksId,
        title: book.title,
        shortDesc: book.shortDesc,
        price: Number(book.discountPrice || book.regularPrice),
        image: book.images?.[0] || "/img/default.png",
        publisher: book.publisher,
        addedAt: new Date(),
      };

      await db
        .collection(collection.USERS_COLLECTION)
        .updateOne(
          { userId },
          { $push: { wishlist: wishlistItem } }
        );
    }

    res.redirect("/wishlist");
  } catch (err) {
    console.log("Wishlist Error:", err);
    res.redirect("/wishlist");
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.loggedInUser?.id;
    console.log(">>>> userId:", userId);

    if (!userId) return res.redirect("/login");

    const { booksId } = req.body;
    if (!booksId) {
      console.log("❌ No booksId provided to removeFromWishlist");
      return res.redirect("/wishlist");
    }

    const db = await connectDB(process.env.DATABASE);

    const result = await db
      .collection(collection.USERS_COLLECTION)
      .updateOne(
        { userId },
        { $pull: { wishlist: { booksId: booksId } } }
      );

    if (result.modifiedCount === 0) {
      console.log("⚠ Book was not in wishlist:", booksId);
    }

    res.redirect("/wishlist");
  } catch (error) {
    console.log("❌ Error Removing Wishlist Item:", error);
    res.redirect("/wishlist");
  }
};










