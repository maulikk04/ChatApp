const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const passport = require('passport');
const passportsetup = require('./setup/passport_setup');
const authroutes = require('./routes/auth');
const profileroutes = require('./routes/profilroutes');
const session = require('express-session')
async function start() {
    try {
        const app = express();
        const server = createServer(app);
        const io = new Server(server);
        app.use(express.static('public'));
        app.set('view engine', 'ejs');
        app.use(session({
            secret: "cats", 
            resave: false,
            saveUninitialized: true
        }))
        app.use(passport.initialize());
        app.use(passport.session());
        app.get('/', (req, res) => {
            res.render('home',{user:req.user});
        })
        app.use('/auth', authroutes);
        app.use('/index',profileroutes);
        const users = {};
        io.on('connection', socket => {
            socket.on('new-user', name => {
                users[socket.id] = name;
                socket.broadcast.emit('user-connected', name);
            })
            socket.on('send-chat-message', message => {
                socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
            })
            socket.on('disconnect', () => {
                socket.broadcast.emit('user-disconnected', users[socket.id]);
                delete users[socket.id];
            })


        })
        server.listen(3000, () => {
            console.log("listening on port 3000");
        })

    } catch (error) {
        console.log(error);
    }
}

start();