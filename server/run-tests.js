const path = require('path');
const http = require('http');
const childProcess = require('child_process');

const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
  if (res.statusCode === 200) {
    const child = childProcess.fork(path.join(__dirname, 'test-runner.js'));
    child.on('exit', (code) => process.exit(code));
  } else {
    spawnAndRun();
  }
});

req.on('error', () => {
  spawnAndRun();
});

function spawnAndRun() {
  const serverProcess = childProcess.spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: 'inherit',
  });

  setTimeout(() => {
    const child = childProcess.fork(path.join(__dirname, 'test-runner.js'));
    child.on('exit', (code) => {
      serverProcess.kill();
      process.exit(code);
    });
  }, 2000);
}
