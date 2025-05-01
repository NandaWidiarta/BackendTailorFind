import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";
import { TailorController } from "../controller/tailor-controller";
import upload from "../middleware/multer";
import { RoomChatController } from "../controller/room-chat-controller";
import { CourseController } from "../controller/course-controller";
import { ArticleController } from "../controller/article-controller";
import { articleController, authController, courseController, customerController, orderController, regionController, tailorController } from "../instance/controller-instance";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", upload.single('profilePicture'), customerController.registerV2.bind(customerController));


//general
publicRouter.get("/province", regionController.getProvince.bind(regionController));
publicRouter.get("/regency/:provinceCode", regionController.getRegency.bind(regionController));
publicRouter.get("/district/:regencyCode", regionController.getDistrict.bind(regionController));
publicRouter.get("/village/:districtCode", regionController.getVillage.bind(regionController));

publicRouter.post(
  "/tailors/register",
  upload.fields([
    { name: "profilePicture", maxCount: 1 }, 
    { name: "certificate", maxCount: 5 }, 
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

publicRouter.post("/auto-complete-order", orderController.autoCompleteLongPendingOrders.bind(orderController))
