const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

async function start(){
    try {
        const app = express();
        const server = createServer(app);
        const io = new Server(server);
        app.use(express.static('public'));
        app.set('view engine','ejs');
        app.get('/',(req,res)=>{
            res.render('index');
        })
        const users = {};
        io.on('connection' , socket=>{ 
            socket.on('new-user' , name =>{
                users[socket.id] = name;
                socket.broadcast.emit('user-connected' , name);
            })
            socket.on('send-chat-message' , message =>{
                socket.broadcast.emit('chat-message', {message:message , name:users[socket.id]})
            })
            socket.on('disconnect',()=>{
                socket.broadcast.emit('user-disconnected', users[socket.id]);
                delete users[socket.id];
            })
            
            
        })
        server.listen(3000,()=>{
            console.log("listening on port 3000");
        })
        
    } catch (error) {
        console.log(error);
    }
}

start();