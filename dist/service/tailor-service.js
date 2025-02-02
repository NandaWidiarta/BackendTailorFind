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
exports.TailorService = void 0;
const database_1 = require("../application/database");
const response_error_1 = require("../error/response-error");
const customer_validation_1 = require("../validation/customer-validation");
const validation_1 = require("../validation/validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const tailor_model_1 = require("../model/tailor-model");
const supabase_client_1 = require("../supabase-client");
class TailorService {
    // static async register(request: CreateTailorRequest): Promise<TailorResponse> {
    //   // const registerRequest = Validation.validate(CustomerValidation.REGISTER, request);
    //   const registerRequest = request;
    //   const totalUserWithSameEmail = await prismaClient.tailor.count({
    //     where: {
    //       email: registerRequest.email,
    //     },
    //   });
    //   if (totalUserWithSameEmail != 0) {
    //     throw new ResponseError(400, "Email already exist");
    //   }
    //   registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    //   const tailor = await prismaClient.tailor.create({
    //     data: registerRequest,
    //   });
    //   return toTailorResponse(tailor);
    // }
    static login(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginRequest = validation_1.Validation.validate(customer_validation_1.CustomerValidation.LOGIN, request);
            let tailor = yield database_1.prismaClient.tailor.findUnique({
                where: {
                    email: loginRequest.email,
                },
            });
            if (!tailor) {
                throw new response_error_1.ResponseError(401, "Email or password is wrong");
            }
            const isPasswordValid = yield bcrypt_1.default.compare(loginRequest.password, tailor.password);
            if (!isPasswordValid) {
                throw new response_error_1.ResponseError(401, "Email or password is wrong");
            }
            tailor = yield database_1.prismaClient.tailor.update({
                where: {
                    email: loginRequest.email,
                },
                data: {
                    token: (0, uuid_1.v4)(),
                },
            });
            const response = (0, tailor_model_1.toTailorResponse)(tailor);
            response.token = tailor.token;
            return response;
        });
    }
    static registerV2(request, profilePictureFile, certificateFiles // Tambahkan array file
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validasi request (opsional)
            const registerRequest = request;
            // Cek jika email sudah terdaftar
            const totalUserWithSameEmail = yield database_1.prismaClient.tailor.count({
                where: {
                    email: registerRequest.email,
                },
            });
            if (totalUserWithSameEmail !== 0) {
                throw new response_error_1.ResponseError(400, "Email already exist");
            }
            // Hash password
            registerRequest.password = yield bcrypt_1.default.hash(registerRequest.password, 10);
            // Upload profile picture jika ada
            let profilePictureUrl = null;
            if (profilePictureFile) {
                const fileName = `profile-pictures/${(0, uuid_1.v4)()}`;
                const { data, error } = yield supabase_client_1.supabase.storage
                    .from("profile") // Ganti dengan bucket storage Anda
                    .upload(fileName, profilePictureFile.buffer, {
                    contentType: profilePictureFile.mimetype,
                });
                if (error) {
                    throw new response_error_1.ResponseError(500, "Failed to upload profile picture");
                }
                profilePictureUrl = (data === null || data === void 0 ? void 0 : data.path)
                    ? `${supabase_client_1.supabase.storage.from("profile").getPublicUrl(data.path).data.publicUrl}`
                    : null;
            }
            // Upload certificates jika ada
            let certificateUrls = [];
            if (certificateFiles && certificateFiles.length > 0) {
                for (const file of certificateFiles) {
                    const fileName = `certificates/${(0, uuid_1.v4)()}`;
                    const { data, error } = yield supabase_client_1.supabase.storage
                        .from("certificates") // Ganti dengan bucket storage Anda
                        .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                    });
                    if (error) {
                        throw new response_error_1.ResponseError(500, "Failed to upload certificate");
                    }
                    if (data === null || data === void 0 ? void 0 : data.path) {
                        const publicUrl = `${supabase_client_1.supabase.storage
                            .from("certificates")
                            .getPublicUrl(data.path).data.publicUrl}`;
                        certificateUrls.push(publicUrl); // Tambahkan URL ke array
                    }
                }
            }
            // Set URLs ke request
            registerRequest.profilePicture = profilePictureUrl;
            registerRequest.certificate = certificateUrls;
            // Simpan ke database
            const tailor = yield database_1.prismaClient.tailor.create({
                data: registerRequest,
            });
            return (0, tailor_model_1.toTailorResponse)(tailor);
        });
    }
}
exports.TailorService = TailorService;
