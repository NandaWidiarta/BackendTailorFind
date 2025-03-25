import express from "express"
import { publicRouter } from "../route/public-api";
import { errorMiddleware } from "../middleware/error-middleware";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { customerApiRouter } from "../route/customer-api";
import { tailorApiRouter } from "../route/tailor-api";
import cors from "cors";

export const web = express()

web.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-token", "X-API-TOKEN"],
    credentials: true,
  })
);

web.use(express.json())
web.use(express.urlencoded({ extended: true }))

web.use(publicRouter)
web.use("/customers", customerApiRouter)
web.use("/tailors", tailorApiRouter)
web.use(errorMiddleware)



