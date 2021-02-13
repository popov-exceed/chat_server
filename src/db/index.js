const mongoose = require("mongoose");


const db = mongoose.connection;

module.exports = connectToDb = (dbUri) => {

    mongoose.connect(dbUri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });

    db.on("error", () => {
        console.error("Failed to сonnect to mongodb.");
    });
    db.once("open", () => console.log("Connect to mongodb"));
};



