import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

export class ArticleController {
  constructor(
    private readonly articleService: ArticleService
) { }
  async addArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      let authorName = userReq.user?.firstname

      if (!tailorId || !authorName) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }

      if (userReq.user?.lastname) {
        authorName += ` ${userReq.user?.lastname}`
      }
      const { title, content } = req.body;
      const response = await this.articleService.addArticle(
        tailorId,
        title,
        content,
        req.file
      );
      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async getAllArticles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1" } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      
      const response = await this.articleService.getAllArticles(currentPage)
    
      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async getArticleDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const articleId  = req.params.id
      
      const response = await this.articleService.getArticleDetail(articleId)
    
      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async searchArticle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = "1", name, pageSize, searchMode = 'all' } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8;
      
      const validSearchMode = ['own', 'others', 'all'].includes(searchMode as string) 
        ? searchMode as 'own' | 'others' | 'all'
        : 'all';

      const userReq = req as UserRequest
      
      const userId = userReq.user?.id;
      const userRole = userReq.user?.role; 
      
      const finalSearchMode = userRole === 'TAILOR' ? validSearchMode : 'all';
      
      const response = await this.articleService.searchArticle(
        name as string, 
        currentPage, 
        pageSizeInt, 
        userId, 
        finalSearchMode
      );
  
      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async getAllArticleByTailor(req: Request, res: Response, next: NextFunction) {
    try {

      const userReq = req as UserRequest
      const tailorId = userReq.user?.id

      if (!tailorId) {
        throw new ResponseError(400, "User id tidak ditemukan");
      }

      const {type = 'own', page = "1", pageSize } = req.query;
      const currentPage = parseInt(page as string, 10) || 1;
      const pageSizeInt = parseInt(pageSize as string, 8) || 8

      const response = await this.articleService.getAllArticleTailor(
        tailorId,
        type === 'own' ? 'own' : 'others',
        currentPage,
        pageSizeInt
      )

      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const courseId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const {
        title, 
        content
      } = req.body

      const response = await this.articleService.updateArticle(
        courseId,
        tailorId,
        title, 
        content,
        req.file
      )

      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }

  async deleteArticle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userReq = req as UserRequest
      const tailorId = userReq.user?.id
      const articleId = req.params.id

      if (!tailorId) {
        throw new ResponseError(400, "Informasi user tidak valid");
      }
      
      const response = await this.articleService.deleteArticle(articleId, tailorId)
    
      res.status(200).json(response)
    } catch (e) {
      next(e);
    }
  }



}
