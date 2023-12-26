const express = require('express');
const passport = require('passport');
const route = express.Router();

route.get('/login',(req,res)=>{
    res.render('login',{user:req.user});
})

route.get('/logout',(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.error(err);
            return next(err);
        }
    })
    res.redirect('/');
})

route.get('/google', passport.authenticate('google',{scope:['profile'] , prompt:'consent'}));

route.get('/google/redirect',
    passport.authenticate('google', {
        failureRedirect: '/auth/login',
        successRedirect: '/chat'
    })
);

module.exports = route;