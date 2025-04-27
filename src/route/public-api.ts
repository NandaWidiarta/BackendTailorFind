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
import { articleController, authController, courseController, customerController, regionController, tailorController } from "../instance/controller-instance";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", upload.single('profilePicture'), customerController.registerV2.bind(customerController));
// publicRouter.post("/customers/register", upload.single('profilePicture'), CustomerController.register);
// publicRouter.post("/customers/login", CustomerController.login);


//general
publicRouter.get("/province", regionController.getProvince.bind(regionController));
publicRouter.get("/regency/:provinceCode", regionController.getRegency.bind(regionController));
publicRouter.get("/district/:regencyCode", regionController.getDistrict.bind(regionController));
publicRouter.get("/village/:districtCode", regionController.getVillage.bind(regionController));

//ini handling ganti ke autheticated api 

// Endpoint untuk create/get room (udh pindah ke customer api)

// Endpoint untuk load semua chat dalam 1 room
// publicRouter.get("/rooms/:roomId/chats", RoomChatController.getChatsInRoom);

// Endpoint untuk kirim pesan via HTTP (opsional, atau pakai socket.io)

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
  tailorController.registerV2.bind(tailorController)
);


//kursus (delete later)
publicRouter.get("/course", courseController.getAllCourses.bind(courseController))
publicRouter.get("/course/search", courseController.searchCourse.bind(courseController))
publicRouter.get("/course/:id", courseController.getCourseDetail.bind(courseController))

//article
publicRouter.get("/article", articleController.getAllArticles.bind(articleController))
publicRouter.get("/article/:id", articleController.getArticleDetail.bind(articleController))
publicRouter.get("/articles/search", articleController.searchArticle.bind(articleController))

publicRouter.post("/forgot-password", authController.forgotPassword.bind(authController));
publicRouter.post("/login", authController.login.bind(authController))
publicRouter.post("/logout", authController.logout.bind(authController))
