var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const { getuid } = require("process");
const { Socket } = require("socket.io");
const {joinUser, removeUser, getUsers} = require('./users');

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/home.html");
});

let thisRoom = "";

io.on("connection", function (socket) {
    console.log("connected");

    socket.on("join lobby", (data) => {
        console.log(data.username + ' joined ' + data.roomname);
        let Newuser = joinUser(socket.id, data.username, data.roomname)
        socket.emit('send data', {id : socket.id, username:Newuser.username, roomname:Newuser.roomname,});

        thisRoom = Newuser.roomname;
        socket.join(Newuser.roomname);

        let userList = getUsers();
        io.to(thisRoom).emit("update user list", {userlist: userList});
    });

    socket.on("chat message", (data) => {
        data.value = data.value.replace(/(<([^>]+)>)/gi, "");
        io.to(thisRoom).emit("chat message", {data:data,id : socket.id});
    });

    socket.on("disconnect", () => { 
        const user = removeUser(socket.id);
        console.log(user);
        if(user) {
            console.log(user.username + ' has left');
        }
        
        let userList = getUsers();
        io.to(thisRoom).emit("update user list", {userlist: userList});

        console.log("disconnected");
    });

    socket.on("update user list", () => {
        let userList = getUsers();
        socket.emit("respond user list", (userList));
    });

    
});

http.listen(process.env.PORT || 3000, function () {
    console.log("SERVER STARTED PORT: 3000");
});
