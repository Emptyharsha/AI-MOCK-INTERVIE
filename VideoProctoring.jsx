import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const VideoProctoring = () => {
  const videoRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Connect to the Flask server

    socket.current = io("http://localhost:4998"); // Flask server URL

    // Set up WebRTC to get video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Set video stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Send video stream to the Flask backend
        socket.current.emit("video_stream", stream);
      })
      .catch((err) => {
        console.error("Error accessing media devices", err);
      });

    // Handle the response from the Flask server
    socket.current.on("video_stream_response", (data) => {
      console.log("Proctoring data received:", data);
    });

    return () => {
      // Clean up when component unmounts
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <h2>Live Video Proctoring</h2>
      <video ref={videoRef} autoPlay muted width="100%" height="auto" />
    </div>
  );
};

export default VideoProctoring;
