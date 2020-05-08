// jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const m = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//const md5 = require('md5');
//const encrypt = require("mongoose-encryption");

// create schema mongoose
const Schema = m.Schema;
const userSchema = new m.Schema({
	email: String,
	password: String,
	googleId: String,
	secret: String
});

userSchema.plugin(passportLocalMongoose);

// for mongoose encrypt
//userSchema.plugin(encrypt, {secret: process.env.secret, encryptedFields: ["password"]});
const User = m.model("user", userSchema);

m.set("useCreateIndex", true);

//passport

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// create app

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: "1234",
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());

m.connect("mongodb://localhost:27017/user-db", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// routes

app.get("/", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.render("home");
	}
});

// login routes
app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", (req, res) => {
	// bcrypt
	const u = req.body.username;
	const p = req.body.password;

	User.findOne({ email: u }, (err, foundUser) => {
		if (!err) {
			if (foundUser) {
				bcrypt.compare(
					p,
					foundUser.password,
					(err, result) => {
						if (result === true) {
							res.render("secrets");
						}
					}
				);
			}
		} else {
			console.log(err);
		}
	});
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

// secret routes
app.get("/secrets", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
});

// register routes
app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	// bcrypt
	bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
		const newUser = new User({
			email: req.body.username,
			password: hash
		});

		newUser.save(err => {
			if (!err) {
				res.render("secrets");
			} else {
				console.log(err);
			}
		});
	});
});

// start server
app.listen(3000);
