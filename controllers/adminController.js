import { v7 as uuidv7 } from "uuid";
import connectDB from "../config/db.js";
import collection from "../config/collection.js";

export const adminLoginPage = async (req, res) => {
  res.render("admin/adminLogin", { layout: "admin", title: "Admin Login" });
};

export const adminLogout = (req, res) => {
  try {
    // Clear the token cookie on logout
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Redirect back to login page
    return res.redirect("/admin");
  } catch (err) {
    // console.error("Logout Error:", err.message);
    return res.redirect("/admin");
  }
};

export const adminDashboardPage = async (req, res) => {

  try {
    // Render dashboard
    res.render("admin/dashboard", {
      layout: "admin",
      title: "Admin Dashboard",
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

export const addBookPage = async (req, res) => {
  try {
    // Render dashboard
    res.render("admin/addBook", {
      layout: "admin",
      title: "Admin - Add Book",
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

export const addBook = async (req, res) => {
  console.log(">>>>>>>>>>>>>>>>>add book function called", req.body);
  console.log(">>>>>>>>>>req.files",req.files)

  try {
    const {
      title,
      shortDesc,
      description,
      regularPrice,
      discountPrice,
      stock,
      rating,
      status,
      category,
      publisher,
      author,
    } = req.body;

    // Validation
    if (!title || !author || !regularPrice) {
      return res.render("admin/addBook", {
        layout: "admin",
        title: "Admin - Add Book",
        error: "Title, author and regular price are required.",
      });
    }

    // Convert numeric fields
    const numericRegular = Number(regularPrice);
    const numericDiscountPrice = discountPrice ? Number(discountPrice) : null;
    const numericStock = Number(stock);
    const numericRating = Number(rating);

     const pictures = req.files.map(
      (file) => `/userAssets/uploads/${file.filename}`
    );
    console.log("pictures>>>",pictures);

      const booksId = uuidv7()

    // Insert into DB
    const db = await connectDB();

    const result = await db
      .collection(collection.BOOKS_COLLECTION)
      .insertOne({
        booksId,
        title,
        shortDesc,
        description,
        regularPrice:numericRegular,
        discountPrice:numericDiscountPrice,
        stock: numericStock,
        rating: numericRating,
        status,
        category,
        publisher,
        author,
        images:pictures,
        createdAt: new Date(),
      });

    console.log("Inserted Book:", result.insertedId);

    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Add Book Error:", error);

    return res.render("admin/addBook", {
      layout: "admin",
      title: "Admin - Add Book",
      error: "Something went wrong while adding the book.",
    });
  }
};

export const bookListPage = async (req, res) => {
  try {
    const db = await connectDB()

    const allBooksData = await db.collection(collection.BOOKS_COLLECTION).find({}).toArray()
    // console.log(">>>>>>>>>>>>>>allBooksData", allBooksData)
    // Render dashboard 
    res.render("admin/bookslist", {
      layout: "admin",
      title: "Admin - Book List",
      booksData:allBooksData
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

