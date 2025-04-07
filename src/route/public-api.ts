import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";
import { GeneralController } from "../controller/general-controller";
import { TailorController } from "../controller/tailor-controller";
// import { TailorService } from "../service/tailor-service";
import upload from "../middleware/multer";
import { RoomChatController } from "../controller/room-chat-controller";
import { CourseController } from "../controller/course-controller";
import { ArticleController } from "../controller/article-controller";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", CustomerController.register);
publicRouter.post("/customers/login", CustomerController.login);
publicRouter.get("/testis", CustomerController.tes);

//general
publicRouter.get("/province", GeneralController.getProvince);
publicRouter.get("/regency/:provinceCode", GeneralController.getRegency);
publicRouter.get("/district/:regencyCode", GeneralController.getDistrict);
publicRouter.get("/village/:districtCode", GeneralController.getVillage);
publicRouter.post("/kirim-email", GeneralController.kirimEmailTes);

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
publicRouter.post("/tailors/login", TailorController.login);
publicRouter.post(
    "/tailors/register",
    upload.fields([
      { name: "profilePicture", maxCount: 1 }, // Untuk 1 file profile picture
      { name: "certificate", maxCount: 5 }, // Maksimal 5 file certificate
    ]),
    TailorController.register
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
publicRouter.get("/article/search", ArticleController.searchArticle)