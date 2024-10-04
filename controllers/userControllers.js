const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const loginController = async (req, res) => {
    console.log('login ', req.body);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not exist please signup' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }
        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        const { passwordHash, ...userResponse } = user._doc;

        console.log('User which comes from db', userResponse);

        res.status(200).json({ message: 'Login successful.', user: userResponse });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


const signupController = async (req, res) => {
    console.log('signup', req.body);
    const { name, email, passwordHash } = req.body;

    try {
        if (!passwordHash) {
            return res.json(
                {
                    success: false,
                    message: 'Password is required.',
                });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: true,
                message: 'User already registered. Please login.',
            });
        }

        const hashedPassword = await bcrypt.hash(passwordHash, 10);
        const newUser = new User({
            name,
            email,
            passwordHash: hashedPassword,
        });
        console.log(newUser)
        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please log in.',
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const googleAuth = async (req, res) => {
    const { name, email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(generatePassword, 10);

            user = new User({
                name,
                email,
                passwordHash
            });
            await user.save();
        }

        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        const { passwordHash, ...userResponse } = user._doc;

        res.status(200).json({ success: true, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};



module.exports = {
    loginController,
    signupController, googleAuth
};