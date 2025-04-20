import express from "express";
import { RoomChatController } from "../controller/room-chat-controller";
import upload from "../middleware/multer";
import { authMiddleware } from "../middleware/auth-middleware";
import { OrderController } from "../controller/order-controller";
import { ArticleController } from "../controller/article-controller";
import { CourseController } from "../controller/course-controller";
import { StuffController } from "../controller/stuff-controller";
import { TailorController } from "../controller/tailor-controller";
import { GeneralController } from "../controller/general-controller";

export const tailorApiRouter = express.Router()
tailorApiRouter.use(authMiddleware)
tailorApiRouter.post("/rooms", RoomChatController.createOrGetRoom)
tailorApiRouter.get("/rooms/:tailorId", RoomChatController.getRoomsByTailor)
tailorApiRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoomByTailor)
tailorApiRouter.post("/rooms/:roomId/chats", upload.single('file'), RoomChatController.sendMessageV2)
tailorApiRouter.delete("/rooms/:roomId", RoomChatController.deleteRoomChat);

//order
tailorApiRouter.post("/order/create", OrderController.createOrder)
tailorApiRouter.get("/order/:orderId", OrderController.getDetailOrder)
tailorApiRouter.get("/order/all/:userId", OrderController.getAllOrderByTailor)
// tailorApiRouter.post("/order/process/:orderId", OrderController.processOrder)
tailorApiRouter.post("/order/complete", upload.single('file'), OrderController.completeOrderByTailor)
tailorApiRouter.post("/order/cancel/:orderId", OrderController.cancelOrder)

//article
tailorApiRouter.post("/article/add", upload.single('file'), ArticleController.addArticle)
tailorApiRouter.post("/course/add", upload.single('file'), CourseController.addCourse)
tailorApiRouter.post("/stuff/add", upload.single('file'), StuffController.addStuff)
tailorApiRouter.get("/articles/search", ArticleController.searchArticle)

//home
tailorApiRouter.get("/home", TailorController.getHomeData)

//list stuff
tailorApiRouter.get("/stuff", TailorController.getStuff)
tailorApiRouter.get("/stuff/filter", TailorController.getFilteredStuff)
tailorApiRouter.patch("/stuff/:id", upload.single('file'), StuffController.updateStuff)
tailorApiRouter.delete("/stuff/:id", StuffController.deleteStuff)

//list course
tailorApiRouter.get("/course", CourseController.getCourseByTailor)
tailorApiRouter.patch("/course/:id", upload.single('file'), CourseController.updateCourse)
tailorApiRouter.delete("/course/:id", CourseController.deleteCourse)
tailorApiRouter.get("/course/search", CourseController.searchCourse)

//list article
tailorApiRouter.get("/article", ArticleController.getAllArticleByTailor)
tailorApiRouter.patch("/article/:id", upload.single('file'), ArticleController.updateArticle)
tailorApiRouter.delete("/article/:id", ArticleController.deleteArticle)

//logout
tailorApiRouter.post("/logout", GeneralController.logout)

tailorApiRouter.patch("/update-profile", upload.single('file'), TailorController.updateProfile)
tailorApiRouter.post(
  "/certificates",
  upload.fields([{ name: "certificate", maxCount: 5 }]),
  TailorController.addCertificate
);

tailorApiRouter.get("/certificates", TailorController.getCertificate)
tailorApiRouter.delete("/certificates", TailorController.deleteCertificate)

tailorApiRouter.post("/reset-password", GeneralController.resetPassword)
tailorApiRouter.post("/forgot-password", GeneralController.forgotPassword);

tailorApiRouter.get("/user-detail", GeneralController.getUserDetail);