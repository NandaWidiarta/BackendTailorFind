import { Role } from "@prisma/client";
import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateCustomerRequest,
  CustomerResponse,
  CustomersResponse,
  LoginCustomerRequest,
  RatingReviewRequest,
  toCustomerResponse,
} from "../model/customer-model";
import { CustomerValidation } from "../validation/customer-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export class CustomerService {
  static async register(
    request: CreateCustomerRequest
  ): Promise<CustomerResponse> {
    const registerRequest = Validation.validate(
      CustomerValidation.REGISTER,
      request
    )

    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        email: registerRequest.email,
      },
    })

    if (totalUserWithSameEmail != 0) {
      throw new ResponseError(400, "Email already exist")
    }

    const isPhoneExist = await prismaClient.user.count({
      where: { phoneNumber: request.phoneNumber },
    });

    if (isPhoneExist > 0) {
      throw new ResponseError(400, "Phone number already exist");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    registerRequest.role = Role.CUSTOMER

    let newToken = uuid()
    let existingToken = await prismaClient.user.findFirst({
      where: { token: newToken },
    })

    while (existingToken) {
      newToken = uuid()
      existingToken = await prismaClient.user.findFirst({
        where: { token: newToken },
      })
    }

    registerRequest.token = newToken

    const customer = await prismaClient.user.create({
      data: registerRequest,
    })

    return toCustomerResponse(customer)
  }

  static async login(request: LoginCustomerRequest): Promise<CustomerResponse> {
    const loginRequest = Validation.validate(CustomerValidation.LOGIN, request)

    let customer = await prismaClient.user.findUnique({
      where: {
        email: loginRequest.email,
      },
    })

    if (!customer) {
      throw new ResponseError(401, "Email or password is wrong")
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      customer.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Email or password is wrong")
    }

    let newToken = uuid()
    let existingToken = await prismaClient.user.findFirst({
        where: { token: newToken },
    });

    while (existingToken) {
        newToken = uuid()
        existingToken = await prismaClient.user.findFirst({
            where: { token: newToken },
        })
    }

    customer = await prismaClient.user.update({
      where: {
        email: loginRequest.email,
      },
      data: {
        token: newToken,
      },
    });

    const response = toCustomerResponse(customer)
    response.token = customer.token!
    return response
  }

  static async addRatingReview(request: RatingReviewRequest): Promise<String> {
    const customer = await prismaClient.ratingReview.create({
      data: request,
    })

    // Hitung ulang rata-rata rating untuk tailor terkait
    const avgRating = await prismaClient.ratingReview.aggregate({
      where: { tailorId: request.tailorId },
      _avg: {
        rating: true,
      },
    })

    // Update nilai averageRating di tabel Tailor
    await prismaClient.tailorProfile.update({
      where: { id: request.tailorId },
      data: {
        averageRating: avgRating._avg.rating ?? 0,
      },
    })

    return "Success Add Review"
  }
}
