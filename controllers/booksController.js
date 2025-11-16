import { ObjectId } from "mongodb";
import collection from "../config/collection.js";
import connectDB from "../config/db.js";

export const editBookDetailsPage = async (req, res) => {
  console.log(">>>>>>>>>>>detailofBook");
  try {
      const bookId = req.params.id; 
    // Render dashboard
    const db = await connectDB()

    const bookData = await db.collection(collection.BOOKS_COLLECTION).findOne({_id: new ObjectId(String(bookId))})
    console.log(bookData)

    res.render("admin/bookDetailsEdit", {
      layout: "admin",
      title: "Admin - Edit Books Details",
      bookDetails:bookData
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

export const editBookDetails = async (req, res) => {
  console.log(">>>>>>>>>>>editBookDetails", req.body);
  try {
  } catch (error) {}
};
