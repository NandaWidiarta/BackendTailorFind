import { LocationService } from "../service/location-service";
import e, { Request, Response, NextFunction } from "express";

export class RegionController {
    constructor(
        private readonly locationService: LocationService
    ) { }

    async getProvince(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.locationService.getProvince();
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

    async getRegency(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.locationService.getRegency(req.params.provinceCode);
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

    async getDistrict(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.locationService.getDistrict(req.params.regencyCode);
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

    async getVillage(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await this.locationService.getVillage(req.params.districtCode);
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

}