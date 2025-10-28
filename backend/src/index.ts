import dotenv from "dotenv"
dotenv.config();

import express, { Request, Response } from "express"
import cors from "cors"
import { authRouter } from "./routes/auth.route";
import { RedisStore } from "connect-redis";
import session from 'express-session';
import redisClient from "./lib/redisClient";
import { REDIS_SESSION_SECRET } from "./config/env";
import swaggerOptions from "./config/swaggerOptions";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";

const app = express();
// Helmetjs is used to add security headers to every request to protect the app from common vulnerabilties 
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);

const store = new (RedisStore)({
    client: redisClient,
})

app.use(
    session({
        store,
        secret: REDIS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, //only true for https
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // one day
        }
    })
)

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
    if (!req.session) {
        return res.send('No session');
    }
    req.session.views = (req.session.views || 0) + 1;
    res.send(`Number of views: ${req.session.views}`);
});


// Routes
app.use('/api/v1/auth', authRouter);

app.use(errorHandler);

app.listen(3001, () => {
    console.log("Listening to port 3001");
    console.log("Swagger docs available at http://localhost:3001/api-docs");
})