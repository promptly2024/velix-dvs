import IORedis from 'ioredis';
import { REDIS_URL } from "../config/env";

export const ioredisClient = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

ioredisClient.on('connect', () => {
    console.log("Connected to redis for bullmq");
})

ioredisClient.on('error', (err) => {
    console.log("IORedis error", err);
})

export default ioredisClient;