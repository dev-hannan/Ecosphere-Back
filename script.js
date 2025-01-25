// const express = require('express');
import express from "express";
import { ConnectDb } from "./connectDb.js";
import User from "./Schema/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Blog from "./Schema/blog.model.js";


import cors from "cors";
import { JWT_SECRET } from "./constants/dummy.js";
import { authenticate } from "./middleware/authentication.js";


const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Create a blog
app.post("/blogs", authenticate, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.userId;
    const blog = await Blog.create({ title, content, tags, userId });
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("userId", "name email");
    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch blogs of the logged-in user
app.get("/my-blogs", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const blogs = await Blog.find({ userId });
    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id)
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ blog });
  } catch (error) {
    console.error("Error fetching single blog:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a blog (only by the creator)
app.put("/blogs/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.userId;
    const blog = await Blog.findOneAndUpdate(
      { _id: id, userId },
      { title, content, tags },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a blog (only by the creator)
app.delete("/blogs/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const blog = await Blog.findOneAndDelete({ _id: id, userId });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/user-data", async function (req, res) {
  const data = await User.create(req.body);
  res.send(data);
});
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create a new user
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error in /register endpoint:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});


app.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

ConnectDb().then(() => {
  app.listen(3000, () => {
    console.log("server started on port 3000");
  });
});
