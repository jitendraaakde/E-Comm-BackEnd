const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: true,
    auth: {
        user: 'triston.lowe50@ethereal.email',
        pass: '42wwUhZZ6hzMkEDwgM'
    }
});
const service = async () => {
    try {
        const info = await transporter.sendMail({
            from: 'triston.lowe50@ethereal.email', // Sender address
            to: "rahulalatre101@gmail.com", // Recipient email
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // Plain text body
            html: "<b>Hello world?</b>", // HTML body
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

service();
