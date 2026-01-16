import { downloadImage, printImage } from '../utils/fortuneCanvas';

function Preview({ employee, fortuneImage, onRestart }) {
  const handleDownload = () => {
    const filename = `konst-fortune-2026-${employee.id}-${employee.name}.png`;
    downloadImage(fortuneImage, filename);
  };

  const handlePrint = () => {
    printImage(fortuneImage);
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
          text: `我是 ${employee.phrase}！來看看我的2026年籤詩`,
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
        <p style={{ marginBottom: '16px', color: '#5D4037' }}>
          {employee.name}，你是「{employee.phrase}」
        </p>
      </div>

      <div className="fortune-preview">
        <img src={fortuneImage} alt="Fortune slip" />
      </div>

      <div className="prize-box" style={{
        background: employee.fortune.isSpecial
          ? 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)'
          : 'linear-gradient(135deg, #B22222 0%, #8B0000 100%)',
        color: employee.fortune.isSpecial ? '#2C1810' : '#FFD700',
        padding: '16px 24px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '2px solid #5D4037',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
          {employee.fortune.isSpecial ? '🌟 恭喜抽中特獎！' : '🧧 恭喜獲得普獎'}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '1.8rem', fontWeight: '900' }}>
          ${employee.fortune.isSpecial
            ? employee.fortune.specialPrize.toLocaleString()
            : employee.fortune.prize}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          下載籤詩
        </button>

        {'share' in navigator && (
          <button className="btn btn-success" onClick={handleShare}>
            分享給朋友
          </button>
        )}

        <button className="btn btn-secondary" onClick={handlePrint}>
          列印
        </button>

        <button
          className="btn btn-secondary"
          onClick={onRestart}
          style={{ marginTop: '8px' }}
        >
          再求一籤
        </button>
      </div>

      <p style={{
        marginTop: '24px',
        fontSize: '0.85rem',
        color: '#8B4513',
        textAlign: 'center'
      }}>
        編號 {employee.id} | KONST AI 2026 尾牙
      </p>
    </div>
  );
}

export default Preview;
