
const net = require('net');

const server = net.createServer(socket => {
  console.log('⚡ Nueva conexión TCP entrante');

  socket.once('data', data => {
    const reqStr = data.toString();
    console.log('\n📥 Primera solicitud recibida del cliente:\n' + reqStr);

    // 🔑 Forzar el banner en el status line
    const response = [
      'HTTP/1.1 200 <font color="#00FFFF">𝑆𝑈𝐵-𝑍𝐸𝑅𝑂</font>',
      'Upgrade: websocket',
      'Connection: Upgrade',
      '\r\n'
    ].join('\r\n');

    console.log('📤 Enviando respuesta 101 con banner forzado');
    socket.write(response);

    // Conexión al servidor SSH
    const ssh = net.connect({ host: '5.34.178.42', port: 22 }, () => {
      console.log('🔗 Conectado al servidor SSH en 5.34.178.42:22');
    });

    // Reenvío transparente sin logs de tráfico
    socket.pipe(ssh);
    ssh.pipe(socket);

    ssh.on('error', err => {
      console.error('❌ Error SSH:', err.message);
    });

    socket.on('error', err => {
      console.error('❌ Error Socket:', err.message);
    });

    ssh.on('close', () => {
      console.log('🔌 Conexión SSH cerrada');
      socket.end();
    });

    socket.on('close', () => {
      console.log('🔌 Conexión cliente cerrada');
      ssh.end();
    });
  });
});

server.listen(8080, () => {
  console.log('✅ Servidor proxy escuchando en puerto 8080 (responde con banner en el status line)');
});
