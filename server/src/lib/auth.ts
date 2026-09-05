import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const serverBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:8081";
const trustedOrigins = [clientUrl, "http://localhost:3000", "http://localhost:3001"];

export const auth = betterAuth({
    baseURL: serverBaseUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});