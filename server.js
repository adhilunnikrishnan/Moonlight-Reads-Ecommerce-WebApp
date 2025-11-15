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

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// app.use(morgan("dev"));
app.use(compression());

/* STATIC FILES */
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(
  "/adminAssets",
  express.static(path.join(__dirname, "public/adminAssets"))
);
app.use(
  "/userAssets",
  express.static(path.join(__dirname, "public/userAssets"))
);

/* VIEW ENGINE SETUP — SHOULD BE BEFORE ROUTES */
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "user",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      upper: (str) => str.toUpperCase(),
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

/* DATABASE CONNECTION */
await connectDB();

/* ROUTES */
app.use("/admin", adminRoutes);

// app.use(errorHandler); // if needed

/* START SERVER */
app.listen(PORT, () => {
  console.log(
    `process ID ${process.pid}: server running on PORT ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
