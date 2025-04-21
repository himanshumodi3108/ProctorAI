const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const Test = require("./models/test");
const { requireSignIn } = require("./middlewares");

const app = express();
app.use(cookieParser());


app.use(
  cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Make sure credentials are included (cookies, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();
const dburl = process.env.MONGO_URI;

const connectDB = (dburl) => {
  return mongoose
    .connect(dburl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database Connected");
    });
};

// const dburl =
//   "mongodb+srv://<username>:<password>@cluster0.ytnck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // MongoDB connection
// const connectDB = (dburl) => {
//   return mongoose
//     .connect(dburl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log("Database Connected");
//     });
// };

// Mongoose Schema and Model for `test_taker` collection
const testTakerSchema = new mongoose.Schema({
  testCode: {
    type: String,
    required: true,
    trim: true,
  },
  name: { type: String, required: true },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
  },
  warningCount: {
    type: Number,
    default: 0,
  },
  // totalWarningCount: { 
  //   type: Number, 
  //   default: 0 
  // }
});

// Remove unique index from MongoDB (if previously set)
testTakerSchema.index(
  { testCode: 1, registrationNumber: 1 },
  { unique: false }
);

const TestTaker = mongoose.model("test_taker", testTakerSchema);

app.post("/api/test-taker", async (req, res) => {
  try {
    const { testCode, registrationNumber, email, name } = req.body;

    // Validate input fields
    if (!testCode || !registrationNumber || !email || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the registration number with the test code already exists
    const existingTestTaker = await TestTaker.findOne({
      testCode,
      registrationNumber,
    });

    if (existingTestTaker) {
      // If it exists, return a success response without saving
      return res
        .status(200)
        .json({
          message:
            "Test taker already exists for this test code and registration number",
        });
    }

    // Create a new document
    const newTestTaker = new TestTaker({
      testCode,
      registrationNumber,
      email,
      name,
    });

    // Save the document to the database
    await newTestTaker.save();

    res.status(201).json({ message: "Test taker data saved successfully" });
  } catch (error) {
    console.error("Error saving test taker data:", error);

    // Send appropriate error response
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/test-takers", async (req, res) => {
  try {
    // Fetch all test-taker records from the database
    const testTakers = await TestTaker.find();

    // Return the fetched data
    res.status(200).json({
      message: "All test takers fetched successfully",
      data: testTakers,
    });
  } catch (error) {
    console.error("Error fetching test takers:", error);

    // Send appropriate error response
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// API to fetch test taker's data
// app.get("/api/test-taker/:testCode/:registrationNumber", async (req, res) => {
//   try {
//     const { testCode, registrationNumber } = req.params;

//     // Find the test taker by testCode and registrationNumber
//     const testTaker = await TestTaker.findOne({ testCode, registrationNumber });

//     if (!testTaker) {
//       return res.status(404).json({ message: "Test taker not found" });
//     }

//     // Return the test taker's data including warningCount
//     res.status(200).json(testTaker);
//   } catch (error) {
//     console.error("Error fetching test taker data:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// });

app.get("/api/test-taker/:testCode/:registrationNumber", async (req, res) => {
  try {
    const { testCode, registrationNumber } = req.params;

    // Find the test taker by testCode and registrationNumber
    const testTaker = await TestTaker.findOne({ testCode, registrationNumber });

    if (!testTaker) {
      return res.status(404).json({ message: "Test taker not found" });
    }

    // Fetch `disableMultiplePeopleWarning` from the Test collection
    // const test = await Test.findOne({ test_code: testCode }).select("test_location disableMultiplePeopleWarning");

    const test = await Test.findOne(
      { test_code: testCode },
      { test_location: 1, disableMultiplePeopleWarning: 1, _id: 0 }
    );

    if (!test) {
      return res.status(404).json({ message: "Test details not found" });
    }

    // Include disableMultiplePeopleWarning in the response
    const responseData = {
      ...testTaker.toObject(), // Convert Mongoose document to JS object
      test_location: test.test_location,
      disableMultiplePeopleWarning: test.disableMultiplePeopleWarning || false, // Ensure it defaults to false if undefined
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching test taker data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// API to update the warningCount for a test taker
app.put(
  "/api/test-taker/:testCode/:registrationNumber/warningCount",
  async (req, res) => {
    try {
      const { testCode, registrationNumber } = req.params;
      const { warningCount } = req.body; // Get the new warningCount value from the request body

      // Find the test taker by testCode and registrationNumber
      const testTaker = await TestTaker.findOne({
        testCode,
        registrationNumber,
      });

      if (!testTaker) {
        return res.status(404).json({ message: "Test taker not found" });
      }

      // Update the warningCount
      testTaker.warningCount = warningCount;

      // Increment the totalWarningCount
      // testTaker.totalWarningCount++;

      // Save the updated test taker
      await testTaker.save();

      // Return the updated test taker data
      res.status(200).json(testTaker);
    } catch (error) {
      console.error("Error updating warningCount:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

app.get("/api/all-tests", (req, res) => {
  // Fetch all tests from the "Test" collection
  Test.find({}).exec((error, allTests) => {
    if (error)
      return res
        .status(400)
        .json({ msg: "Something went wrong while fetching tests", error });
    if (allTests.length > 0) {
      return res.status(200).json({ allTests });
    } else {
      return res.status(404).json({ msg: "No tests found" });
    }
  });
});

// Route to delete a test by ID
app.delete("/api/tests/:test_id", requireSignIn, async (req, res) => {
  const { test_id } = req.params;

  // Check if test_id is provided
  if (!test_id) {
    return res.status(400).json({ msg: "Test ID is required" });
  }

  try {
    const test = await Test.findOne({ _id: test_id, userId: req.user.id });

    if (!test) {
      return res
        .status(404)
        .json({ msg: "Test not found or not authorized to delete" });
    }

    // Delete the test
    await Test.deleteOne({ _id: test_id });

    return res.status(200).json({ msg: "Test deleted successfully" });
  } catch (err) {
    console.error("Error deleting test:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Serve static files
app.use("/public", express.static(path.join(__dirname, "uploads")));

// Placeholder for other routes
const userRoutes = require("./routes/user.routes");
const testRoutes = require("./routes/test.routes");
app.use("/api", userRoutes);
app.use("/api", testRoutes);

// Start the server
const start = async () => {
  try {
    await connectDB(dburl);
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  } catch (error) {
    console.log(error);
  }
};

start();