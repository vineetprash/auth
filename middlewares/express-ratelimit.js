import ratelimit from "express-rate-limit";

// Apply rate limiting middleware
export const limiter = ratelimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many requests, please try again later.",
});
