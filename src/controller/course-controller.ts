import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";
import { CourseService } from "../service/course-service";

export class CourseController {
  static async addCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next()
      }
      const {
        tailorId,
        authorName,
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
