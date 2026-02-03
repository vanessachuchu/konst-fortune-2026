// Fortune Canvas Generator - KONST AI 風格籤詩
// Generates KONST branded fortune slip with Grok AI content

const CANVAS_WIDTH = 1200;  // 4 英吋 @ 300 DPI
const CANVAS_HEIGHT = 1800; // 6 英吋 @ 300 DPI

// KONST 品牌配色 + 傳統元素
const COLORS = {
  // KONST 品牌色
  konstBlue: '#6366F1',
  konstBlueDark: '#4F46E5',
  konstBlueLight: '#818CF8',
  cyberGlow: '#00D4FF',
  spaceSilver: '#C0C0C0',

  // 傳統色彩
  background: '#F8F4F0',
  paper: '#FFFFFF',
  gold: '#D4AF37',
  red: '#DC2626',
  darkText: '#1F2937',
  lightText: '#6B7280',
};

// 天干地支
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 籤詩等級配色
const LEVEL_COLORS = {
  '上上籤': '#F59E0B',
  '上籤': '#10B981',
  '中上籤': '#6366F1',
  '中籤': '#8B5CF6',
  '中下籤': '#EC4899',
};

// Load image from data URL
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 繪製 KONST 風格邊框
function drawKonstBorder(ctx, x, y, width, height) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, COLORS.konstBlue);
  gradient.addColorStop(0.5, COLORS.konstBlueDark);
  gradient.addColorStop(1, COLORS.konstBlue);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, width, height);

  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 12, y + 12, width - 24, height - 24);

  ctx.fillStyle = COLORS.konstBlue;
  [[x + 12, y + 12], [x + width - 12, y + 12], [x + 12, y + height - 12], [x + width - 12, y + height - 12]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 生成年份天干地支
function getYearGanzhi(year) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIANGAN[ganIndex] + DIZHI[zhiIndex];
}

// 生成隨機籤號
function getFortuneNumber() {
  const num = Math.floor(Math.random() * 100) + 1;
  const chineseNums = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const tens = Math.floor(num / 10);
  const ones = num % 10;

  if (num < 10) return `第 ${chineseNums[num]} 首`;
  if (ones === 0) return `第 ${chineseNums[tens]} 拾 首`;
  return `第 ${chineseNums[tens]} 拾 ${chineseNums[ones]} 首`;
}

// 自動換行文字繪製
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('');
  let line = '';
  let currentY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * 主要生成函數 - 使用 Grok AI 生成的內容
 * @param {Object} employeeData - 員工資料
 * @param {string} photoDataUrl - 照片 data URL
 * @param {Object} fortuneContent - Grok AI 生成的籤詩內容
 * @param {string} wish - 願望
 */
