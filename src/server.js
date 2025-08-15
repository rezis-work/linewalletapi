import express from "express";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rate-limiter.js";
import { initDB } from "./config/db.js";
import transactionsRouter from "./routes/transactions.route.js";
import ratelimit from "./config/upstash.js";

dotenv.config();

const app = express();

app.use(rateLimiter);
app.use(express.json());

app.get("/health", async (req, res) => {
  const key = `${req.ip}:${req.path}`;
  const result = await ratelimit.limit(key);
  res.status(200).json({
    message: "Server is running",
    status: "healthy",
    ip: req.ip,
    result,
  });
});

app.use("/api/transactions", transactionsRouter);

initDB().then(() =>
  app.listen(process.env.PORT, () => {
    console.log(
      `Server is running on port http://localhost:${process.env.PORT}`
    );
  })
);
