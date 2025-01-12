import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";
import { GeneralController } from "../controller/general-controller";

export const publicRouter = express.Router();

publicRouter.post("/customers/register", CustomerController.register);
publicRouter.post("/customers/login", CustomerController.login);
publicRouter.get("/testis", CustomerController.tes);
publicRouter.get("/get-customer", CustomerController.getCustomer);

//general
publicRouter.get("/province", GeneralController.getProvince);
publicRouter.get("/regency/:provinceCode", GeneralController.getRegency);
publicRouter.get("/district/:regencyCode", GeneralController.getDistrict);
publicRouter.get("/village/:districtCode", GeneralController.getVillage);

//tailor
publicRouter.post("/tailors/register", CustomerController.register);