export async function generateFortuneImage(employeeData, photoDataUrl, fortuneContent, wish = '', styleEvaluation = null) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 背景漸層
  const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGradient.addColorStop(0, '#F8F4F0');
  bgGradient.addColorStop(1, '#EDE9E5');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 微妙紋理
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? COLORS.konstBlue : COLORS.spaceSilver;
    ctx.fillRect(
      Math.random() * CANVAS_WIDTH,
      Math.random() * CANVAS_HEIGHT,
      Math.random() * 2,
      Math.random() * 2
    );
  }
  ctx.globalAlpha = 1;

  // 主籤紙區域
  const paperX = 40;
  const paperY = 40;
  const paperWidth = CANVAS_WIDTH - 80;
  const paperHeight = CANVAS_HEIGHT - 80;

  ctx.fillStyle = COLORS.paper;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;
  ctx.fillRect(paperX, paperY, paperWidth, paperHeight);
  ctx.shadowColor = 'transparent';

  drawKonstBorder(ctx, paperX, paperY, paperWidth, paperHeight);

  // 從 Grok AI 內容取得資料
  const {
    level = '中上籤',
    levelDesc = '穩中求進',
    mainPoem = '穩紮穩打基礎牢，循序漸進步步高。\n蛇年平安是福氣，順心如意樂逍遙。',
    interpretation = '今年是你穩健前行的一年，把握機會，成功在望。',
    luckyItem = '蛇年吊飾',
    luckyColor = '藍色',
    advice = '保持初心，穩步向前',
  } = fortuneContent;

  const levelColor = LEVEL_COLORS[level] || COLORS.konstBlue;
  const fortuneNumber = getFortuneNumber();
  const yearGanzhi = getYearGanzhi(2026);

  let yPos = 80;
  const leftMargin = 100;

  // ===== KONST Logo（使用圖片）=====
  try {
    const logoImg = await loadImage('/konst-logo.png');
    const logoHeight = 60;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    const logoX = (CANVAS_WIDTH - logoWidth) / 2;
    ctx.drawImage(logoImg, logoX, yPos - 10, logoWidth, logoHeight);
    yPos += logoHeight + 20;
  } catch (e) {
    // 如果圖片載入失敗，使用文字備用
    ctx.textAlign = 'center';
    ctx.font = 'bold 42px "Orbitron", sans-serif';
    ctx.fillStyle = COLORS.konstBlue;
    ctx.fillText('KONST', CANVAS_WIDTH / 2, yPos + 32);
    yPos += 70;
  }

  // ===== 頂部區域 =====
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.konstBlue;
  ctx.fillText(`貳 零 貳 陸   歲 次 ${yearGanzhi}`, CANVAS_WIDTH / 2, yPos);
  yPos += 60;

  ctx.font = 'bold 38px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.darkText;
  ctx.fillText(fortuneNumber, CANVAS_WIDTH / 2, yPos);
  yPos += 70;

  // 運勢等級
  ctx.font = 'bold 68px "Noto Serif TC", serif';
  ctx.fillStyle = levelColor;
  const levelChars = level.split('');
  ctx.fillText(levelChars.join(' '), CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  ctx.font = '26px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.lightText;
  ctx.fillText(levelDesc, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 分隔線
  const lineGradient = ctx.createLinearGradient(100, yPos, CANVAS_WIDTH - 100, yPos);
  lineGradient.addColorStop(0, 'transparent');
  lineGradient.addColorStop(0.2, COLORS.konstBlueLight);
  lineGradient.addColorStop(0.5, COLORS.konstBlue);
  lineGradient.addColorStop(0.8, COLORS.konstBlueLight);
  lineGradient.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, yPos);
  ctx.lineTo(CANVAS_WIDTH - 100, yPos);
  ctx.stroke();
  yPos += 40;

  // ===== 照片區域 =====
  const photoWidth = 360;
  const photoHeight = 360;
  const photoX = (CANVAS_WIDTH - photoWidth) / 2;

  ctx.strokeStyle = COLORS.konstBlue;
  ctx.lineWidth = 4;
  ctx.strokeRect(photoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

  try {
    const img = await loadImage(photoDataUrl);
    const imgAspect = img.width / img.height;
    const targetAspect = photoWidth / photoHeight;

    let sx, sy, sWidth, sHeight;
    if (imgAspect > targetAspect) {
      sHeight = img.height;
      sWidth = img.height * targetAspect;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / targetAspect;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, yPos, photoWidth, photoHeight);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, yPos, photoWidth, photoHeight);
    ctx.restore();
  } catch (e) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(photoX, yPos, photoWidth, photoHeight);
  }

  yPos += photoHeight + 40;

  // ===== 員工資訊 =====
  ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText(employeeData.name, CANVAS_WIDTH / 2, yPos);
  yPos += 45;

  // 形容詞短語
  if (employeeData.adjective && employeeData.noun) {
    ctx.font = '26px "Noto Sans TC", sans-serif';
    ctx.fillStyle = COLORS.darkText;
    ctx.fillText(`今年的我是「${employeeData.adjective}${employeeData.noun}」`, CANVAS_WIDTH / 2, yPos);
    yPos += 50;
  } else if (employeeData.phrase) {
    ctx.font = '26px "Noto Sans TC", sans-serif';
    ctx.fillStyle = COLORS.darkText;
    ctx.fillText(`今年的我是「${employeeData.phrase}」`, CANVAS_WIDTH / 2, yPos);
    yPos += 50;
  }

  // ===== 今年的幸運號碼 =====
  const luckyBoxWidth = 180;
  const luckyBoxHeight = 70;
  const luckyBoxX = (CANVAS_WIDTH - luckyBoxWidth) / 2;

  const luckyGradient = ctx.createLinearGradient(luckyBoxX, yPos, luckyBoxX + luckyBoxWidth, yPos + luckyBoxHeight);
  luckyGradient.addColorStop(0, COLORS.konstBlue);
  luckyGradient.addColorStop(1, COLORS.konstBlueDark);
  ctx.fillStyle = luckyGradient;
  ctx.beginPath();
  ctx.roundRect(luckyBoxX, yPos, luckyBoxWidth, luckyBoxHeight, 12);
  ctx.fill();

  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('今年的幸運號碼', CANVAS_WIDTH / 2, yPos + 25);

  ctx.font = 'bold 32px "Orbitron", "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(employeeData.luckyNumber || employeeData.id || '??', CANVAS_WIDTH / 2, yPos + 58);
  yPos += luckyBoxHeight + 45;

  // 分隔線
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, yPos);
  ctx.lineTo(CANVAS_WIDTH - 120, yPos);
  ctx.stroke();
  yPos += 40;

  // ===== 籤詩詩句 (Grok AI 生成) =====
  ctx.font = '26px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.darkText;

  const poemLines = mainPoem.split('\n');
  poemLines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // 如果有逗號，分開處理
      const parts = trimmedLine.split('，');
      parts.forEach((part, i) => {
        const chars = part.trim().split('');
        const spacedText = chars.join(' ') + (i < parts.length - 1 ? ' ，' : '');
        ctx.fillText(spacedText, CANVAS_WIDTH / 2, yPos);
        yPos += 45;
      });
    }
  });
  yPos += 20;

  // ===== AI 解籤 (Grok AI 生成) =====
  ctx.textAlign = 'left';
  ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlue;
  ctx.fillText('【 AI 解籤 】', leftMargin, yPos);
  yPos += 40;

  ctx.font = '20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;
  yPos = drawWrappedText(ctx, interpretation, leftMargin, yPos, CANVAS_WIDTH - 200, 35);
  yPos += 15;

  // ===== 幸運物 & 幸運色 =====
  ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText(`幸運物：${luckyItem}`, leftMargin, yPos);
  yPos += 35;

  ctx.fillText(`幸運色：${luckyColor}`, leftMargin, yPos);
  yPos += 45;

  // ===== 一句話建議 =====
  ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText('AI 建議', leftMargin, yPos);
  yPos += 35;

  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;
  yPos = drawWrappedText(ctx, advice, leftMargin, yPos, CANVAS_WIDTH - 200, 32);
  yPos += 30;

  // ===== 願望區域 =====
  if (wish) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.fillStyle = COLORS.konstBlue;
    ctx.fillText('【 2026 年願望 】', CANVAS_WIDTH / 2, yPos);
    yPos += 38;

    ctx.font = '22px "Noto Sans TC", sans-serif';
    ctx.fillStyle = COLORS.darkText;
    ctx.fillText(`「${wish}」`, CANVAS_WIDTH / 2, yPos);
    yPos += 45;
  }

  // ===== 底部 KONST Logo =====
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px "Orbitron", sans-serif';
  ctx.fillStyle = COLORS.konstBlue;
  ctx.fillText('KONST AI', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 90);

  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.lightText;
  ctx.fillText('2026 尾牙  •  AI 個性靈籤', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);

  return canvas.toDataURL('image/png');
}

