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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const database_1 = require("../application/database");
const response_error_1 = require("../error/response-error");
const customer_model_1 = require("../model/customer-model");
const customer_validation_1 = require("../validation/customer-validation");
const validation_1 = require("../validation/validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
class CustomerService {
    static register(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const registerRequest = validation_1.Validation.validate(customer_validation_1.CustomerValidation.REGISTER, request);
            const totalUserWithSameEmail = yield database_1.prismaClient.customer.count({
                where: {
                    email: registerRequest.email
                }
            });
            if (totalUserWithSameEmail != 0) {
                throw new response_error_1.ResponseError(400, "Email already exist");
            }
            registerRequest.password = yield bcrypt_1.default.hash(registerRequest.password, 10);
            const customer = yield database_1.prismaClient.customer.create({
                data: registerRequest
            });
            return (0, customer_model_1.toCustomerResponse)(customer);
        });
    }
    static login(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginRequest = validation_1.Validation.validate(customer_validation_1.CustomerValidation.LOGIN, request);
            let customer = yield database_1.prismaClient.customer.findUnique({
                where: {
                    email: loginRequest.email
                }
            });
            if (!customer) {
                throw new response_error_1.ResponseError(401, "Email or password is wrong");
            }
            const isPasswordValid = yield bcrypt_1.default.compare(loginRequest.password, customer.password);
            if (!isPasswordValid) {
                throw new response_error_1.ResponseError(401, "Email or password is wrong");
            }
            customer = yield database_1.prismaClient.customer.update({
                where: {
                    email: loginRequest.email
                },
                data: {
                    token: (0, uuid_1.v4)()
                }
            });
            const response = (0, customer_model_1.toCustomerResponse)(customer);
            response.token = customer.token;
            return response;
        });
    }
    static getCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield database_1.prismaClient.customer.findMany({});
            if (!users) {
                throw new response_error_1.ResponseError(401, "Username or password is wrong");
            }
            console.log(users);
            return users;
        });
    }
    static get(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, customer_model_1.toCustomerResponse)(customer);
        });
    }
    static addRatingReview(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const customer = yield database_1.prismaClient.ratingReview.create({
                data: request,
            });
            // Hitung ulang rata-rata rating untuk tailor terkait
            const avgRating = yield database_1.prismaClient.ratingReview.aggregate({
                where: { tailorId: request.tailorId },
                _avg: {
                    rating: true,
                },
            });
            // Update nilai averageRating di tabel Tailor
            yield database_1.prismaClient.tailor.update({
                where: { id: request.tailorId },
                data: {
                    averageRating: (_a = avgRating._avg.rating) !== null && _a !== void 0 ? _a : 0,
                },
            });
            return "Success Add Review";
        });
    }
}
exports.CustomerService = CustomerService;
