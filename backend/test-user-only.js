const axios = require('axios');

async function testUserOnlyEmails() {
  try {
    console.log('=== TESTING USER-ONLY EMAIL NOTIFICATIONS ===');
    
    const announcementData = {
      title: 'Information Importante pour les Utilisateurs',
      content: 'Ceci est un test pour vérifier que seuls les utilisateurs (et non les administrateurs) reçoivent les emails d\'annonces.',
      type: 'INFO',
      isActive: true
    };
    
    console.log('Creating announcement (should only email USER role)...');
    
    const response = await axios.post('http://localhost:5000/api/test/announcements', announcementData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response:', response.data);
    console.log('=== USER-ONLY EMAIL TEST COMPLETED ===');
    
  } catch (error) {
    console.error('=== TEST FAILED ===');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUserOnlyEmails();
