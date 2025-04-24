import express from "express";
import { CustomerController, getHome } from "../controller/customer-controller";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";
import { GeneralController } from "../controller/general-controller";
import { CourseController } from "../controller/course-controller";
import { ArticleController } from "../controller/article-controller";
import { authController } from "../instance/controller-instance";

export const customerApiRouter = express.Router()
customerApiRouter.use(authMiddleware)
customerApiRouter.post("/add-rating-review",upload.single('file'), CustomerController.addRatingReview);
customerApiRouter.post("/rooms", RoomChatController.createOrGetRoom);
customerApiRouter.get("/rooms/:customerId", RoomChatController.getRoomsByCustomer);
customerApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByCustomer);
customerApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)
customerApiRouter.delete("/rooms/:roomId", RoomChatController.deleteRoomChat);

//order
// customerApiRouter.post("/order/upload-payment/:orderId", upload.single('file'), OrderController.uploadPaymentProof)
customerApiRouter.get("/order/:orderId", OrderController.getDetailOrder)
customerApiRouter.get("/order/all/:userId", OrderController.getAllOrderByCustomer)
customerApiRouter.post("/order/cancel/:orderId", upload.single('file'), OrderController.cancelOrder)
customerApiRouter.post("/order/complete/:orderId", OrderController.completeOrderByCustomer)
customerApiRouter.post("/order/midtrans-token/:orderId", OrderController.getMidtransToken);
customerApiRouter.post("/order/payment-complete/:orderId", OrderController.processOrder);

customerApiRouter.get("/home", getHome)
customerApiRouter.post("/logout", authController.logout.bind(authController))
customerApiRouter.patch("/update-profile",upload.single('file'), CustomerController.updateCustomerProfile)
customerApiRouter.post("/reset-password", authController.resetPassword.bind(authController))
customerApiRouter.post("/forgot-password", authController.forgotPassword.bind(authController));

customerApiRouter.get("/user-detail", GeneralController.getUserDetail);
customerApiRouter.get("/home", GeneralController.getHomeData)
customerApiRouter.get("/get-tailors", CustomerController.getTailors)
customerApiRouter.get("/get-tailors/filter", CustomerController.getFilteredTailors)
customerApiRouter.get("/tailor/:id", CustomerController.getTailorDetail)

//kursus
customerApiRouter.get("/course", CourseController.getAllCourses)
customerApiRouter.get("/course/search", CourseController.searchCourse)
customerApiRouter.get("/course/:id", CourseController.getCourseDetail)

//article
customerApiRouter.get("/article", ArticleController.getAllArticles)
customerApiRouter.get("/article/:id", ArticleController.getArticleDetail)
customerApiRouter.get("/articles/search", ArticleController.searchArticle)

customerApiRouter.post("/withdraw", GeneralController.withdraw);
customerApiRouter.get("/user-oauth", authController.getDetailUserLoggedIn.bind(authController))