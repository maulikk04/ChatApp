const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');
const userschema = new schema({
    username:{
        type:String,
        require:true,
        validate(value) {
            for (let v of value) {
                if (!(v >= "a" && v <= "z") && !(v >= "A" && v <= "Z")) {
                    throw new Error("Name should be alphabetical value only");
                }
            }
        }
    },
    email:{
        type:String,
        require:true,
        validate: [isEmail, 'Enter a valid email']
    },
    password:{
        type:String
    },
    confirmpassword:{
        type:String
    },
    googleid:{
        type:String
    }
})

userschema.pre("save", async function (next) {
    if(this.password){
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = undefined;
    }
    next();
})

const user = new mongoose.model('user',userschema);
module.exports = user;