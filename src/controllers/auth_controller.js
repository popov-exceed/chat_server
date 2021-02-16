const {user} = require("../db/models");
const jwt = require("jsonwebtoken");


module.exports = async (req, res) => {
    const oldUser = await user.findOne({name: req.body.name});

    if(oldUser && !oldUser.online) {
        const token = jwt.sign({
            userId: oldUser._id,
            name: oldUser.name
        }, process.env.SECRET_JWT);
        return res.json({token, user: oldUser});
    } else if(oldUser && oldUser.online) {
        return res.status(409).json({message: "This user already online"})
    }
    const newUser = new user({name: req.body.name});
    await newUser.save();
    const token = jwt.sign({
        userId: newUser._id,
        name: newUser.name
    }, process.env.SECRET_JWT);
    return res.json({token, user: newUser});

};
