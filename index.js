const net = require('net');

const server = net.createServer(socket => {
  console.log('⚡️ Nueva conexión TCP entrante');
    
   const PORT = 22;
   const IP = '87.101.93.6';

  // Conexión al servidor SSH
  const ssh = net.connect({ host: IP, port: PORT }, () => {
    console.log('🔗 Conectado al servidor SSH en ' + IP + ':' + PORT);
  });

  // Enviar HTTP 101 al cliente inmediatamente
  const banner = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    '\r\n'
  ].join('\r\n');
  socket.write(banner);
  console.log('📤 Enviado HTTP 101 al cliente');

  let firstPacketHandled = false;

  // Datos del cliente -> servidor SSH
  socket.on('data', data => {
    if (!firstPacketHandled) {
      // Detectar si este primer paquete contiene SSH-2
      const str = data.toString();
      const sshIndex = str.indexOf('SSH-2.0');

      if (sshIndex !== -1) {
        const sshPart = str.slice(sshIndex); // enviar solo la parte SSH
        console.log('📤 Reenviando primer paquete válido SSH al servidor');
        ssh.write(sshPart);
      } else {
        console.log('📤 Primer paquete no es SSH, no se reenvía al servidor');
      }

      firstPacketHandled = true;
    } else {
      ssh.write(data); // reenviar paquetes posteriores normalmente
    }
  });

  // Datos del servidor SSH -> cliente
  ssh.on('data', data => {
    socket.write(data); // reenviar al cliente
  });

  // Manejo de errores
  socket.on('error', e => console.error('Client error:', e.message));
  ssh.on('error', e => console.error('Server error:', e.message));

  // Cierre de conexiones
  socket.on('close', () => {
    console.log('🔌 Conexión con el cliente cerrada');
    ssh.end();
  });

  ssh.on('close', () => {
    console.log('🔌 Conexión con el servidor SSH cerrada');
    socket.end();
  });
});

server.listen(8080, () => {
  console.log('✅ Servidor proxy escuchando en puerto 8080');
});
