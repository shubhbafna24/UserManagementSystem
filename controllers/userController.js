const User=require('../models/userModel');
const bcrypt = require('bcryptjs');
const nodemailer=require("nodemailer");

const randomstring=require("randomstring")

//require('dotenv').config();
const config=require("../config/config");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

// for send mail
const sendVerifyMail =async(name,email,user_id)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions ={
            from: config.emailUser,
            to:email,
            subject:'For Verification Purpose',
            html:'<p> Hii '+name+ ', please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'"> Verify </a> your mail .</p>'
        }

        transporter.sendMail(mailOptions, function(error,info){
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log("Email has been send :-", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

// for reset password send mail
const sendResetPasswordMail =async(name,email,token)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions ={
            from: config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p> Hii '+name+ ', please click here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'"> Reset  </a> your Password .</p>'
        }

        transporter.sendMail(mailOptions, function(error,info){
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log("Email has been send :-", info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister =async(req,res)=>{
    try{

        res.render('registration');

    } catch(error) 
    {
        console.log(error);        
    }
}

const insertUser= async(req,res)=>{
    try {
        const spassword=await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0,
        });

        const userData= await user.save();

        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration',{message:"Your Registeration has been Succesfull. Please verify your mail"});
        }
        else
        {
            res.render('registration',{message:"Your Registeration has been Failed"});
        }        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail =async(req,res)=>{
    
    try {
        //new code added to prevent
        // Cast to ObjectId failed for value "{ _id: undefined }" (type Object) at path "_id" for model "User"

        const userId = req.query.id;
        if (!userId) {
            console.log("User ID is undefined");
            return res.render("404", { message: "Invalid User ID" });
        }
        const updateInfo= await User.updateOne({_id:req.query.id},{ $set:{ is_verified:1 } });

        console.log(updateInfo);
        res.render("email-verified");


    } catch (error) {
        clg(error.message);
    }
}

//login user methods started

const loginLoad = async (req,res)=>{
    try {
        res.render('login');
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log the entire request body
        const email = req.body.email;
        const password = req.body.password;

        // const email ='shubhbafnaindia@gmail.com';
        // const password='123'

        // Log email and password
        console.log("Email:", email);
        console.log("Password:", password);

        const userData = await User.findOne({ email: email });
        console.log("User Data:", userData);

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log("Password Match:", passwordMatch);

            if (passwordMatch) {
                console.log("User Verified:", userData.is_verified);
                if (userData.is_verified === 0) {
                    res.render('login', { message: "Please verify your mail." });
                    console.log("User not verified");
                    return;
                } else {
                    req.session.user_id=userData._id;
                    
                    console.log("Redirect to home");
                    return res.redirect('/home');
                }
            } else {
                res.render('login', { message: "Email and password is incorrect" });
                console.log("Password incorrect");
            }
        } else {
            res.render('login', { message: "Email and password is incorrect" });
            console.log("User not found");
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
};


const loadHome = async (req,res)=>{
    try {
        //new code added to prevent
        // Cast to ObjectId failed for value "{ _id: undefined }" (type Object) at path "_id" for model "User"
        
        const userId = req.query.id;
        if (!userId) {
            console.log("User ID is undefined");
            return res.render("404", { message: "Invalid User ID" });
        }

        const userData = await User.findById({_id: req.session.user_id});
        res.render('home',{user:userData});

    } catch (error) {

        console.log(error.message);
        
    }
}

const userLogout = async(req,res)=>{
    try {
        // req.session.destroy();
        // res.redirect('/');
        
        req.session.destroy((err) => {
            if (err) console.log("Session destruction error:", err);
            res.redirect('/');
        });
        
    } catch (error) {
        console.log(error.message);
    }
}
// forget password
const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
        
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req,res)=>{
    try {
        const email=req.body.email;
        const userData= await User.findOne({email:email});

        if(userData){
            
            if(userData.is_verified === 0)
            {
                res.render('forget',{message:"Please verify your mail"});
            }
            else
            {
                const randomString= randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{ token : randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);

                res.render('forget',{message:"Please check your mail to reset your password"})
            }

        }
        else{
            res.render('forget',{message:"User email is incorrect. "});
        }
        

    } catch (error) {
        console.log(error.message);
    }    
}
const forgetPasswordLoad = async(req,res)=>{
    try {
        const token=req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }
        else
        {
            res.render('404',{message:"Token is Invalid."})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword= async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id=req.body.user_id;

        const secure_password= await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({_id:user_id},{ $set: { password :secure_password, token:''}});

        res.redirect("/");
        
    } catch (error) {
        console.log(error.message);
    }
}

// for verification send link

const verificationLoad= async(req,res)=>{
    try {
        res.render('verification');
        
    } catch (error) {
        console.log(error.message);
    }
}

const sendVerificationLink= async(req,res)=>{
    try {
        const email=req.body.email;
        const UserData=await User.findOne({email:email});

        if(UserData){
            sendVerifyMail(UserData.name,UserData.email,UserData._id);
            res.render('verification',{message:"Verification mail is sent to your email id"})
        }
        else
        {
            res.render('verification',{message:"This email is not registered"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//user profile edit and update

const editLoad= async(req,res)=>{
    try {
        //new code added to prevent
        // Cast to ObjectId failed for value "{ _id: undefined }" (type Object) at path "_id" for model "User"
        
        const userId = req.query.id;
        if (!userId) {
            console.log("User ID is undefined");
            return res.render("404", { message: "Invalid User ID" });
        }

        const id = req.query.id;
        const userData = await User.findById({_id:id});

        if(userData)
        {
            res.render('edit',{ user: userData});
        }
        else
        {
            res.redirect('/home');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req, res) => {
    try {
        //console.log("Request Body:", req.body);  // Log the entire request body
        const userId = req.body.user_id;  // Fetch user_id from request body
    
        if (req.file) {
            await User.findByIdAndUpdate(
                { _id: userId }, 
                { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno, image: req.file.filename } }
            );
        } else {
            await User.findByIdAndUpdate(
                { _id: userId }, 
                { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } }
            );
        }
        
        res.redirect('/home');
    } catch (error) {
        console.log("Error:", error.message);        
    }
};


module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerificationLink,
    editLoad,
    updateProfile    
}