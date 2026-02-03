// Google Sheets API 工具
// 使用 Google Apps Script Web App 作為中間層

// Google Apps Script Web App URL
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzUJIazhNVODYgVsUfk3eeSrM1wAE7d298EuQnZ20TijAJBONop3_0ul4E9OVEQl30F/exec';

// 本地儲存 key (當 Google Sheets 無法連接時的備用方案)
const LOCAL_STORAGE_KEY = 'konst-employees-2026';

/**
 * 獲取所有已註冊員工
 */
export async function fetchEmployees() {
  // 先嘗試從 Google Sheets 獲取
  if (SCRIPT_URL) {
    try {
      // 使用最簡單的 GET 請求（不加任何 headers，避免 CORS 預檢）
      const response = await fetch(`${SCRIPT_URL}?action=getAll`);
      if (response.ok) {
        const data = await response.json();
        // 同時更新本地快取
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data.employees || [];
      }
    } catch (error) {
      console.warn('Google Sheets 連線失敗，使用本地資料:', error);
    }
  }

  // 回退到本地儲存
  return getLocalEmployees();
}

/**
 * 新增員工
 */
export async function addEmployee(employeeData) {
  const employee = {
    ...employeeData,
    registeredAt: new Date().toISOString(),
  };

  // 先存到本地（包含完整資料）
  saveLocalEmployee(employee);

  // 嘗試同步到 Google Sheets（使用 Image beacon 避免 CORS 問題）
  if (SCRIPT_URL) {
    // 準備要送到 Google Sheets 的資料（排除 base64 圖片，太大會導致 URL 超長）
    const sheetData = {
      id: employee.id,
      name: employee.name,
      adjective: employee.adjective || '',
      noun: employee.noun || '',
      phrase: employee.phrase || '',
      styleType: employee.styleType || '',
      styleName: employee.styleName || '',
      styleSuggestion: employee.styleSuggestion || '', // AI 穿搭建議
      luckyNumber: employee.luckyNumber || '', // 抽獎號碼（尾牙當天再抽）
      score: employee.score || '',
      styleFeedback: employee.styleFeedback || '',
      isTopThree: employee.isTopThree || false,
      evaluatedAt: employee.evaluatedAt || '',
      registeredAt: employee.registeredAt,
    };

    // 將資料編碼為 URL 參數
    const params = new URLSearchParams({
      action: 'add',
      data: JSON.stringify(sheetData),
    });

    // 使用 no-cors 模式發送（避免 CORS 問題，fire-and-forget）
    try {
      await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      });
      console.log('Google Sheets 同步請求已發送');
    } catch (err) {
      console.warn('Google Sheets 同步失敗:', err);
    }
  }

  return employee;
}

/**
 * 更新員工資料
 */
export async function updateEmployee(id, updateData) {
  // 更新本地資料
  updateLocalEmployee(id, updateData);

  // 嘗試同步到 Google Sheets（使用 GET + no-cors 避免 CORS 問題）
  if (SCRIPT_URL) {
    // 注意：id 在此系統中就是 name，用 name 作為識別
    // 將 updateData 展開為獨立參數，方便 Google Apps Script 處理
    const params = new URLSearchParams({
      action: 'update',
      name: id, // 用 name 來識別要更新的資料列
    });

    // 將要更新的欄位直接加入參數
    Object.entries(updateData).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    try {
      await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      });
      console.log('Google Sheets 更新請求已發送, name:', id, 'data:', updateData);
    } catch (error) {
      console.warn('Google Sheets 連線失敗:', error);
    }
  }
}

/**
 * 根據 ID 獲取員工
 */
export async function getEmployeeById(id) {
  const employees = await fetchEmployees();
  return employees.find(emp => emp.id === id);
}

/**
 * 根據姓名搜尋員工
 */
export async function searchEmployeeByName(name) {
  const employees = await fetchEmployees();
  return employees.filter(emp =>
    emp.name.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * 獲取下一個可用的抽獎號碼（隨機生成，確保不重複）
 */
export async function getNextLuckyNumber() {
  // 同時從 Google Sheets 和本地取得已使用的號碼
  const employees = await fetchEmployees();
  const localEmployees = getLocalEmployees();

  // 合併所有已使用的號碼（只計算有效的 luckyNumber，不是空字串）
  const allEmployees = [...employees, ...localEmployees];
  const usedNumbers = new Set(
    allEmployees
      .map(emp => emp.luckyNumber)
      .filter(num => num && num !== '') // 只計算有值的 luckyNumber
  );

  // 生成所有可用號碼 (1-99)
  const availableNumbers = [];
  for (let i = 1; i <= 99; i++) {
    const num = String(i);
    if (!usedNumbers.has(num) && !usedNumbers.has(num.padStart(2, '0'))) {
      availableNumbers.push(num);
    }
  }

  // 如果還有可用號碼，隨機選一個
  if (availableNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  }

  // 如果都用完了，生成 100+ 的號碼
  const maxNum = Math.max(...Array.from(usedNumbers).map(n => parseInt(n) || 0), 99);
  return String(maxNum + 1);
}

/**
 * 檢查姓名是否已存在
 */
export async function isNameExists(name) {
  const employees = await fetchEmployees();
  return employees.some(emp => emp.name === name);
}

// ===== 本地儲存操作 =====

function getLocalEmployees() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.employees || [];
    }
  } catch (error) {
    console.error('讀取本地資料失敗:', error);
  }
  return [];
}

function saveLocalEmployee(employee) {
  try {
    const employees = getLocalEmployees();
    employees.push(employee);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ employees }));
  } catch (error) {
    console.error('儲存本地資料失敗:', error);
  }
}

function updateLocalEmployee(id, updateData) {
  try {
    const employees = getLocalEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updateData };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ employees }));
    }
  } catch (error) {
    console.error('更新本地資料失敗:', error);
  }
}

// ===== 導出/導入功能 =====

/**
 * 導出所有員工資料為 JSON
 */
export function exportEmployeesToJSON() {
  const employees = getLocalEmployees();
  const dataStr = JSON.stringify({ employees }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `konst-employees-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 從 JSON 導入員工資料
 */
export function importEmployeesFromJSON(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (data.employees && Array.isArray(data.employees)) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return true;
    }
  } catch (error) {
    console.error('導入資料失敗:', error);
  }
  return false;
}

/**
 * 清除所有本地資料
 */
export function clearLocalData() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

// ===== 當前用戶管理 =====

const CURRENT_USER_KEY = 'konst-current-user-2026';

/**
 * 儲存當前用戶（記住登入狀態）
 */
export function saveCurrentUser(employee) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(employee));
  } catch (error) {
    console.error('儲存當前用戶失敗:', error);
  }
}

/**
 * 獲取當前用戶
 */
export function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('讀取當前用戶失敗:', error);
  }
  return null;
}

/**
 * 清除當前用戶
 */
export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
