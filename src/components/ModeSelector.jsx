import { useState } from 'react';

// 首頁模式選擇
function ModeSelector({ onSelectMode, wish, onWishChange }) {
  const [localWish, setLocalWish] = useState(wish || '');

  const handleWishChange = (e) => {
    setLocalWish(e.target.value);
    if (onWishChange) {
      onWishChange(e.target.value);
    }
  };

  return (
    <div className="mode-selector">
      <div className="welcome-text">
        <h3>KONST AI 尾牙 2026</h3>
        <p>請選擇你要進行的操作</p>
      </div>

      <div className="mode-cards">
        {/* 活動前預註冊 */}
        <button
          className="mode-card mode-preregister"
          onClick={() => onSelectMode('preregister')}
        >
          <div className="mode-icon">📝</div>
          <h4>活動前預註冊</h4>
          <p>輸入你的資料，獲取 AI 穿搭建議</p>
          <span className="mode-tag">尾牙前使用</span>
        </button>

        {/* 尾牙當天 */}
        <button
          className="mode-card mode-eventday"
          onClick={() => onSelectMode('eventday')}
        >
          <div className="mode-icon">🎉</div>
          <h4>尾牙開始！</h4>
          <p>選擇你的名字，拍照生成籤詩</p>
          <span className="mode-tag">活動當天使用</span>
        </button>
      </div>

      <div className="mode-divider">
        <span>或</span>
      </div>

      {/* 快速開始（無預註冊） */}
      <button
        className="btn btn-outline mode-quick"
        onClick={() => onSelectMode('quick')}
      >
        直接開始（不使用預註冊資料）
      </button>

      {/* 願望輸入區 - 移到首頁 */}
      <div className="wish-input-section">
        <label>✨ 2026 年你的願望是什麼？</label>
        <textarea
          placeholder="例如：升職加薪、身體健康、找到真愛..."
          value={localWish}
          onChange={handleWishChange}
          maxLength={50}
        />
        <span className="char-count">{localWish.length}/50</span>
      </div>

      <p className="mode-hint">
        建議先使用「活動前預註冊」讓員工填寫資料，<br />
        活動當天再使用「尾牙開始」快速生成籤詩
      </p>
    </div>
  );
}

export default ModeSelector;
