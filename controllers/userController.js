import { getBooksData } from "./booksController.js";

export const homePage = async (req, res) => {
  console.log(">>>>>>>>>>>home page fuction called");
  try {
    const featuredBooks = await getBooksData({
      sort: "random",
      limit: 12,
    });
    console.log(">>>>>>>>featuredBooks", featuredBooks)
    const mangaBooks = await getBooksData({
      category: "manga",
      sort: "latest",
      limit: 10,
    });
    // console.log(">>>>>>>>>>>>manga",mangaBooks)
    const comicBooks = await getBooksData({
      category: "comics",
      sort: "latest",
      limit: 10,
    });
// console.log(">>>>comics",comicBooks)
    const newArrivals = await getBooksData({
      sort: "latest",
      limit: 15,
    });
    // console.log(">>>>>arrvils",newArrivals)

    res.render("user/homePage", {
      title: "Home - Moonligth Reads",
      featuredBooks,
      newArrivals,
      comicBooks,
      mangaBooks
    });
  } catch (error) {
    res.status(500).send("Error loading home page");
  }
};
