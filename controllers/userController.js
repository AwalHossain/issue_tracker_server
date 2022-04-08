/* eslint-disable consistent-return */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ErrorHandler = require('../lib/errorHandler');
const sendToken = require('../lib/jwt');
const sendEmail = require('../lib/sendEmail');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Users = require('../models/Users');
const generate = require('../middleware/generate');

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const existingUser = await Users.findOne({ email, status: 'approve' });
    // const pendingUser = await Users.findOne({ email, status: 'pending' });
    const user = await Users.findOne({ email });

    console.log(user, existingUser);

    if (existingUser) {
        return next(new ErrorHandler('User already exist '));
    }

    // hashing the otp
    // console.log(gt, email, 'haol');
    const x = generate.generateOtp();
    const otp = await bcrypt.hash(x, 10);
    try {
        if (!user) {
            console.log('heoll');
            const newUser = await Users.create({
                email,
                password,
                name,
                otp,
            });

            await sendEmail({
                email: newUser.email,
                subject: 'Issue Tracker Password Recovery',
                message: `Your new user OTP for Email Verification is ${x}`,
            });
            res.status(200).json({
                success: true,
                message: `Email ${newUser.email} sent to  successfully for new user Otp`,
            });
        } else {
            const refreshOtp = await Users.updateOne({ email, otp });
            console.log(refreshOtp, 'refrest');
            await sendEmail({
                email: req.body.email,
                subject: 'Issue Tracker Password Recovery',
                message: `Your refresh OTP for Email Verification is '${x}'`,
            });

            res.status(200).json({
                success: true,
                message: `Email ${email} sent to  successfully refresh otp`,
            });
        }
        console.log('sendmail', sendEmail);
    } catch (err) {
        console.log(err.message);
        // user.resetPasswordExpire = undefined;
        user[0].otp = undefined;

        await user.save({ validateBeforeSave: false });
    }
    // const newUser = await Users.create({
    //     name,
    //     email,
    //     password,
    // });

    // sendToken(newUser, res, 201);
});
// Match OTP

exports.matchOtp = catchAsyncErrors(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });

    console.log('hlloo ', user);

    const isMatched = await bcrypt.compare(req.body.code, user.otp);
    console.log(user.otp, 'he', isMatched, 'lam', req.body.code);

    if (!isMatched) {
        return next(new ErrorHandler('You otp didn not matched'));
    }

    console.log(isMatched);
    if (isMatched) {
        user.otp = undefined;
        user.status = 'approve';
        await user.save({ validateBeforeSave: false });

        sendToken(user, res, 200);
    }
});

//  Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email & Password', 400));
    }

    const user = await Users.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, res, 200);
});
// Forgot password recovery

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    console.log(resetToken.toString());

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://localhost:5000/api/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Issue Tracker Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await Users.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler('Reset Password Token is invalid or has been expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not password', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, res, 200);
});
