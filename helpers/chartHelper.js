import collection from "../config/collection.js";
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

/**
 * Get donut chart data for order statuses over the past 12 months
 * @param {Object} db - Database connection
 * @returns {Object} - { labels: [], data: [] }
 */
export const getDonutChartData = async (db) => {
  try {
    const now = new Date();
    const past12Months = new Date(now);
    past12Months.setMonth(now.getMonth() - 12);
    past12Months.setHours(0, 0, 0, 0);

    const statusData = await db
      .collection(collection.ORDERS_COLLECTION)
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: past12Months,
              $lte: now,
            },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, // Sort by count descending
      ])
      .toArray();

    const labels = statusData.map((item) => item._id);
    const data = statusData.map((item) => item.count);

    return { labels, data };
  } catch (error) {
    console.error("Error in getDonutChartData:", error);
    return { labels: [], data: [] };
  }
};

/**
 * Get yearly statistics for the dashboard
 * @param {Object} db - Database connection
 * @returns {Object} - Yearly stats
 */
export const getYearlyStats = async (db) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    // Delivered orders count
    const deliveredOrdersThisYear = await db
      .collection(collection.ORDERS_COLLECTION)
      .countDocuments({
        status: "Delivered",
        createdAt: { $gte: startOfYear, $lte: now },
      });

    // Total revenue
    const revenueDataYear = await db
      .collection(collection.ORDERS_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: { $gte: startOfYear, $lte: now },
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ])
      .toArray();

    const totalRevenueThisYear = revenueDataYear[0]?.totalRevenue || 0;

    // Products sold
    const productsSoldYear = await db
      .collection(collection.ORDERS_COLLECTION)
      .aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: { $gte: startOfYear, $lte: now },
          },
        },
        { $unwind: "$userCart" },
        { $group: { _id: null, totalSold: { $sum: "$userCart.quantity" } } },
      ])
      .toArray();

    const productsSoldThisYear = productsSoldYear[0]?.totalSold || 0;

    // Unique users
    const totalUsersThisYearArray = await db
      .collection(collection.ORDERS_COLLECTION)
      .distinct("userId", {
        createdAt: { $gte: startOfYear, $lte: now },
      });
    const totalUsersThisYear = totalUsersThisYearArray.length;

    return {
      deliveredOrdersThisYear,
      totalRevenueThisYear,
      productsSoldThisYear,
      totalUsersThisYear,
    };
  } catch (error) {
    console.error("Error in getYearlyStats:", error);
    return {
      deliveredOrdersThisYear: 0,
      totalRevenueThisYear: 0,
      productsSoldThisYear: 0,
      totalUsersThisYear: 0,
    };
  }
};

/**
 * Get line chart data for manga and comics orders (placeholder for now)
 * @param {Object} db - Database connection
 * @param {Date} now - Current date
 * @returns {Object} - { mangaData: [], comicsData: [] }
 */
export const getLineChartData = async (db) => {
  try {
    const now = new Date();
    
    // Calculate the start date (12 months ago from today)
    const past12Months = new Date(now);
    past12Months.setMonth(now.getMonth() - 12);
    past12Months.setHours(0, 0, 0, 0);

    console.log("Past 12 months start >>>>", past12Months);
    console.log("Current date (end) >>>>", now);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: past12Months, $lte: now },
        },
      },
      { $unwind: "$userCart" },
      {
        $lookup: {
          from: "books",
          localField: "userCart.booksId",
          foreignField: "booksId",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            category: "$productInfo.category",
          },
          totalQuantity: { $sum: "$userCart.quantity" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ];

    const results = await db
      .collection(collection.ORDERS_COLLECTION)
      .aggregate(pipeline)
      .toArray();

    console.log("Line chart results>>>>>", results);

    // Generate labels for the past 12 months
    const labels = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Create array of the last 12 months with year-month format
    const monthsData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      
      labels.push(`${monthNames[date.getMonth()]} ${year}`);
      monthsData.push({ year, month });
    }

    // Initialize data arrays with zeros
    const mangaData = Array(12).fill(0);
    const comicsData = Array(12).fill(0);

    // Fill in the actual data
    results.forEach((r) => {
      // Find the index in our 12-month array
      const index = monthsData.findIndex(
        (m) => m.year === r._id.year && m.month === r._id.month
      );

      if (index !== -1) {
        if (r._id.category === "Manga") {
          mangaData[index] = r.totalQuantity;
        }
        if (r._id.category === "Comics") {
          comicsData[index] = r.totalQuantity;
        }
      }
    });

    return { 
      labels,
      mangaData, 
      comicsData 
    };
  } catch (error) {
    console.error("Error in getLineChartData:", error);
    return { 
      labels: [],
      mangaData: [], 
      comicsData: [] 
    };
  }
};
