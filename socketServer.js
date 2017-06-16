/**
 * Created by lzy on 16/10/25.
 */

var io = require('socket.io')();
var map ={};
var rooms={};
var idsocket ={};
var reveiveMessage = "";
var meeting = 0;

io.sockets.on('connection', function (socket) {
    //io.sockets.sockets.length 在线人数

    socket.on('addUserRoom', function (data) {

        var socketid = data.message;
        var num = data.num;
        idsocket[socketid].join(num);
        var userName = map[socket.id];

        var roomName =rooms[socket.id+"-"+num];

        console.log(socketid+"------"+"roomName:"+roomName);
        socket.broadcast.to(num).emit('message', {
            code:1,
            message:userName,
            roomName:roomName,
            num:num
        });

    });
    //

    // when the client emits 'typing', we broadcast it to others
    socket.on('addRoom', function (data) {
        meeting++;
        socket.join(meeting);
        rooms[socket.id+"-"+meeting] = data.message;
        console.log(map[socket.id]+"创建聊天室:"+data.message);
        socket.emit('joinResult', {message:data.message,num:meeting});

        //socket.broadcast.to(room).emit('message', {
        //  text: nickNames[socket.id] + 'has joined ' + room + '.'
        //});

    });
    //
    //// when the client emits 'stop typing', we broadcast it to others
    socket.on('message', function (data) {
        console.log(data.message)
        socket.broadcast.emit('message', {
            message: data.message
        });

    });

    socket.on('roomMessage', function (data) {

        var userName  = map[socket.id];
        var num = data.num;

        socket.broadcast.to(num).emit('message', {
            code:2,
            message: data.message,
            user:userName,
            num:num
        });

    });

    socket.on('connection', function (data) {

        map[socket.id] = data.userName;
        console.log(data.userName+"登录成功,其socketid"+socket.id);

        console.log(Object.getOwnPropertyNames(map).length);
        io.sockets.emit('init', {
            data: map
        });
    });

    socket.on('onlineNum', function (data) {
        var num = data.num;
        io.sockets.emit('onlineNum', {
            message: map,
            num:num
        });
    });
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {

        var userName = map[socket.id];
        var userN = map[socket.id];
        delete map[socket.id];
        if(userName){
            setTimeout(function(){
                var flag  = true;
                for(key in map){
                    if(map[key] === userName){
                        flag = false;
                        idsocket[key].emit('heart',{message:userName});
                        setTimeout(function(){
                            if(reveiveMessage===""){
                                socket.broadcast.emit('dis', {
                                    message:userN
                                });
                            }
                        },1000)
                    }
                }
                if(flag){
                    socket.broadcast.emit('dis', {
                        message:userN
                    });
                }
            },1000);
        }else{
            console.log("其他");
        }
    });

    socket.on('heart',function(data){
        reveiveMessage = data.userName;
    });

});
io.listen(3100);
module.exports = io;