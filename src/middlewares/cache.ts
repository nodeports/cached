import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

const redis = new Redis();

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cacheKey = `__express__${req.originalUrl || req.url}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.send(JSON.parse(cachedData));
    } else {
      const originalSend = res.send.bind(res);

      res.send = (body) => {
        redis.set(cacheKey, JSON.stringify(body), "EX", 3600);
        originalSend(body);
        return res;
      };

      next();
    }
  } catch (err) {
    console.error("Redis error:", err);
    next();
  }
};

export default cacheMiddleware;
