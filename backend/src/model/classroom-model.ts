import { Classroom, Topic, User } from "@prisma/client";

export interface ClassroomIndex extends Classroom {
    topics: Topic[],
    creator: User
    total_students: number,
}

export interface ClassroomRequest {
    title: string,
    description: string,
    classroom_picture?: string
    max_students: number
}


