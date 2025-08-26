const net = require('net');

function hexDump(buffer) {
  return buffer.toString('hex').match(/.{1,2}/g).join(' ');
}

const server = net.createServer(socket => {
  console.log('⚡ Nueva conexión TCP entrante');

  socket.once('data', data => {
    const reqStr = data.toString();

    console.log('\n📥 Primera solicitud recibida del cliente:\n' + reqStr);

    if (reqStr.includes('Upgrade: websocket')) {
      console.log('🌐 WebSocket upgrade detectado');

      // Respuesta 101
      const response = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        '\r\n'
      ].join('\r\n');

      console.log('📤 Enviando respuesta 101:\n' + response);
      socket.write(response);

      // Conexión SSH
      const ssh = net.connect({ host: '5.34.178.42', port: 22 }, () => {
        console.log('🔗 Conectado al servidor SSH (127.0.0.1:8022)');
      });

      // Mostrar todos los datos del cliente hacia SSH
      socket.on('data', data => {
        console.log('\n➡️ Datos del cliente hacia SSH (' + data.length + ' bytes):');
        console.log(hexDump(data));
        ssh.write(data);
      });

      // Mostrar todos los datos del SSH hacia el cliente
      ssh.on('data', data => {
        console.log('\n⬅️ Datos del SSH hacia cliente (' + data.length + ' bytes):');
        console.log(hexDump(data));
        socket.write(data);
      });

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

    } else {
      console.log('❌ No se detectó "Upgrade: websocket", cerrando conexión');
      socket.end();
    }
  });
});

server.listen(8080, () => {
  console.log('✅ Servidor WebSocket falso (raw) escuchando en puerto 8080');
});
