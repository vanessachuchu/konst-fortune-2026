import { useState } from 'react';

function WishInput({ employee, onSubmit, onBack }) {
  const [wish, setWish] = useState('');

  const handleSubmit = () => {
    onSubmit(wish.trim() || '順利平安');
  };

  return (
    <div className="wish-input-page">
      <div className="welcome-text">
        <h3>2026 年的願望</h3>
        <p>{employee.name}，許下你的新年願望</p>
      </div>

      <div className="wish-card">
        <div className="wish-icon">✨</div>
        <textarea
          className="wish-textarea"
          placeholder="例如：升職加薪、身體健康、找到真愛..."
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          maxLength={50}
          rows={3}
        />
        <div className="wish-char-count">{wish.length}/50</div>
      </div>

      <div className="wish-hints">
        <p className="wish-hint-label">快速選擇：</p>
        <div className="wish-hint-chips">
          {['升職加薪', '身體健康', '桃花朵朵', '財源滾滾', '心想事成'].map((hint) => (
            <button
              key={hint}
              type="button"
              className={`wish-hint-chip ${wish === hint ? 'selected' : ''}`}
              onClick={() => setWish(hint)}
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      <p className="wish-note">
        AI 會根據你的願望生成專屬籤詩
      </p>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>
          返回
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          生成我的籤詩
        </button>
      </div>
    </div>
  );
}

export default WishInput;
