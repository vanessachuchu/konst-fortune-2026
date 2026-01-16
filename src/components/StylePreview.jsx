// 風格預覽頁面 - 顯示員工的 AI 建議穿搭
function StylePreview({ employee, onContinue, onBack }) {
  return (
    <div className="style-preview-section">
      <div className="welcome-text">
        <h3>{employee.name}，準備好了嗎？</h3>
        <p>這是 AI 為你準備的尾牙穿搭建議</p>
      </div>

      {/* 員工資訊卡 */}
      <div className="employee-info-card">
        <div className="info-header">
          <span className="info-number">{employee.id}</span>
          <span className="info-name">{employee.name}</span>
        </div>
        <p className="info-phrase">「{employee.phrase}」</p>
      </div>

      {/* 風格建議卡 */}
      <div className="style-advice-card">
        <h4>🎨 AI 穿搭建議</h4>
        <div className="advice-style">
          <span className="style-badge">{employee.styleName}</span>
        </div>

        {/* 如果有生成的風格圖片 */}
        {employee.styleImage && (
          <div className="style-card-image">
            <img src={employee.styleImage} alt="Style suggestion" />
          </div>
        )}

        <div className="advice-note">
          <p>📸 待會拍照時，我們會把你的實際穿搭</p>
          <p>跟這個 AI 建議做個有趣的對比哦！</p>
        </div>
      </div>

      {/* 提示 */}
      <div className="style-tips">
        <h5>拍照小提示</h5>
        <ul>
          <li>找個光線充足的地方</li>
          <li>展現你最自信的笑容</li>
          <li>可以擺個有趣的 pose</li>
        </ul>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={onBack}>
          返回選擇
        </button>
        <button className="btn btn-primary" onClick={onContinue}>
          開始拍照！
        </button>
      </div>
    </div>
  );
}

export default StylePreview;
