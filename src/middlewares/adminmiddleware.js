// import workspace from "../models/workspace.js";


// export const isOwner = async (req, res, next) => {
  
//     const workspaceId = req.params.workspaceId;
//     const userId = req.user._id;

//     const foundWorkspace = await workspace.findById(workspaceId);
//     if (!foundWorkspace) {
//         return res.status(404).json({ message: "Workspace not found" });
//     }
//     if (foundWorkspace.owner.toString() !== userId.toString()) {
//         return res.status(403).json({ message: "You are not authorized to perform this action" });
//     }
//     next();
    
// }


import Workspace from "../models/workspace.js";

export const isOwner = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    // console.log("userId", userId);
    console.log("workspaceId>>>>>>>>>",workspaceId)
    const foundWorkspace = await Workspace.findById(workspaceId);

    if (!foundWorkspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    console.log("foundWorkspace.owner", foundWorkspace.owner);
    // console.log("userId", userId);

    if (foundWorkspace.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to perform this action"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};