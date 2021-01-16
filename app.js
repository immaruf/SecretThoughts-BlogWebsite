require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const homeStartingContent = "This is a simple blog website where anyone can share their thoughts anonymously!👨‍💻 To post your thoughts just click on COMPOSE!👆";
let posts = [];

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

const postSchema = {
    title: String,
    content: String
};

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/home",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));

app.get("/home", function(req, res) {

    User.find({}, function(err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                Post.find({}, function(err, posts) {
                    res.render("home", {
                        startingContent: homeStartingContent,
                        posts: posts
                    });
                });
            }
        }
    });
});

app.get("/", function(req, res) {

    Post.find({}, function(err, posts) {
        res.render("welcome");
    });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/home",
    passport.authenticate('google', { failureRedirect: "/login" }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/home");
    });

app.get("/compose", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("compose");
    } else {
        res.redirect("/login");
    }
});

app.post("/compose", function(req, res) {
    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody
    });
    post.save(function(err) {
        if (!err) {
            res.redirect("/home");
        }
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/posts/:postId", function(req, res) {

    const requestedPostId = req.params.postId;

    Post.findOne({ _id: requestedPostId }, function(err, post) {
        res.render("post", {
            title: post.title,
            content: post.content
        });
    });

});

app.post("/register", function(req, res) {

    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/home");
            });
        }
    });

});

app.post("/login", function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/home");
            });
        }
    });

});






app.listen(process.env.PORT || 3000, function() {
    console.log("Server has started successfully");
});