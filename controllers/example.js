const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
        user: 'jitendraaakde8959@gmail.com',
        pass: 'zyhdlewqshezoreu'
    }
});
const service = async () => {
    try {
        const info = await transporter.sendMail({
            from: 'jitendraaakde8959@gmail.com', // Sender address
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
