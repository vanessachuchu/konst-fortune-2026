import { useState, useRef, useEffect, useCallback } from 'react';

function Camera({ employee, onCapture, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState('');


  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1440 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('請允許使用相機權限');
      } else if (err.name === 'NotFoundError') {
        setError('找不到相機裝置');
      } else {
        setError('無法開啟相機');
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const startCountdown = () => {
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoData);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const confirmPhoto = () => {
    onCapture(capturedPhoto);
  };

  return (
    <div className="camera-section">
      <div className="welcome-text">
        <div className="employee-badge">
          {employee.name}
        </div>
        <h3>{capturedPhoto ? '照片預覽' : '拍攝你的靈籤照'}</h3>
        <p>{capturedPhoto ? 'AI 將解讀你的表情生成籤詩' : '展現你的水水穿搭'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="camera-preview">
        {!capturedPhoto ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ display: error ? 'none' : 'block' }}
            />
            <button className="switch-camera-btn" onClick={switchCamera} title="切換鏡頭">
              🔄
            </button>
            {countdown && <div className="countdown-overlay">{countdown}</div>}
          </>
        ) : (
          <img src={capturedPhoto} alt="Captured" />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-controls">
        {!capturedPhoto ? (
          <>
            <button
              className="capture-btn"
              onClick={startCountdown}
              disabled={countdown !== null || error}
            />
            <p style={{ textAlign: 'center', marginTop: '12px', color: '#666', fontSize: '0.9rem' }}>
              點擊拍照 (3秒倒數)
            </p>
          </>
        ) : (
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={retakePhoto}>
              重新選擇
            </button>
            <button className="btn btn-primary" onClick={confirmPhoto}>
              使用此照片
            </button>
          </div>
        )}

        {!capturedPhoto && (
          <button
            className="btn btn-secondary"
            onClick={onBack}
            style={{ marginTop: '12px' }}
          >
            返回
          </button>
        )}
      </div>
    </div>
  );
}

export default Camera;
