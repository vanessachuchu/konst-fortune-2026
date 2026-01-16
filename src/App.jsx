import { useState } from 'react';
import ModeSelector from './components/ModeSelector';
import PreRegister from './components/PreRegister';
import EventDayLogin from './components/EventDayLogin';
import StylePreview from './components/StylePreview';
import Login from './components/Login';
import Camera from './components/Camera';
import FortuneGenerator from './components/FortuneGenerator';
import Preview from './components/Preview';
import './index.css';

// 流程步驟 - 移除 MOOD 步驟
const STEPS = {
  MODE_SELECT: 'mode_select',     // 首頁模式選擇
  PRE_REGISTER: 'pre_register',   // 活動前預註冊
  EVENT_LOGIN: 'event_login',     // 活動當天登入
  STYLE_PREVIEW: 'style_preview', // 風格預覽
  LOGIN: 'login',                 // 快速模式登入
  CAMERA: 'camera',
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
  const [currentStep, setCurrentStep] = useState(STEPS.MODE_SELECT);
  const [appMode, setAppMode] = useState(null); // 'preregister', 'eventday', 'quick'
  const [employee, setEmployee] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [wish, setWish] = useState('');
  const [fortuneImage, setFortuneImage] = useState(null);

  // 模式選擇
  const handleModeSelect = (mode) => {
    setAppMode(mode);
    switch (mode) {
      case 'preregister':
        setCurrentStep(STEPS.PRE_REGISTER);
        break;
      case 'eventday':
        setCurrentStep(STEPS.EVENT_LOGIN);
        break;
      case 'quick':
        setCurrentStep(STEPS.LOGIN);
        break;
      default:
        setCurrentStep(STEPS.MODE_SELECT);
    }
  };

  // 願望變更
  const handleWishChange = (newWish) => {
    setWish(newWish);
  };

  // 活動當天選擇員工
  const handleEventDaySelect = (selectedEmployee) => {
    setEmployee(selectedEmployee);
    setCurrentStep(STEPS.STYLE_PREVIEW);
  };

  // 從風格預覽進入拍照
  const handleStylePreviewContinue = () => {
    setCurrentStep(STEPS.CAMERA);
  };

  // 快速模式登入（無預註冊資料）
  const handleQuickLogin = (employeeData) => {
    setEmployee(employeeData);
    setCurrentStep(STEPS.CAMERA);
  };

  // 拍照完成 - 直接進入生成（跳過心情選擇）
  const handleCapture = (capturedPhoto) => {
    setPhoto(capturedPhoto);
    setCurrentStep(STEPS.GENERATING);
  };

  const handleFortuneComplete = (generatedImage) => {
    setFortuneImage(generatedImage);
    setCurrentStep(STEPS.PREVIEW);
  };

  const handleRestart = () => {
    setEmployee(null);
    setPhoto(null);
    setWish('');
    setFortuneImage(null);
    // 根據模式返回不同頁面
    if (appMode === 'eventday') {
      setCurrentStep(STEPS.EVENT_LOGIN);
    } else {
      setCurrentStep(STEPS.MODE_SELECT);
      setAppMode(null);
    }
  };

  const handleBackToModeSelect = () => {
    setEmployee(null);
    setPhoto(null);
    setWish('');
    setFortuneImage(null);
    setAppMode(null);
    setCurrentStep(STEPS.MODE_SELECT);
  };

  const handleBackToCamera = () => {
    setPhoto(null);
    setCurrentStep(STEPS.CAMERA);
  };

  const handleBackToLogin = () => {
    setEmployee(null);
    if (appMode === 'eventday') {
      setCurrentStep(STEPS.EVENT_LOGIN);
    } else {
      setCurrentStep(STEPS.LOGIN);
    }
  };

  const handleBackToStylePreview = () => {
    setPhoto(null);
    setCurrentStep(STEPS.STYLE_PREVIEW);
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case STEPS.MODE_SELECT:
      case STEPS.PRE_REGISTER:
        return 0;
      case STEPS.EVENT_LOGIN:
      case STEPS.LOGIN:
        return 1;
      case STEPS.STYLE_PREVIEW:
        return 1;
      case STEPS.CAMERA:
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
      case STEPS.MODE_SELECT:
        return (
          <ModeSelector
            onSelectMode={handleModeSelect}
            wish={wish}
            onWishChange={handleWishChange}
          />
        );

      case STEPS.PRE_REGISTER:
        return (
          <PreRegister
            onComplete={() => setCurrentStep(STEPS.MODE_SELECT)}
            onBack={handleBackToModeSelect}
            wish={wish}
          />
        );

      case STEPS.EVENT_LOGIN:
        return (
          <EventDayLogin
            onSelect={handleEventDaySelect}
            onBack={handleBackToModeSelect}
          />
        );

      case STEPS.STYLE_PREVIEW:
        return (
          <StylePreview
            employee={employee}
            onContinue={handleStylePreviewContinue}
            onBack={() => setCurrentStep(STEPS.EVENT_LOGIN)}
          />
        );

      case STEPS.LOGIN:
        return <Login onLogin={handleQuickLogin} />;

      case STEPS.CAMERA:
        return (
          <Camera
            employee={employee}
            onCapture={handleCapture}
            onBack={appMode === 'eventday' ? handleBackToStylePreview : handleBackToLogin}
          />
        );

      case STEPS.GENERATING:
        return (
          <FortuneGenerator
            employee={employee}
            photo={photo}
            wish={wish}
            onComplete={handleFortuneComplete}
            onBack={handleBackToCamera}
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
        return (
          <ModeSelector
            onSelectMode={handleModeSelect}
            wish={wish}
            onWishChange={handleWishChange}
          />
        );
    }
  };

  // 判斷是否顯示進度條 - 調整為 5 步驟
  const showProgress = ![STEPS.MODE_SELECT, STEPS.PRE_REGISTER].includes(currentStep);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo">
          <KonstLogo />
        </div>
        <h1>AI 靈籤</h1>
        <h2>貳零貳陸 尾牙特別版</h2>

        {showProgress && (
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
        )}
      </header>

      <main className="card">
        <div className="ai-corner ai-corner-tl"></div>
        <div className="ai-corner ai-corner-tr"></div>
        <div className="ai-corner ai-corner-bl"></div>
        <div className="ai-corner ai-corner-br"></div>
        {renderStep()}
      </main>

      <footer className="footer">
        <p>KONST AI 2026</p>
      </footer>
    </div>
  );
}

export default App;
