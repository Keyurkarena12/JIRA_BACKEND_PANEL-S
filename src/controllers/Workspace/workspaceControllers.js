import workspace from "../../models/workspace.js"

export const createWorkspace = async (req,res) => {

    try {
         const {name,slug,description} = req.body;

         const newWorkspace = await workspace.create({
            name,
            slug,
            description,
            owner: req.user._id
         });

         if(!newWorkspace){
            return res.status(400).json({message: "Workspace not created"});
         }

         res.status(201).json(newWorkspace);
       
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    
}