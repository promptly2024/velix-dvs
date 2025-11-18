import { Queue } from "bullmq";
import { defaultQueueOptions } from "../config/queue";
import ioredisClient from "../lib/ioredisClient";

export const emailQueueName = "emailQueue";

export const emailQueue = new Queue(emailQueueName, {
    connection: ioredisClient,
    defaultJobOptions: defaultQueueOptions
})