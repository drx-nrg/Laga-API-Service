import express from 'express'
import dotenv from 'dotenv';
import { userRoutes } from './route/user-routes';
import { authRoutes } from './route/auth-routes';
import { errorMiddleware } from './middleware/error-middleware';

dotenv.config();

const PORT: number | string = process.env.PORT || 8000;

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is listening in port ${PORT}`)
})