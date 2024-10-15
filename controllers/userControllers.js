const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Address = require('../models/AddressModel');

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
            process.env.JWT_SECRET);
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

        console.log('UserID:', userId, 'Updated Data:', updatedData);

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('Updated user:', user);
        res.json({ msg: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.user; // Assuming `req.user` is populated by some middleware
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

        const user = await User.findOne({ _id: userId });

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
            return res.status(404).json({ msg: 'User not found. Please login again.', success: true });
        }
        const response = await User.deleteOne({ _id: userId });

        return res.status(200).json({ msg: 'User deleted successfully', success: true, });

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
};




module.exports = {
    loginController,
    signupController, googleAuth, editUserData, getUserAddresses, addUserAddresses, deleteUserAddresses, changeUserPassword, deleteUser
};