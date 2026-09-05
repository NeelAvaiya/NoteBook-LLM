import { ValidationError } from "../types/app-error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import { artifactIdParamSchema, createArtifactSchema, } from "../validators/artifact.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import { createArtifactForWorkspace, deleteArtifactForWorkspace, getArtifactForWorkspace, listArtifactsForWorkspace, } from "../services/artifact.services.js";
function parseWorkspaceId(params) {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid workspace id", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
}
function parseArtifactParams(params) {
    const parsed = artifactIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid artifact params", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
}
export async function listArtifacts(req, res) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const artifacts = await listArtifactsForWorkspace(workspaceId, req.session.user.id);
    res.json(artifacts);
}
export async function getArtifact(req, res) {
    const { workspaceId, artifactId } = parseArtifactParams(req.params);
    const artifact = await getArtifactForWorkspace(workspaceId, artifactId, req.session.user.id);
    res.json(artifact);
}
export async function createArtifact(req, res) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const parsed = createArtifactSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    const artifact = await createArtifactForWorkspace(workspaceId, req.session.user.id, parsed.data);
    res.status(201).json(artifact);
}
export async function deleteArtifact(req, res) {
    const { workspaceId, artifactId } = parseArtifactParams(req.params);
    await deleteArtifactForWorkspace(workspaceId, artifactId, req.session.user.id);
    res.status(204).send();
}
