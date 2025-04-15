import express from "express";
import { CustomerController, getHome } from "../controller/customer-controller";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { AdminController } from "../controller/admin-controller";


export const adminApiRouter = express.Router()
adminApiRouter.use(authMiddleware)
adminApiRouter.post("/confirm-payment-customer/:orderId", AdminController.confirmCustomerPayment);
adminApiRouter.post("/upload-payment-to-tailor/:orderId", upload.single('file'), AdminController.uploadPaymentProofToTailor)
adminApiRouter.post("/approve-cancelation/:orderId", upload.single('file'), AdminController.approveCancelation)
adminApiRouter.post("/reject-cancelation/:orderId", AdminController.rejectCancelation);
adminApiRouter.post("/reject-payment-customer/:orderId", AdminController.rejectPaymentCustomer);
adminApiRouter.get("/all-order", AdminController.getAllOrder);