export interface ArticleResponse {
    id: string;
    tailorId: string;
    authorName: string;
    imageUrl?: string | null;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export function mapToArticleResponse(article: any): ArticleResponse {
    return {
        id: article.id,
        tailorId: article.tailorId,
        authorName: `${article.tailor?.user?.firstname || ""} ${article.tailor?.user?.lastname || ""}`.trim(),
        title: article.title,
        imageUrl: article.imageUrl,
        content: article.content,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
    };
}