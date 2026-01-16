import { useState } from 'react';
import { addEmployee, getNextLuckyNumber, isNameExists } from '../utils/googleSheets';
import { calculateStyle, generateStyleCard } from '../utils/styleGenerator';

function PreRegister({ onComplete, onBack }) {
  const [step, setStep] = useState('input'); // input, preview, success
  const [name, setName] = useState('');
  const [adjective, setAdjective] = useState('');
  const [noun, setNoun] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [styleInfo, setStyleInfo] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [savedEmployee, setSavedEmployee] = useState(null);

  // 形容詞和名詞選項
  const adjectiveHints = ['熱血', '佛系', '斜槓', '爆肝', '躺平', '內捲', '社恐', '社牛'];
  const nounHints = ['工程師', '設計師', '小資族', '打工人', '吃貨', '貓奴', '夜貓子', '早鳥'];

  const handleGenerateStyle = async () => {
    if (!name.trim()) {
      setError('請輸入你的名字');
      return;
    }
    if (!adjective.trim() || !noun.trim()) {
      setError('請輸入形容詞和名詞');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 檢查姓名是否重複
      const exists = await isNameExists(name.trim());
      if (exists) {
        setError('這個名字已經註冊過了，請確認是否為本人');
        setLoading(false);
        return;
      }

      // 計算風格
      const style = calculateStyle(adjective.trim(), noun.trim());
      setStyleInfo(style);

      // 生成風格卡片圖片
      const image = await generateStyleCard(name.trim(), adjective.trim(), noun.trim(), style);
      setStyleImage(image);

      setStep('preview');
    } catch (err) {
      console.error('生成風格失敗:', err);
      setError('生成失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    setLoading(true);

    try {
      // 獲取下一個抽獎號碼
      const luckyNumber = await getNextLuckyNumber();

      // 儲存到 Google Sheets / localStorage
      const employee = await addEmployee({
        id: luckyNumber,
        name: name.trim(),
        adjective: adjective.trim(),
        noun: noun.trim(),
        phrase: `${adjective.trim()}${noun.trim()}`,
        styleType: styleInfo.id,
        styleName: styleInfo.name,
        styleImage: styleImage,
      });

      setSavedEmployee(employee);
      setStep('success');
    } catch (err) {
      console.error('儲存失敗:', err);
      setError('儲存失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleHintClick = (type, value) => {
    if (type === 'adjective') {
      setAdjective(value);
    } else {
      setNoun(value);
    }
    setError('');
  };

  // 步驟一：輸入資料
  if (step === 'input') {
    return (
      <div className="preregister-section">
        <div className="welcome-text">
          <h3>活動前預註冊</h3>
          <p>填寫你的資料，AI 會為你生成專屬穿搭建議</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>你的名字</label>
          <input
            type="text"
            placeholder="請輸入你的名字"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>用「形容詞 + 名詞」形容今年的你</label>
          <p className="form-hint">AI 會根據這個組合為你推薦尾牙穿搭風格</p>

          <div className="phrase-inputs">
            <div className="phrase-input-group">
              <input
                type="text"
                placeholder="形容詞"
                value={adjective}
                onChange={(e) => { setAdjective(e.target.value); setError(''); }}
                maxLength={10}
              />
              <div className="hint-chips">
                {adjectiveHints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    className={`hint-chip ${adjective === hint ? 'selected' : ''}`}
                    onClick={() => handleHintClick('adjective', hint)}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>

            <span className="phrase-plus">+</span>

            <div className="phrase-input-group">
              <input
                type="text"
                placeholder="名詞"
                value={noun}
                onChange={(e) => { setNoun(e.target.value); setError(''); }}
                maxLength={10}
              />
              <div className="hint-chips">
                {nounHints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    className={`hint-chip ${noun === hint ? 'selected' : ''}`}
                    onClick={() => handleHintClick('noun', hint)}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(adjective || noun) && (
            <div className="phrase-preview">
              今年的你是：<strong>{adjective || '？'}{noun || '？'}</strong>
            </div>
          )}
        </div>

        <div className="btn-group">
          <button className="btn btn-secondary" onClick={onBack}>
            返回
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerateStyle}
            disabled={loading || !name.trim() || !adjective.trim() || !noun.trim()}
          >
            {loading ? '生成中...' : '生成穿搭建議'}
          </button>
        </div>
      </div>
    );
  }

  // 步驟二：預覽風格
  if (step === 'preview') {
    return (
      <div className="preregister-section">
        <div className="welcome-text">
          <h3>你的 AI 穿搭建議</h3>
          <p>{name}，你的專屬風格已生成！</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* 風格預覽卡 */}
        <div className="style-preview-card">
          <div className="style-emoji">{styleInfo.emoji}</div>
          <h4 className="style-name">{styleInfo.name}</h4>
          <p className="style-desc">{styleInfo.description}</p>

          <div className="style-colors">
            {styleInfo.colors.map((color, i) => (
              <div
                key={i}
                className="color-dot"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="style-suggestion">
            <strong>穿搭建議</strong>
            <p>{styleInfo.suggestion}</p>
          </div>
        </div>

        {/* 生成的圖片預覽 */}
        {styleImage && (
          <div className="style-image-preview">
            <img src={styleImage} alt="Style card" />
          </div>
        )}

        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setStep('input')}>
            重新填寫
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmSave}
            disabled={loading}
          >
            {loading ? '儲存中...' : '確認並儲存'}
          </button>
        </div>
      </div>
    );
  }

  // 步驟三：完成
  if (step === 'success') {
    return (
      <div className="preregister-section">
        <div className="welcome-text">
          <div className="success-icon">🎉</div>
          <h3 className="success-title">註冊成功！</h3>
          <p>{savedEmployee.name}，你的資料已儲存</p>
        </div>

        <div className="lucky-number-display">
          <span className="lucky-label">你的抽獎號碼</span>
          <span className="lucky-number-big">{savedEmployee.id}</span>
        </div>

        <div className="success-info">
          <p>風格：<strong>{styleInfo.name}</strong></p>
          <p>形容：<strong>{savedEmployee.phrase}</strong></p>
        </div>

        <div className="success-reminder">
          <p>📌 請記住你的抽獎號碼！</p>
          <p>尾牙當天選擇你的名字即可快速開始</p>
        </div>

        <div className="btn-group">
          <button className="btn btn-secondary" onClick={onBack}>
            返回首頁
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setStep('input');
              setName('');
              setAdjective('');
              setNoun('');
              setStyleInfo(null);
              setStyleImage(null);
              setSavedEmployee(null);
            }}
          >
            繼續註冊下一位
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default PreRegister;
