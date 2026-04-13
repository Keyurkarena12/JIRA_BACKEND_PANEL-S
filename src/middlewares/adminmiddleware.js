import workspace from "../models/workspace.js";


export const isOwner = async (req, res, next) => {
  
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;

    const workspace = await workspace.findById(workspaceId);
    if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
    }
    if (workspace.owner.toString() !== userId.toString()) {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }
    next();
    
}
