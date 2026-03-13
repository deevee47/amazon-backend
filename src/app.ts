import express from "express";
import { corsMiddleware } from "./middlewares/cors.middleware.ts";
import { notFoundHandler } from "./middlewares/notFound.middleware.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";
import apiRouter from "./routes/index.ts";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
