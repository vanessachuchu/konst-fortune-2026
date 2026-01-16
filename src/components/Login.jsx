import { useState } from 'react';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [adjective, setAdjective] = useState('');
  const [noun, setNoun] = useState('');
  const [error, setError] = useState('');

  // 形容詞範例提示
  const adjectiveHints = ['熱血', '佛系', '斜槓', '爆肝', '躺平', '內捲', '社恐', '社牛'];
  const nounHints = ['工程師', '設計師', '小資族', '打工人', '吃貨', '貓奴', '夜貓子', '早鳥'];

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedAdj = adjective.trim();
    const trimmedNoun = noun.trim();

    if (!trimmedName) {
      setError('請輸入你的名字');
      return;
    }

    if (!trimmedAdj || !trimmedNoun) {
      setError('請輸入形容詞和名詞來形容自己');
      return;
    }

    // 生成抽獎號碼 (01-99)
    const luckyNumber = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');

    const employeeData = {
      name: trimmedName,
      phrase: `${trimmedAdj}${trimmedNoun}`,
      adjective: trimmedAdj,
      noun: trimmedNoun,
      luckyNumber,
    };

    setError('');
    onLogin(employeeData);
  };

  const handleHintClick = (type, value) => {
    if (type === 'adjective') {
      setAdjective(value);
    } else {
      setNoun(value);
    }
    setError('');
  };

  return (
    <div className="login-section">
      <div className="welcome-text">
        <h3>歡迎來到尾牙!</h3>
        <p>輸入你的資料，生成專屬籤詩</p>
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
        <label>用一個「形容詞 + 名詞」形容今年的你</label>
        <p className="form-hint">例如：熱血工程師、佛系設計師、爆肝打工人</p>

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

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!name.trim() || !adjective.trim() || !noun.trim()}
      >
        下一步
      </button>
    </div>
  );
}

export default Login;
