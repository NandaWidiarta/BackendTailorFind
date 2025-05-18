import { ArticleController } from "../controller/article-controller";
import { AuthController } from "../controller/auth-controller";
import { CourseController } from "../controller/course-controller";
import { CustomerController } from "../controller/customer-controller";
import { OrderController } from "../controller/order-controller";
import { RegionController } from "../controller/region-controller";
import { RoomChatController } from "../controller/chat-controller";
import { StuffController } from "../controller/stuff-controller";
import { TailorController } from "../controller/tailor-controller";
import { ArticleService } from "../service/article-service";
import { AuthService } from "../service/auth-service";
import { ChatService } from "../service/chat-service";
import { CourseService } from "../service/course-service";
import { CustomerService } from "../service/customer-service";
import { LocationService } from "../service/location-service";
import { OrderService } from "../service/order-service";
import { StuffService } from "../service/stuff-service";
import { TailorService } from "../service/tailor-service";


export const authController = new AuthController(new AuthService())
export const regionController = new RegionController(new LocationService())
export const courseController = new CourseController(new CourseService())
export const articleController = new ArticleController(new ArticleService())
export const stuffController = new StuffController(new StuffService())
export const chatController = new RoomChatController(new ChatService())
export const orderController = new OrderController(new OrderService())
export const customerController = new CustomerController(new CustomerService())
export const tailorController = new TailorController(new TailorService())