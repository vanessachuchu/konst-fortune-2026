import { useState, useEffect } from 'react';

// 活動日期（2026/2/9 17:30 開始）
const EVENT_DATE = new Date('2026-02-09T17:30:00+08:00');

function WaitingPage({ employee }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = EVENT_DATE - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="waiting-page">
      <div className="welcome-text">
        <h3>敬請期待尾牙的到來！</h3>
        <p>{employee.name}，祝你中大獎！</p>
      </div>

      {/* 倒數計時 */}
      <div className="countdown-section">
        <p className="countdown-label">距離尾牙還有</p>
        <div className="countdown-boxes">
          <div className="countdown-box">
            <span className="countdown-number">{countdown.days}</span>
            <span className="countdown-unit">天</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-number">{countdown.hours}</span>
            <span className="countdown-unit">時</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-number">{countdown.minutes}</span>
            <span className="countdown-unit">分</span>
          </div>
          <div className="countdown-box">
            <span className="countdown-number">{countdown.seconds}</span>
            <span className="countdown-unit">秒</span>
          </div>
        </div>
        <p className="event-date">2026 年 2 月 9 日</p>
      </div>

      {/* 已註冊資訊 */}
      <div className="registered-info">
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">姓名</span>
            <span className="info-value">{employee.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">我的代表</span>
            <span className="info-value highlight">{employee.phrase || `${employee.adjective}${employee.noun}`}</span>
          </div>
        </div>
      </div>

      {/* AI 穿搭建議 */}
      {employee.styleSuggestion && (
        <div className="style-suggestion-card">
          <h4>AI 穿搭建議</h4>
          <p>{employee.styleSuggestion}</p>
        </div>
      )}

      <div className="waiting-reminder">
        <p>📌 尾牙當天回來這裡抽取幸運號碼！</p>
      </div>
    </div>
  );
}

export default WaitingPage;
