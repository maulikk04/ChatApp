const mongoose = require('mongoose');
const schema = mongoose.Schema;

const messageschema = new schema({
    sender_id: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    reciever_id:{
        type:schema.Types.ObjectId,
        ref:"user"
    },
    text : {
        type:String
    },
    time:{
        type:Date,
        default:Date.now()
    }
})

const message = new mongoose.model('message' , messageschema);
module.exports = message