const User=require('../models/userModel');
const bcrypt = require('bcryptjs');
const nodemailer=require("nodemailer");

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
                user:'email',
                pass:'passwd(screen_shot)'
            }
        });

        const mailOptions ={
            from: 'shubhbafna24@gmail.com',
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
        const spassord=await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassord,
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

module.exports = {
    loadRegister,
    insertUser,
    verifyMail
}