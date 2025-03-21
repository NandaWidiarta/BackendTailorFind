import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";
import { GeneralController } from "./general-controller";
import { GeneralService } from "../service/general-service";

export class ArticleController {
  static async addArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      let authorName = userReq.user?.firstname

      if (!tailorId || !authorName) {
        throw new ResponseError(400, "Invalid-user-information");
      }

      if (userReq.user?.lastname) {
        authorName += ` ${userReq.user?.lastname}`
      }
      const { title, content } = req.body;
      const response = await ArticleService.addArticle(
        tailorId,
        authorName,
        title,
        content,
        req.file
      );
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllArticles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      
      const response = await ArticleService.getAllArticles(currentPage)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getArticleDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const articleId  = req.params.id
      
      const response = await ArticleService.getArticleDetail(articleId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async searchArticle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1", name, pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8
      
      console.log('masuk search article controllerr')
      const response = await ArticleService.searchArticle(name as string, currentPage, pageSizeInt)

      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async getAllArticleByTailor(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "user-id-not-found");
      }

      const {type = 'own', page = "1", pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8

      const response = await ArticleService.getAllArticleTailor(
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

  static async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const {
        title, 
        content
      } = req.body

      const response = await ArticleService.updateArticle(
        courseId,
        tailorId,
        title, 
        content,
        req.file
      )

      res.status(200).json({
        data: response,
      })
    } catch (e) {
      next(e);
    }
  }

  static async deleteArticle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const articleId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Invalid-user-information");
      }
      
      const response = await ArticleService.deleteArticle(articleId, tailorId)
    
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }



}
