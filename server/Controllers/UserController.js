import UserModal from "../Models/UseerModal.js";
import bycrpt from 'bcrypt'
//get a user
export const getUser = async(req,res)=>{
    const id = req.params.id;
    try {
        const user = await UserModal.findById(id);
        if(user){
            const {password,...otherDetails} = user._doc
            res.status(200).json(otherDetails)
        }
        else{
            res.status(404).json("User does not exist")
        }
    } catch (error) {
        res.status(500).json({message:error})
    }
};

//update a user
export const updateUser = async(req,res) =>{
    const id = req.params.id;
    const {currentUserId,currentUserAdminStatus,password} = req.body;

    if(id===currentUserId||currentUserAdminStatus){
        try {
            if(password){
                const salt = await bycrpt.genSalt(10);
                req.body.password = await bycrpt.hash(password,salt);
            }
            const user = await UserModal.findByIdAndUpdate(id,req.body,{new:true})
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({message:error})
        }
    }
    else{
        res.status(403).json("Access denied")
    }
}

//delete user
export const deleteUser = async(req,res)=>{
    const id = req.params.id;

    const {currentUserId,currentUserAdminStatus} = req.body;

    if(currentUserId===id||currentUserAdminStatus){
        try {
            await UserModal.findByIdAndDelete(id);
            res.status(200).json("User deleted")
        } catch (error) {
            res.status(500).json({message:error})
        }
    }
    else{
        res.status(403).json("Access denied")
    }
}

//follow a user
export const follower = async(req,res) =>{
    const id = req.params.id;
    const {currentUserId} = req.body;

    if(currentUserId===id){
        res.status(403).json("Action forbidden")
    }
    else{
        try {
            const followUser = await UserModal.findById(id)
            const followingUser = await UserModal.findById(currentUserId)
            if(!followUser.followers.includes(currentUserId)){
                await followUser.updateOne({$push:({followers: currentUserId})})
                await followingUser.updateOne({$push:({following:id})})
                res.status(200).json("User followed")
            }
            else{
                res.status(403).json("User is already followed")
            }
        } catch (error) {
            res.status(500).json({message:error})
        }
    }
}

//unfollow a user
export const unfollower = async(req,res) =>{
    const id = req.params.id;
    const {currentUserId} = req.body;

    if(currentUserId===id){
        res.status(403).json("Action forbidden")
    }
    else{
        try {
            const followUser = await UserModal.findById(id)
            const followingUser = await UserModal.findById(currentUserId)
            if(followUser.followers.includes(currentUserId)){
                await followUser.updateOne({$pull:({followers: currentUserId})})
                await followingUser.updateOne({$pull:({following:id})})
                res.status(200).json("User unfollowed")
            }
            else{
                res.status(403).json("User is not followed")
            }
        } catch (error) {
            res.status(500).json({message:error})
        }
    }
}