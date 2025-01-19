import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";
import { GeneralController } from "../controller/general-controller";
import { TailorController } from "../controller/tailor-controller";
import { TailorService } from "../service/tailor-service";
import upload from "../middleware/multer";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", CustomerController.register);
publicRouter.post("/customers/login", CustomerController.login);
publicRouter.post("/customers/add-rating-review", CustomerController.addRatingReview);
publicRouter.get("/testis", CustomerController.tes);
publicRouter.get("/get-customer", CustomerController.getCustomer);

//general
publicRouter.get("/province", GeneralController.getProvince);
publicRouter.get("/regency/:provinceCode", GeneralController.getRegency);
publicRouter.get("/district/:regencyCode", GeneralController.getDistrict);
publicRouter.get("/village/:districtCode", GeneralController.getVillage);

//tailor
// publicRouter.post("/tailors/register", TailorController.register);
publicRouter.post("/tailors/login", TailorController.login);
publicRouter.post(
    "/tailors/register",
    upload.fields([
      { name: "profilePicture", maxCount: 1 }, // Untuk 1 file profile picture
      { name: "certificate", maxCount: 5 }, // Maksimal 5 file certificate
    ]),
    TailorController.register
  );