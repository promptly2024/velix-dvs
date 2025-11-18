import emailWorker from "./email.worker";

export const startWorkers = () => {
    console.log('Starting BullMQ workers...');    
    return {
        emailWorker,
    };
};

export const shutdownWorkers = async () => {
    console.log('Shutting down workers...');
    
    await emailWorker.close();
    
    console.log('All workers shut down');
};

process.on('SIGTERM', async () => {
    await shutdownWorkers();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await shutdownWorkers();
    process.exit(0);
});
