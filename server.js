import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRouts.js";
import compression from "compression";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "30mb", extented: true }));
app.use(express.urlencoded({ limit: "30mb", extented: true }));

app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(morgan("dev"));
app.use(compression());

app.use("/assets", express.static(path.join(__dirname, "public/assets")));
//Add for admin assets
app.use(
  "/adminAssets",
  express.static(path.join(__dirname, "public/adminAssets"))
);

// Add for user assets
app.use(
  "/userAssets",
  express.static(path.join(__dirname, "public/userAssets"))
);

await connectDB();

app.use("/admin", adminRoutes);

// Error handlerC
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `process ID ${process.pid}:server running on PORT ${PORT} in ${process.env.NODE_ENV} mode`
  );
});



/* VIEW ENGINE SETUP */
app.engine(
  "hbs",
  engine({
    extname: ".hbs", // use .hbs extension
    defaultLayout: "user", // default layout file (user.hbs)
    layoutsDir: path.join(__dirname, "views/layouts"), // layouts folder
    partialsDir: path.join(__dirname, "views/partials"), // partials folder
    helpers: {
      // custom helpers for production scaling
      upper: (str) => str.toUpperCase(),
      json: (context) => JSON.stringify(context),
      eq: (a, b) => a === b,
      or: (a, b) => a || b,
      formatDate: (timestamp) => {
        return new Date(timestamp).toLocaleDateString("en-GB"); // dd/mm/yyyy
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);

// set view engine
app.set("view engine", "hbs");
// set views folder
app.set("views", path.join(__dirname, "views"));
