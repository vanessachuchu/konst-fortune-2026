import { downloadImage, printImage, printToThermalPrinter } from '../utils/fortuneCanvas';

function Preview({ employee, fortuneImage, styleScore, onRestart }) {
  const handleDownload = () => {
    const filename = `konst-fortune-2026-${employee.name}.png`;
    downloadImage(fortuneImage, filename);
  };

  const handlePrint = () => {
    printImage(fortuneImage, 'normal');
  };

  const handleThermalPrint = () => {
    printToThermalPrinter(fortuneImage);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(fortuneImage);
        const blob = await response.blob();
        const file = new File([blob], `konst-fortune-${employee.name}.png`, {
          type: 'image/png',
        });

        await navigator.share({
          title: 'KONST AI 2026 尾牙籤詩',
          text: `我是${employee.phrase}！來看看我的2026年籤詩`,
          files: [file],
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      handleDownload();
    }
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

        {'share' in navigator && (
          <button className="btn btn-success" onClick={handleShare}>
            分享給朋友
          </button>
        )}

        <div className="print-options">
          <button className="btn btn-secondary" onClick={handlePrint}>
            一般列印
          </button>
          <button className="btn btn-thermal" onClick={handleThermalPrint}>
            快速列印（熱感應）
          </button>
        </div>

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
