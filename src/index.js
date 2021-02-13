const express =  require("express");
const socket = require("socket.io");
const cors = require('cors');
require('dotenv').config()
const bodyParser = require("body-parser")
const connectToDb = require("./db");
const router = require("./routes/auth");
const jwt = require("jsonwebtoken");
const {user} = require("./db/models");


const ROOMS = {
    ROOM_MAIN : "ROOM_MAIN"
};

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use("/", router);


const users = [];

const server = app.listen(8000, () => console.log("Server start"));

connectToDb(process.env.DB_CONNECTION);

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }});

io.use((socket, next) => {
    if(socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.SECRET_JWT, (err, decoded) => {
            err && next(new Error("Invalid token"));
            user.findOneAndUpdate({_id: decoded.userId}, {online: true}).then(() => next());
            users.push({session: socket.id, id: decoded.userId, name: decoded.name});
        });
    }


}).on("connection", (socket) => {
    socket.join(ROOMS.ROOM_MAIN);
    console.log("success connection", socket.id)
    const currentUser = users.find(user => user.session === socket.id);
    socket.on("new message", (data) => {
        console.log(users)
        io.to(ROOMS.ROOM_MAIN).emit("message", {message: data.message, author: currentUser.name, date: new Date()});
    });



    socket.on("disconnect", () => {
        const currentUser = users.find(user => user.session === socket.id);
        users.splice(users.indexOf(currentUser), 1);
        user.findOneAndUpdate({_id: currentUser.id}, {online: false}).then(() => console.log("success disconnection"));

    });
})



