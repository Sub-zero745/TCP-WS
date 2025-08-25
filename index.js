const express = require("express");
const { createProxyServer } = require("http-proxy");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Proxy hacia la IP objetivo
const proxy = createProxyServer({
  target: "https://5.34.178.42:443",
  changeOrigin: true,
  ws: true,
  secure: false
});

// Manejo de conexiones WebSocket
server.on("upgrade", (req, socket, head) => {
  if (req.url === "/app53") {
    proxy.ws(req, socket, head);
  } else {
    socket.destroy();
  }
});

// Ruta GET raíz (solo devuelve texto)
app.get("/", (req, res) => {
  res.send("SUB-ZERO");
});

// Puerto de escucha (por defecto 8080)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Proxy WebSocket iniciado en puerto " + PORT);
});
