import UserModal from "../Models/UseerModal.js";
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
//register a new user
export const register = async(req,res)=>{
    
    const salt = await bycrypt.genSalt(10);
    const hashpassword = await bycrypt.hash(req.body.password,salt);
    req.body.password = hashpassword
    const newUser = new UserModal(req.body)
    const {username} = req.body

    try{
        const oldUser = await UserModal.findOne({username})
        if(oldUser){
            return res.status(400).json({message:"username is already registered"})
        }
        const user = await newUser.save()
        const token = jwt.sign({
            username:user.username,id:user._id
        },"MERN",{expiresIn:'1h'})
        res.status(200).json({user,token})
    }catch(error){
        res.status(500).json({message:error})
    }
}

//login user
export const login = async(req,res)=>{
    const {username,password} = req.body;

    try {
        const user = await UserModal.findOne({username: username})
        if(user){
            const validy = await bycrypt.compare(password,user.password)

            if(!validy)
            {
                res.status(400).json("Wrong password")
            }else{
                const token = jwt.sign({
                    username:user.username,id:user._id
                },"MERN",{expiresIn:'1h'})
                res.status(200).json({user,token})
            }
        }
        else{
            res.status(404).json("User does not exist")
        }
    } catch (error) {
        res.status(500).json({message:error})
    }
}