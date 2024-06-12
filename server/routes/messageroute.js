const express = require('express');
const router = express.Router();
const message = require('../model/messagemodel');

router.post('/sendmessage', async (req, res) => {
    try {
        const { sender_id, reciever_id, text } = req.body;
        const messagedata = new message({
            sender_id: sender_id,
            reciever_id: reciever_id,
            text: text
        })
        await messagedata.save();
        res.status(200).json({ message: "message sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: "failed to send message" })
    }
})

router.post('/allmessage', async (req, res) => {
    try {
        const { sender_id, reciever_id } = req.body;
        const messages = await message.find({
            $or: [{
                sender_id: sender_id,
                reciever_id: reciever_id
            },
            {
                sender_id: reciever_id,
                reciever_id: sender_id
            }]
        }).sort({ time: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: "failed to get message" })
    }
})

module.exports = router;
