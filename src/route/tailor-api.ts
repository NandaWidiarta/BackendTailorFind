import express from "express";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";
import { ArticleController } from "../controller/article-controller";
import { CourseController } from "../controller/course-controller";
import { StuffController } from "../controller/stuff-controller";
import { TailorController } from "../controller/tailor-controller";
import { articleController, authController, chatController, courseController, orderController, stuffController, tailorController } from "../instance/controller-instance";

export const tailorApiRouter = express.Router()
tailorApiRouter.use(authMiddleware)
tailorApiRouter.post("/rooms", chatController.createOrGetRoom.bind(chatController))
tailorApiRouter.get("/rooms", chatController.getAllRoom.bind(chatController))
tailorApiRouter.get("/rooms/:roomId/chats", chatController.getChatsInRoom.bind(chatController))
tailorApiRouter.post("/rooms/:roomId/chats", upload.single('file'), chatController.sendMessage.bind(chatController))
tailorApiRouter.delete("/rooms/:roomId", chatController.deleteRoomChat.bind(chatController));
tailorApiRouter.post("/rooms/mark-read/:roomId", chatController.markAsRead.bind(chatController));

//order
tailorApiRouter.post("/order/create", orderController.createOrder.bind(orderController))
tailorApiRouter.get("/order/:orderId", orderController.getDetailOrder.bind(orderController))
tailorApiRouter.get("/order/all/:userId", orderController.getAllOrder.bind(orderController))
tailorApiRouter.post("/order/complete", upload.single('file'), orderController.completeOrderByTailor.bind(orderController))
tailorApiRouter.post("/order/cancel/:orderId", orderController.cancelOrder.bind(orderController))

//article
tailorApiRouter.post("/article/add", upload.single('file'), articleController.addArticle.bind(articleController))
tailorApiRouter.post("/course/add", upload.single('file'), courseController.addCourse.bind(courseController))
tailorApiRouter.post("/stuff/add", upload.single('file'), stuffController.addStuff.bind(stuffController))
tailorApiRouter.get("/articles/search", articleController.searchArticle.bind(articleController))

//home
tailorApiRouter.get("/home", tailorController.getHomeData.bind(tailorController))

//list stuff
tailorApiRouter.get("/stuff", tailorController.getStuff.bind(tailorController))
tailorApiRouter.get("/stuff/filter", tailorController.getFilteredStuff.bind(tailorController))
tailorApiRouter.patch("/stuff/:id", upload.single('file'), stuffController.updateStuff.bind(stuffController))
tailorApiRouter.delete("/stuff/:id", stuffController.deleteStuff.bind(stuffController))

//list course
tailorApiRouter.get("/course", courseController.getCourseByTailor.bind(courseController))
tailorApiRouter.patch("/course/:id", upload.single('file'), courseController.updateCourse.bind(courseController))
tailorApiRouter.delete("/course/:id", courseController.deleteCourse.bind(courseController))
tailorApiRouter.get("/course/search", courseController.searchCourse.bind(courseController))

//list article
tailorApiRouter.get("/article", articleController.getAllArticleByTailor.bind(articleController))
tailorApiRouter.patch("/article/:id", upload.single('file'), articleController.updateArticle.bind(articleController))
tailorApiRouter.delete("/article/:id", articleController.deleteArticle.bind(articleController))

//logout
tailorApiRouter.post("/logout", authController.logout.bind(authController))

tailorApiRouter.patch("/update-profile", upload.single('file'), tailorController.updateProfile.bind(tailorController))
tailorApiRouter.post(
  "/certificates",
  upload.fields([{ name: "certificate", maxCount: 5 }]),
  tailorController.addCertificate.bind(tailorController)
);

tailorApiRouter.get("/certificates", tailorController.getCertificate.bind(tailorController))
tailorApiRouter.delete("/certificates", tailorController.deleteCertificate.bind(tailorController))
tailorApiRouter.get("/review", tailorController.getReviewData.bind(tailorController));

tailorApiRouter.post("/reset-password", authController.resetPassword.bind(authController))
tailorApiRouter.post("/forgot-password", authController.forgotPassword.bind(authController));

tailorApiRouter.get("/user-detail", authController.getUserDetailById.bind(authController));
tailorApiRouter.post("/withdraw", orderController.withdraw.bind(orderController));