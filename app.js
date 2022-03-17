require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User, sequelize } = require("./db");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable("etag");

app.use(
  session({
    secret: "testingsecretswithpassport.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      User.findOne({ where: { email } }).then(function (user) {
        if (user) {
          return done(null, false, { message: "That email is already taken" });
        } else {
          User.create({ ...req.body }).then((newUser, created) => {
            if (!newUser) return done(null, false);

            return done(null, newUser);
          });
        }
      });
    }
  )
);

passport.use(
  "local-signin",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    (_req, username, password, done) => {
      User.findOne({ where: { username } })
        .then(function (user) {
          if (!user) {
            console.log("Username does not exist");
            return done(null, false, {
              message: "Username does not exist",
            });
          }

          if (user.password !== password) {
            return done(null, false, {
              message: "Incorrect password.",
            });
          }

          return done(null, user.get());
        })
        .catch(function (err) {
          console.error("Error:", err);
          return done(null, false, {
            message: "Something went wrong with your Signin",
          });
        });
    }
  )
);

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser((username, done) => {
  User.findOne({ where: { username } }).then((user) => {
    if (user) {
      done(null, user.get());
    } else {
      done(user.errors, null);
    }
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post(
  "/register",
  passport.authenticate("local-signup", {
    successRedirect: "/secrets",
    failureRedirect: "/register",
  })
);

app.post(
  "/login",
  passport.authenticate("local-signin", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

async function main() {
  await sequelize.sync();

  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
}

module.exports = main;
