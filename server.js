const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { addUsers, addroomsToRoom, removeUserFromRoom } = require('./manageUsers');
const moment = require('moment/moment');
// const { ExpressPeerServer } = require("peer");


const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

const server = app.listen(5000, () => {
    console.log("server is running on port 5000")
})

// const peerServer = ExpressPeerServer(server, {
//     proxied: true,
//     debug: true,
//     path: "/myapp",
//     ssl: {},
// });

// app.use(peerServer);

app.get("/", (req, res) => {
    res.send("hello server")
})


const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://videocall9806.netlify.app/",
    },
    maxHttpBufferSize: 1e8
});

io.on("connection", (socket) => {

    // const interval = setInterval(() => {
    //     socket.emit("datetime", new Date(Date.now()));
    // }, 1000)
    socket.on("joinroom", (roomdata, peerId) => {
        socket.join(roomdata.roomId)
        const room = addroomsToRoom(socket.handshake.query.username, roomdata.roomId)
        io.to(roomdata.roomId).emit("updatedroomusers", room)
        socket.to(roomdata.roomId).emit("notification", `${socket.handshake.query.username} has joined`);
        socket.to(roomdata.roomId).emit("callconnectuser", peerId);
        console.log("joinroom", roomdata.roomId)
    })

    socket.on("imageMessage", (imgdata) => {
        console.log("imageMessage", imgdata)
        const message = { image: imgdata.toString('base64'), message: "", username: socket.handshake.query.username, date: new Date(Date.now()) }
        io.to(socket.handshake.query.roomname).emit("newMessage", message)

    })

    socket.on("sendMessage", (message) => {
        // console.log("sendMessage", message)
        io.to(socket.handshake.query.roomname).emit("newMessage", { message: message, username: socket.handshake.query.username, date: new Date(Date.now()) })
    })
    // socket.emit("connecteduser", addUsers(socket.handshake.query.userId))

    socket.on("disconnecteduser", (peerId) => {
        console.log("disconnected user from frotn")
        socket.leave(socket.handshake.query.username)
        socket.leave(socket.handshake.query.roomname)
        // socket.emit("leftroom")
        const rooms = removeUserFromRoom(socket.handshake.query.username);
        // console.log("user disconnected", rooms, "roomId", socket.handshake.query.roomname);
        io.to(socket.handshake.query.roomname).emit("updatedroomusers", rooms)
        socket.to(socket.handshake.query.roomname).emit("notification", `${socket.handshake.query.username} has left`)
        socket.to(socket.handshake.query.roomname).emit("calldisconnect", peerId);

        io.to(socket.handshake.query.roomname).emit("callended", socket.handshake.query.username)

    })
    socket.on("disconnect", () => {
        console.log("left room")
        socket.leave(socket.handshake.query.username)
        socket.leave(socket.handshake.query.roomname)
        // socket.emit("leftroom")
        const rooms = removeUserFromRoom(socket.handshake.query.username);
        io.to(socket.handshake.query.roomname).emit("updatedroomusers", rooms)
        socket.to(socket.handshake.query.roomname).emit("notification", `${socket.handshake.query.username} has left`)
        socket.to(socket.handshake.query.roomname).emit("usercallEnded", `${socket.handshake.query.username}`)
        io.to(socket.handshake.query.roomname).emit("callended", socket.handshake.query.username)

        // removeUser(socket.handshake.query.userId);
        // io.sockets.emit("disconnecteduser", getallUsers());
        // socket.leave(socket.handshake.query.userId);
    });
})