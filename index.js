const express = require('express');
const basicAuth = require('basic-auth');
const { spawn } = require('child_process');
const cors = require('cors');
const ffmpegPath = require('ffmpeg-static');
const app = express();
const port = 3000



// Spawn FFmpeg process
const ffmpegProcess = spawn(ffmpegPath, [
  '-f', 'dshow',          // Use DirectShow for input
  '-rtbufsize', '50M',    // Buffer size
  '-i', 'video="GENERAL WEBCAM"', // Replace with your webcam name
  '-c:v', 'vp8',          // Video codec
  '-f', 'webm',           // Output format
  //'-hwaccel', 'cuda',
  //'-c:v', 'h264_nvenc',
  // '-b:v', '1M',          // Set a reasonable bitrate
  // '-bufsize', '1M',      // Set the buffer size for streaming
  'pipe:1'                // Pipe to STDOUT
], { shell: true });

const MAX_BUFFER_SIZE = 100; // Number of chunks to store
let buffer = [];
let clients = [];

ffmpegProcess.stdout.on("data", (chunk) => {
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.shift(); // Remove the oldest chunk
  }
  console.log("wrote to buffer ", "current size: ", buffer.length)
  buffer.push(chunk);
  clients.forEach(client => {
    if(!client.destroyed) {
      client.write(chunk);
    }
  })
});

// Log FFmpeg errors
ffmpegProcess.on('error', (data) => {
  console.error(`FFmpeg error: ${data}`);
});

// Handle process exit
ffmpegProcess.on('close', (code) => {
  console.log(`FFmpeg process exited with code ${code}`);
});



app.use(cors());

// Middleware to check HTTP Basic Authentication
function basicAuthMiddleware(req, res, next) {
  const user = basicAuth(req);
  
  // Simple check for hardcoded credentials
  if (user && user.name === 'very' && user.pass === 'sealy') {
    return next(); // If credentials are correct, continue to the route
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
    res.status(401).send('Unauthorized');
  }
}

// Protect routes with the basicAuthMiddleware
//app.use('/video', basicAuthMiddleware);

// Serve static HTML page for the video
app.use(express.static("public"));

// // Endpoint to stream webcam footage
app.get('/video', (req, res) => {
  //set headers
  res.setHeader('Content-Type', 'video/webm');
  res.setHeader('Transfer-Encoding', 'chunked');
  // Pipe FFmpeg output to HTTP response
  
  clients.push(res);

  // Catch up client with the existing buffer
  buffer.forEach(chunk => {
    res.write(chunk);
  });
  
  // Handle client disconnection
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
