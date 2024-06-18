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
        type:String,
        validate(value){
            let lower = false, upper=false, number=false,symbol = false;
            for(let v of value){
                if(v.charCodeAt(0) >= 97 && v.charCodeAt(0) <= 122)
                    lower=true;
                else if(v.charCodeAt(0)>=65 && v.charCodeAt(0)<=90)
                    upper=true;
                else if(v.charCodeAt(0)>=48 && v.charCodeAt(0)<=57)
                    number = true;
                else 
                    symbol = true;
            }

            if(!lower || !upper || !number || !symbol)
                throw new Error("Password must contain atleast one lowercase letter, one uppercase letter, one number and one symbol")
            if(value.length < 6)
                throw new Error("Password must be of minimum of length 6")
        }
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