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
exports.GeneralService = void 0;
const database_1 = require("../application/database");
const response_error_1 = require("../error/response-error");
class GeneralService {
    static getProvince() {
        return __awaiter(this, void 0, void 0, function* () {
            const provinces = yield database_1.prismaClient.province.findMany({});
            return provinces;
        });
    }
    static getRegency(provinceCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const regency = yield database_1.prismaClient.regency.findMany({
                where: {
                    province_code: provinceCode
                }
            });
            if (!regency) {
                throw new response_error_1.ResponseError(404, "Regency Not Found");
            }
            return regency;
        });
    }
    static getDistrict(regencyCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const district = yield database_1.prismaClient.district.findMany({
                where: {
                    regency_code: regencyCode
                }
            });
            if (!district) {
                throw new response_error_1.ResponseError(404, "District Not Found");
            }
            return district;
        });
    }
    static getVillage(districtCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const village = yield database_1.prismaClient.village.findMany({
                where: {
                    district_code: districtCode
                }
            });
            if (!village) {
                throw new response_error_1.ResponseError(404, "District Not Found");
            }
            return village;
        });
    }
}
exports.GeneralService = GeneralService;
