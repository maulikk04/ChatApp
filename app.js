const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

async function main() {
    try {
        await mongoose.connect('mongodb+srv://maulikkansara04:Tp9v7ZmONEJMBwIY@cluster0.4qikkrc.mongodb.net/Cluster0?retryWrites=true&w=majority');
        console.log('connected to db');
        const model = mongoose.connection;
        const collection = model.collection('messages');
        const app = express();
        const server = createServer(app);

        const io = new Server(server, {
            connectionStateRecovery: {},
        });

        app.get('/', (req, res) => {
            res.sendFile(join(__dirname, 'index.html'));
        });

        io.on('connection', async (socket) => {
            console.log('user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
            })

            socket.on('chat message', async (msg,clientoffset,callback) => {
                let result;
                try {
                     result = await collection.insertOne({ content: msg, clientoffset:clientoffset });
                } catch (error) {
                    if(error.code == 11000){
                        callback();
                    }
                    return;
                }
                io.emit('chat message', msg, result.insertedId);
                callback();

            })

            if(!socket.recovered)
            {
                try {
                    const data = collection.find({_id:{$gt: new mongoose.Types.ObjectId(socket.handshake.auth.serveroffset )  }});
                    for await(const val of data){
                        socket.emit('chat message',val.content,val._id);
                    }
                } catch (error) {
                    console.log(error);
                    
                }
            }
         })
        server.listen(3000, () => {
            console.log("listening on port 3000");
        })
    } catch (error) {
        console.log(error);
    }
}

main();