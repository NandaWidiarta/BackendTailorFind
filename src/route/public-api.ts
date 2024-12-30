import express from "express"
import { CustomerController } from "../controller/customer-controller";
import { CustomerService } from "../service/customer-service";
import { Request, Response, NextFunction } from "express";

export const publicRouter = express.Router();

publicRouter.post("/api/users", CustomerController.register);
publicRouter.get("/testis", CustomerController.tes);
publicRouter.get("/get-customer", CustomerController.getCustomer);
