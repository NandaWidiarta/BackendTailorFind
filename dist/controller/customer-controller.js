"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_service_1 = require("../service/customer-service");
class CustomerController {
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.body;
                const response = yield customer_service_1.CustomerService.register(request);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.body;
                const response = yield customer_service_1.CustomerService.login(request);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static tes(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    message: "test"
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static getCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield customer_service_1.CustomerService.getCustomers();
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static get(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield customer_service_1.CustomerService.get(req.customer);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static addRatingReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.body;
                const response = yield customer_service_1.CustomerService.addRatingReview(request);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.CustomerController = CustomerController;
