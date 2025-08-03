const express = require('express');
const connectdb = require('./DB/db')
const dotenv  = require("dotenv")
dotenv.config(
    {path:'.env'}
)
connectdb();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());


app.set("trust proxy",1);

const corsOptions = {
    origin: (origin, callback) => {
  
      const allowedOrigin = process.env.FRONTEND_URL;

      if (origin === allowedOrigin || !origin) {
        callback(null, true);  
      } else {
  
        callback(new Error('Not allowed by CORS'), false);  
      }
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));
  

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Credentials','true');
    next()
})
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (req,res)=>{
    res.send('Hello World');
});
const userRoutes = require('./routes/user.routes')
const postRoutes = require('./routes/post.routes')
app.use('/user',userRoutes)
app.use('/posts',postRoutes)
app.get('/user/batch', async (req, res) => {
  try {
    const ids = req.query.ids.split(',');
    const users = await userModel.find({ _id: { $in: ids } }).select('fullname email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = app;