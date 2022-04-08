/* eslint-disable prettier/prettier */
const otpGenerator = require('otp-generator');

exports.generateOtp = () =>
    otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
    });
