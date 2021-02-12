const express =  require("express");
const socket = require("socket.io");
const cors = require('cors');



const app = express();


app.use(cors());

const users = [];
const connections = [];

const server = app.listen(8000, () => console.log("Server start"));

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }});

io.on("connection", (socket) => {
    connections.push(socket);
    socket.on("new message", ({message}) => {
        io.sockets.emit("message", message);
    });



    socket.on("disconnect", () => {
        connections.splice(connections.indexOf(socket), 1);
    });
});




