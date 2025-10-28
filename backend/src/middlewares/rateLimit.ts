import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,  // we should remember a request for 5 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: "Too many request, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});