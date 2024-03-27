
const express=require('express')
const router = express.Router()
const User = require("../model/User");
const bcrypt = require("bcrypt"); 

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log('hiiii',req.body.password,'hiiii')

    //create new user 
    const newUser = new User({
      username: req.body.username, 
      email: req.body.email,
      password: hashedPassword,
    });
    
   console.log(newUser);

    //save user and respond
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(req.body.email);
    
    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;