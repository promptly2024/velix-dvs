export const DATABASE_URL = process.env.DATABASE_URL || (() => {
    throw new Error("DATABASE_URL not set in environment variables");
})();

export const JWT_SECRET = process.env.JWT_SECRET || (() => {
    throw new Error("JWT_SECRET not set in environment variables");
})();

export const REDIS_URL = process.env.REDIS_URL || (() => {
    throw new Error("REDIS_URL not set in environment variables");
})();

export const REDIS_SESSION_SECRET = process.env.REDIS_SESSION_SECRET || (() => {
    throw new Error("REDIS_SESSION_SECRET not set in environment variables");
})();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (() => {
    throw new Error("GEMINI_API_KEY not set in environment variables");
})();

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || (() => {
    throw new Error("CLOUDINARY_CLOUD_NAME not set in environment variables");
})();

export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || (() => {
    throw new Error("CLOUDINARY_API_KEY not set in environment variables");
})();

export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || (() => {
    throw new Error("CLOUDINARY_API_SECRET not set in environment variables");
})();