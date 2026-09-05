import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import {functions} from "./inngest/index.js"
const app = express();
const PORT = process.env.PORT ?? 8081;
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const allowedOrigins = [clientUrl, "http://localhost:3001", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        exposedHeaders: ["x-conversation-id", "X-Conversation-Id"],
    }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

// app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/favicon.ico", (_req, res) => {
    res.type("image/svg+xml");
    res.send(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#7c3aed"/>
            <path d="M18 42h28v6H18zm4-20h20v6H22zm-4-8h28v6H18z" fill="#fff"/>
        </svg>
    `);
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});


registerRoutes(app);

app.use(errorHandler)


app.listen(PORT, () => {
    console.log("Server is running on port 8081");
});