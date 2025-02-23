import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";

export class ArticleController {
  static async addArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { tailorId, authorName, title, content } = req.body;
      const response = await ArticleService.addArticle(tailorId, authorName, title, content, req.file);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
