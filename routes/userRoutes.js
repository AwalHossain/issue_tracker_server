const express = require('express');
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');

const router = express.Router();
// All routes

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/password/forget').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

module.exports = router;
