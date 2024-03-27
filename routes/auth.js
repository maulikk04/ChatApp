const express = require('express');
const passport = require('passport');
const route  = express.Router();

route.get('/google', passport.authenticate('google',{
    scope: ['profile']
}));

route.get('/google/redirect' , passport.authenticate('google'),(req,res)=>{
    res.render('index',{user:req.user});
})

route.get('/logout',(req,res)=>{
    req.logout(function(err){
        if(err)
            return next(err);
    });
    res.redirect('/');
})

module.exports = route;