const passport = require('passport');
const googlestrategy = require('passport-google-oauth20');
const model = require('../model/usermodel');

passport.serializeUser((user,done)=>{
    done(null,user._id);
})

passport.deserializeUser(async (id,done)=>{
    try {
        const user = await model.findById(id);
        done(null,user);
        
    } catch (error) {
        done(error,null);
    }
})

passport.use(new googlestrategy({
    callbackURL: '/auth/google/redirect',
    clientID: '995618359295-vqg949oijegopr99am5pkhm10ejb2od3.apps.googleusercontent.com',
    clientSecret: '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'
},
   async (accessToken, refreshToken, profile, done)=>{
        const currentuser = await model.findOne({googleid:profile.id});
        if(currentuser){
            done(null,currentuser);
        }
        else{
            new model({
                username:profile.displayName,
                googleid:profile.id,
            }).save().then((user)=>{
                done(null,user);
            })
        }

   }
))