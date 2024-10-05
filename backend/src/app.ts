import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { userRoutes } from "./route/user-routes";
import { authRoutes } from "./route/auth-routes";
import { errorMiddleware } from "./middleware/error-middleware";
import { fakerID_ID as faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { prisma } from "./database/database";
import { Classroom, User } from "@prisma/client";
import { classroomRoutes } from "./route/classroom-routes";
import { generateSlug } from "./lib/generate-slug";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'

dotenv.config();

const PORT: number | string = process.env.PORT || 8000;

export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get(
  "/api/user-factory",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const companies: string[] = [];
    for (let i = 0; i < 100; i++) {
      const firstName: string = faker.person.firstName();
      const lastName: string = faker.person.lastName();
      const data: any = {
        firstname: firstName,
        lastname: lastName,
        email: faker.internet
          .email({ firstName: firstName, lastName })
          .toLowerCase(),
        username: faker.internet
          .userName({ firstName, lastName })
          .toLowerCase(),
        password: await bcrypt.hash("jokowiganteng", 10),
      };

      await prisma.user.create({ data });
    }

    return res.json({
      content: companies,
    });
  }
);

app.get('/api/user-customizer', async (req: Request, res: Response, next: NextFunction) => {
  await prisma.user.updateMany({
    where: {
      password: {
        startsWith: "$2b$"
      }
    },
    data: {
      password: await bcrypt.hash("jokowiganteng", 10)
    }
  });

  res.status(200).json({
    status: "success"
  })
})

app.get(
  "/api/class-factory",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const users: User[] = await prisma.user.findMany();
    let classrooms: any = [];
    for (let i = 0; i < 100; i++) {
      const title = [...Array(3)]
        .map((_) =>
          faker.word
            .noun()
            .split("")
            .map((el: string, i: number) => (i === 0 ? el.toUpperCase() : el))
            .join("")
        )
        .join(" ");
      const data: Classroom = {
        title,
        description: faker.lorem.paragraph(2),
        creator_id: users[Math.floor(Math.random() * users.length)].user_id,
        classroom_picture: null,
        max_students: 30,
      } as Classroom;

      const created = await prisma.classroom.create({ data });
      classrooms.push(created);
    }

    res.status(200).json({
      data: classrooms,
    });
  }
);

app.get('/api/class-customizer', async (req: Request, res: Response, next: NextFunction) => {
  const classrooms = await prisma.classroom.findMany();
  const classroomIDs = classrooms.map((cl: any) => Number(cl.classroom_id));

  for(let i = 0; i < classrooms.length; i++){
    await prisma.classroom.update({
      where: {
        classroom_id: classroomIDs[i]
      },
      data: {
        slug: generateSlug(classrooms[i].title) as string
      }
    })
  }

  res.status(200).json({
    status: "success"
  })
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/classroom", classroomRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "not-found",
    message: "Not Found"
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is listening in port ${PORT}`);
});
