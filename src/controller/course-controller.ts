import { Request, Response, NextFunction } from "express";
import { CourseService } from "../service/course-service";
import { ResponseError } from "../error/response-error";
import { UserRequest } from "../type/user-request";

export class CourseController {
  constructor(
    private readonly courseService: CourseService
) { }
  async addCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return next()
      }

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }

      const {
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate,
      } = req.body

      const response = await this.courseService.addCourse(
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

  async getAllCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      
      const response = await this.courseService.getAllCourse(currentPage)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async searchCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1", name, pageSize, searchMode = 'all' } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8

      const validSearchMode = ['own', 'others', 'all'].includes(searchMode as string) 
        ? searchMode as 'own' | 'others' | 'all'
        : 'all';

      const userReq = req as UserRequest
      
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role; 
      
      const finalSearchMode = userRole === 'TAILOR' ? validSearchMode : 'all';
      
      const response = await this.courseService.searchCourse(name as string, currentPage, pageSizeInt, userId, finalSearchMode)
      
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getCourseDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courseId  = req.params.id
      
      const response = await this.courseService.getCourseDetail(courseId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getCourseByTailor(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "User id tidak valid");
      }

      const {type = 'own', page = "1", pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8

      const response = await this.courseService.getAllCourseTailor(
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

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const {
        courseName,
        shortDescription,
        registrationLink,
        description,
        place,
        courseDate,
      } = req.body

      const response = await this.courseService.updateCourse(
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

  async deleteCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const response = await this.courseService.deleteCourse(courseId, tailorId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
