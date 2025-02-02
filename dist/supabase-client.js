"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_KEY = process.env.SUPABASE_KEY;
exports.supabase = (0, supabase_js_1.createClient)('https://xtyrxekcsaesyyopouhh.supabase.co', // Ganti dengan URL proyek Anda
SUPABASE_KEY !== null && SUPABASE_KEY !== void 0 ? SUPABASE_KEY : "" // Ganti dengan kunci publik Supabase
);
