const isLogin = async(req,res,next)=>{
    try {

        if(req.session.user_id){
            next();            
        }
        else{
            res.redirect('/admin');
            return;
        }        
        
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/admin/home');
            return;
        }
        else{            
            next();
        }        
        
    } catch (error) {
        console.log(error.message);
    }
}
const isAdmin = (req, res, next) => {
    if (req.session.user_id && req.session.is_admin) {
        // Allow access if user is admin
        return next();
    } else {
        // Redirect to the login page or a forbidden page if not an admin
        res.redirect('/login'); // Or another page of your choice
    }
};

module.exports={
    isLogin,
    isLogout,
    isAdmin
}