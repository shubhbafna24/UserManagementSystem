const express=require("express");
const user_route =express();

const session = require("express-session");

const config =require("../config/config");

user_route.use(session({
    secret: config.sessionSecret,  // The secret for signing the session ID cookie
    resave: false,  // Don't save session if unmodified
    saveUninitialized: false,  // Don't create a session until something is stored
    cookie: { maxAge: 60000 }  // Optional: configure the cookie expiration time (1 minute in this case)
}));

const auth=require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser=require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer = require("multer");
const path = require("path");

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload =multer({storage:storage});

const userController=require("../controllers/userController")

user_route.get('/register',auth.isLogout,userController.loadRegister);

user_route.post('/register',upload.single('image'),userController.insertUser);

user_route.get('/verify',userController.verifyMail);

user_route.get('/',auth.isLogout,userController.loginLoad);

user_route.get('/login',auth.isLogout,userController.loginLoad);

user_route.post('/login', userController.verifyLogin);

user_route.get('/home', auth.isLogin,userController.loadHome);

user_route.get('/logout',auth.isLogin,userController.userLogout)

user_route.get('/forget',auth.isLogout,userController.forgetLoad);

user_route.post('/forget',userController.forgetVerify);

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);

user_route.post('/forget-password',userController.resetPassword);

user_route.get('/verification',userController.verificationLoad);

user_route.post('/verification',userController.sendVerificationLink);

module.exports= user_route;