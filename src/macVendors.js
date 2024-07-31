const fetch = require('node-fetch');

const isMACAddress = (address) => {
  return /^[0-9A-Fa-f]{12}$/.test(address.replace(/[:-]/g, ''));
};

const getMacVendor = async (mac) => {
  if (!isMACAddress(mac)) {
    throw new Error('Invalid MAC address');
  }

  const url = `https://api.macvendors.com/${encodeURIComponent(mac)}`;
  const response = await fetch(url);

  if (response.ok) {
    const data = await response.text();
    return data;
  } else if (response.status === 404) {
    throw new Error('MAC address not found');
  } else {
    throw new Error('Failed to fetch data');
  }
};

module.exports = { getMacVendor };
