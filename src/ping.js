const ping = require("ping");

const pingIp = async (req, res) => {
  const { ip } = req.params;

  try {
    const result = await ping.promise.probe(ip);
    res.json(result);
  } catch (error) {
    console.error("Error pinging:", error);
    res
      .status(500)
      .json({ error: "Error pinging the IP address", details: error });
  }
};

module.exports = pingIp;