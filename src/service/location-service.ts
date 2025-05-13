import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";

export class LocationService {
    async getProvince() {
      return await prismaClient.province.findMany();
    }
    
    async getRegency(provinceCode: string) {
      const data = await prismaClient.regency.findMany({ where: { province_code: provinceCode } });
      if (!data || data.length === 0) throw new ResponseError(400, "Kabupaten/Kota Tidak Ditemukan");
      return data;
    }
  
    async getDistrict(regencyCode: string) {
      const data = await prismaClient.district.findMany({ where: { regency_code: regencyCode } });
      if (!data || data.length === 0) throw new ResponseError(400, "Kecamatan Tidak Ditemukan");
      return data;
    }
  
    async getVillage(districtCode: string) {
      const data = await prismaClient.village.findMany({ where: { district_code: districtCode } });
      if (!data || data.length === 0) throw new ResponseError(400, "Desa tidak ditemukan");
      return data;
    }
  }
  