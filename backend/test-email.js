import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log('🔧 Testing Gmail SMTP Configuration...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: process.env.EMAIL_USER || 'your-email@gmail.com', // Send to self for testing
      subject: '🧪 QRCal Email Test - SMTP Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; text-align: center;">🧪 QRCal Email Test</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Gmail SMTP konfigürasyonu başarıyla çalışıyor.</p>
            <p>Email servisi aktif ve kullanıma hazır.</p>
          </div>
          
          <h3 style="color: #16a34a; margin-top: 0;">SMTP Ayarları</h3>
          <p><strong>Host:</strong> smtp.gmail.com</p>
          <p><strong>Port:</strong> 587</p>
          <p><strong>Security:</strong> TLS</p>
          
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #166534;">✅ Email test başarılı!</p>
          </div>
        </div>
      `
    });
    
    console.log('📧 Test email sent successfully!');
    console.log('📤 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Check your email and password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check your internet connection and firewall settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. Check your network settings.');
    } else {
      console.error('🔍 Unknown error. Check the error details above.');
    }
  }
}

// Run test
testEmail();
