require('dotenv').config()

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
        return done(null,profile);
    }
))

