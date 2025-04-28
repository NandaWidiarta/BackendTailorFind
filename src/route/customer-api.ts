import express from "express";
import { CustomerController, getHome } from "../controller/customer-controller";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";
import { CourseController } from "../controller/course-controller";
import { ArticleController } from "../controller/article-controller";
import { articleController, authController, chatController, courseController, customerController, orderController } from "../instance/controller-instance";

export const customerApiRouter = express.Router()
customerApiRouter.use(authMiddleware)
customerApiRouter.post("/add-rating-review",upload.single('file'), customerController.addRatingReview.bind(customerController));
customerApiRouter.post("/rooms", chatController.createOrGetRoom.bind(chatController));
customerApiRouter.get("/rooms", chatController.getAllRoom.bind(chatController));
customerApiRouter.get("/rooms/:roomId/chats", chatController.getChatsInRoomByCustomer.bind(chatController));
customerApiRouter.post("/rooms/:roomId/chats", upload.single('file'), chatController.sendMessageV2.bind(chatController))
customerApiRouter.delete("/rooms/:roomId", chatController.deleteRoomChat.bind(chatController));

//order
// customerApiRouter.post("/order/upload-payment/:orderId", upload.single('file'), OrderController.uploadPaymentProof)
customerApiRouter.get("/order/:orderId", orderController.getDetailOrder.bind(orderController))
customerApiRouter.get("/order/all/:userId", orderController.getAllOrderByCustomer.bind(orderController))
customerApiRouter.post("/order/cancel/:orderId", upload.single('file'), orderController.cancelOrder.bind(orderController))
customerApiRouter.post("/order/complete/:orderId", orderController.completeOrderByCustomer.bind(orderController))
customerApiRouter.post("/order/midtrans-token/:orderId", orderController.getMidtransToken.bind(orderController));
customerApiRouter.post("/order/payment-complete/:orderId", orderController.processOrder.bind(orderController));

customerApiRouter.get("/home", getHome)
customerApiRouter.post("/logout", authController.logout.bind(authController))
customerApiRouter.patch("/update-profile",upload.single('file'), customerController.updateCustomerProfile.bind(customerController))
customerApiRouter.post("/reset-password", authController.resetPassword.bind(authController))
customerApiRouter.post("/forgot-password", authController.forgotPassword.bind(authController));

customerApiRouter.get("/user-detail", authController.getUserDetailById.bind(authController));
customerApiRouter.get("/home", customerController.getHomeData.bind(customerController))
customerApiRouter.get("/get-tailors", customerController.getTailors.bind(customerController))
customerApiRouter.get("/get-tailors/filter", customerController.getFilteredTailors.bind(customerController))
customerApiRouter.get("/tailor/:id", customerController.getTailorDetail.bind(customerController))

//kursus
customerApiRouter.get("/course", courseController.getAllCourses.bind(courseController))
customerApiRouter.get("/course/search", courseController.searchCourse.bind(courseController))
customerApiRouter.get("/course/:id", courseController.getCourseDetail.bind(courseController))

//article
customerApiRouter.get("/article", articleController.getAllArticles.bind(articleController))
customerApiRouter.get("/article/:id", articleController.getArticleDetail.bind(articleController))
customerApiRouter.get("/articles/search", articleController.searchArticle.bind(articleController))

customerApiRouter.post("/withdraw", orderController.withdraw.bind(orderController));
customerApiRouter.get("/user-oauth", authController.getDetailUserLoggedIn.bind(authController))