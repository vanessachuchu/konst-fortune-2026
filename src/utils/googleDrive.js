// Google Drive 上傳功能
// 上傳籤詩圖片到共享資料夾供工作人員列印

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzUJIazhNVODYgVsUfk3eeSrM1wAE7d298EuQnZ20TijAJBONop3_0ul4E9OVEQl30F/exec';

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

    // 使用 no-cors 模式的 POST（不會觸發預檢請求）
    // 注意：no-cors 模式無法讀取回應內容，但請求會被發送
    try {
      const formData = new FormData();
      formData.append('action', 'uploadImage');
      formData.append('fileName', fileName);
      formData.append('employeeName', employeeName);
      formData.append('luckyNumber', luckyNumber);
      formData.append('imageData', base64Data);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // 避免 CORS 預檢
        body: formData,
      });

      // no-cors 模式下無法確認結果，假設成功
      console.log('上傳請求已發送（no-cors 模式）');
      return { success: true };
    } catch (fetchError) {
      console.warn('POST 請求失敗，嘗試備用方案', fetchError);
    }

    // 備用方案：使用 iframe 表單提交（適合大型資料）
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.name = 'uploadFrame';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SCRIPT_URL;
      form.target = 'uploadFrame';

      const fields = {
        action: 'uploadImage',
        fileName,
        employeeName,
        luckyNumber,
        imageData: base64Data,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // 清理並假設成功
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        resolve({ success: true });
      }, 3000);
    });

  } catch (error) {
    console.error('上傳失敗:', error);
    return { success: false, error: error.message };
  }
}
