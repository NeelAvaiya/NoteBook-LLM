import { workspaceRoutes } from "./workspace.routes.js";
import { sourceRoutes } from "./source.routes.js";
import { chatRoutes } from "./chat.routes.js";
import { artifactRoutes } from "./artifact.routes.js";
export function registerRoutes(app) {
    workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
    workspaceRoutes.use("/:workspaceId", chatRoutes);
    workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);
    app.use("/api/workspaces", workspaceRoutes);
    // app.use("/api/memory", memoryRoutes);
}
