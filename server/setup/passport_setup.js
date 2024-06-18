require('dotenv').config()
const detail = require('../model/usermodel');
const passport = require('passport');
const googglestrategy = require('passport-google-oauth20');

passport.serializeUser((user,done)=>{
    done(null,user);
})

passport.deserializeUser((user,done)=>{
    done(null,user);
})

passport.use(new googglestrategy({
    callbackURL: '/auth/google/redirect',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
},
    async (accessToken, refreshToken, profile, done)=>{
        try {
            const findUser = await detail.findOne({ googleid: profile.id });
            if (findUser) {
                return done(null, findUser); 
            }
            
            const newUser = new detail({
                username: profile.name.givenName,
                googleid: profile.id
            });
            const savedUser = await newUser.save();
            return done(null, savedUser); 
        } catch (err) {
            return done(err, null); 
        }
    }
))

