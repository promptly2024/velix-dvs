import { HIBP_API_KEY } from "./env";

export const hibpConfig = {
  apiKey: HIBP_API_KEY,
  rateLimit: {
    windowMs: 60 * 1000,
    max: 10,
  },
  cacheExpiry: 24 * 60 * 60,
};