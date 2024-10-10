const User=require('../models/userModel');

const bcrypt = require('bcryptjs');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

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

module.exports = {
    loadRegister,
    insertUser
}