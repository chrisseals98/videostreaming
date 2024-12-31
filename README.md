# Video Streaming
This project was something I wanted to try out with video streaming over HTTP. This repo contains a very simple Node.js express server that sends webm chunks from a webcam connected to the server. For the video stream on the server, I used FFMPEG to connect the webcam feed to a stream which is then sent back as chunks to the client.

## Improvements
While using this I noticed the stream buffers frequently, I believe I need to try a different format with FFMPEG to get better results, because it buffered when connecting directly to the FFMPEG stream locally using VLC. There could also be some configuration changes on the server to use web sockets, and I might come back to that later.

## To run
1. First install the node packages with `npm install`
2. Connect a webcam to your computer, and then run `.\node_modules\ffmpeg-static\ffmpeg.exe -list_devices true -f dshow -i dummy` to see a list of available webcams on windows.
    - Please visit [ffmpeg-devices](https://www.ffmpeg.org/ffmpeg-devices.html#Input-Devices) for more details on how to get this information on other OS
3. Update line 14 in `index.js` to match the name of your webcam
4. Run `node index.js` to start the server on port 3000
5. Open your browser and go to `localhost:3000`, you will see a very simple HTML video player, clicking start should show you the feed from the webcam!

### Example
> Footage of my webcam pointed at a 3D printed capybara figure (^̮^)

![Screenshot of Browser with the server running](/public/streaming.png)