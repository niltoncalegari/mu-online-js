const net = require('net');

/**
 * Check if a TCP port is open
 */
function checkPort(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

/**
 * Pass the process info from the server to mu-web-admin.
 *
 * @param {String} clientName
 * @param {Object} payload
 * @param {Function} sendToClient
 * @param {Object} globalStore
 */
module.exports = async ({payload, sendToClient, globalStore}) => {
  const serverName = payload.serverName;
  
  // First check if we have a child process (started by socket server)
  const hasChildProcess = Object.prototype.hasOwnProperty.call(globalStore?.childProcesses, serverName);
  
  if (hasChildProcess) {
    const response = {
      event: 'setServerStatus',
      payload: {
        serverName,
        isOnline: true
      }
    };
    sendToClient('mu-web-admin', response);
    return;
  }

  // If no child process, check if server is responding on its TCP port
  let port;
  switch (serverName) {
    case 'ConnectServer':
      port = 44405;
      break;
    case 'JoinServer':
      port = 55962;
      break;
    case 'GameServer':
      port = 55901; // Default GameServer port
      break;
    default:
      port = null;
  }

  let isOnline = false;
  
  if (port) {
    // Check if the server port is open
    // For Docker containers, try service names first (they work in the same Docker network)
    let hostsToTry = [];
    switch (serverName) {
      case 'ConnectServer':
        hostsToTry = ['connectserver', '127.0.0.1'];
        break;
      case 'JoinServer':
        hostsToTry = ['joinserver', '127.0.0.1'];
        break;
      case 'GameServer':
        hostsToTry = ['127.0.0.1'];
        break;
      default:
        hostsToTry = ['127.0.0.1'];
    }
    
    for (const host of hostsToTry) {
      isOnline = await checkPort(host, port);
      if (isOnline) break;
    }
  }

  const response = {
    event: 'setServerStatus',
    payload: {
      serverName,
      isOnline
    }
  };
  sendToClient('mu-web-admin', response);
};
