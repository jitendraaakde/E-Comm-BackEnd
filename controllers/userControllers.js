const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Address = require('../models/AddressModel');
const Otp = require('../models/OtpModel');
const Order = require('../models/ordersModel')
const Cart = require('../models/cartModel')
const { emailService } = require('../utils/email');
const shortid = require('shortid');


const signupController = async (req, res) => {
    const { name, email, passwordHash } = req.body;
    try {
        if (!passwordHash) {
            return res.status(400).json({
                success: false,
                message: 'Password is required.',
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already registered. Please log in.',
            });
        }
        const hashedPassword = await bcrypt.hash(passwordHash, 10);
        const newUser = new User({
            name,
            email,
            passwordHash: hashedPassword,
        });

        await newUser.save();

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const otpData = await Otp.create({
            userId: newUser._id,
            otp,
            expiresAt,
        });

        emailService(email, otp);
        res.status(201).json({
            success: true,
            message: 'User registered successfully. OTP sent to your email.',
        });
    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};

const otpController = async (req, res) => {
    const { otp, email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        const otpData = await Otp.findOne({ userId: user._id });
        if (!otpData) {
            return res.status(400).json({ success: false, message: 'OTP not found.' });
        }
        if (otpData.otp.toString() !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        if (otpData.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        user.isVerified = true;
        await user.save();

        await Otp.deleteOne({ userId: user._id });

        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        const { passwordHash, ...userResponse } = user._doc;


        res.status(200).json({ message: 'OTP verified, Login successful.', success: true, user: userResponse });

    } catch (error) {
        console.error('OTP verification error:', error.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};
const loginController = async (req, res) => {
    const { email, password } = req.body;
    console.log('login', email, password)

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist. Please sign up.', success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.', success: false });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        const { passwordHash, ...userResponse } = user._doc;
        res.status(200).json({ message: 'Login successful.', user: userResponse, success: true });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error. Please try again later.', success: false });
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

const editUserData = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedData = req.body;
        const { email, name, phone } = req.body
        console.log(typeof phone)


        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const { passwordHash, ...userResponse } = user._doc;

        res.json({ msg: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.user;
        const response = await Address.find({ userId });

        if (!response.length) {
            return res.status(404).json({ msg: "No addresses found for this user" });
        }

        return res.status(200).json({ msg: "Addresses retrieved successfully", userAddresses: response });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return res.status(500).json({ msg: "Server error while fetching addresses" });
    }
};

const addUserAddresses = async (req, res) => {
    try {
        const { _id, ...addressData } = req.body;
        const { userId } = req.user;

        let response;

        if (_id) {
            response = await Address.updateOne(
                { _id, userId },
                { $set: addressData }
            );

            if (response.matchedCount === 0) {
                return res.status(404).json({ msg: 'Address not found or does not belong to the user' });
            }

            return res.status(200).json({ msg: 'Address updated successfully', address: response });
        } else {
            response = await Address.create({ userId, ...addressData });

            return res.status(201).json({ msg: 'New address added successfully', address: response });
        }
    } catch (error) {
        console.error('Error adding or updating address:', error);
        return res.status(500).json({ msg: "Server error while adding or updating the address" });
    }
};

const deleteUserAddresses = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await Address.deleteOne({ _id: id });

        if (response.deletedCount === 0) {
            return res.status(404).json({ msg: 'Address not found or already deleted' });
        }

        return res.status(200).json({ msg: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ msg: "Server error while deleting the address" });
    }
};

const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, confirmPassword } = req.body;
        const { userId } = req.user;

        console.log('userId', userId, 'req.body', req.body)

        const user = await User.findOne({ _id: userId });
        console.log('user', user)

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(confirmPassword, 10);

        const status = await User.findByIdAndUpdate(userId, { passwordHash: hashedPassword });

        if (status) {
            return res.json({ msg: 'Password changed successfully' });
        } else {
            return res.status(500).json({ msg: 'Error updating password' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.user;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found. Please login again.', success: false });
        }


        const response = await User.deleteOne({ _id: userId });

        if (response.deletedCount === 0) {
            return res.status(500).json({ msg: 'Failed to delete user. Please try again.', success: false });
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });


        return res.status(200).json({ msg: 'User deleted successfully', success: true });

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

const userPlaceOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { productArray, shippingAddress } = req.body;

        const { street, city, state, country, zipCode, type } = shippingAddress;

        const orderId = shortid.generate();
        console.log('orderId', orderId)

        const newOrder = new Order({
            userId,
            products: productArray,
            shippingAddress: {
                street,
                city,
                state,
                country,
                zipCode,
                type,
            },
            orderId: orderId
        });

        const savedOrder = await newOrder.save();

        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('products.productId')

        if (populatedOrder) {
            const cartDelete = await Cart.deleteOne({ userId });
        }
        return res.status(201).json({
            message: 'Your order has been confirmed!',
            order: populatedOrder,
            success: true,
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({
            message: 'Failed to place the order. Please try again.',
            error: error.message,
            success: false,
        });
    }
};

const userOrdersHistory = async (req, res) => {
    const { userId } = req.user;
    try {
        const orders = await Order.find({ userId }).populate('products.productId');
        return res.status(200).json({ msg: 'Orders fetched successfully', orders });
    } catch (error) {
        console.error('Error in fetching orders:', error);
        return res.status(500).json({ msg: 'Failed to fetch orders', error: error.message });
    }
};

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, msg: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, msg: "User does not exist. Please sign up." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.create({
            userId: user._id,
            otp,
            expiresAt,
        });

        emailService(email, otp);

        return res.status(201).json({
            success: true,
            message: 'OTP sent to your email.',
            email
        });
    } catch (error) {
        console.error("Error in forgetPassword:", error);
        return res.status(500).json({
            success: false,
            msg: "An error occurred while processing your request. Please try again later.",
        });
    }
};

const handleForgetPasswordOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        console.log('OTP and EMAIL:', typeof otp, typeof email);

        if (!otp || !email) {
            return res.status(400).json({ success: false, message: 'OTP and email are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const otpData = await Otp.findOne({ userId: user._id });
        if (!otpData) {
            return res.status(404).json({ success: false, message: 'OTP not found. Please request a new one.' });
        }

        if (Number(otp) !== Number(otpData.otp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        if (otpData.expiresAt < new Date()) {
            await Otp.deleteOne({ userId: user._id });
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        await Otp.deleteOne({ userId: user._id });

        return res.status(200).json({ success: true, message: 'OTP verified successfully.' });

    } catch (error) {
        console.error("Error in handleForgetPasswordOtp:", error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.',
        });
    }
};


const handleNewPassword = async (req, res) => {
    try {
        const { password, email } = req.body;

        console.log(req.body);

        if (!password || !email) {
            return res.status(400).json({ success: false, msg: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found. Please sign up.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const status = await User.findByIdAndUpdate(user._id, { passwordHash: hashedPassword }, { new: true });

        if (status) {
            return res.status(200).json({ success: true, msg: 'Password changed successfully.' });
        }

        return res.status(500).json({ success: false, msg: 'Error updating password.' });

    } catch (error) {
        console.error("Error in handleNewPassword:", error);
        return res.status(500).json({ success: false, msg: 'An error occurred. Please try again later.' });
    }
};


module.exports = {
    loginController,
    signupController, googleAuth, editUserData, getUserAddresses, addUserAddresses, deleteUserAddresses, changeUserPassword, deleteUser, logoutUser, otpController, userPlaceOrder, userOrdersHistory, forgetPassword, handleForgetPasswordOtp, handleNewPassword
};