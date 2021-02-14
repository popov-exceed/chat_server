const express =  require("express");
const socket = require("socket.io");
const cors = require('cors');
require('dotenv').config()
const bodyParser = require("body-parser")
const connectToDb = require("./db");
const router = require("./routes/auth");
const jwt = require("jsonwebtoken");
const {user, message} = require("./db/models");


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
        origin: "*",
        methods: ["GET", "POST"]
    }});

io.use((socket, next) => {
    console.log(socket.handshake.auth)
    if(socket.handshake.auth.token) {
        console.log()
        jwt.verify(socket.handshake.auth.token, process.env.SECRET_JWT, (err, decoded) => {
            err && next(new Error("Invalid token"));
            user.findOneAndUpdate({_id: decoded.userId}, {online: true}).then(() => next());
            users.push({session: socket.id, id: decoded.userId, name: decoded.name});
        });
    }


}).on("connection",async (socket) => {
    socket.join(ROOMS.ROOM_MAIN);
    console.log("success connect")
    const onlineUsers = await user.find({online: true});
    const lastsMessages = await message.find().populate({
        path: "author",
        select: {
            name: 1
        }
    });
    socket.emit("connected", {onlineUsers,lastsMessages});
    const currentUser = users.find(user => user.session === socket.id);
    socket.on("new message", (data) => {
        const newMessage = message({
            content: data.content,
            author: currentUser.id
        });
        newMessage.save( async (err,newMessage) => {
           const userInDB = await user.findById(currentUser.id);
            userInDB.messages.push(newMessage._id);
           await userInDB.save();
        })

        io.to(ROOMS.ROOM_MAIN).emit("new message", {content: data.content, author: {
            name: currentUser.name,
                id: currentUser.id
            }, date: new Date()});
    });



    socket.on("disconnect", () => {
        const currentUser = users.find(user => user.session === socket.id);
        users.splice(users.indexOf(currentUser), 1);
        user.findOneAndUpdate({_id: currentUser.id}, {online: false}).then(() => console.log("success disconnection"));

    });
})



