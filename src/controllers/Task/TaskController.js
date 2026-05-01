import Task from "../../models/Task.js";
import Project from "../../models/Project.js";

export const taskCreate = async (req, res) => {

    try {

        const { title, description, column, priority, dueDate } = req.body;
        const { projectId } = req.params;

        const lastTask = await Task.findOne({ project: projectId, column })
            .sort({ order: -1 });

        const newOrder = lastTask ? lastTask.order + 1 : 1;

        // Get project to generate task key
        const project = await Project.findById(projectId);
        const projectPrefix = project ? project.name.substring(0, 3).toUpperCase() : 'TSK';
        
        // Count total tasks in project for sequential number
        const taskCount = await Task.countDocuments({ project: projectId });
        const taskKey = `${projectPrefix}-${taskCount + 1}`;

        const task = await Task.create({
            taskKey,
            title,
            description,
            project: projectId,
            column,
            priority,
            dueDate,
            order: newOrder,
            reporter: req.user._id
        });

        console.log("backend task",task)

        return res.status(201).json({
            message: "Task created",
            task
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }

}


export const getTask = async(req,res)=>{
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        return res.status(200).json({
            message: "Task fetched",
            task
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
} 


export const getProjectTask = async(req,res)=>{

    try {
        const {projectId}=req.params;
        console.log("Fetching tasks for projectId:", projectId);

    const task = await Task.find({ project: projectId }).populate('assignee', 'name email');
    console.log("Found tasks:", task.length, task);
    
    return res.status(200).json({
        message: "Project tasks fetched",
        task
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const assignTaskMember  = async(req,res)=>{
    try {
        const {taskId}= req.params;
        
        const {assigneeId}= req.body;

        const task = await Task.findById(taskId);

        if(!task){
            return res.status(404).json
            ({
                message:"Task not found"
            })
        }

        const project = await Project.findById(task.project);

        if(!project){
            return res.status(404).json
            ({
                message:"Project not found"
            })
        } 

         const isProjectMember = project.members.find(
            m => m.user.toString() === assigneeId
        );


        if(!isProjectMember){
            return res.status(404).json
            ({
                message:"User is not a member of this project"
            })
        } 

        task.assignee = assigneeId;
        await task.save();
        
        // Populate the assignee data before returning
        const populatedTask = await Task.findById(task._id).populate('assignee', 'name email');
        
        return res.status(200).json({
            message: "Task assigned",
            task: populatedTask
        });

    

    } catch (error) {
        
         console.log(error);
        return res.status(500).json({message: "Internal server error"});

    }
}

