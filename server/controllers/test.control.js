const Test = require('../models/test');
const User = require('../models/user');
const shortid = require('shortid');

// const createTest = (req, res) => {
//     const { 
//         email, 
//         test_name, 
//         test_link_by_user, 
//         start_time, 
//         end_time, 
//         no_of_candidates_appear, 
//         test_location 
//     } = req.body;

//     // ✅ Ensure `test_location` is provided
//     if (!test_location) {
//         console.error("❌ Missing test_location in request");
//         return res.status(400).json({ msg: "test_location is required" });
//     }

//     console.log("✅ Received test_location:", test_location);

//     if (!email || !test_name || !test_link_by_user || !start_time || !end_time || !no_of_candidates_appear) {
//         return res.status(400).json({ msg: "Missing required fields" });
//     }

//     let startTime, endTime;
//     try {
//         startTime = new Date(start_time);
//         endTime = new Date(end_time);
//         if (isNaN(startTime) || isNaN(endTime)) {
//             throw new Error('Invalid date format');
//         }
//     } catch (err) {
//         return res.status(400).json({ msg: "Invalid date format", error: err.message });
//     }

//     if (!req.user || !req.user.id) {
//         return res.status(401).json({ msg: "Unauthorized access" });
//     }

//     try {
//         const test = new Test({
//             userId: req.user.id, 
//             email,
//             test_name,
//             test_link_by_user,
//             test_code: shortid.generate() + "-" + shortid.generate(),
//             start_time: startTime,
//             end_time: endTime,
//             no_of_candidates_appear,
//             test_location,
//             total_threshold_warnings: 3,  // ✅ Keep total warnings at 3
//             disableMultiplePeopleWarning: test_location === 'classroom'  // ✅ Disable "Multiple People" Warning in Classroom mode
//         });

//         test.save((error, data) => {
//             if (error) {
//                 return res.status(500).json({ msg: "Something went wrong while creating new test", error });
//             }
//             return res.status(201).json({ msg: "Successfully created new Test on platform", data });
//         });
//     } catch (err) {
//         return res.status(500).json({ msg: "Server error", error: err });
//     }
// };


const createTest = async (req, res) => {
    try {
        const { email, test_name, test_link_by_user, start_time, end_time, no_of_candidates_appear, test_location } = req.body;

        if (!email || !test_name || !test_link_by_user || !start_time || !end_time || !no_of_candidates_appear || !test_location) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        // ✅ Ensure `disableMultiplePeopleWarning` is stored based on test location
        const disableMultiplePeopleWarning = test_location === 'classroom';

        if (!req.user || !req.user.id) {
            console.error("User not authenticated or missing user ID");
            return res.status(401).json({ msg: "Unauthorized access" });
        }

        const test = new Test({
            userId: req.user.id,
            email,
            test_name,
            test_link_by_user,
            test_code: shortid.generate() + "-" + shortid.generate(),
            start_time: new Date(start_time),
            end_time: new Date(end_time),
            no_of_candidates_appear,
            test_location,
            disableMultiplePeopleWarning,  // 🔹 Ensure this field is stored in MongoDB
            total_threshold_warnings: 3
        });

        await test.save();
        return res.status(201).json({ msg: "Test created successfully", test });

    } catch (err) {
        console.error("❌ Error creating test:", err);
        return res.status(500).json({ msg: "Server error", error: err });
    }
};


const increasePersonDetected = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ msg: "Unauthorized access" });
    }

    try {
        // ✅ Fetch user's test to check if "Multiple People Warning" is disabled
        const userTest = await Test.findOne({ userId });

        if (userTest && userTest.disableMultiplePeopleWarning) {
            console.log("❌ Skipping 'Multiple People Warning' (Classroom Mode)");
            return res.status(200).json({ msg: "Multiple People Warning is disabled in Classroom mode" });
        }

        // ✅ Increase warning if not in Classroom mode
        await User.findOneAndUpdate({ _id: userId }, { $inc: { person_detected: 1 } });

        res.status(200).json({ msg: "Warning for 'Multiple People Detected' increased" });
    } catch (error) {
        console.error("Error increasing person detected warning:", error);
        res.status(500).json({ msg: "Server error", error });
    }
};

