import express from "express";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { authController, orderController } from "../instance/controller-instance";


export const adminApiRouter = express.Router()
adminApiRouter.use(authMiddleware)

adminApiRouter.post("/approve-cancelation/:orderId", orderController.approveCancelation.bind(orderController))
adminApiRouter.post("/reject-cancelation/:orderId", orderController.rejectCancelation.bind(orderController))
adminApiRouter.get("/all-order", orderController.getAllOrder.bind(orderController))
adminApiRouter.get("/user-detail", authController.getUserDetailById.bind(authController))
adminApiRouter.post("/withdraw", orderController.withdraw.bind(orderController))