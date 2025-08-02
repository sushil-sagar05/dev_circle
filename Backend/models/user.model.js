const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
     fullname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
    email:{
        type:String,
        required:true,
        unique:true,
        index: true,
        minLength:[5,'Email must be atleast 5 character long']
    },
    bio:{
        type:String,
        minLength:[10,'Bio must be atleast 10 characters long'],
        maxlength:[300,'Bio must be less than 300 characters']
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"  
    }],
    dislikes:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
            }
          
    ]
},{timestamps:true})
userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id}, process.env.JWT_SECRET,{expiresIn:'24h'});
    return token;
}
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password,10);
}
const userModel= mongoose.model('User',userSchema);
module.exports = userModel;