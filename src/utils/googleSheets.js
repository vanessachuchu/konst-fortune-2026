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
      const data = await fetchGoogleSheets(`${SCRIPT_URL}?action=getAll`);
      if (data && data.employees) {
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
 * 透過隱藏 iframe 發送請求到 Google Sheets（繞過 CORS）
 */
function fetchGoogleSheets(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 8000);

    // 創建隱藏的 iframe 來載入資料
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    // 使用 message 事件接收資料（需要 Apps Script 配合）
    const messageHandler = (event) => {
      if (event.origin.includes('googleusercontent.com') || event.origin.includes('google.com')) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          document.body.removeChild(iframe);
          resolve(data);
        } catch (e) {
          // 忽略無法解析的訊息
        }
      }
    };

    window.addEventListener('message', messageHandler);
    document.body.appendChild(iframe);

    // 備用方案：如果 iframe 方式失敗，嘗試直接 fetch
    setTimeout(async () => {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          const data = await response.json();
          clearTimeout(timeout);
          window.removeEventListener('message', messageHandler);
          if (iframe.parentNode) document.body.removeChild(iframe);
          resolve(data);
        }
      } catch (e) {
        // 靜默失敗，等待 timeout
      }
    }, 100);
  });
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

  // 嘗試同步到 Google Sheets（使用 Image beacon 避免 CORS 問題）
  if (SCRIPT_URL) {
    // 將資料編碼為 URL 參數
    const params = new URLSearchParams({
      action: 'add',
      data: JSON.stringify(employee),
    });

    // 使用 Image beacon 發送請求（fire-and-forget，繞過 CORS）
    const img = new Image();
    img.onload = () => console.log('Google Sheets 同步成功');
    img.onerror = () => {
      // 即使 onerror 觸發，請求可能已經成功送出
      // Google Apps Script 會返回 JSON 而非圖片，所以會觸發 onerror
      console.log('Google Sheets 請求已送出');
    };
    img.src = `${SCRIPT_URL}?${params.toString()}`;
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
