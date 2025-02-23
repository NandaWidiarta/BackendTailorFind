import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { CreateCustomerRequest, CustomerResponse, CustomersResponse, LoginCustomerRequest, toCustomerResponse } from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt"
import {v4 as uuid} from "uuid";
// import { CustomerRequest } from "../type/customer-request";
import { ChatResponse, DistrictResponse, ProvinceResponse, RegencyResponse, VillageResponse } from "../model/general-model";


export class GeneralService {
    static async getProvince() : Promise<ProvinceResponse[]> {
        const provinces = await prismaClient.province.findMany({})
        return provinces
    }

    static async getRegency(provinceCode: string): Promise<RegencyResponse[]>{
        const regency = await prismaClient.regency.findMany({
            where: {
                province_code: provinceCode
            }
        })

        if(!regency){
            throw new ResponseError(404, "Regency Not Found")
        }

        return regency
    }

    static async getDistrict(regencyCode: string): Promise<DistrictResponse[]>{
        const district = await prismaClient.district.findMany({
            where: {
                regency_code: regencyCode
            }
        })

        if(!district){
            throw new ResponseError(404, "District Not Found")
        }

        return district
    }

    static async getVillage(districtCode: string): Promise<VillageResponse[]>{
        const village = await prismaClient.village.findMany({
            where: {
                district_code: districtCode
            }
        })

        if(!village){
            throw new ResponseError(404, "District Not Found")
        }

        return village
    }
}