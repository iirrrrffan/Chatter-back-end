const imageUpload = require("../middleware/imageUploade");
const User = require("../model/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");




//update user
router.put("/:id", imageUpload("profilePicture"),async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email} = req.body;
    const { profilePicture } = req.body;
    const {coverPicture} = req.body;
    console.log(profilePicture);
 
    console.log("nameeeee ", username, email);
    let user = await User.findById(userId); 5
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You can't Update other user's profile" });

    if (profilePicture && coverPicture) {
      if (user.profilePicture && user.coverPicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop(".")[0],
          user.coverPicture.split("/").pop(".")[0]
        );
      }
    }

    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    user.coverPicture = coverPicture || user.coverPicture;

    user = await user.save();

    res.status(200).json({ message: "Profile upadated succesfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
    const check=  await User.findByIdAndDelete(req.params.id)
    console.log(check);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    console.log('fgffgfg')
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    res.status(200).json({
      message: "successfully fetched user profile",
      user: user,
    });
  } catch (error) {
    console.error(error, "get user profile");
    res.status(500).json({ error: "internal server errror" });
  }
  });

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;