const express = require('express');
const route = express.Router();

const authcheck = (req, res, next) => {
    if(req.user) next();
    else 
        res.redirect('/auth/google');
}

route.get('/', authcheck, (req,res)=>{
    res.render('index' , {user:req.user});
});

module.exports = route;