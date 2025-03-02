require("dotenv").config()

const express = require("express");
const path = require("path");
const userRouter = require("./routes/user");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const blogRoute = require("./routes/blog")
const {
  cheakforAuthenticationoCookie,
} = require("./middlewares/authentication");

const User = require("./models/user")
const blog = require("./models/blog") 

const app = express();
mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("mongodb conncted..."));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cheakforAuthenticationoCookie("token"));
app.use(express.static(path.resolve("./public")))

app.get("/",async (req, res) => {
  const allBlogs = await blog.find({})
  let users = await User.find({_id:'677d835e25ef18456fea7df6'})
  if(req.user){
  const id = req.user._id
  users = await User.find({_id:id})
  }
  console.log(users)
  res.render("home", {
     user: req.user,
     users,
    blogs:allBlogs });
});

app.use("/user", userRouter);
app.use("/blog",blogRoute)

app.listen(process.env.PORT||8000, () => console.log(`server started at port 8000....`));
