import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Static method to get a setting
systemSettingsSchema.statics.getSetting = async function (key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static method to set a setting
systemSettingsSchema.statics.setSetting = async function (key, value, userId = null, description = '') {
    return await this.findOneAndUpdate(
        { key },
        {
            value,
            updatedAt: new Date(),
            updatedBy: userId,
            description
        },
        { upsert: true, new: true }
    );
};

export default mongoose.model('SystemSettings', systemSettingsSchema);
