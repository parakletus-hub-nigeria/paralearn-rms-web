const axios = require('axios');

async function testRegister() {
  try {
    console.log('Sending request to backend...');
    const response = await axios.post('http://localhost:3001/lesson-generator/auth/register', {
      name: 'Test Node User',
      email: `test_node_${Date.now()}@example.com`,
      password: 'password123',
      schoolName: 'Node Test School',
      role: 'teacher'
    }, {
      headers: {
        'X-Tenant-Subdomain': 'sabinote'
      },
      timeout: 10000
    });
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.message);
      // console.error('Request:', error.request);
    } else {
      console.error('General Error:', error.message);
    }
  }
}

testRegister();
