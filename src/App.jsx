import { useState, useEffect } from 'react';
import PreRegister from './components/PreRegister';
import WaitingPage from './components/WaitingPage';
import WishInput from './components/WishInput';
import EventDayLogin from './components/EventDayLogin';
import StylePreview from './components/StylePreview';
import Camera from './components/Camera';
import FortuneGenerator from './components/FortuneGenerator';
import Preview from './components/Preview';
import { fetchEmployees, updateEmployee } from './utils/googleSheets';
import './index.css';

// 活動日期常數
const EVENT_DATE = new Date('2026-02-09T00:00:00+08:00');

// 檢查是否為活動當天或之後（支援 ?test=eventday 測試參數）
const isEventDay = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('test') === 'eventday') {
    return true; // 測試模式：強制進入活動頁面
  }
  return new Date() >= EVENT_DATE;
};

// 流程步驟
const STEPS = {
  LOADING: 'loading',           // 載入中（檢查註冊狀態）
  PRE_REGISTER: 'pre_register', // 註冊頁面
  WAITING: 'waiting',           // 敬請期待（活動前已註冊）
  EVENT_LOGIN: 'event_login',   // 活動當天選擇員工
  STYLE_PREVIEW: 'style_preview',
  CAMERA: 'camera',
  WISH_INPUT: 'wish_input',     // 願望輸入
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
  const [currentStep, setCurrentStep] = useState(STEPS.LOADING);
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [wish, setWish] = useState('');
  const [fortuneImage, setFortuneImage] = useState(null);
  const [styleScore, setStyleScore] = useState(null);
  const [eventDayMode, setEventDayMode] = useState(false);

  // 初始化：檢查日期和註冊狀態
  useEffect(() => {
    const init = async () => {
      const isEvent = isEventDay();
      setEventDayMode(isEvent);

      try {
        // 載入所有員工資料
        const data = await fetchEmployees();
        setEmployees(data);

        if (isEvent) {
          // 活動當天：顯示員工選擇頁面
          setCurrentStep(STEPS.EVENT_LOGIN);
        } else {
          // 活動前：顯示註冊頁面
          setCurrentStep(STEPS.PRE_REGISTER);
        }
      } catch (err) {
        console.error('載入員工資料失敗:', err);
        // 即使載入失敗也顯示註冊頁面
        setCurrentStep(isEvent ? STEPS.EVENT_LOGIN : STEPS.PRE_REGISTER);
      }
    };

    init();
  }, []);

  // 註冊完成處理
  const handleRegisterComplete = (newEmployee) => {
    setEmployee(newEmployee);
    if (eventDayMode) {
      // 活動當天：直接進入尾牙流程
      setCurrentStep(STEPS.STYLE_PREVIEW);
    } else {
      // 活動前：顯示敬請期待
      setCurrentStep(STEPS.WAITING);
    }
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

  // 拍照完成
  const handleCapture = (capturedPhoto) => {
    setPhoto(capturedPhoto);
    setCurrentStep(STEPS.WISH_INPUT);
  };

  // 願望輸入完成
  const handleWishSubmit = (submittedWish) => {
    setWish(submittedWish);
    setCurrentStep(STEPS.GENERATING);
  };

  // 籤詩生成完成
  const handleFortuneComplete = async (generatedImage, scoreData) => {
    setFortuneImage(generatedImage);
    setStyleScore(scoreData);

    // 儲存評分到 Google Sheets
    if (scoreData && employee) {
      try {
        await updateEmployee(employee.id, {
          score: scoreData.score,
          styleFeedback: scoreData.feedback,
          isTopThree: scoreData.score >= 85,
          evaluatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('儲存評分失敗:', err);
      }
    }

    setCurrentStep(STEPS.PREVIEW);
  };

  // 重新開始
  const handleRestart = () => {
    setEmployee(null);
    setPhoto(null);
    setWish('');
    setFortuneImage(null);
    setStyleScore(null);
    setCurrentStep(eventDayMode ? STEPS.EVENT_LOGIN : STEPS.PRE_REGISTER);
  };

  // 返回上一步
  const handleBackToCamera = () => {
    setPhoto(null);
    setCurrentStep(STEPS.CAMERA);
  };

  const handleBackToStylePreview = () => {
    setPhoto(null);
    setCurrentStep(STEPS.STYLE_PREVIEW);
  };

  const handleBackToWish = () => {
    setCurrentStep(STEPS.WISH_INPUT);
  };

  // 幫其他同事註冊
  const handleRegisterAnother = () => {
    setEmployee(null);
    setCurrentStep(STEPS.PRE_REGISTER);
  };

  // 活動當天的「尚未註冊」處理
  const handleGoToRegister = () => {
    setCurrentStep(STEPS.PRE_REGISTER);
  };

  // 計算進度
  const getStepIndex = () => {
    switch (currentStep) {
      case STEPS.LOADING:
      case STEPS.PRE_REGISTER:
      case STEPS.WAITING:
      case STEPS.EVENT_LOGIN:
        return 0;
      case STEPS.STYLE_PREVIEW:
        return 1;
      case STEPS.CAMERA:
        return 2;
      case STEPS.WISH_INPUT:
        return 3;
      case STEPS.GENERATING:
        return 4;
      case STEPS.PREVIEW:
        return 5;
      default:
        return 0;
    }
  };

  // 渲染步驟
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.LOADING:
        return (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>載入中...</p>
          </div>
        );

      case STEPS.PRE_REGISTER:
        return (
          <PreRegister
            onComplete={handleRegisterComplete}
            onBack={eventDayMode ? () => setCurrentStep(STEPS.EVENT_LOGIN) : null}
            isEventDay={eventDayMode}
          />
        );

      case STEPS.WAITING:
        return (
          <WaitingPage
            employee={employee}
            onRegisterAnother={handleRegisterAnother}
          />
        );

      case STEPS.EVENT_LOGIN:
        return (
          <EventDayLogin
            employees={employees}
            onSelect={handleEventDaySelect}
            onGoToRegister={handleGoToRegister}
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

      case STEPS.CAMERA:
        return (
          <Camera
            employee={employee}
            onCapture={handleCapture}
            onBack={handleBackToStylePreview}
          />
        );

      case STEPS.WISH_INPUT:
        return (
          <WishInput
            employee={employee}
            onSubmit={handleWishSubmit}
            onBack={handleBackToCamera}
          />
        );

      case STEPS.GENERATING:
        return (
          <FortuneGenerator
            employee={employee}
            photo={photo}
            wish={wish}
            onComplete={handleFortuneComplete}
            onBack={handleBackToWish}
          />
        );

      case STEPS.PREVIEW:
        return (
          <Preview
            employee={employee}
            fortuneImage={fortuneImage}
            styleScore={styleScore}
            onRestart={handleRestart}
          />
        );

      default:
        return (
          <div className="loading-section">
            <p>載入中...</p>
          </div>
        );
    }
  };

  // 判斷是否顯示進度條
  const showProgress = [
    STEPS.STYLE_PREVIEW,
    STEPS.CAMERA,
    STEPS.WISH_INPUT,
    STEPS.GENERATING,
    STEPS.PREVIEW,
  ].includes(currentStep);

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
            {[0, 1, 2, 3, 4, 5].map((step) => (
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
