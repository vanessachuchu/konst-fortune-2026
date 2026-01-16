import { useState, useEffect } from 'react';

function Login({ onLogin }) {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load employee data
    fetch('/employees.json')
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load employees:', err);
        setError('無法載入員工資料');
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    const id = selectedId || manualId.trim();

    if (!id) {
      setError('請選擇或輸入你的編號');
      return;
    }

    // Find employee by ID (pad to 3 digits)
    const paddedId = id.padStart(3, '0');
    const employee = employees.find((emp) => emp.id === paddedId);

    if (!employee) {
      setError('找不到此編號，請確認後再試');
      return;
    }

    setError('');
    onLogin(employee);
  };

  const handleSelectChange = (e) => {
    setSelectedId(e.target.value);
    setManualId('');
    setError('');
  };

  const handleManualChange = (e) => {
    setManualId(e.target.value);
    setSelectedId('');
    setError('');
  };

  if (loading) {
    return (
      <div className="loading-section">
        <div className="spinner"></div>
        <p className="loading-text">載入中...</p>
      </div>
    );
  }

  return (
    <div className="login-section">
      <div className="welcome-text">
        <h3>歡迎來到尾牙!</h3>
        <p>選擇你的名字，開始製作專屬籤詩</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>請選擇你的名字</label>
        <div className="select-wrapper">
          <select value={selectedId} onChange={handleSelectChange}>
            <option value="">-- 請選擇 --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id} {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divider">
        <span>或</span>
      </div>

      <div className="form-group">
        <label>輸入編號</label>
        <input
          type="text"
          placeholder="輸入 1-35 之間的數字"
          value={manualId}
          onChange={handleManualChange}
          maxLength={3}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!selectedId && !manualId.trim()}
      >
        開始拍照
      </button>
    </div>
  );
}

export default Login;
