import { RATE_LIMIT, RATE_WINDOW } from "../constants/index.js";
import redisClient from "../redis/index.js";

export const ipRateLimiter = async (req, res, next) => {
  const clientId = req.ip; // Use client IP address as the identifier
  const key = `rate-limit:${clientId}`;
  try {
    // Increment the request count
    const requests = await redisClient.incr(key);

    if (requests === 1) {
      // If it's the first request, set the expiration time
      await redisClient.expire(key, RATE_WINDOW);
    }

    if (requests > RATE_LIMIT) {
      // If the limit is exceeded, block the request
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again after ${RATE_WINDOW} seconds.`,
      });
    }
    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
