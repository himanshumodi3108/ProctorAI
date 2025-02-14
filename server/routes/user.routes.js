const express = require('express');
const { register, signIn, signOut } = require('../controllers/user.control');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const OTP = require('../models/otp.model'); // Import OTP Model

// 🔹 Send OTP & Store in MongoDB
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate OTP

    try {
        await OTP.findOneAndDelete({ email }); // Remove existing OTP if any
        const newOtp = new OTP({ email, otp });
        await newOtp.save();

        console.log(`OTP for ${email}: ${otp}`); // ✅ Log OTP to debug

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: "ProctorAI <your-email@gmail.com>",
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is: ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        res.json({ success: false, message: "Error sending OTP." });
    }
});


// 🔹 Verify OTP from MongoDB
// router.post('/verify-otp', async (req, res) => {
//     const { email, otp } = req.body;

//     console.log(`Verifying OTP for ${email}: Received OTP - ${otp}`); // ✅ Debug

//     if (!email || !otp) {
//         return res.status(400).json({ success: false, message: "Email and OTP are required." });
//     }

//     try {
//         const otpRecord = await OTP.findOne({ email });
//         console.log(`Stored OTP in DB: ${otpRecord?.otp}`); // ✅ Debug

//         if (!otpRecord) {
//             return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
//         }

//         if (otpRecord.otp.trim() !== otp.trim()) {  // 🔹 Fix: Trim spaces & Compare as strings
//             return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
//         }

//         await OTP.deleteOne({ email }); // ✅ OTP verified, remove it
//         res.json({ success: true, message: "OTP Verified!" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error verifying OTP." });
//     }
// });
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // ✅ OTP verified, delete it from DB
        await OTP.deleteOne({ email });

        console.log("✅ OTP Verified & Deleted from Database.");

        res.json({ success: true, message: "OTP Verified!" });
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "Error verifying OTP." });
    }
});



// 🔹 Register User (Only after OTP verification)
// router.post('/register', async (req, res, next) => {
//     const { email, otp } = req.body;

//     console.log("Received Registration Request:");
//     console.log(req.body); // ✅ Debug received request

//     try {
//         if (!email || !otp) {
//             console.log("❌ Error: Email or OTP is missing!");
//             return res.status(400).json({ success: false, message: "Email and OTP are required." });
//         }

//         const otpRecord = await OTP.findOne({ email });
//         console.log(`Stored OTP in DB: ${otpRecord?.otp}`); // ✅ Debug stored OTP

//         if (!otpRecord) {
//             console.log("❌ Error: OTP not found in database.");
//             return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
//         }

//         if (otpRecord.otp.trim() !== otp.trim()) {
//             console.log("❌ Error: OTP does not match.");
//             return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
//         }

//         await OTP.deleteOne({ email }); // ✅ OTP verified, remove it
//         console.log("✅ OTP Verified Successfully!");

//         next(); // Proceed to user registration
//     } catch (error) {
//         console.error("❌ Error verifying OTP:", error);
//         res.status(500).json({ success: false, message: "Error verifying OTP." });
//     }
// }, register);

router.post('/register', async (req, res, next) => {
    const { email } = req.body;

    try {
        // ✅ Ensure OTP was verified and deleted before allowing registration
        const otpRecord = await OTP.findOne({ email });

        if (otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not verified. Please verify OTP first." });
        }

        console.log("✅ OTP Already Verified. Proceeding to Registration...");
        next(); // Proceed to registration
    } catch (error) {
        console.error("❌ Error verifying OTP before registration:", error);
        res.status(500).json({ success: false, message: "Error verifying OTP before registration." });
    }
}, register);




router.post('/signin', signIn);
router.post('/signout', signOut);

module.exports = router;
