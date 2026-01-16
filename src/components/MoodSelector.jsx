import { useState } from 'react';
import { MOOD_OPTIONS } from '../utils/fortuneCanvas';

function MoodSelector({ employee, photo, onSelect, onBack }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [wish, setWish] = useState('');

  // 願望範例
  const wishHints = [
    '升職加薪',
    '身體健康',
    '脫單成功',
    '買房買車',
    '學新技能',
    '環遊世界',
    '財富自由',
    '工作順利',
  ];

  const handleConfirm = () => {
    if (selectedMood) {
      onSelect(selectedMood, wish);
    }
  };

  const handleWishHint = (hint) => {
    setWish(hint);
  };

  return (
    <div className="mood-section">
      <div className="welcome-text">
        <div className="employee-badge">
          {employee.name} • {employee.phrase}
        </div>
        <div className="lucky-number-badge">
          抽獎號碼：<span className="lucky-number">{employee.luckyNumber}</span>
        </div>
        <h3>AI 正在解讀你的照片...</h3>
        <p>選擇最符合你現在心情的選項</p>
      </div>

      {/* 照片小預覽 */}
      <div className="photo-mini-preview">
        <img src={photo} alt="Your photo" />
        <div className="ai-scanning">
          <span className="scan-text">AI 分析中</span>
        </div>
      </div>

      {/* 心情選擇 */}
      <div className="mood-grid">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.id}
            className={`mood-card ${selectedMood === mood.id ? 'selected' : ''}`}
            onClick={() => setSelectedMood(mood.id)}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* 心願輸入 */}
      <div className="wish-section">
        <label>2026 年你的願望是什麼？</label>
        <textarea
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="寫下你對未來一年的期許..."
          maxLength={50}
        />
        <span className="char-count">{wish.length}/50</span>

        <div className="wish-hints">
          {wishHints.map((hint) => (
            <button
              key={hint}
              type="button"
              className={`wish-hint-chip ${wish === hint ? 'selected' : ''}`}
              onClick={() => handleWishHint(hint)}
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>
          重拍照片
        </button>
        <button
          className="btn btn-primary"
          onClick={handleConfirm}
          disabled={!selectedMood}
        >
          生成籤詩
        </button>
      </div>
    </div>
  );
}

export default MoodSelector;
