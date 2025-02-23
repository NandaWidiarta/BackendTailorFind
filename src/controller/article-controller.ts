import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../service/article-service";
import { UserRequest } from "../type/user-request";
import { ResponseError } from "../error/response-error";

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
}
