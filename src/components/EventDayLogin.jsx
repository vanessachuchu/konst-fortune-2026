import { useState, useEffect } from 'react';
import { fetchEmployees, getCurrentUser, saveCurrentUser } from '../utils/googleSheets';

function EventDayLogin({ employees: initialEmployees, onSelect, onGoToRegister }) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(!initialEmployees || initialEmployees.length === 0);
  const [error, setError] = useState('');
  const [rememberedUser, setRememberedUser] = useState(null);

  useEffect(() => {
    // 檢查是否有記住的用戶
    const saved = getCurrentUser();
    if (saved) {
      setRememberedUser(saved);
    }

    if (!initialEmployees || initialEmployees.length === 0) {
      loadEmployees();
    }
  }, [initialEmployees]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('載入員工列表失敗:', err);
      setError('載入失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedId) {
      setError('請選擇你的名字');
      return;
    }

    const employee = employees.find(emp => String(emp.id) === String(selectedId));
    if (employee) {
      // 記住這個用戶
      saveCurrentUser(employee);
      onSelect(employee);
    }
  };

  // 快速進入（已記住的用戶）
  const handleQuickEnter = () => {
    if (rememberedUser) {
      onSelect(rememberedUser);
    }
  };

  // 切換到其他用戶
  const handleSwitchUser = () => {
    setRememberedUser(null);
  };

  if (loading) {
    return (
      <div className="loading-section">
        <div className="loading-spinner"></div>
        <p className="loading-text">載入員工名單中...</p>
      </div>
    );
  }

  // 如果有記住的用戶，顯示快速入口
  if (rememberedUser) {
    return (
      <div className="eventday-login">
        <div className="welcome-text">
          <h3>🎉 歡迎回來！</h3>
          <p>準備好開始你的尾牙之旅了嗎？</p>
        </div>

        <div className="quick-enter-card">
          <div className="quick-enter-badge">
            <span className="quick-enter-name">{rememberedUser.name}</span>
          </div>
          <p className="quick-enter-phrase">
            「{rememberedUser.phrase || `${rememberedUser.adjective}${rememberedUser.noun}`}」
          </p>
        </div>

        <div className="btn-group">
          <button className="btn btn-primary btn-large" onClick={handleQuickEnter}>
            開始尾牙活動
          </button>
        </div>

        <button className="btn btn-text" onClick={handleSwitchUser}>
          切換為其他人
        </button>
      </div>
    );
  }

  return (
    <div className="eventday-login">
      <div className="welcome-text">
        <h3>🎉 尾牙開始！</h3>
        <p>選擇你的名字，開始生成專屬籤詩</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {employees.length > 0 ? (
        <>
          <div className="form-group">
            <label>請選擇你的名字</label>
            <div className="select-wrapper">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setError(''); }}
              >
                <option value="">-- 請選擇 --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}（{emp.phrase || `${emp.adjective}${emp.noun}`}）
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 選中後顯示預覽 */}
          {selectedId && (() => {
            const emp = employees.find(e => String(e.id) === String(selectedId));
            return emp ? (
              <div className="selected-preview">
                <div className="preview-badge">
                  <span className="preview-name">{emp.name}</span>
                </div>
                <p className="preview-phrase">「{emp.phrase || `${emp.adjective}${emp.noun}`}」</p>
                {emp.styleName && (
                  <p className="preview-style">
                    建議風格：<strong>{emp.styleName}</strong>
                  </p>
                )}
              </div>
            ) : null;
          })()}

          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!selectedId}
            >
              確認，開始拍照
            </button>
          </div>

          {/* 尚未生成穿搭建議 */}
          <div className="not-registered">
            <p>還沒生成穿搭建議？</p>
            <button className="btn btn-outline" onClick={onGoToRegister}>
              立即開始！
            </button>
          </div>
        </>
      ) : (
        <div className="no-employees">
          <p>目前沒有已註冊的員工</p>
          <button className="btn btn-primary" onClick={onGoToRegister}>
            立即註冊
          </button>
        </div>
      )}

      {/* 重新整理按鈕 */}
      <button
        className="btn btn-text refresh-btn"
        onClick={loadEmployees}
      >
        🔄 重新載入名單
      </button>
    </div>
  );
}

export default EventDayLogin;
