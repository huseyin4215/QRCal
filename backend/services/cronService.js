import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import SystemSettings from '../models/SystemSettings.js';

// Initialize cron jobs
export const initCronJobs = () => {
    console.log('Initializing cron jobs...');

    // Run every hour to check for expired appointments
    // Schedule: "0 * * * *" (At minute 0 of every hour)
    cron.schedule('0 * * * *', async () => {
        console.log('Running expired appointments cleanup job...');
        await checkExpiredAppointments();
    });

    console.log('Cron jobs initialized');
};

// Check and expire pending appointments
export const checkExpiredAppointments = async () => {
    try {
        // Get timeout setting (in hours)
        const timeoutHours = await SystemSettings.getSetting('appointmentTimeoutHours');

        // If not set or invalid, skip
        if (!timeoutHours || isNaN(timeoutHours) || timeoutHours <= 0) {
            console.log('Appointment timeout not configured or invalid, skipping cleanup.');
            return;
        }

        const now = new Date();
        const timeoutMs = timeoutHours * 60 * 60 * 1000;
        const thresholdDate = new Date(now.getTime() - timeoutMs);

        // Find pending appointments requested before the threshold
        const result = await Appointment.updateMany(
            {
                status: 'pending',
                $or: [
                    { requestedAt: { $lt: thresholdDate } },
                    { requestedAt: { $exists: false }, createdAt: { $lt: thresholdDate } }
                ]
            },
            {
                $set: {
                    status: 'no_response'
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Expired ${result.modifiedCount} pending appointments due to timeout (${timeoutHours} hours).`);
        }
    } catch (error) {
        console.error('Error running expired appointments cleanup:', error);
    }
};
