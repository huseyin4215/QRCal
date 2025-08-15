import { createTransporter } from './services/emailService.js';
import { config } from 'dotenv';

// Load environment variables
config({ path: './.env' });

async function testEmail() {
  try {
    console.log('🔧 Testing Gmail SMTP Configuration...');
    
    const transporter = createTransporter();
    
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Test email sending
    const testMailOptions = {
      from: process.env.EMAIL_USER || 'infoqrcal@gmail.com',
      to: process.env.EMAIL_USER || 'infoqrcal@gmail.com', // Send to self for testing
      subject: '🧪 QRCal Email Test - SMTP Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Email Test Başarılı!</h2>
          <p>Gmail SMTP konfigürasyonu başarıyla çalışıyor.</p>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #16a34a; margin-top: 0;">SMTP Ayarları</h3>
            <p><strong>Host:</strong> smtp.gmail.com</p>
            <p><strong>Port:</strong> 465 (SSL)</p>
            <p><strong>Kullanıcı:</strong> infoqrcal@gmail.com</p>
            <p><strong>Güvenlik:</strong> SSL/TLS</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Bu e-posta QRCal sistemi tarafından test amaçlı gönderilmiştir.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📤 Email sent to:', testMailOptions.to);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Check your email and password.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check your internet connection and firewall settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. Check your network settings.');
    }
    
    console.error('Full error:', error);
  }
}

// Run the test
testEmail();
