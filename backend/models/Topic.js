import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Konu adı zorunludur'],
        trim: true,
        maxlength: [100, 'Konu adı 100 karakterden uzun olamaz'],
        unique: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Açıklama 500 karakterden uzun olamaz'],
        default: ''
    },
    isAdvisorOnly: {
        type: Boolean,
        default: false,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
topicSchema.index({ isActive: 1, order: 1 });
topicSchema.index({ name: 1 });

// Static methods
topicSchema.statics.findActive = function () {
    return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

topicSchema.statics.findByName = function (name) {
    return this.findOne({ name, isActive: true });
};

// Instance methods
topicSchema.methods.toPublicJSON = function () {
    const topic = this.toObject();
    return {
        _id: topic._id,
        name: topic.name,
        description: topic.description,
        isAdvisorOnly: topic.isAdvisorOnly,
        order: topic.order
    };
};

export default mongoose.model('Topic', topicSchema);
