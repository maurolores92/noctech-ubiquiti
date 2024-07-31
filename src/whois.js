const fetch = require('node-fetch');

const getWhoisInfo = async (ip) => {
  if (!ip) {
    throw new Error('IP address is required');
  }

  const apiKey = 'c6214a27484fbc'
  const url = `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${apiKey}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

module.exports = { getWhoisInfo };
