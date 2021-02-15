const express =  require("express");
const socket = require("socket.io");
const cors = require('cors');
require('dotenv').config()
const bodyParser = require("body-parser")
const connectToDb = require("./db");
const router = require("./routes/auth");
const jwt = require("jsonwebtoken");
const {user, message} = require("./db/models");

const PORT = process.env.PORT || 8000;

const ROOMS = {
    ROOM_MAIN : "ROOM_MAIN"
};

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use("/", router);


const users = [];

const server = app.listen(PORT, () => console.log("Server start"));

connectToDb(process.env.DB_CONNECTION);

const io = socket(server, {
    cors: {
        origin: "*",
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


}).on("connection",async (socket) => {
    socket.join(ROOMS.ROOM_MAIN);
    console.log("success connect")
    const onlineUsers = await user.find({online: true});
    const lastsMessages = await message.find().sort({date: -1}).limit(10).sort({date: 1}).populate({
        path: "author",
        select: {
            name: 1
        }
    });
    socket.emit("connected", {onlineUsers, lastsMessages});
    const currentUser = users.find(user => user.session === socket.id);
    io.to(ROOMS.ROOM_MAIN).emit("new user", currentUser);



    socket.on("new message", (data) => {


        const newMessage = message({
            content: data.content,
            author: currentUser.id
        });
        if (data.content.indexOf("https://www.youtube.com/watch?v=") !== -1){
            newMessage.video = data.content.replace(/.*https:\/\/www.youtube.com\/watch\?v=/gi, "").replace(/&.+$/gi, "");
        }
        newMessage.save(() => {
            message.findById(newMessage._id).populate({
                path: "author",
                select: {
                    name: 1
                }
            }).then((data) =>   io.to(ROOMS.ROOM_MAIN).emit("new message", data))
        });

    });


    socket.on("read message", async (messageId) => {
        const readMessage = await message.findOneAndUpdate({_id : messageId}, {read: true})
        io.to(ROOMS.ROOM_MAIN).emit("read message", readMessage._id);
    });

    socket.on("disconnect", () => {
        const currentUser = users.find(user => user.session === socket.id);
        users.splice(users.indexOf(currentUser), 1);
        user.findOneAndUpdate({_id: currentUser.id}, {online: false}).then(() => console.log("success disconnection"));
        io.to(ROOMS.ROOM_MAIN).emit("user exit", currentUser.id);
    })
});


