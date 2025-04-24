import { AuthController } from "../controller/auth-controller";
import { RegionController } from "../controller/region-controller";
import { AuthService } from "../service/auth-service";
import { LocationService } from "../service/location-service";


export const authController = new AuthController(new AuthService());
export const regionController = new RegionController(new LocationService())
