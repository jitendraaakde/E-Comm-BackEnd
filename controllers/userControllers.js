const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const loginController = async (req, res) => {
    console.log('login ', req.body)
    const { userEmail, userPassword } = req.body;

    try {
        const user = await User.findOne({ userEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email' });
        }

        const isPasswordValid = await bcrypt.compare(userPassword, user.userPasswordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        const token = jwt.sign(
            { userId: user._id, userEmail: user.userEmail, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });

        const { userPasswordHash, ...userResponse } = user._doc;
        console.log(user._doc)
        res.status(200).json({ message: 'Login successful.', user: userResponse });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const signupController = async (req, res) => {
    console.log('signup', req.body)
    const { userName, userEmail, userPassword } = req.body;
    try {
        if (!userPassword) {
            return res.status(400).json({ message: 'Password is required.' });
        }
        const existingUser = await User.findOne({ userEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already registered. Please login.' });
        }
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        const newUser = new User({
            userName,
            userEmail,
            userPasswordHash: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully. Please log in.' });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
const googleAuth = async (req, res) => {
    console.log(req.body)
    res.send({ msg: 'user created by google' })
}
module.exports = {
    loginController,
    signupController, googleAuth
};