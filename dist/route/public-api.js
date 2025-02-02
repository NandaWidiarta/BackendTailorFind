"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controller/customer-controller");
const general_controller_1 = require("../controller/general-controller");
const tailor_controller_1 = require("../controller/tailor-controller");
const multer_1 = __importDefault(require("../middleware/multer"));
const room_chat_controller_1 = require("../controller/room-chat-controller");
exports.publicRouter = express_1.default.Router();
exports.publicRouter.post("/customers/register", customer_controller_1.CustomerController.register);
exports.publicRouter.post("/customers/login", customer_controller_1.CustomerController.login);
exports.publicRouter.post("/customers/add-rating-review", customer_controller_1.CustomerController.addRatingReview);
exports.publicRouter.get("/get-customer", customer_controller_1.CustomerController.getCustomer);
exports.publicRouter.get("/testis/1", customer_controller_1.CustomerController.tes);
exports.publicRouter.get("/testis", customer_controller_1.CustomerController.tes);
exports.publicRouter.get("/testiss", room_chat_controller_1.RoomChatController.tes);
exports.publicRouter.get("/memek", customer_controller_1.CustomerController.tes);
//general
exports.publicRouter.get("/province", general_controller_1.GeneralController.getProvince);
exports.publicRouter.get("/regency/:provinceCode", general_controller_1.GeneralController.getRegency);
exports.publicRouter.get("/district/:regencyCode", general_controller_1.GeneralController.getDistrict);
exports.publicRouter.get("/village/:districtCode", general_controller_1.GeneralController.getVillage);
//ini handling ganti ke autheticated api 
// Endpoint untuk create/get room
exports.publicRouter.post("/rooms", room_chat_controller_1.RoomChatController.createOrGetRoom);
// Endpoint untuk load semua room milik Customer (opsional)
exports.publicRouter.get("/rooms/customer/:customerId", room_chat_controller_1.RoomChatController.getRoomsByCustomer);
exports.publicRouter.get("/rooms/customer", room_chat_controller_1.RoomChatController.tes);
// Endpoint untuk load semua room milik Tailor (opsional)
exports.publicRouter.get("/rooms/tailor/:tailorId", room_chat_controller_1.RoomChatController.getRoomsByTailor);
// Endpoint untuk load semua chat dalam 1 room
exports.publicRouter.get("/rooms/:roomId/chats", room_chat_controller_1.RoomChatController.getChatsInRoom);
// Endpoint untuk kirim pesan via HTTP (opsional, atau pakai socket.io)
exports.publicRouter.post("/rooms/:roomId/chats", room_chat_controller_1.RoomChatController.sendMessage);
//tailor
// publicRouter.post("/tailors/register", TailorController.register);
exports.publicRouter.post("/tailors/login", tailor_controller_1.TailorController.login);
exports.publicRouter.post("/tailors/register", multer_1.default.fields([
    { name: "profilePicture", maxCount: 1 }, // Untuk 1 file profile picture
    { name: "certificate", maxCount: 5 }, // Maksimal 5 file certificate
]), tailor_controller_1.TailorController.register);
