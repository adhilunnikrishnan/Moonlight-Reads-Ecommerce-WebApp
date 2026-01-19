import { ObjectId } from "mongodb";
import collection from "../config/collection.js";
import connectDB from "../config/db.js";
import { getStockStatus } from "../helpers/productHelper.js";

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
  console.log(">>>>>>>>>>>>deletebookFuntionCalled");

  try {
    const bookId = req.params.id;
    console.log(bookId);
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

/**
 * Fetch books from the database with optional filters, sorting, and limit
 * @param {Object} options - Options for fetching books
 * @param {string} [options.category] - Filter by category (e.g. "men", "women")
 * @param {string} [options.publisher] - Filter by publisher (e.g. "Rolex")
 * @param {string} [options.sort] - Sort type ("latest", "oldest", "random")
 * @param {number} [options.limit] - Max number of books to return
 * @returns {Promise<Array>} - Array of books
 */

export const getBooksData = async (options = {}) => {
  try {
    const db = await connectDB();

    // Build filter dynamically
    const filter = {};
    if (options.category) filter.category = options.category;
    if (options.publisher) filter.publisher = options.publisher;
    if (options.excludeId) filter._id = { $ne: new ObjectId(options.excludeId) };

    let books;

    // If sort = random → use aggregation to return random books
    if (options.sort === "random") {
      books = await db
        .collection(collection.BOOKS_COLLECTION)
        .aggregate([
          { $match: filter },
          { $sample: { size: options.limit || 20 } },
        ])
        .toArray();
    } else {
      let sortOption = { createdAt: -1 };
      if (options.sort === "oldest") sortOption = { createdAt: 1 };

      let query = db
        .collection(collection.BOOKS_COLLECTION)
        .find(filter)
        .sort(sortOption);

      if (options.limit) {
        query = query.limit(parseInt(options.limit));
      }

      books = await query.toArray();
    }

    return books;
  } catch (error) {
    throw error;
  }
};

export const bookViewPage = async (req, res) => {
  try {
    console.log(">>>>>>>bookview");

    const db = await connectDB(process.env.DATABASE);

    const bookId = req.query.id;

    if (!bookId) {
      return res.status(400).send("Book ID is required");
    }

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).send("Invalid Book ID");
    }

    const book = await db
      .collection(collection.BOOKS_COLLECTION)
      .findOne({ _id: new ObjectId(bookId) });

    if (!book) {
      return res.status(404).send("Book not found");
    }

    // Main product stock status
    book.stockStatus = getStockStatus(book.stock);

    const relatedProducts = await getBooksData({
      sort: "random",
      category: book.category,
      excludeId: bookId,
      limit: 4,
    });

    // Related products stock status
    const updatedRelatedProducts = relatedProducts.map((product) => ({
      ...product,
      stockStatus: getStockStatus(product.stock),
    }));

    return res.render("user/bookViewPage", {
      title: book.title,
      book,
      stockStatus: book.stockStatus,
      relatedBooks: updatedRelatedProducts,
    });
  } catch (error) {
    console.log("❌ Error in bookViewPage:", error);
    return res.status(500).send("Server error");
  }
};
