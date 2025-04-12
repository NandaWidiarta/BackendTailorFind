import { Request, Response, NextFunction } from "express";
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
        place,
        courseDate,
      } = req.body

      const response = await CourseService.addCourse(
        tailorId,
        authorName,
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate,
        req.file
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async getAllCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      
      const response = await CourseService.getAllCourse(currentPage)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async searchCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1", name, pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8
      
      const response = await CourseService.searchCourse(name as string, currentPage, pageSizeInt)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getCourseDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courseId  = req.params.id
      
      const response = await CourseService.getCourseDetail(courseId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getCourseByTailor(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "invalid-user-id");
      }

      const {type = 'own', page = "1", pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8

      const response = await CourseService.getAllCourseTailor(
        tailorId,
        type === 'own' ? 'own' : 'others',
        currentPage,
        pageSizeInt
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const {
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate,
      } = req.body

      const response = await CourseService.updateCourse(
        courseId,
        tailorId,
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate,
        req.file
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async deleteCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const response = await CourseService.deleteCourse(courseId, tailorId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
