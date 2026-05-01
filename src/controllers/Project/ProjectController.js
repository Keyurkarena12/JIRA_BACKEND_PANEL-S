import Project from "../../models/Project.js";
import User from "../../models/user.js";
import Workspace from "../../models/workspace.js";


// export const createProject = async(req,res) =>{

//     try {
     
//         const {name,description}=req.body;
//         const {workspaceId} = req.params;
//         // const {workspaceId}=req.query;

//         // console.log("workspaceId", workspaceId);
//         const workspace = await Workspace.findById(workspaceId);

//         console.log("workspace.....+++++", workspace);
//         if(!workspace){
//             return res.status(404).json({message: "Workspace not found"});
//         }

//         const project = await Project.create({
//             name,
//             description,
//             workspace: workspaceId,
//             createdBy: req.user._id
//         });

//         return res.status(201).json({message: "Project created successfully", project});
        
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({message: "Internal server error"});
//     }
    
// } 


export const createProject = async(req,res) =>{

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
            project
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

    // 3. check karo already member hai ya nahi
    const alreadyMember = project.members.find(
      (m) => m.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User already a member" });
    }

    // 4. new member add karo
    project.members.push({
      user: userId,
      role: role || "member"
    });

    await project.save();

    return res.status(200).json({
      message: "Member added successfully",
      project
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