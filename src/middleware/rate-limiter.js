import limiter from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const key = `${req.ip}:${req.path}`;
    const result = await limiter.limit(key);

    if (!result.success) {
      res.status(429).json({
        error: "Too many requests, please try again later",
      });
      return;
    }
    next();
  } catch (error) {
    console.error("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
