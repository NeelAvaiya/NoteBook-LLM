import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
export async function requireAuth(req, res, next) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    req.session = session;
    next();
}
