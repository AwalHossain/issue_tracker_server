const express = require('express');
const { registerUser, loginUser, forgotPassword } = require('../controllers/userController');

const router = express.Router();
// All routes

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/password/forget').post(forgotPassword);

module.exports = router;
