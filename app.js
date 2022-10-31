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
  await mongoose.connect(process.env.ATLAS_KEY);
}

const chainSchema = new mongoose.Schema({
  chainName: String,
  streak: Number,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  pomodoroStreak: Number,
  chains: [chainSchema],
});

//Insert passportLocalMongoose and findOrCreate Plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
const Chain = mongoose.model("Chain", chainSchema);

passport.use(User.createStrategy());

//Serialise and deserialise user
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//Create Google strategy, according to Oauth2.0 Google authentication documentation
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

//Google authorisation page route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

//if Google auth fails redirect to login page
app.get(
  "/auth/google/grow-together",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//authentication routes and checks using passport.js
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

//Log in user using passport local method
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

//Create new user using passport local method
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

//Page routing after checking for authentication
app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

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

//If user is authenticated render chain page with their chains displayed
app.get("/chain", function (req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else if (foundUser) {
        res.render("chain", { userChains: foundUser.chains });
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Adding new chain to the user schema with 0 streak to begin with.
app.post("/chain", function (req, res) {
  const newChainName = req.body.newChain;
  if (req.body.submit === "add") {
    console.log(req.body.submit);
    User.findById(req.user._id, function (err, foundUser) {
      if (err) {
        console.log(err);
      } else if (foundUser) {
        foundUser.chains.push({
          chainName: newChainName,
          streak: 0,
        });
        foundUser.save(function () {
          res.redirect("/chain");
        });
      }
    });
  }
});

//Increasing or decreasing the specific chain's streak when + or - buttons are clicked
app.post("/chainDisplay", function (req, res) {
  const clickedChain = req.body.secret;
  const clickedButton = req.body.submit;
  const clickedId = clickedChain.currentId;

  if (clickedButton === "increase") {
    User.findOneAndUpdate(
      { id: req.user._id, "chains.chainName": clickedChain },
      { $inc: { "chains.$.streak": 1 } },
      function (err, foundUser) {
        if (!err) {
          res.redirect("/chain");
        }
      }
    );
  } else if (clickedButton === "decrease") {
    User.findOneAndUpdate(
      { id: req.user._id, "chains.chainName": clickedChain },
      { $inc: { "chains.$.streak": -1 } },
      function (err, foundUser) {
        if (!err) {
          res.redirect("/chain");
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

app.listen(port, function() {
  console.log("Server has started successfully.");
});
