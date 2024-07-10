const { Client } = require("ssh2");

let conn = new Client();
conn.connected = false;

const connectUbiquiti = (host, username, password, port) => {
  return new Promise((resolve, reject) => {
    if (conn.connected) {
      conn.end();
      conn.connected = false;
    }

    conn
      .on("ready", () => {
        console.log("Connected successfully to Ubiquiti antenna");
        conn.connected = true;
        resolve("Connected successfully");
      })
      .on("error", (error) => {
        console.error("Failed to connect to Ubiquiti antenna:", error.message);
        conn.connected = false;
        reject(new Error(`SSH Connection Error: ${error.message}`));
      })
      .on("end", () => {
        console.log("SSH connection ended");
        conn.connected = false;
      })
      .on("close", (hadError) => {
        console.log("SSH connection closed", hadError ? "due to error" : "");
        conn.connected = false;
      })
      .connect({
        host,
        port,
        username,
        password,
      });
  });
};

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    if (!conn.connected) {
      reject(new Error("Not connected to the SSH server"));
    } else {
      conn.exec(command, (err, stream) => {
        if (err) {
          reject(new Error(`Failed to execute command: ${err.message}`));
        } else {
          let output = "";
          stream
            .on("data", (data) => (output += data.toString()))
            .on("close", (code, signal) => {
              if (code !== 0) {
                reject(new Error(`Command failed with code ${code} and signal ${signal}`));
              } else {
                resolve(output.trim());
              }
            })
            .stderr.on("data", (data) => {
              console.error("STDERR:", data.toString());
            });
        }
      });
    }
  });
};

const getInfo = () => execCommand("mca-status");

const rebootAntenna = () => execCommand("reboot").finally(() => {
  conn.end();
  conn.connected = false;
});

const downloadFile = () => execCommand("wget -O /dev/null http://codewithmauricio.tech/IPCam.apk");

const getDhcpLeases = () => execCommand('cat /tmp/dhcpd.leases');

const getSystemConfig = () => execCommand('cat /tmp/system.cfg');

module.exports = {
  connectUbiquiti,
  getInfo,
  downloadFile,
  rebootAntenna,
  getDhcpLeases,
  getSystemConfig,
};
