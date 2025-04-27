export type ProvinceResponse = {
    code: string;
    name: string;
}

export type RegencyResponse = {
    code: string;
    name: string;
    province_code: string;
}

export type DistrictResponse = {
    code: string;
    name: string;
    regency_code: string;
}

export type VillageResponse = {
    code: string;
    name: string;
    district_code: string;
}