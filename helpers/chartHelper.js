import { ObjectId } from "mongodb";
import collection from "../config/collection.js";
import connectDB from "../config/db.js";

/* ----------------------------------------------------
   DONUT CHART → Order status counts (THIS MONTH)
---------------------------------------------------- */
export const getDonutChartData = async (db, startOfMonth, now) => {
  const statusData = await db
    .collection(collection.ORDERS_COLLECTION)
    .aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: now } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  return {
    labels: statusData.map((item) => item._id),   // status names
    data: statusData.map((item) => item.count),   // counts
  };
};


/* ----------------------------------------------------
   LINE CHART → Manga vs Fiction orders for 30 Days
---------------------------------------------------- */
export const getLineChartData = async (db, now) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Create last 30 days array
  const last30Days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("default", { month: "short" });
    last30Days.push(`${day}/${month}`);
  }

  const dailyOrders = await db
    .collection(collection.ORDERS_COLLECTION)
    .aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo, $lte: now } } },
      { $unwind: "$cart" },
      {
        $addFields: {
          booksId: {
            $cond: {
              if: { $eq: [{ $type: "$cart.booksId" }, "string"] },
              then: { $toObjectId: "$cart.booksId" },
              else: "$cart.booksId",
            },
          },
        },
      },
      {
        $lookup: {
          from: collection.BOOKS_COLLECTION,
          localField: "booksId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            orderId: "$_id",
            date: {
              $dateToString: {
                format: "%d/%b",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },
          categories: { $addToSet: "$productDetails.category" },
        },
      },
      { $unwind: "$categories" },
      {
        $group: {
          _id: {
            date: "$_id.date",
            category: "$categories",
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ])
    .toArray();

  const mangaData = last30Days.map((day) => {
    const d = dailyOrders.find(
      (x) => x._id.date === day && x._id.category.toLowerCase() === "manga"
    );
    return d ? d.orderCount : 0;
  });

  const fictionData = last30Days.map((day) => {
    const d = dailyOrders.find(
      (x) => x._id.date === day && x._id.category.toLowerCase() === "fiction"
    );
    return d ? d.orderCount : 0;
  });

  return {
    last30Days,
    mangaData,
    fictionData,
  };
};
