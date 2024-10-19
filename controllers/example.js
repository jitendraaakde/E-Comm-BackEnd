const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'zackery48@ethereal.email', // Ethereal email
        pass: 'ab4URmqbqz9QTVxgAW' // Ethereal password
    }
});

// Function to send an email
const service = async () => {
    try {
        const info = await transporter.sendMail({
            from: '"Maddison Foo Koch 👻" <zackery48@ethereal.email>', // Sender address
            to: "jitendraaakde8959@gmail.com", // Recipient email
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
