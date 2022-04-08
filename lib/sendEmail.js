const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        service: 'Yandex',
        auth: {
            user: process.env.USER_MAIL,
            pass: 'zeyufjortueahqds',
        },
    });

    const mailOptions = {
        from: 'process.env.USER_MAIL',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
