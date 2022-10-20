//Require packages
require("dotenv").config();
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

//declare an Express application
const app = express();

//use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//Use express.static to serve static files.
app.use(express.static("public"));

//set the view engine to use ejs.
app.set("view engine", "ejs");

//set sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//setup Mongoose
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/growTogetherDB");
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  pomodoroStreak: Number,
  chains: {
    chainName: String,
    streak: Number,
  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/grow-together",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/grow-together",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//authentication routes and checks using passportjs
app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.render("login");
  }
});

app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.render("register");
  }
});

app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

app.post("/login", function (req, res) {
  const user = new User({
    email: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    }
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/home");
        });
      }
    }
  );
});

//Page routing
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.render("landing");
  }
});

app.get("/about", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("about");
  } else {
    res.redirect("/login");
  }
});

app.get("/chain", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("chain");
  } else {
    res.redirect("/login");
  }
});

app.get("/future", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("future");
  } else {
    res.redirect("/login");
  }
});

app.get("/pomodoro", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("pomodoro");
  } else {
    res.redirect("/login");
  }
});

//run the app on port 3000 locally.
app.listen(3000, function (req, res) {
  console.log("Server successfully started on port 3000.");
});
