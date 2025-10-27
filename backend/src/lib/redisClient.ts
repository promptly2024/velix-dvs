import { createClient } from 'redis';
import { REDIS_URL } from '../config/env';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('connect', () => {
    console.log('Connected to Redis for sessions')
});
redisClient.on('error', (err) => {
    console.error('Redis error:', err)

});

redisClient.connect().catch(console.error);

export default redisClient;
