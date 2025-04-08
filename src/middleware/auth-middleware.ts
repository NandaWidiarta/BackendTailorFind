import { Response, NextFunction } from "express";
import { prismaClient } from "../application/database";
import { UserRequest } from "../type/user-request";
import { supabase } from "../supabase-client";
import { ResponseError } from "../error/response-error";

export const authMiddleware = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.get("X-API-TOKEN");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ResponseError(401, "Unauthorized");
    }

    const prismaUser = await prismaClient.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!prismaUser) {
      throw new ResponseError(401, "Unauthorized");
    }

    req.user = prismaUser;
    next()

  } catch (error) {
    res
    .status(401)
    .json({
      errors: "Unauthorized",
    })
    .end();
  }
};

/// YANG LAMA
// export const authMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
//   const token = req.get('X-API-TOKEN')

//   if (token) {
//       const user = await prismaClient.user.findFirst({
//           where: {
//               token: token
//           }
//       })

//       if (user) {
//           req.user = user
//           next()
//           return
//       }
//   }

//   res.status(401).json({
//       errors: "Unauthorized"
//   }).end()
// }
