export interface CourseResponse {
    id: string
    tailorId: string
    authorName: string
    imageUrl: string
    courseName: string
    shortDescription: string
    registrationLink: string
    description: string
    place?: string | null
    courseDate?: string | null
    createdAt: Date
    updatedAt: Date
}

export function mapToCourseResponse(course: any): CourseResponse {
    return {
        id: course.id,
        tailorId: course.tailorId,
        authorName: `${course.tailor?.user?.firstname || ""} ${course.tailor?.user?.lastname || ""}`.trim(),
        imageUrl: course.imageUrl,
        courseName: course.courseName,
        shortDescription: course.shortDescription,
        registrationLink: course.registrationLink,
        description: course.description,
        place: course.place,
        courseDate: course.courseDate,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
    }
}