const increaseVoiceDetected = async (req, res) => {
    const userId = req.user.id;
    if (userId) {
        await User.findOneAndUpdate({ _id: userId }, { $inc: { voice_detected: 1 } });
        res.status(200).json({ msg: "Warning for voice detected increased" });
    }
};

const increaseFaceCovering = async (req, res) => {
    const userId = req.user.id;
    if (userId) {
        await User.findOneAndUpdate({ _id: userId }, { $inc: { face_covered: 1 } });
        res.status(200).json({ msg: "Warning for face covering increased" });
    }
};

const totalWarnings = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ msg: "Unauthorized access" });
    }

    try {
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // ✅ Fetch user's test to check if "Multiple People Warning" is disabled
        const userTest = await Test.findOne({ userId });

        let total_warnings = user.voice_detected + user.face_covered; // ✅ Count only these warnings

        if (!userTest || !userTest.disableMultiplePeopleWarning) {
            total_warnings += user.person_detected; // ✅ Add "Multiple People Warning" only if not disabled
        } else {
            console.log("❌ Excluding 'Multiple People Warning' from total warnings");
        }

        return res.status(200).json({ totalWarnings: total_warnings });
    } catch (error) {
        console.error("Error calculating total warnings:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

const terminateExam = async (req, res) => {
    const userId = req.user.id;
    if (userId) {
        await User.findOneAndUpdate({ _id: userId }, { status: "block" });
        res.status(200).json({ msg: "Candidate has been blocked" });
    }
};

const allowInExam = async (req, res) => {
    const userId = req.user.id;
    if (userId) {
        await User.findOneAndUpdate({ _id: userId }, { status: "safe" });
        res.status(200).json({ msg: "Candidate is now allowed to give exam" });
    }
};

const userCreatedTests = (req, res) => {
    const userId = req.query.userId;  

    if (userId) {
        Test.find({ userId })
            .exec((error, _allTests) => {
                if (error) return res.status(400).json({ msg: "Something went wrong while fetching user tests", error });
                if (_allTests) return res.status(200).json({ _allTests });
            });
    } else {
        return res.status(400).json({ 
            msg: "Check user ID, something is wrong" 
        });
    }
};

const testRegister = async (req, res) => {
    const { test_code } = req.params;
    const userId = req.user.id;
    if (userId) {
        await User.findOneAndUpdate({ _id: userId }, { test_code: test_code });
        res.status(200).json({ msg: "Now you are registered" });
    }
};

const testAdminData = (req, res) => {
    const { test_code } = req.params;
    if (test_code) {
        User.find({ test_code: test_code })
            .exec((error, candidates) => {
                if (error) return res.status(400).json({ msg: "Error fetching candidates-status" });
                if (candidates) return res.status(200).json({ candidates });
            });
    }
};

const testTakerDetails = async (req, res) => {
    try {
        const { test_code, registrationNumber } = req.params;

        // ✅ Fetch test details including `disableMultiplePeopleWarning`
        const test = await Test.findOne({ test_code }).select("test_location disableMultiplePeopleWarning warningCount");

        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }

        console.log("✅ Test Found:", test);  // Debugging log

        return res.status(200).json({
            testCode: test.test_code,
            test_location: test.test_location,
            disableMultiplePeopleWarning: test.disableMultiplePeopleWarning ?? false, // 🔹 Ensure this is always present
            warningCount: test.warningCount || 0
        });

    } catch (error) {
        console.error("❌ Error fetching test details:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};


module.exports = {
    createTest,
    userCreatedTests,
    testRegister,
    testAdminData,
    testTakerDetails,
    increasePersonDetected,
    increaseVoiceDetected,
    increaseFaceCovering,
    totalWarnings,
    terminateExam,
    allowInExam
};
