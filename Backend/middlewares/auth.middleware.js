const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1] ;

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if(!process.env.JWT_SECRET){
     return res.status(400).json({ message: 'Secret is not matched' });  
     }

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};