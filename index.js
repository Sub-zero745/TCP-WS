
const net = require('net');

function hexDump(buffer) {
  return buffer.toString('hex').match(/.{1,2}/g).join(' ');
}

const server = net.createServer(socket => {
  console.log('⚡ Nueva conexión TCP entrante');

  socket.once('data', data => {
    const reqStr = data.toString();
    console.log('\n📥 Primera solicitud recibida del cliente:\n' + reqStr);

    // 🔑 Respuesta 101 con banner HTML en la primera línea
    const response = [
      'HTTP/1.1 101 <font color="#00FFFF">𝑆𝑈𝐵-𝑍𝐸𝑅𝑂</font>',
      'Upgrade: websocket',
      'Connection: Upgrade',
      '\r\n'
    ].join('\r\n');

    console.log('📤 Enviando respuesta 101 con banner:\n' + response);
    socket.write(response);

    // Conectar al servidor SSH en la VPS
    const ssh = net.connect({ host: '5.34.178.42', port: 22 }, () => {
      console.log('🔗 Conectado al servidor SSH en 5.34.178.42:22');
    });

    // Redirigir datos cliente → SSH
    socket.on('data', data => {
      console.log('\n➡️ Cliente → SSH (' + data.length + ' bytes):');
      console.log(hexDump(data));
      ssh.write(data);
    });

    // Redirigir datos SSH → cliente
    ssh.on('data', data => {
      console.log('\n⬅️ SSH → Cliente (' + data.length + 'bytes):');
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
  });
});

server.listen(8080, () => {
  console.log('✅ Servidor proxy escuchando en puerto 8080 (responde siempre con banner en 101)');
});
