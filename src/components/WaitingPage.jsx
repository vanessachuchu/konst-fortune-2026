import { useState, useEffect } from 'react';

// 活動日期
const EVENT_DATE = new Date('2026-02-09T00:00:00+08:00');

function WaitingPage({ employee, onRegisterAnother }) {
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
        <div className="waiting-icon">🎊</div>
        <h3>敬請期待尾牙的到來！</h3>
        <p>{employee.name}，你已成功註冊</p>
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
            <span className="info-label">抽獎號碼</span>
            <span className="info-value lucky-number">{employee.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">姓名</span>
            <span className="info-value">{employee.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">形容</span>
            <span className="info-value">{employee.phrase || `${employee.adjective}${employee.noun}`}</span>
          </div>
        </div>
      </div>

      <div className="waiting-reminder">
        <p>📌 請記住你的抽獎號碼！</p>
        <p>尾牙當天回來這裡開始活動</p>
      </div>

      {onRegisterAnother && (
        <div className="btn-group">
          <button className="btn btn-outline" onClick={onRegisterAnother}>
            幫其他同事註冊
          </button>
        </div>
      )}
    </div>
  );
}

export default WaitingPage;
