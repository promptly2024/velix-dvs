import dotenv from "dotenv"
dotenv.config();
import express, { Request, Response } from "express"
import cors from "cors"
import { authRouter } from "./routes/auth.route";
import { RedisStore } from "connect-redis";
import session from 'express-session';
import redisClient from "./lib/redisClient";
import { REDIS_SESSION_SECRET } from "./config/env";

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/', (req: Request, res: Response) => {
    if (!req.session) {
        return res.send('No session');
    }
    req.session.views = (req.session.views || 0) + 1;
    res.send(`Number of views: ${req.session.views}`);
});


// Routes
app.use('/api/auth', authRouter);

app.listen(3001, () => {
    console.log("Listening to port 3001")
})