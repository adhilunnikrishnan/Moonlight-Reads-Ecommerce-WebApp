import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())

app.use(cors())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"})) 

app.use(morgan("dev"))

await connectDB()



// Error handlerC
// app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(
        `process ID ${process.pid}:server running on PORT ${PORT} in ${process.env.NODE_ENV} mode`
    )
})
