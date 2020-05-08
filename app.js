//jshint esversion:6
//
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const m = require("mongoose");
const encrypt = require("mongoose-encryption");

// create schema 
const Schema = m.Schema;
const userSchema = new m.Schema({email: String, password: String}); 

userSchema.plugin(encrypt, {secret: process.env.secret, encryptedFields: ["password"]});

const User = m.model("user", userSchema);

// create app

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

m.connect("mongodb://localhost:27017/user-db",{useNewUrlParser: true, useUnifiedTopology: true } );

// routes

app.get("/", (req,res) => {
	res.render("home")
});

app.get("/login", (req,res) => {
	res.render("login")
});

app.post("/login", (req,res) => {
	const u = req.body.username
	const p = req.body.password

	User.findOne({email: u}, (err, foundUser) => {
		if (!err) {
			if (foundUser) {
			if(foundUser.password === p) {
				res.render("secrets");
			}
			}
		} else {
			console.log(err)
		}
	})

});

app.get("/register", (req,res) => {
	res.render("register")
});

app.post("/register", (req, res) => {
	const newUser = new User({
		email: req.body.username,
		password: req.body.password
	});

	newUser.save( err => {
		if (!err) {
			res.render("secrets");
		} else {
			console.log(err)
		}
	});
})

// start server
app.listen(process.env.PORT || 3000);
