// Test script to verify SBTET API proxy
import fetch from 'node-fetch';

const testPin = '24054-cps-011';
const apiUrl = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${encodeURIComponent(testPin)}`;

console.log('Testing SBTET API directly...');
console.log('URL:', apiUrl);

try {
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; FeedX-Proxy/1.0)'
    }
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (response.ok) {
    const data = await response.json();
    console.log('Response data:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('Error response:', await response.text());
  }
} catch (error) {
  console.error('Error:', error.message);
}