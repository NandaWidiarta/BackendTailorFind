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
exports.GeneralController = void 0;
const general_service_1 = require("../service/general-service");
class GeneralController {
    static getProvince(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield general_service_1.GeneralService.getProvince();
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static getRegency(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provinceCode = req.params.provinceCode;
                const response = yield general_service_1.GeneralService.getRegency(provinceCode);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static getDistrict(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const regencyCode = req.params.regencyCode;
                const response = yield general_service_1.GeneralService.getDistrict(regencyCode);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static getVillage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const districtCode = req.params.districtCode;
                const response = yield general_service_1.GeneralService.getVillage(districtCode);
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
exports.GeneralController = GeneralController;
