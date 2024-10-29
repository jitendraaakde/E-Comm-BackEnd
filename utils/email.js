const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
        user: 'jitendraaakde8959@gmail.com',
        pass: 'zyhdlewqshezoreu'
    }
});
const emailService = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: 'jitendraaakde8959@gmail.com',
            to: email,
            subject: 'Your OTP Code for Verification',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>OTP Verification</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                        }
                        .container {
                            max-width: 600px;
                            margin: 50px auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            text-align: center;
                            color: #333;
                        }
                        .otp {
                            text-align: center;
                            font-size: 48px;
                            font-weight: bold;
                            color: #4CAF50;
                            margin: 20px 0;
                        }
                        .message {
                            text-align: center;
                            font-size: 16px;
                            color: #555;
                        }
                        .note {
                            text-align: center;
                            font-size: 14px;
                            color: #999;
                            margin-top: 10px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #aaa;
                        }
                        
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Verify Your Account</h1>
                        <p class="message">Your One-Time Password (OTP) is:</p>
                        <div class="otp">${otp}</div>
                        <p class="note">This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
                        <div class="footer">
                            <p>If you didn't request this, please ignore this email.</p>
                            <p>Need help? <a href="#">Contact Support</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


module.exports = { emailService }