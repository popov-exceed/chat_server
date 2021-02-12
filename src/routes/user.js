const express = require('express');
const router = express.Router();

const auth_controller = require("./../controllers/auth.controller");


router.post("/login",auth_controller.login);

router.post("/registration",auth_controller.register);

module.exports = router;
