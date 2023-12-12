// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routers/adminAuth.js");
const projectsRoutes = require("./routers/projects.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Use auth routes
app.use("/auth", authRoutes);

// Use projects routes
app.use("/api", projectsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
