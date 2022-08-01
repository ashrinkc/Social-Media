import PostModal from "../Models/PostModal.js";
import mongoose from "mongoose";
import UserModal from "../Models/UseerModal.js";

//create new post
export const createPost = async(req,res)=>{
    const newPost = new PostModal(req.body);
    try {
        await newPost.save();
        res.status(200).json("Post created");
    } catch (error) {
        res.status(500).json(error)
    }
}

//get a post
export const getPost = async(req,res)=>{
    const id = req.params.id
    try {
        const post = await PostModal.findById(id);
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//update a post
export const  updatePost= async(req,res)=>{
    const postId = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModal.findById(postId)
        if(post.userId === userId ){
            await post.updateOne({$set:req.body})
            res.status(200).json("post updated")
        }else{
            res.status(403).json("action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

//ddelete a post
export const deletePost = async(req,res)=>{
    const id = req.params.id;
    const {userId} = req.body

    try {
        const post = await PostModal.findById(id)
        if(post.userId === userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully")
        }else{
            res.status(403).json("action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

//likes/dislike a post
export const likePost = async(req,res) =>{
    const id = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModal.findById(id);
        if(!post.likes.includes(userId)){
            await post.updateOne({$push : {likes : userId}})
            res.status(200).json("Post liked")
        }else{
            await post.updateOne({$pull : {likes : userId}})
            res.status(200).json("Post unliked")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

//get timeline post
export const getTimeLinePost = async(req,res)=>{
    const userId = req.params.id;
    try {
        const currentUserPosts = await PostModal.find({userId:userId})
        const followingPosts = await UserModal.aggregate([
           {
            $match:{
                _id: new mongoose.Types.ObjectId(userId)
            }
           },
           {
            $lookup:{
                from:"posts",
                localField:"following",
                foreignField:"userId",
                as:"followingPosts"
            }
           },
           {
            $project:{
                followingPosts:1,
                _id:0
            }
           }
        ])
        res.status(200)
        .json(currentUserPosts.concat(...followingPosts[0].followingPosts)
        .sort((a,b)=>{
            return b.createdAt - a.createdAt;
        })
        )
    } catch (error) {
        res.status(500).json(error)
    }
}