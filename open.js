import { spawn } from 'child_process';
import { platform } from 'os';

const server = spawn('node', ['server.js'], { stdio: 'inherit' });

let cmd = '', args = [];
if (platform() === 'win32') {
  cmd = 'cmd';
  args = ['/c', 'start', 'http://localhost:8000'];
} else if (platform() === 'darwin') {
  cmd = 'open';
  args = ['http://localhost:8000'];
} else {
  cmd = 'xdg-open';
  args = ['http://localhost:8000'];
}

spawn(cmd, args);

server.on('close', code => process.exit(code));
