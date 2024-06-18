const express = require('express');
const bcrypt = require('bcrypt')
const router = express.Router();
const passport = require('passport');
const detail = require('../model/usermodel');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const Token = require('../model/tokenmodel');
require('dotenv').config();

const errorhandel = (err) => {
    let error_message = '';
    Object.values(err.errors).forEach(({ properties }) => {
        error_message = properties.message
    })
    return error_message;
}

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
            res.status(200).json({ message: "Registered Successfully", userid: registered._id });
        }
        else {
            res.status(404).json({ message: "Password not matching" });
        }
    }
    catch (err) {
        console.log(err);
        const error_message = errorhandel(err);
        res.status(404).json({ message: error_message });
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
            return res.status(200).json({ message: "LoggedIn Successfully", userid: findemail._id });
        }
        else {
            return res.status(404).json({ message: "Enter Valid Password" });
        }

    } catch (err) {
        console.log(err);
        const error_message = errorhandel(err);
        res.status(404).json({ message: error_message });
    }

})

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    const userid = req.user._id;
    res.redirect(`/dashboard?id=${userid}`);
})

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err)
            return next(err);
    });
    res.redirect('/');
})

const sendresetpasswordmail = async (name, email, token) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: process.env.email,
                pass: process.env.password
            }
        });

        const mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'For reset password',
            html: '<p>Hii, ' + name + ', Plesae copy the link and <a href="http://localhost:3000/reset-password?token=' + token + '"> reset your password </a>'
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log(`email send successfully ${info.response}`);
            }
        })
    } catch (err) {
        console.log(err);
        const error_message = errorhandel(err);
        res.status(404).json({ message: error_message });
    }
}

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const userdata = await detail.findOne({ email: email });

        if (!userdata) {
            return res.status(404).send({ message: "Enter valid registered Email Id" });
        }

        let tokendata = await Token.findOne({ userid: userdata._id });
        if (!tokendata) {
            const rs = randomstring.generate();
            tokendata = new Token({
                userid: userdata._id,
                token: rs
            });
            await tokendata.save();
        }

        sendresetpasswordmail(userdata.username, userdata.email, tokendata.token);
        return res.status(200).send({ message: "Reset Password Link has been sent to your email" })

    } catch (error) {
        console.log(err);
        const error_message = errorhandel(err);
        res.status(404).json({ message: error_message });
    }
})

router.post('/reset-password', async (req, res) => {
    try {
        const token = req.query.token;
        const tokendata = await Token.findOne({ token: token });
        if (tokendata) {
            const password = req.body.password;
            if (!password) {
                return res.status(404).send({ message: "Password is required" });
            }
            const user = await detail.findOne({ _id: tokendata.userid });
            if (!user) {
                return res.status(404).send({ message: "Cannot find user" });
            }
            user.password = password;
            await user.save();
            await tokendata.deleteOne({ token: token })
            return res.status(200).send({ message: "Password changed successfully" });
        }
        else {
            return res.status(404).send({ message: "Invalid Token" });
        }

    } catch (error) {
        console.log(error);
        const error_message = errorhandel(error);
        return res.status(404).json({ message: error_message });
    }
})


module.exports = router;