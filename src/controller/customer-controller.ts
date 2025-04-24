import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  CreateCustomerRequest,
  LoginRequest,
  RatingReviewRequest,
} from "../model/customer-model";
import { CustomerService } from "../service/customer-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
// import { CustomerRequest } from "../type/customer-request";
import { Gender } from "@prisma/client";
import { supabase } from "../supabase-client";

export class CustomerController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateCustomerRequest = req.body as CreateCustomerRequest;
      const profilePicture = req.file
      const response = await CustomerService.register(request, profilePicture);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async tes(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        message: "test",
      });
    } catch (e) {
      next(e);
    }
  }

  static async addRatingReview(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const rating = parseInt(req.body.rating);
      const review = req.body.review;
      const tailorId = req.body.tailorId;
      const customerId = req.body.customerId;

      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new ResponseError(400, "Invalid rating value");
      }

      const response = await CustomerService.addRatingReview(
        { rating, review, tailorId, customerId },
        req.file
      );

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getHomeData(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user id null");
      }

      const result = await CustomerService.getHomeData(userId);
      return res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }

  static async getTailors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;

      const response = await CustomerService.getTailors(currentPage);

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getFilteredTailors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        page = "1",
        name,
        provinceId,
        regencyId,
        districtId,
        villageId,
        specialization,
        averageRating,
        workEstimation,
        priceRange,
        gender
      } = req.query;

      const currentPage = parseInt(page as string, 10) || 1;
      const pageSize = 8;

      const result = await CustomerService.getFilteredTailors({
        page: currentPage,
        pageSize,
        search: name as string,
        provinceId: provinceId as string,
        regencyId: regencyId as string,
        districtId: districtId as string,
        villageId: villageId as string,
        specialization: specialization as string,
        averageRating: averageRating as string,
        workEstimation: workEstimation as string,
        priceRange: priceRange as string,
        gender: gender as Gender
      });

      res.status(200).json({
        data: result,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getTailorDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const response = await CustomerService.getTailorById(id);

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateCustomerProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest;
      const userId = userReq.user?.id;
      if (!userId) {
        throw new ResponseError(400, "user id null");
      }
      const { firstname, lastname, email, phoneNumber } = req.body;
      const imageFile = req.file

      let profilePicture: string | null = null;
      if (imageFile) {
        profilePicture = await uploadFileToSupabase(imageFile, userReq.user?.email ?? "email");
      }

      const updatedUser = await CustomerService.updateCustomerProfile(userId, {
        firstname,
        lastname,
        email,
        phoneNumber,
        profilePicture
      });

      res.status(200).json({
        message: "Customer profile updated successfully",
        data: updatedUser,
      });
    } catch (e) {
      next(e);
    }
  }

  static async registerV2(req: Request, res: Response, next: NextFunction) {
    try {
      const request: CreateCustomerRequest = req.body as CreateCustomerRequest;
      const profilePicture = req.file
      console.log("registerv2", request)
      const response = await CustomerService.registerCustomerV2(request, profilePicture);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}

export const getHome: RequestHandler = async (req, res, next) => {
  try {
    const user = req as UserRequest;
    const userId = user.user?.id
    if (!userId) {
      return next();
    }
    const result = await CustomerService.getHomeData(userId);
    res.json({ data: result });
    return
  } catch (error) {
    next(error);
  }
};


async function uploadFileToSupabase(
  file: Express.Multer.File,
  userEmail: string
): Promise<string | null> {
  try {
    const extension = file.originalname.split('.').pop();
    const fileName = `${userEmail}-${Date.now()}.${extension || ''}`;

    const { data, error } = await supabase.storage
      .from('profile')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    let publicURL: string | null = null;
    if (data && data.path) {
      const { data: publicData } = supabase.storage
        .from('profile')
        .getPublicUrl(data.path);
      publicURL = publicData?.publicUrl ?? null;
    }

    return publicURL;
  } catch (err) {
    console.error('Exception uploading to Supabase:', err);
    return null;
  }
}
