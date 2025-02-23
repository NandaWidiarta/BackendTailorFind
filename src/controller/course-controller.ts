import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";
import { CourseService } from "../service/course-service";
import { ResponseError } from "../error/response-error";
import { UserRequest } from "../type/user-request";

export class CourseController {
  static async addCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next()
      }

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      let authorName = userReq.user?.firstname

      if (!tailorId || !authorName) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      if (userReq.user?.lastname) {
        authorName += ` ${userReq.user?.lastname}`
      }
      
      const {
        courseName,
        shortDescription,
        registrationLink,
        description,
      } = req.body

      const response = await CourseService.addCourse(
        tailorId,
        authorName,
        courseName,
        shortDescription,
        registrationLink,
        description,
        req.file
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }
}
