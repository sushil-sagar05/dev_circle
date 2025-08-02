const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true,
        trim:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"  
     }],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User" ,
                required:true 
            },
            text:{
                type:String,
                required:true,
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]

},{timestamps:true})
const PostModel = mongoose.model('Post',PostSchema);
module.exports = PostModel;