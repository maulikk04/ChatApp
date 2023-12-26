const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    sender :{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'userinfo'
        type: String
    },
    message:{
        type: String
    },
    clientoffset:{
        type: String
    }
})

module.exports = mongoose.model('message',schema);