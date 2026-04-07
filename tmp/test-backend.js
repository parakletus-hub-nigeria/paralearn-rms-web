const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:3001/lesson-generator/auth/register', {
      name: 'Test Node User',
      email: `test_node_${Date.now()}@example.com`,
      password: 'password123',
      schoolName: 'Node Test School',
      role: 'teacher'
    }, {
      headers: {
        'X-Tenant-Subdomain': 'sabinote'
      }
    });
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegister();
