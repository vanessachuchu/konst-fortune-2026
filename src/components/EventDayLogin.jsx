import { useState, useEffect } from 'react';
import { fetchEmployees } from '../utils/googleSheets';

function EventDayLogin({ employees: initialEmployees, onSelect, onGoToRegister }) {
  const [employees, setEmployees] = useState(initialEmployees || []);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(!initialEmployees || initialEmployees.length === 0);
  const [error, setError] = useState('');

  useEffect(() => {
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
      onSelect(employee);
    }
  };

  if (loading) {
    return (
      <div className="loading-section">
        <div className="loading-spinner"></div>
        <p className="loading-text">載入員工名單中...</p>
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
                    {emp.id} - {emp.name}（{emp.phrase || `${emp.adjective}${emp.noun}`}）
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
                  <span className="preview-number">{emp.id}</span>
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

          <p className="employee-count">
            已註冊 {employees.length} 人
          </p>

          {/* 尚未註冊 */}
          <div className="not-registered">
            <p>還沒註冊？</p>
            <button className="btn btn-outline" onClick={onGoToRegister}>
              立即註冊
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
