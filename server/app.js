const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('passport');
const passportsetup = require('./setup/passport_setup');
const authroutes = require('./routes/authroutes')
const message = require('./routes/messageroute');
const session = require('express-session');
const mongoose = require('mongoose');
const detail = require('./model/usermodel');
require('dotenv').config();
async function start() {
    try {
        const app = express();
        const server = createServer(app);
        const io = new Server(server);
        app.use(express.static('../client/public'));
        app.set('views', path.join(__dirname, '../client/views'));
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: true }));
        app.set('view engine', 'ejs');
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true
        }))
        app.use(passport.initialize());
        app.use(passport.session());
        app.get('/', (req, res) => {
            res.render('home', { user: req.user });
        })
        app.get('/register',(req,res)=>{
            res.render('register');
        })
        app.use('/message',message);
        app.get('/dashboard', async (req,res)=>{
            try {
                const users = await detail.find();
                const curruserid = req.query.id;
                const curruser = await detail.findOne({_id:curruserid})
                res.render('dashboard', { users, userid:curruser._id ,username: curruser.username });
            } catch (error) {
                console.log(error);
            }
        })
        app.use('/auth', authroutes);
        io.on('connection', (socket) => {
            console.log('A user connected');

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });

            socket.on('send-message', (data) => {
                io.to(data.reciever_id).emit('new-message', {
                    message: data.message,
                    sender_id: data.sender_id,
                    reciever_id:data.reciever_id
                });
            });

            socket.on('join-room',(roomid)=>{
                socket.join(roomid);
            })
        });

        server.listen(3000, () => {
            console.log("listening on port 3000");
        })
        mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log("Connected to database")
            })
            .catch(err => {
                console.log(err);
            })
    } catch (error) {
        console.log(error);
    }
}

start();