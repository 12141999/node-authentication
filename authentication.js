var express = require("express");
var path=require('path');
var mongoose = require('mongoose');
var User =  require("./user");
var passport = require("passport");
var LocalStrategy  = require("passport-local");
var passportLocalMongoose  = require("passport-local-mongoose");

var app = express();
var bodyParser = require('body-parser');
 mongoose.connect("mongodb://localhost/auth_example");
app.use(bodyParser.urlencoded({extended : true}));
app.use('', express.static(path.join(__dirname + '')));
app.set('views', path.join(__dirname, 'views'));

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.post("/signup",function(req,res){
    var name = req.body.username;
    var password  =  req.body.password;
 	User.register(new User({username : name}) ,  password , function(err,user){
         if(err)
         {
         	console.log(err);
          return res.render("register.ejs");
         }
          passport.authenticate("local")(req, res, function(){
              res.redirect("/secret");
            });
            
});
});

app.get("/secret", isLoggedIn ,function(req,res){
  User.find({},function(err,result){
     res.render("secret.ejs",{p : result});
  });
});

app.get("/login" , function(req,res){
   res.render("authlogin.ejs");
});

app.get("/signup",function(req,res){
   res.render("register.ejs");
});

app.get("/",function(req,res){
   res.render("home.ejs");
});

app.post("/login" , passport.authenticate("local",{
   successRedirect : "/secret" , 
   failureRedirect : "/login"
}), function(req,res){
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}


app.listen("6088",function(req,res){
   console.log("server is started");
});