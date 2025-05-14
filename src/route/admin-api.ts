import express from "express";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { AdminController } from "../controller/admin-controller";
import { adminController, authController, orderController } from "../instance/controller-instance";


export const adminApiRouter = express.Router()
adminApiRouter.use(authMiddleware)

adminApiRouter.post("/approve-cancelation/:orderId", adminController.approveCancelation.bind(adminController))
adminApiRouter.post("/reject-cancelation/:orderId", adminController.rejectCancelation.bind(adminController))
adminApiRouter.get("/all-order", adminController.getAllOrder.bind(adminController))
adminApiRouter.get("/user-detail", authController.getUserDetailById.bind(authController))
adminApiRouter.post("/withdraw", orderController.withdraw.bind(orderController))