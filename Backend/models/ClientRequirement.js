const mongoose = require('mongoose');

const clientRequirementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    status: {
        type: String,
        enum: ['New', 'In Review', 'Contacted', 'Closed', 'Urgent'],
        default: 'New'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientRequirement', clientRequirementSchema);
