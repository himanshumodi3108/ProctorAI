const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    email: { type: String, trim: true, lowercase: true, required: true },
    test_name: { type: String, required: true, trim: true, min: 2, max: 20 },
    test_link_by_user: { type: String, required: true },
    test_link: { type: String, default: "none" },
    test_code: { type: String, unique: true, default: "none" },
    start_time: { type: Date, required: true, default: Date.now() },
    end_time: { type: Date, required: true, default: Date.now() },
    no_of_candidates_appear: { type: String, required: true },
    total_threshold_warnings: { type: Number, required: true, default: 3 },
    test_location: { 
        type: String, 
        enum: ['classroom', 'own-location'], 
        required: true, 
        default: 'classroom'  // ✅ Ensuring default value
    },
    disableMultiplePeopleWarning: { 
        type: Boolean, 
        default: false  // ✅ Default is false (Enabled in 'own-location')
    }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
