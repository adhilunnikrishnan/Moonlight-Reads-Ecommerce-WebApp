import { v7 as uuidv7 } from "uuid";
import connectDB from "../config/db.js";
import collection from "../config/collection.js";
import { ObjectId } from "mongodb";
import {
  getDonutChartData,
  getYearlyStats,
  getLineChartData,
} from "../helpers/chartHelper.js";

export const adminLoginPage = async (req, res) => {
  res.render("admin/adminlogin", { layout: "admin", title: "Admin Login" });
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
    const db = await connectDB(process.env.DATABASE);
    const now = new Date();

    // 1️⃣ Get yearly statistics
    const stats = await getYearlyStats(db);

    // 2️⃣ Get donut chart data (past 12 months)
    const { labels: donutLabels, data: donutData } = await getDonutChartData(db);

// 3️⃣ Get line chart data
const { labels: lineChartLabels, mangaData, comicsData } = await getLineChartData(db);

    // Render dashboard
    res.render("admin/dashboard", {
      layout: "admin",
      title: "Admin Dashboard",
      stats: {
        totalRevenueThisYear: stats.totalRevenueThisYear.toFixed(2),
        deliveredOrdersThisYear: stats.deliveredOrdersThisYear,
        productsSoldThisYear: stats.productsSoldThisYear,
        totalUsersThisYear: stats.totalUsersThisYear,
      },
      donutLabels: JSON.stringify(donutLabels),
      donutData: JSON.stringify(donutData),
      lineChartLabels: JSON.stringify(lineChartLabels),
      mangaData: JSON.stringify(mangaData),
      comicsData: JSON.stringify(comicsData),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
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

export const usersListPage = async (req, res) => {
  // console.log("Admin UserstList route working 🚀");
  try {
    const db = await connectDB(process.env.DATABASE);

    let usersData = await db
      .collection(collection.USERS_COLLECTION)
      .find({})
      .toArray();

    // format createdAt before sending to HBS
    usersData = usersData.map((user) => {
      return {
        ...user,
        createdAtFormatted: new Date(user.createdAt).toLocaleDateString(
          "en-GB"
        ), // dd/mm/yyyy
      };
    });

    // console.log("userData:", usersData);

    res.render("admin/userList", {
      layout: "admin",
      title: "Admin - Users List",
      usersData,
    });
  } catch (error) {
    // console.error("Error fetching user data:", error);
    res.render("admin/userList", {
      layout: "admin",
      title: "Admin - UsersList",
      usersData: [],
    });
  }
};

export const blockUnblockUser = async (req, res) => {
  console.log("Block/Unblock User route working 🚀");
  // console.log(req.params.id);
  // console.log(req.query.status);
  try {
    const db = await connectDB(process.env.DATABASE);
    const userId = req.params.id; // user id from params
    const { status } = req.query; // status from query true/false

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const isBlock = status === "true"; // convert query string to boolean

    // Prepare update data (no blockedAt)
    const updateData = {
      isBlocked: isBlock,
      isActive: !isBlock,
      updatedAt: new Date(),
    };

    const result = await db
      .collection(collection.USERS_COLLECTION)
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // res.status(200).json({
    //   message: isBlock ? "User blocked successfully" : "User unblocked successfully",
    // });

    res.redirect("/admin/users-list");
  } catch (error) {
    console.error("Block/Unblock User Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const adminOrdersListPage = async (req, res) => {
  console.log("Admin OrdersList route working 🚀");
  try {
    const db = await connectDB(process.env.DATABASE);

    const ordersCollection = db.collection(collection.ORDERS_COLLECTION);
    const usersCollection = db.collection(collection.USERS_COLLECTION);

    // Fetch all orders sorted by newest
    const orders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Map orders to include totals and user email
    const ordersWithTotals = await Promise.all(
      orders.map(async (order) => {
        // Calculate totals for cart items
        const cartWithTotal = order.userCart.map((item) => ({
          ...item,
          total: item.total || item.price * item.quantity,
        }));
        const totalAmount = cartWithTotal.reduce(
          (acc, item) => acc + item.total,
          0
        );

        // Fetch email from users collection using string UUID
        let userEmail = "N/A";
        if (order.userId) {
          try {
            // Make sure this matches the field storing UUID in your users collection
            const user = await usersCollection.findOne({
              userId: order.userId,
            });
            if (user && user.email) userEmail = user.email;
          } catch (err) {
            // console.log("Error fetching user email for order:", order._id, err);
          }
        }

        return {
          ...order,
          userCart: cartWithTotal,
          totalAmount,
          userEmail, // now guaranteed to exist if user is found
        };
      })
    );

    // Render the admin orders list page
    res.render("admin/ordersList", {
      layout: "admin",
      title: "Admin - Orders List",
      orders: ordersWithTotals,
    });
  } catch (error) {
    // console.error("Error loading admin orders list:", error);
    res
      .status(500)
      .send("Something went wrong while loading orders for admin.");
  }
};

/*** */
export const updateOrderStatus = async (req, res) => {
  try {
    const db = await connectDB(process.env.DATABASE);
    const ordersCollection = db.collection(collection.ORDERS_COLLECTION);

    const orderId = req.params.id;
    const newStatus = req.params.status;

    // console.log("🆕 Updating order:", orderId, "➡️", newStatus);

    // Update order status
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    // Redirect back to orders list
    res.redirect("/admin/orders-list");
  } catch (error) {
    // console.error("❌ Error updating order status:", error);
    res.status(500).send("Failed to update order status.");
  }
};

export const adminOrderDetailsPage = async (req, res) => {
  // console.log("Admin Order Details route working 🚀");
  try {
    const db = await connectDB(process.env.DATABASE);

    const orderId = req.params.id;
    const ordersCollection = db.collection(collection.ORDERS_COLLECTION);
    const productsCollection = db.collection(collection.BOOKS_COLLECTION); // ✅ corrected key

    // Fetch the order by ID
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });
        // console.log("???????? order", order)


    if (!order) return res.status(404).send("Order not found");

    // Attach product details for each cart item
    const cartWithProductDetails = await Promise.all(
      order.userCart.map(async (item) => {
        const product = await productsCollection.findOne({ booksId: item.booksId
        });

        return {
          ...item,
          title: product?.title || "Unknown Book",
          publisher: product?.publisher  || "Unknown publisher",
          stock: product?.stock ?? "N/A",
          image: product.images?.[0] || "/assets/imgs/shop/default.jpg",
        };
      })
    );
        // console.log("???????? Product", cartWithProductDetails)


    // Calculate total amount
    const totalAmount = cartWithProductDetails.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Render the order details page
    res.render("admin/order-details", {
      layout: "admin",
      title: `Order Details - ${order._id}`,
      order,
      UserCart: cartWithProductDetails,
      totalAmount,
    });
  } catch (error) {
    console.error("Error loading admin order details:", error);
    res.status(500).send("Something went wrong loading order details.");
  }
};



