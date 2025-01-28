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
exports.TailorController = void 0;
const tailor_service_1 = require("../service/tailor-service");
class TailorController {
    // static async register(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const request: CreateTailorRequest = req.body as CreateTailorRequest;
    //         const response = await TailorService.register(request);
    //         res.status(200).json({
    //             data: response
    //         })
    //     } catch (e) {
    //         next(e);
    //     }
    // }
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.body;
                const response = yield tailor_service_1.TailorService.login(request);
                res.status(200).json({
                    data: response
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const request = Object.assign(Object.assign({}, req.body), { specialization: JSON.parse(req.body.specialization || "[]") });
                // File profile picture
                const profilePictureFile = Array.isArray(req.files) ? undefined : (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.profilePicture) === null || _b === void 0 ? void 0 : _b[0];
                // File certificates
                const certificateFiles = Array.isArray(req.files) ? [] : ((_c = req.files) === null || _c === void 0 ? void 0 : _c.certificate) || [];
                // Call service
                const response = yield tailor_service_1.TailorService.registerV2(request, profilePictureFile, certificateFiles // Cast ke array file
                );
                res.status(200).json({
                    data: response,
                });
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.TailorController = TailorController;
