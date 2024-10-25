const express = require("express");
const admin_route=express();

const session = require("express-session");
const config= require("../config/config");
admin_route.use(session({secret:config.sessionSecret}));

const bodyParser= require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const auth=require("../middleware/adminauth");


const adminController =require("../controllers/adminController");


admin_route.get('/',auth.isLogout,adminController.loadLogin)

admin_route.post('/',adminController.verifyLogin)

admin_route.get('/home',auth.isLogin,adminController.loadDashboard);

admin_route.get('/logout',auth.isLogin, adminController.logout);

admin_route.get('/forget',auth.isLogout, adminController.forgetLoad);
admin_route.post('/forget', adminController.forgetVerify);

admin_route.get('/forget-password', auth.isLogout,adminController.forgetPasswordLoad);

admin_route.post('/forget-password', adminController.resetPassword);

admin_route.get('*',function(req,res){

    res.redirect('/admin');
})

module.exports= admin_route;