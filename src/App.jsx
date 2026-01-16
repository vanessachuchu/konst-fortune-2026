import { useState } from 'react';
import Login from './components/Login';
import Camera from './components/Camera';
import MoodSelector from './components/MoodSelector';
import FortuneGenerator from './components/FortuneGenerator';
import Preview from './components/Preview';
import './index.css';

// Steps: login -> camera -> mood -> generating -> preview
const STEPS = {
  LOGIN: 'login',
  CAMERA: 'camera',
  MOOD: 'mood',
  GENERATING: 'generating',
  PREVIEW: 'preview',
};

// KONST Logo SVG Component
const KonstLogo = () => (
  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6L16 16L8 26" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 6L12 16L4 26" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 6L28 16L20 26" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="38" y="22" fill="white" fontFamily="Orbitron, sans-serif" fontSize="18" fontWeight="700">KONST</text>
  </svg>
);

function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.LOGIN);
  const [employee, setEmployee] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [mood, setMood] = useState(null);
  const [wish, setWish] = useState('');
  const [fortuneImage, setFortuneImage] = useState(null);

  const handleLogin = (selectedEmployee) => {
    setEmployee(selectedEmployee);
    setCurrentStep(STEPS.CAMERA);
  };

  const handleCapture = (capturedPhoto) => {
    setPhoto(capturedPhoto);
    setCurrentStep(STEPS.MOOD);
  };

  const handleMoodSelect = (selectedMood, userWish) => {
    setMood(selectedMood);
    setWish(userWish);
    setCurrentStep(STEPS.GENERATING);
  };

  const handleFortuneComplete = (generatedImage) => {
    setFortuneImage(generatedImage);
    setCurrentStep(STEPS.PREVIEW);
  };

  const handleRestart = () => {
    setEmployee(null);
    setPhoto(null);
    setMood(null);
    setWish('');
    setFortuneImage(null);
    setCurrentStep(STEPS.LOGIN);
  };

  const handleBackToCamera = () => {
    setPhoto(null);
    setMood(null);
    setCurrentStep(STEPS.CAMERA);
  };

  const handleBackToMood = () => {
    setMood(null);
    setCurrentStep(STEPS.MOOD);
  };

  const handleBackToLogin = () => {
    setEmployee(null);
    setCurrentStep(STEPS.LOGIN);
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case STEPS.LOGIN:
        return 0;
      case STEPS.CAMERA:
        return 1;
      case STEPS.MOOD:
        return 2;
      case STEPS.GENERATING:
        return 3;
      case STEPS.PREVIEW:
        return 4;
      default:
        return 0;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.LOGIN:
        return <Login onLogin={handleLogin} />;
      case STEPS.CAMERA:
        return (
          <Camera
            employee={employee}
            onCapture={handleCapture}
            onBack={handleBackToLogin}
          />
        );
      case STEPS.MOOD:
        return (
          <MoodSelector
            employee={employee}
            photo={photo}
            onSelect={handleMoodSelect}
            onBack={handleBackToCamera}
          />
        );
      case STEPS.GENERATING:
        return (
          <FortuneGenerator
            employee={employee}
            photo={photo}
            mood={mood}
            wish={wish}
            onComplete={handleFortuneComplete}
            onBack={handleBackToMood}
          />
        );
      case STEPS.PREVIEW:
        return (
          <Preview
            employee={employee}
            fortuneImage={fortuneImage}
            onRestart={handleRestart}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo">
          <KonstLogo />
        </div>
        <h1>AI 靈籤</h1>
        <h2>貳零貳陸 尾牙特別版</h2>

        <div className="progress-steps">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`progress-step ${
                step < getStepIndex()
                  ? 'completed'
                  : step === getStepIndex()
                  ? 'active'
                  : ''
              }`}
            />
          ))}
        </div>
      </header>

      <main className="card">
        <div className="ai-corner ai-corner-tl"></div>
        <div className="ai-corner ai-corner-tr"></div>
        <div className="ai-corner ai-corner-bl"></div>
        <div className="ai-corner ai-corner-br"></div>
        {renderStep()}
      </main>

      <footer className="footer">
        <p>KONST AI © 2026</p>
      </footer>
    </div>
  );
}

export default App;
