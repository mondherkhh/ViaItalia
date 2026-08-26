const emailService = require('./services/emailService');

async function testEmail() {
  console.log('Testing email service...');
  
  try {
    // Test configuration
    console.log('1. Testing email configuration...');
    const configTest = await emailService.testEmailConfig();
    console.log('Config test result:', configTest);
    
    // Send test email
    console.log('2. Sending test email...');
    const emailTest = await emailService.sendTestEmail();
    console.log('Email test result:', emailTest);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
