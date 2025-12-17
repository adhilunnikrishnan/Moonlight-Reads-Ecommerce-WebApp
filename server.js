import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { verifyUser } from "./middleware/verifyUser.js";

/* =======================
   BASIC CONFIG
======================= */
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MIDDLEWARES
======================= */
app.use(cookieParser());

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

app.use(cors());

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/* =======================
   STATIC FILES
======================= */
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(
  "/adminAssets",
  express.static(path.join(__dirname, "public/adminAssets"))
);
app.use(
  "/userAssets",
  express.static(path.join(__dirname, "public/userAssets"))
);

/* =======================
   VIEW ENGINE (MUST BE BEFORE ROUTES)
======================= */
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "user",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      upper: (str) => str?.toUpperCase(),
      json: (context) => JSON.stringify(context),
      eq: (a, b) => a === b,
      or: (a, b) => a || b,
      formatDate: (timestamp) =>
        new Date(timestamp).toLocaleDateString("en-GB"),
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

/* =======================
   USER AUTH MIDDLEWARE
======================= */
app.use((req, res, next) => {
  // Skip admin routes
  if (req.originalUrl.startsWith("/admin")) {
    return next();
  }

  verifyUser(req, res, () => {
    res.locals.loggedInUser = req.loggedInUser || null;
    next();
  });
});

/* =======================
   ROUTES
======================= */
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

/* =======================
   SERVER START
======================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
