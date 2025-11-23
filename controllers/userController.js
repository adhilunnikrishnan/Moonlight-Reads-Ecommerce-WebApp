import { getBooksData } from "./booksController.js";
import { bannerData, publishersData } from "../data/index.js";
import { createUser } from "./userAuth.js";

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
    console.log(">>>>>arrvils",newArrivals)

    res.render("user/homePage", {
      title: "Home - Moonligth Reads",
      featuredBooks,
      newArrivals,
      comicBooks,
      mangaBooks,
      bannerData:bannerData,
      publishersData:publishersData
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

