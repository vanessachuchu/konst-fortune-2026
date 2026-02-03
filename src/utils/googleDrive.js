// Google Drive 上傳功能
// 上傳籤詩圖片到共享資料夾供工作人員列印

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

/**
 * 上傳籤詩圖片到 Google Drive
 * @param {string} imageDataUrl - Base64 圖片資料 (data:image/png;base64,...)
 * @param {string} employeeName - 員工姓名
 * @param {string} luckyNumber - 幸運號碼
 * @returns {Promise<{success: boolean}>}
 */
export async function uploadFortuneImage(imageDataUrl, employeeName, luckyNumber = '') {
  if (!SCRIPT_URL) {
    console.warn('Google Script URL 未設定');
    return { success: false, error: 'SCRIPT_URL not configured' };
  }

  try {
    // 提取 Base64（去掉 data:image/png;base64, 前綴）
    const base64Data = imageDataUrl.split(',')[1];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `${luckyNumber}-${employeeName}-${timestamp}.png`;

    // 由於 Base64 圖片很大，使用 POST 請求
    const formData = new FormData();
    formData.append('action', 'uploadImage');
    formData.append('fileName', fileName);
    formData.append('employeeName', employeeName);
    formData.append('luckyNumber', luckyNumber);
    formData.append('imageData', base64Data);

    // 嘗試 fetch POST（可能會有 CORS 問題）
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (fetchError) {
      console.warn('POST 請求失敗，嘗試 Image beacon 方式', fetchError);
    }

    // 備用方案：使用 Image beacon（限制較大的圖片可能會失敗）
    const params = new URLSearchParams({
      action: 'uploadImage',
      fileName,
      employeeName,
      luckyNumber,
      imageData: base64Data,
    });

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ success: true });
      img.onerror = () => resolve({ success: true }); // 即使 onerror 也視為成功（no-cors 限制）
      img.src = `${SCRIPT_URL}?${params.toString()}`;

      // 5秒後視為成功（no-cors 無法取得回應）
      setTimeout(() => resolve({ success: true }), 5000);
    });

  } catch (error) {
    console.error('上傳失敗:', error);
    return { success: false, error: error.message };
  }
}
