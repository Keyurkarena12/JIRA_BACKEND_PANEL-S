import Project from "../../models/Project.js";
import User from "../../models/user.js";
import Workspace from "../../models/workspace.js";
import { checkPlanLimit } from "../../middlewares/checkPlanLimits.js";

export const createProject = async (req, res) => {
    try {

        const {name,description}=req.body;

        const {workspaceId} = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if(!workspace){
            return res.status(404).json({
                message: "Workspace not found"
            });
        }

        const project = await Project.create({
            name,
            description,
            workspace: workspaceId,
            createdBy: req.user._id,

            // add creator automatically
            members: [
                {
                    user: req.user._id,
                    role: "owner"
                }
            ]
        });

        return res.status(201).json({
            message: "Project created successfully",
            project,
            currentPlan: req.currentPlan,
            limits: req.planLimits
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const getAllProjects = async(req,res)=>{
    const {workspaceId} = req.params;
    try {
        const projects = await Project.find({workspace: workspaceId}).populate('members.user', 'name email');
        const totalProjects = projects.length;
        return res.status(200).json({message: "Projects fetched successfully", projects, totalProjects});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const updateProject = async(req,res)=>{
    try {
       
        const {projectId} = req.params;
        const {name,description} = req.body;
        
        const project = await Project.findById(projectId);
        
        if(!project){
            return res.status(404).json({message: "Project not found"});
        }
        
        project.name = name;
        project.description = description;
        await project.save();
        
        return res.status(200).json({message: "Project updated successfully", project});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteProject = async(req,res)=>{
    try {
        const {projectId} = req.params;
        const project = await Project.findById(projectId);
        if(!project){
            return res.status(404).json({message: "Project not found"});
        }
        await Project.findByIdAndDelete(projectId);
        return res.status(200).json({message: "Project deleted successfully", projectId});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const addProjectMember = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { userId, role } = req.body;

      // 1. project find karo
      const project = await Project.findById(projectId);

      console.log("projeeeeeeee",project)
      console.log("dataaaaaaaaaa",userId,role)

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

    // 2. user exist hai ya nahi check karo
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2.1 check if user is in the workspace
    const workspace = await Workspace.findById(project.workspace);
    const isWorkspaceMember = workspace.members.some(
      (m) => m.user.toString() === userId
    );

    if (!isWorkspaceMember) {
      return res.status(400).json({ message: "User is not a member of this workspace" });
    }
    
    // 3. check karo already member hai ya nahi
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User already a member of this project" });
    }

    // 4. new member add karo
    project.members.push({
      user: userId,
      role: role || "member"
    });

    await project.save();
    
    const populatedProject = await Project.findById(projectId).populate('members.user', 'name email');

    return res.status(200).json({
      message: "Member added successfully",
      project: populatedProject,
      currentPlan: req.currentPlan,
      limits: req.planLimits
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectMembers = async (req, res) => {

    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("members.user", "name email");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            members: project.members
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};