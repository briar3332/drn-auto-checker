require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const PASSWORD = process.env.PASSWORD;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Route for root "/" to serve login view
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { password } = req.body;
  const match = await bcrypt.compare(password, PASSWORD);
  if (match) {
    req.session.authenticated = true;
    return res.redirect("/dashboard");
  } else {
    return res.render("login", { error: "Incorrect password" });
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect("/login");
  }
  res.render("dashboard");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
