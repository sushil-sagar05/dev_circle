const userModel = require('../models/user.model');
const userService = require('../Services/user.service');
const {validationResult} = require('express-validator');
module.exports.registerUser = async(req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {fullname,email,password} = req.body;
    const isUserArlearyRegisterd = await userModel.findOne({email});
    if(isUserArlearyRegisterd){
        return res.status(401).json({message: "User Already Exist"})
    }
    const hashedPassword = await userModel.hashPassword(password);
    const user = await userService.createUser({
        fullname,
        email,
        password:hashedPassword
    });
    const token = user.generateAuthToken();
    const options = {
      httpOnly:true,
      secure:true,
      sameSite:"None",
      maxAge:7 * 24 * 60 * 60 * 1000,
    }
    const { password: _, ...safeUser } = user.toObject();
   return res
   .status(200)
   .cookie("token",token,options)
   .json({token,user:safeUser})
}
module.exports.loginUser = async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()})
    }
    const {email,password} = req.body;
    const user = await userModel.findOne({email}).select('+password')
    if(!user){
        return res.status(401).json({message:'Invalid email or Password'})
    }
    const isMatch = await user.comparePassword(password)
    if(!isMatch){
        return res.status(401).json({message:'Invalid email or password'})
    }
    const token = user.generateAuthToken();
    const options = {
      httpOnly:true,
      secure:true,
      sameSite:"None",
      maxAge:2 * 24 * 60 * 60 * 1000,
    }
    const { password: _, ...safeUser } = user.toObject();
   return res
   .status(200)
   .cookie("token",token,options)
   .json({token,user: safeUser,})
}
module.exports.getUserProfile = async(req,res,next) =>{
    if(!req.user){
       return res.status(401).json({message:'Please Login to view Your profile'});
    }
    return res.status(200).json(req.user)
}
module.exports.updateBio = async(req,res,next)=>{
    const user = req.user
    if(!user){
       return res.status(401).json({message:'Please Login to update bio'}); 
    }
    const {bio}= req.body
    const UpdatedUser = await userModel.findByIdAndUpdate(user._id,{$set:{bio}},{new:true})
    return res.status(200).json({UpdatedUser})

}
module.exports.anotherUserProfile = async(req,res,next)=>{
    const User = req.user
    if(!User){
       return res.status(401).json({message:'Please Login to view This profile'});
    }
    const thatUserId = req.params.id
    const thatUserProfile = await userModel.findById(thatUserId).select('-password')
    if(!thatUserProfile){
       return res.status(400).json({message:'User doesnot exist'}); 
    }
    return res.status(200).json(thatUserProfile)
}
module.exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};