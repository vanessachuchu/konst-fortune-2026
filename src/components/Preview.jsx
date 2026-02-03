import { useState } from 'react';
import { downloadImage } from '../utils/fortuneCanvas';
import { uploadFortuneImage } from '../utils/googleDrive';

function Preview({ employee, fortuneImage, styleScore, onRestart }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDownload = () => {
    const filename = `konst-fortune-2026-${employee.name}.png`;
    downloadImage(fortuneImage, filename);
  };

  const handleUploadForPrint = async () => {
    setUploading(true);
    try {
      await uploadFortuneImage(
        fortuneImage,
        employee.name,
        employee.luckyNumber || employee.id
      );
      setUploaded(true);
    } catch (err) {
      console.error('上傳失敗', err);
    }
    setUploading(false);
  };

  return (
    <div className="preview-section">
      <div className="welcome-text">
        <div className="success-icon">🎋</div>
        <h3 className="success-title">籤詩已揭曉！</h3>
        <p style={{ marginBottom: '8px', color: '#5D4037' }}>
          {employee.name}，你是「{employee.phrase}」
        </p>
        <div className="lucky-number-display">
          <span className="lucky-label">今年的幸運號碼</span>
          <span className="lucky-number-big">{employee.luckyNumber}</span>
        </div>
      </div>

      <div className="fortune-preview">
        <img src={fortuneImage} alt="Fortune slip" />
      </div>

      {/* 穿搭評分卡片 */}
      {styleScore && (
        <div className="style-score-card">
          <div className="score-header">
            {styleScore.score >= 85 && (
              <div className="award-badge">🏆 AI 時尚大獎</div>
            )}
            <div className="score-display">
              <span className="score-label">穿搭符合度</span>
              <span className="score-value">{styleScore.score}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
          <div className="score-feedback">
            <p>{styleScore.feedback}</p>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleDownload}>
          下載籤詩
        </button>

        <button
          className="btn btn-thermal"
          onClick={handleUploadForPrint}
          disabled={uploading || uploaded}
        >
          {uploaded ? '✓ 已上傳' : uploading ? '上傳中...' : '上傳列印'}
        </button>

        <button
          className="btn btn-outline"
          onClick={onRestart}
        >
          再求一籤
        </button>
      </div>

      <p className="footer-note">
        {employee.name} | 幸運號碼 {employee.luckyNumber} | KONST AI 2026 尾牙
      </p>
    </div>
  );
}

export default Preview;
