import { useState, useEffect } from 'react';
import { generateFortuneImage } from '../utils/fortuneCanvas';
import { generateFortuneWithGrok } from '../utils/grokAI';

// AI 處理過程的有趣提示語
const LOADING_MESSAGES = [
  'AI 正在解讀你的命運密碼...',
  'Grok 神經網路運算中...',
  '從量子維度抓取運勢數據...',
  '機器學習模型推論中...',
  '正在生成你的命運算法...',
  '大數據分析你的2026運勢...',
  'AI Fortune Engine 啟動中...',
  '分析「形容詞+名詞」組合...',
];

function FortuneGenerator({ employee, photo, wish, onComplete, onBack }) {
  const [status, setStatus] = useState('generating');
  const [fortuneImage, setFortuneImage] = useState(null);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    generateFortune();

    // 輪換載入訊息
    const msgInterval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 1200);

    // 進度條動畫
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 12, 90));
    }, 350);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const generateFortune = async () => {
    try {
      setStatus('generating');

      // 使用 Grok AI 生成籤詩內容
      const fortuneContent = await generateFortuneWithGrok({
        name: employee.name,
        adjective: employee.adjective || '',
        noun: employee.noun || '',
        wish: wish || '',
      });

      setProgress(70);

      // 生成籤詩圖片
      const imageData = await generateFortuneImage(employee, photo, fortuneContent, wish);

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setFortuneImage(imageData);
      setStatus('complete');
    } catch (err) {
      console.error('Generation error:', err);
      setError('AI 運算發生錯誤，請重試');
      setStatus('error');
    }
  };

  if (status === 'generating') {
    return (
      <div className="loading-section fortune-loading">
        <div className="fortune-loading-icon">🤖</div>
        <div className="loading-animation">
          <div className="ai-dot"></div>
          <div className="ai-dot"></div>
          <div className="ai-dot"></div>
        </div>
        <p className="loading-text">{loadingMsg}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p style={{ color: '#A0A0A0', marginTop: '12px', fontSize: '0.9rem' }}>
          {employee.name}，你的專屬籤詩即將揭曉
        </p>
        {employee.adjective && employee.noun && (
          <p style={{ color: '#6366F1', marginTop: '8px', fontSize: '0.85rem' }}>
            「{employee.adjective}{employee.noun}」的命運正在解析...
          </p>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="loading-section">
        <div className="success-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={onBack}>
            返回重拍
          </button>
          <button className="btn btn-primary" onClick={generateFortune}>
            重新運算
          </button>
        </div>
      </div>
    );
  }

  // 完成後傳遞結果
  onComplete(fortuneImage);
  return null;
}

export default FortuneGenerator;
