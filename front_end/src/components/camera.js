import React, { useRef, useEffect, useState, useCallback } from 'react';
import '../App.css';

const Camera = () => {
  const videoRef = useRef(null); // Reference to the video element
  const canvasRef = useRef(null); // Reference to the canvas element
  const intervalRef = useRef(null); // Reference to the interval for capturing frames
  const [loading, setLoading] = useState(true); // Loading state for camera
  const [error, setError] = useState(null); // Error state
  const [detectedText, setDetectedText] = useState([]); // State to store detected text
  const [isCapturing, setIsCapturing] = useState(false); // State to track if capturing is ongoing

  // Function to stop capturing frames
  const stopCapturing = useCallback(() => {
    if (isCapturing) {
      clearInterval(intervalRef.current);
      setIsCapturing(false);
    }
  }, [isCapturing]);

  // useEffect to initialize and clean up the camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      } catch (err) {
        console.error('Error accessing the camera:', err);
        setError('Error accessing the camera');
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      stopCapturing(); // Stop capturing when component unmounts
      if (videoRef.current) {
        const videoElement = videoRef.current;
        const stream = videoElement.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop()); // Stop all tracks of the video stream
        }
      }
    };
  }, [stopCapturing]);

  // Function to capture a frame and send it to the server
  const sendFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/jpeg');
    const blob = await dataURLtoBlob(dataURL);

    const formData = new FormData();
    formData.append('frame', blob);

    try {
      const response = await fetch('http://localhost:5000/detect_text', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setDetectedText(data.map(detection => detection.text));
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Error sending frame to server');
    }
  };

  // Function to convert data URL to blob
  const dataURLtoBlob = async (dataURL) => {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob;
  };

  // Function to start capturing frames
  const startCapturing = () => {
    if (!isCapturing) {
      intervalRef.current = setInterval(sendFrame, 500); // Send frames every 500 milliseconds (2 frames per second)
      setIsCapturing(true);
    }
  };

  // Function to stop the camera stream
  const stopCameraStream = () => {
    const video = videoRef.current;
    if (video) {
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
    setError(null); // Clear any existing error messages
    setLoading(true); // Set loading state to true
    setDetectedText([]); // Clear detected text
    setIsCapturing(false); // Ensure capturing is stopped
  };

  return (
    <div className='container'>
      <div className='card1'>
        {loading && <p>Loading camera...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <video ref={videoRef} autoPlay playsInline width="640" height="480" />
        <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
        {!isCapturing ? (
          <button onClick={startCapturing} className='stopButton'>Start Capturing</button>
        ) : (
          <>
            <button onClick={stopCapturing} className="stopButton">Stop Capturing</button>
            <button onClick={stopCameraStream} className="stopButton">Stop Camera</button>
            <p>Capturing frames...</p>
          </>
        )}
        <div>
          <h3>Detected Text</h3>
          <ul>
            {detectedText.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Camera;
