const express =  require("express");
const socket = require("socket.io");
const cors = require('cors');



const app = express();

const messages = [];
app.use(cors());

const server = app.listen(8000, () => console.log("Server start"));

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }});

io.on("connection", (socket) => {
    socket.on("new message", ({message}) => {
        socket.emit("message", message);
    });
});


