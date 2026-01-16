// Google Sheets API 工具
// 使用 Google Apps Script Web App 作為中間層

// Google Apps Script Web App URL
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzLqqESZfKuToI8kqlgZ-fbDWimvbRS2D-n5YIfJTvuFcv7nDkqFm7utuLAZQeh1GTW/exec';

// 本地儲存 key (當 Google Sheets 無法連接時的備用方案)
const LOCAL_STORAGE_KEY = 'konst-employees-2026';

/**
 * 獲取所有已註冊員工
 */
export async function fetchEmployees() {
  // 先嘗試從 Google Sheets 獲取
  if (SCRIPT_URL) {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAll`, {
        method: 'GET',
        redirect: 'follow',
      });

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

  // 先存到本地
  saveLocalEmployee(employee);

  // 嘗試同步到 Google Sheets（使用 GET 請求避免 CORS 問題）
  if (SCRIPT_URL) {
    try {
      // 將資料編碼為 URL 參數
      const params = new URLSearchParams({
        action: 'add',
        data: JSON.stringify(employee),
      });

      const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET',
        redirect: 'follow',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Google Sheets 同步成功:', result);
      } else {
        console.warn('Google Sheets 同步失敗:', response.status);
      }
    } catch (error) {
      console.warn('Google Sheets 連線失敗:', error);
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

  // 嘗試同步到 Google Sheets
  if (SCRIPT_URL) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          id,
          data: updateData,
        }),
      });

      if (!response.ok) {
        console.warn('Google Sheets 更新失敗');
      }
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
 * 獲取下一個可用的抽獎號碼
 */
export async function getNextLuckyNumber() {
  const employees = await fetchEmployees();
  const usedNumbers = new Set(employees.map(emp => emp.id));

  // 找到 01-99 之間第一個未使用的號碼
  for (let i = 1; i <= 99; i++) {
    const num = String(i).padStart(2, '0');
    if (!usedNumbers.has(num)) {
      return num;
    }
  }

  // 如果都用完了，生成隨機號碼
  return String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
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
