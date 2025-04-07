import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { DistrictResponse, ProvinceResponse, RegencyResponse, VillageResponse } from "../model/general-model";

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

import axios from "axios";

const BASE_URL = 'https://astungkaraaa.github.io/api-wilayah-indonesia/api';

export class RegionService {
  static async getProvinces(): Promise<ProvinceResponse[]> {
    try {
      const response = await axios.get<Province[]>(
        `${BASE_URL}/provinces.json`
      );
      return response.data.map((province) => ({
        code: province.id,
        name: province.name,
      }));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new Error("Failed to fetch provinces");
    }
  }

  static async getRegency(provinceCode: string): Promise<RegencyResponse[]> {
    const regency = await prismaClient.regency.findMany({
      where: {
        province_code: provinceCode,
      },
    });

    if (!regency) {
      throw new ResponseError(404, "Regency Not Found");
    }

    return regency;
  }

  static async getDistrict(regencyCode: string): Promise<DistrictResponse[]> {
    const district = await prismaClient.district.findMany({
      where: {
        regency_code: regencyCode,
      },
    });

    if (!district) {
      throw new ResponseError(404, "District Not Found");
    }

    return district;
  }

  static async getVillage(districtCode: string): Promise<VillageResponse[]> {
    const village = await prismaClient.village.findMany({
      where: {
        district_code: districtCode,
      },
    });

    if (!village) {
      throw new ResponseError(404, "District Not Found");
    }

    return village;
  }
}