const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const passport = require('passport');
const passportsetup = require('./config/passport-setup')
const authroutes = require('./routes/authroutes');
const profileroutes = require('./routes/profileroutes');
const session = require('express-session');
const msgmodel = require('./model/messagesmodel');
const usermodel= require('./model/usermodel');

async function main() {
    try {
        await mongoose.connect('mongodb+srv://maulikkansara04:Tp9v7ZmONEJMBwIY@cluster0.4qikkrc.mongodb.net/Cluster0?retryWrites=true&w=majority');
        console.log('connected to db');
        const app = express();
        const server = createServer(app);

        app.use(session({
            secret: 'abcdefghijk',
            resave : false,
            saveUninitialized : true,
            cookie :{
                maxAge : 24*60*60*1000
            }
        }))
        
        //initialize passport
        app.use(passport.initialize());
        app.use(passport.session());

        const io = new Server(server, {
            connectionStateRecovery: {},
        });

        app.use(express.static('public'));
        app.set('view engine','ejs');
        app.get('/', (req, res) => {
            res.render('home',{user:req.user});
        });
        app.use('/auth',authroutes);
        app.use('/chat',profileroutes);

        io.on('connection', async (socket) => {
            console.log('user connected');
            socket.on('disconnect', () => {
                console.log('user disconnected');
            })
            socket.on('chat message', async (msg,clientoffset,callback) => {
                let result;
                console.log('Received:', msg, clientoffset);
                try {
                     result = await msgmodel.create({message: msg, clientoffset:clientoffset });
                     io.emit('chat message',msg, result.insertedId);
                     callback();
                } catch (error) {
                    if(error.code == 11000){
                        callback();
                    }
                    return;
                }
                

            })

            if(!socket.recovered)
            {
                try {
                    const data = await msgmodel.find({_id:{$gt: new mongoose.Types.ObjectId(socket.handshake.auth.serveroffset )  }});
                    for await(const val of data){
                        socket.emit('chat message',val.message,val._id);
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