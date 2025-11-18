import { Worker, Job } from 'bullmq';
import ioredisClient from '../lib/ioredisClient';
import { emailQueueName } from '../queues/email.queue';

interface EmailJobData {
    to: string;
    subject: string;
    body: string;
    template?: string;
}

export const emailWorker = new Worker<EmailJobData>(
    emailQueueName,
    async (job: Job<EmailJobData>) => {
        console.log(`Processing job ${job.id}`);
        
        await job.updateProgress(10);
        
        try {
            //  email sending logic here
            const { to, subject, body, template } = job.data;

            // await sendEmail(to, subject, body);
            await job.updateProgress(50);
            
            return { success: true, sentAt: new Date().toISOString() };
        } catch (error) {
            console.error(`Failed to process job ${job.id}:`, error);
            throw error;
        }
    },
    {
        connection: ioredisClient,
        concurrency: 5, 
        limiter: {
            max: 10, 
            duration: 1000, 
        },
    }
);

emailWorker.on('completed', (job, returnvalue) => {
    console.log(`Job ${job.id} completed with result:`, returnvalue);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error:`, err.message);
});

emailWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
});

emailWorker.on('error', (err) => {
    console.error('Worker error:', err);
});

export default emailWorker;
