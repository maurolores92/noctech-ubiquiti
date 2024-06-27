const express = require("express");
const cors = require("cors");
const {
  connectUbiquiti,
  getInfo,
  downloadFile,
  rebootAntenna,
  getDhcpLeases,
  getSystemConfig
} = require("./src/connect");
const app = express();
const pingIp = require("./src/ping");

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.get("/ping/:ip", pingIp);

app.get("/", (req, res) => {
  res.json({ message: "Servidor Activo" });
});

app.post("/connect", async (req, res) => {
  const { ip, port, username, password } = req.body;
  
  if (!ip || !port || !username || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  // Validación de IP y puerto
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const portNumber = parseInt(port, 10);
  if (!ipRegex.test(ip) || isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    return res.status(400).json({ error: 'IP o puerto inválido' });
  }

  try {
    const data = await connectUbiquiti(ip, username, password, port);
    res.json({ message: data });
  } catch (error) {
    res.status(500).json({ error: `Error al conectar: ${error.message}` });
  }
});

app.get("/info", async (req, res) => {
  try {
    const message = await getInfo();
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener información: ${error.message}` });
  }
});

app.get("/download", async (req, res) => {
  try {
    const fileData = await downloadFile();
    res.json({ message: fileData });
  } catch (error) {
    res.status(500).json({ error: `Error al descargar archivo: ${error.message}` });
  }
});

app.get("/reboot", async (req, res) => {
  try {
    const output = await rebootAntenna();
    res.json({ message: output });
  } catch (error) {
    console.error("Error rebooting antenna:", error);
    res.status(500).json({ error: `Error al reiniciar antena: ${error.message}` });
  }
});

app.get("/dhcpLeases", async (req, res) => {
  try {
    const data = await getDhcpLeases();
    res.json({ message: data });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener concesiones DHCP: ${error.message}` });
  }
});

app.get("/systemConfig", async (req, res) => {
  try {
    const data = await getSystemConfig();
    res.json({ message: data });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener configuración del sistema: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
