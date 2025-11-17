import { ObjectId } from "mongodb";
import collection from "../config/collection.js";
import connectDB from "../config/db.js";

export const editBookDetailsPage = async (req, res) => {
  console.log(">>>>>>>>>>>detailofBook");
  try {
    const bookId = req.params.id;
    // Render dashboard
    const db = await connectDB();

    const bookData = await db
      .collection(collection.BOOKS_COLLECTION)
      .findOne({ _id: new ObjectId(String(bookId)) });
    console.log(bookData);

    res.render("admin/bookDetailsEdit", {
      layout: "admin",
      title: "Admin - Edit Books Details",
      bookDetails: bookData,
    });
  } catch (error) {
    // console.error("Error loading admin dashboard:", error);
    res.status(500).send("Something went wrong loading the dashboard.");
  }
};

// export const editBookDetails = async (req, res) => {
//   console.log(">>>>>>>>>>>editBookDetails", req.body);
//   try {
//     const db = await db.collection(collection.BOOKS_COLLECTION).find
//   } catch (error) {}
// };

// UPDATE BOOK DETAILS
export const editBookDetails = async (req, res) => {
  try {
    const bookId = req.params.id;
    const updatedData = req.body;

    const db = await connectDB();

    await db
      .collection(collection.BOOKS_COLLECTION)
      .updateOne({ _id: new ObjectId(bookId) }, { $set: updatedData });

    res.redirect("/admin/books/list"); // redirect back to listing page
  } catch (error) {
    console.log("Edit book error:", error);
    res.status(500).send("Failed to update the book details.");
  }
};

export const deleteBook = async (req, res) => {
  console.log(">>>>>>>>>>>>deletebookFuntionCalled")

  try {
    const bookId = req.params.id;
console.log(bookId)
    const db = await connectDB();

    await db
      .collection(collection.BOOKS_COLLECTION)
      .deleteOne({ _id: new ObjectId(bookId) });

    res.redirect("/admin/books/list");
  } catch (error) {
    console.log("Delete book error:", error);
    res.status(500).send("Failed to delete the book.");
  }
};
