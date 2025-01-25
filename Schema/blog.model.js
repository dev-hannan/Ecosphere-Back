// Schema/blog.model.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String }],
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
