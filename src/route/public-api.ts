import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";
import { GeneralController } from "../controller/general-controller";
import { TailorController } from "../controller/tailor-controller";
import upload from "../middleware/multer";
import { RoomChatController } from "../controller/room-chat-controller";
import { CourseController } from "../controller/course-controller";
import { ArticleController } from "../controller/article-controller";
import { authController, regionController } from "../instance/controller-instance";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", upload.single('profilePicture'), CustomerController.registerV2);
// publicRouter.post("/customers/register", upload.single('profilePicture'), CustomerController.register);
// publicRouter.post("/customers/login", CustomerController.login);

publicRouter.get("/testis", CustomerController.tes);

//general
publicRouter.get("/province", regionController.getProvince.bind(regionController));
publicRouter.get("/regency/:provinceCode", regionController.getRegency.bind(regionController));
publicRouter.get("/district/:regencyCode", regionController.getDistrict.bind(regionController));
publicRouter.get("/village/:districtCode", regionController.getVillage.bind(regionController));

//ini handling ganti ke autheticated api 

// Endpoint untuk create/get room (udh pindah ke customer api)
publicRouter.post("/rooms", RoomChatController.createOrGetRoom); //v

// Endpoint untuk load semua room milik Customer (opsional)
publicRouter.get("/rooms/customer/:customerId", RoomChatController.getRoomsByCustomer); //v

// Endpoint untuk load semua room milik Tailor (opsional)
publicRouter.get("/rooms/tailor/:tailorId", RoomChatController.getRoomsByTailor);

// Endpoint untuk load semua chat dalam 1 room
// publicRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoom);

// Endpoint untuk kirim pesan via HTTP (opsional, atau pakai socket.io)
publicRouter.post("/rooms/:roomId/chats", RoomChatController.sendMessage);

//tailor
// publicRouter.post("/tailors/login", TailorController.login);
// publicRouter.post(
//   "/tailors/register",
//   upload.fields([
//     { name: "profilePicture", maxCount: 1 }, // Untuk 1 file profile picture
//     { name: "certificate", maxCount: 5 }, // Maksimal 5 file certificate
//   ]),
//   TailorController.register
// );
publicRouter.post(
  "/tailors/register",
  upload.fields([
    { name: "profilePicture", maxCount: 1 }, // Untuk 1 file profile picture
    { name: "certificate", maxCount: 5 }, // Maksimal 5 file certificate
  ]),
  TailorController.registerV2
);


//dashboard
publicRouter.get("/home", GeneralController.getHomeData)

publicRouter.get("/get-tailors", CustomerController.getTailors)
publicRouter.get("/get-tailors/filter", CustomerController.getFilteredTailors)
publicRouter.get("/tailor/:id", CustomerController.getTailorDetail)

//kursus
publicRouter.get("/course", CourseController.getAllCourses)
publicRouter.get("/course/search", CourseController.searchCourse)
publicRouter.get("/course/:id", CourseController.getCourseDetail)

//article
publicRouter.get("/article", ArticleController.getAllArticles)
publicRouter.get("/article/:id", ArticleController.getArticleDetail)
publicRouter.get("/articles/search", ArticleController.searchArticle)

publicRouter.post("/forgot-password", authController.forgotPassword.bind(authController));
publicRouter.post("/login", authController.login.bind(authController))
publicRouter.post("/logout", authController.logout.bind(authController))
