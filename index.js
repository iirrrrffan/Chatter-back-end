const express = require("express");
const app = express();
const mongoose = require("mongoose")
const PORT = 3006
const cors =require("cors")
const authRoute = require("./routes/auth")
const userRoute = require("./routes/users");
const bodyParser = require("body-parser");
const morgan= require('morgan')

mongoose.connect("mongodb://127.0.0.1:27017/Chatter",{
useNewUrlParser: true,
useUnifiedTopology:true
    
}).then(()=>{
    console.log('Connected to MongoDb');
}).catch((err)=>{
    console.log('Error connecteing to MongoDb',err);
})


// middleware
app.use(express.json()); 
app.use(morgan('dev'));


app.use(cors())
app.use("/api/auth", authRoute);
app.use("/api/users",userRoute);



app.listen(PORT,()=>{
   console.log('server is runing on port 3000');
})  