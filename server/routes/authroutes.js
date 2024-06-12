const express = require('express');
const bcrypt = require('bcrypt')
const router = express.Router();
const passport = require('passport');
const detail = require('../model/usermodel');
require('dotenv').config();


router.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        const email = req.body.email;
        const availableuser = await detail.findOne({ email: email });
        if (availableuser) {
            return res.status(404).json({ message: "User already registered" });
        }
        if (password === cpassword) {
            const registered = new detail({
                username: req.body.username,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            })
            await registered.save();
            res.status(200).json({ message: "Registered Successfully",userid:registered._id });
        }
        else {
            res.status(404).json({ message: "Password not matching" });
        }
    }
    catch (err) {
       console.log(err);
        res.status(404).json({ message: err });

    }
})

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const findemail = await detail.findOne({ email: email })
        if (!findemail) {
            return res.status(404).json({ message: "Enter Valid Email" });
        }
        const isMatch = await bcrypt.compare(password, findemail.password)
        if (isMatch) {
            return res.status(200).json({ message: "LoggedIn Successfully", userid:findemail._id });
        }
        else {
            return res.status(404).json({ message: "Enter Valid Password" });
        }

    } catch (error) {
        return res.status(404).json({ message: error });
    }

})

router.get('/google', passport.authenticate('google',{
    scope: ['profile']
}));

router.get('/google/redirect' , passport.authenticate('google'),(req,res)=>{
    const userid = req.user._id; 
    res.redirect(`/dashboard?id=${userid}`);
})

router.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err)
            return next(err);
    });
    res.redirect('/');
})

module.exports = router;