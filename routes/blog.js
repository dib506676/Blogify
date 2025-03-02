const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");

const blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()} - ${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", async (req, res) => {
  const id = req.user._id;
  const users = await User.find({ _id: id });
  return res.render("addBlog", {
    user: req.user,
    users,
  });
});

router.get("/:id", async (req, res) => {
  const Blog = await blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  const id = req.user._id;
  const users = await User.find({ _id: id });
  console.log("blog : ", Blog);
  console.log("comment : ", comments);
  return res.render("blog", {
    user: req.user,
    Blog,
    comments,
    users,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImageURL"), async (req, res) => {
  const { title, body } = req.body;
  const Blog = await blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${Blog._id}`);
});

module.exports = router;