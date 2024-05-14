const express = require('express');
require('dotenv').config();
var mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1/dynamic-chat-app');

const app = express();

const PORT = 3000

const http = require('http').Server(app);
const User = require('./models/userModel')
const Chat = require('./models/chatModel')

const userRoute = require('./routes/userRoutes')
app.use('/', userRoute);
const io = require('socket.io')(http);

var usp = io.of('/user-namespace')

usp.on('connection', async function(socket){
    console.log('user connected');
    var userId = socket.handshake.auth.token;

    await User.findByIdAndUpdate({_id:userId}, {$set:{is_online:'1'}});

    //User broadcast online status
    socket.broadcast.emit('getOnlineUser', {user_id:userId});

    socket.on('disconnect',async function(){
        console.log('user Disconnected');
        var userId = socket.handshake.auth.token;

        await User.findByIdAndUpdate({_id:userId}, {$set:{is_online:'0'}});

        //User broadcast offline status
        socket.broadcast.emit('getOfflineUser', {user_id:userId});
    })

    //chatting implementation
    socket.on('newChat', function(data){
        socket.broadcast.emit('loadNewChat', data);
    })

    //load old chats
    socket.on('existsChat', async function(data){
      var chats =  await Chat.find({$or:[
            {sender_id:data.sender_id, receiver_id:data.receiver_id},
            {sender_id:data.receiver_id, receiver_id:data.sender_id}
        ]})
        socket.emit('loadChats', {chats:chats});
    })

    //delete chats
    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted', id);
    })

    //update chats
    socket.on('chatUpdated', function(data){
        socket.broadcast.emit('chatMessageUpdated', data);
    })

    // Group chats --------------------------------------------
    socket.on('newGroupChats', function(data){
        socket.broadcast.emit('loadNewGroupChat', data);
    })
});

http.listen(PORT, () => {
    console.log(`Server is connecting on ${PORT}`);
})

