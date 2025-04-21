const bcrypt = require('bcrypt');  
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const OTP = require('../models/otp.model'); // ✅ Import OTP Model

const register = async (req, res) => {
    const { email, fullName, password, otp } = req.body;

    console.log("Processing Registration for:", email);

    if (!email || !fullName || !password) {
        console.log("❌ Error: Missing required fields.");
        return res.status(400).json({ message: "Email, Full Name, and Password are required." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("❌ Error: User already exists.");
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            fullName,
            hash_password: hashedPassword, 
        });

        await user.save();
        console.log("✅ User Registered Successfully!");

        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('❌ Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const signIn = (req, res) => {
    User.findOne({ email: req.body.email })
        .exec((error, user) => {
            if (error) {
                return res.status(400).json({ msg: "Internal error", error });
            }
            if (user) {
                if (user.authenticate(req.body.password)) {
                    const token = jwt.sign(
                        { id: user._id, email: user.email },
                        JWT_SECRET_KEY,
                        { expiresIn: '2d' }
                    );
                    const { _id, fullName, email, profilePicture } = user;

                    const expires = new Date();
                    expires.setDate(expires.getDate() + 2); 
                    res.cookie('token', token, {
                        httpOnly: true,        // For security: can't be accessed by JavaScript
                        secure: true,          // Always use HTTPS in production
                        sameSite: 'None',      // For cross-origin requests
                        expires: expires               // Set cookie expiration
                    });
                    res.status(200).json({
                        token,
                        userId: user._id,
                        user: { _id, fullName, email, profilePicture }
                    });
                } else {
                    return res.status(401).json({ msg: "Invalid password" });
                }
            } else {
                return res.status(404).json({ msg: "User does not exist" });
            }
        });
};

const signOut = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ msg: `Sign-out Successfully...!` });
};

module.exports = {
    register,
    signIn,
    signOut
};
