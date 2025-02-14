const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// const JWT_SECRET_KEY = "key"; 

require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const requireSignIn = (req, res, next) => {
    const token = req.cookies.token; 

    if (token) {
        try {
            const user = jwt.verify(token, JWT_SECRET_KEY);
            req.user = user;
            next();
        } catch (error) {
            console.error("JWT verification error:", error.message);
            return res.status(401).json({ msg: "Invalid or expired token" });
        }
    } else {
        return res.status(400).json({ msg: "Authorization token missing" });
    }
};



module.exports = { requireSignIn };
