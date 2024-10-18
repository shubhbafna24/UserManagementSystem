const User=require('../models/userModel');
const bcrypt = require('bcryptjs');
const nodemailer=require("nodemailer");

require('dotenv').config();

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
                user:process.env.EMAIL,
                pass:process.env.PASSWORD
            }
        });

        const mailOptions ={
            from: process.env.EMAIL,
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
                } else {
                    req.session.user_id=userData._id;
                    res.redirect('/home');
                    console.log("Redirect to home");
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
        res.render('home');

    } catch (error) {

        console.log(error.message);
        
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome    
}