// Download the generated image
export function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename || 'konst-fortune-2026.png';
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Print the image
export function printImage(dataUrl, printerType = 'thermal') {
  const printWindow = window.open('', '', 'width=400,height=600');
  if (printWindow) {
    const styles = printerType === 'thermal'
      ? `
        @page { size: 101.6mm auto; margin: 0; }
        body { margin: 0; padding: 0; width: 101.6mm; }
        img { width: 101.6mm; height: auto; }
      `
      : `
        @page { size: 4in 6in; margin: 0; }
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        img { max-width: 100%; max-height: 100vh; }
        @media print { body { margin: 0; } img { width: 4in; height: 6in; } }
      `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KONST AI 籤詩</title>
          <style>${styles}</style>
        </head>
        <body>
          <img src="${dataUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

// 熱感應印表機列印
export async function printToThermalPrinter(dataUrl) {
  try {
    const img = await loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    const targetWidth = 812; // 4 英吋 @ 203 DPI (熱感應印表機)
    const scale = targetWidth / img.width;
    canvas.width = targetWidth;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (navigator.share && navigator.canShare({ files: [new File([blob], 'fortune.png', { type: 'image/png' })] })) {
      await navigator.share({
        files: [new File([blob], 'konst-fortune.png', { type: 'image/png' })],
        title: 'KONST AI 籤詩',
      });
    } else {
      printImage(dataUrl, 'thermal');
    }
  } catch (e) {
    printImage(dataUrl, 'thermal');
  }
}
