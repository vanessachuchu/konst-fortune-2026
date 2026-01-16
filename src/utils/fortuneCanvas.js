// Fortune Canvas Generator - KONST AI 風格籤詩
// Generates KONST branded fortune slip with better spacing

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1800; // 增加高度以容納更多間距

// KONST 品牌配色 + 傳統元素
const COLORS = {
  // KONST 品牌色
  konstBlue: '#6366F1',       // 主要藍紫色
  konstBlueDark: '#4F46E5',   // 深藍紫
  konstBlueLight: '#818CF8',  // 淺藍紫
  cyberGlow: '#00D4FF',       // 科技藍
  spaceSilver: '#C0C0C0',     // 太空銀

  // 傳統色彩
  background: '#F8F4F0',      // 淺米灰背景
  paper: '#FFFFFF',           // 純白籤紙
  gold: '#D4AF37',            // 金色
  red: '#DC2626',             // 現代紅
  darkText: '#1F2937',        // 深灰文字
  lightText: '#6B7280',       // 淺灰文字
};

// 天干地支
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 籤詩等級 - 使用 KONST 配色
const FORTUNE_LEVELS = [
  { level: '上上籤', color: '#F59E0B', desc: '大吉大利' },
  { level: '上籤', color: '#10B981', desc: '諸事順遂' },
  { level: '中上籤', color: '#6366F1', desc: '穩中求進' },
  { level: '中籤', color: '#8B5CF6', desc: '平安是福' },
  { level: '中下籤', color: '#EC4899', desc: '小心謹慎' },
];

// 心情對應的籤詩內容庫
const MOOD_FORTUNES = {
  happy: {
    poems: [
      '春風得意馬蹄疾，一日看盡長安花',
      '喜氣洋洋福自來，笑口常開百事諧',
      '心花怒放迎新歲，萬事如意樂開懷',
    ],
    advice: [
      '開心能量滿載，適合拓展人脈，貴人運旺',
      '好運正在發酵，把握機會大膽出擊',
      '笑容是最好的名片，今年桃花朵朵開',
    ],
    keywords: ['貴人相助', '心想事成', '錦上添花', '喜上眉梢'],
  },
  calm: {
    poems: [
      '靜水流深藏智慧，不動聲色成大事',
      '泰山崩於前而色不變，此乃大將之風',
      '心如止水映明月，萬般紛擾皆浮雲',
    ],
    advice: [
      '沉穩是你的超能力，大事小事穩穩來',
      '內心平靜，外在順利，今年適合深耕',
      '不急不躁，好事自然來敲門',
    ],
    keywords: ['穩紮穩打', '厚積薄發', '以靜制動', '大器晚成'],
  },
  tired: {
    poems: [
      '休養生息蓄能量，厚積薄發待時機',
      '偷得浮生半日閒，養精蓄銳再出發',
      '暫時停下腳步，是為了走更遠的路',
    ],
    advice: [
      '累了就休息，充電後戰鬥力翻倍',
      '今年要學會說不，照顧好自己最重要',
      '適度躺平不是罪，是為了更好的起飛',
    ],
    keywords: ['養精蓄銳', '韜光養晦', '以逸待勞', '蓄勢待發'],
  },
  excited: {
    poems: [
      '龍騰虎躍展宏圖，鵬程萬里任翱翔',
      '衝勁十足向前衝，勇往直前無所懼',
      '熱血沸騰志氣高，乘風破浪會有時',
    ],
    advice: [
      '衝勁是你的武器，但記得帶上智慧當副駕',
      '熱情可以燎原，今年適合大展身手',
      '保持這股衝勁，但也要注意不要用力過猛',
    ],
    keywords: ['一飛沖天', '勢如破竹', '銳不可當', '旗開得勝'],
  },
  confused: {
    poems: [
      '山重水複疑無路，柳暗花明又一村',
      '迷霧終將散去，前方自有光明',
      '走過迷茫方知路，歷經風雨見彩虹',
    ],
    advice: [
      '迷茫是轉變的前兆，答案很快就會出現',
      '不確定的時候，聽聽內心的聲音',
      '今年是探索年，多嘗試就會找到方向',
    ],
    keywords: ['撥雲見日', '守得雲開', '峰迴路轉', '豁然開朗'],
  },
  neutral: {
    poems: [
      '平平淡淡才是真，細水長流見真情',
      '穩穩當當過日子，平安喜樂勝萬金',
      '不求大富大貴，但願歲月靜好',
    ],
    advice: [
      '平凡中見真章，今年穩紮穩打最實在',
      '維持現狀就是進步，不要給自己太大壓力',
      '安穩是福，珍惜當下擁有的一切',
    ],
    keywords: ['平安是福', '知足常樂', '細水長流', '穩中求進'],
  },
};

// 有趣的職場籤詩解語
const WORK_INTERPRETATIONS = [
  '老闆的眼光會飄向你，但可能是因為你太帥/美',
  'KPI 會達標，前提是你要先設定 KPI',
  '今年會有升遷機會，請確保不是被升到別家公司',
  '貴人出現，但他可能偽裝成甲方',
  '財運亨通，但主要是幫公司賺錢',
  '工作運旺，旺到加班都停不下來',
  '職場人緣好，茶水間八卦第一個知道',
  '會有意外之財，例如：報帳終於過了',
  '今年適合跳槽，跳到更好的工位',
  '創意爆發，但 PPT 還是要自己做',
];

// 有趣的生活籤詩解語
const LIFE_INTERPRETATIONS = [
  '減肥會成功，在你開始之後',
  '桃花朵朵開，但可能是辦公室的盆栽',
  '旅遊運旺，出差也算',
  '健康運佳，因為你會被迫早睡（太累）',
  '學習運好，YouTube 教學都看得懂',
  '社交運旺，群組訊息接到手軟',
  '美食運爆發，外送 App 是你的貴人',
  '購物運亨通，但錢包表示需要休息',
  '睡眠運不錯，開會時特別明顯',
  '運動運提升，從座位走到茶水間算一次',
];

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
  // 外框漸層
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, COLORS.konstBlue);
  gradient.addColorStop(0.5, COLORS.konstBlueDark);
  gradient.addColorStop(1, COLORS.konstBlue);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, width, height);

  // 內框 - 金色
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 12, y + 12, width - 24, height - 24);

  // 四角裝飾 - KONST 藍紫色圓點
  ctx.fillStyle = COLORS.konstBlue;
  [[x + 12, y + 12], [x + width - 12, y + 12], [x + 12, y + height - 12], [x + width - 12, y + height - 12]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 根據心情判斷運勢等級
function getFortuneLevel(mood) {
  const moodToLevel = {
    happy: 0,
    excited: 1,
    calm: 2,
    neutral: 3,
    confused: 3,
    tired: 4,
  };
  return FORTUNE_LEVELS[moodToLevel[mood] || 3];
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

// 主要生成函數
export async function generateFortuneImage(employeeData, photoDataUrl, mood = 'neutral', wish = '') {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 背景 - 淺灰白漸層
  const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGradient.addColorStop(0, '#F8F4F0');
  bgGradient.addColorStop(1, '#EDE9E5');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 加入微妙紋理
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

  // 主要籤紙區域
  const paperX = 40;
  const paperY = 40;
  const paperWidth = CANVAS_WIDTH - 80;
  const paperHeight = CANVAS_HEIGHT - 80;

  // 籤紙底色 - 純白
  ctx.fillStyle = COLORS.paper;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;
  ctx.fillRect(paperX, paperY, paperWidth, paperHeight);
  ctx.shadowColor = 'transparent';

  // KONST 風格邊框
  drawKonstBorder(ctx, paperX, paperY, paperWidth, paperHeight);

  // 獲取籤詩內容
  const fortuneLevel = getFortuneLevel(mood);
  const moodFortune = MOOD_FORTUNES[mood] || MOOD_FORTUNES.neutral;
  const poem = moodFortune.poems[Math.floor(Math.random() * moodFortune.poems.length)];
  const advice = moodFortune.advice[Math.floor(Math.random() * moodFortune.advice.length)];
  const keyword = moodFortune.keywords[Math.floor(Math.random() * moodFortune.keywords.length)];
  const workInterp = WORK_INTERPRETATIONS[Math.floor(Math.random() * WORK_INTERPRETATIONS.length)];
  const lifeInterp = LIFE_INTERPRETATIONS[Math.floor(Math.random() * LIFE_INTERPRETATIONS.length)];
  const fortuneNumber = getFortuneNumber();
  const yearGanzhi = getYearGanzhi(2026);

  let yPos = 100;

  // ===== 頂部區域 =====

  // 年份標題 - KONST 藍紫色
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.konstBlue;
  ctx.fillText(`貳 零 貳 陸   歲 次 ${yearGanzhi}`, CANVAS_WIDTH / 2, yPos);
  yPos += 60;

  // 籤號 - 加大字間距
  ctx.font = 'bold 38px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.darkText;
  ctx.fillText(fortuneNumber, CANVAS_WIDTH / 2, yPos);
  yPos += 70;

  // 運勢等級 - 大字
  ctx.font = 'bold 68px "Noto Serif TC", serif';
  ctx.fillStyle = fortuneLevel.color;
  // 增加字間距
  const levelChars = fortuneLevel.level.split('');
  const levelText = levelChars.join(' ');
  ctx.fillText(levelText, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 運勢描述
  ctx.font = '26px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.lightText;
  ctx.fillText(fortuneLevel.desc, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 分隔線 - KONST 漸層
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
  const photoWidth = 280;
  const photoHeight = 280;
  const photoX = (CANVAS_WIDTH - photoWidth) / 2;

  // 照片外框 - KONST 藍紫色
  ctx.strokeStyle = COLORS.konstBlue;
  ctx.lineWidth = 4;
  ctx.strokeRect(photoX - 6, yPos - 6, photoWidth + 12, photoHeight + 12);

  // 繪製照片
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

  // 員工姓名
  ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText(employeeData.name, CANVAS_WIDTH / 2, yPos);
  yPos += 45;

  // 形容詞短語
  ctx.font = '26px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;
  ctx.fillText(`今年的我是「${employeeData.phrase}」`, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // ===== 抽獎號碼 =====
  const luckyBoxWidth = 180;
  const luckyBoxHeight = 70;
  const luckyBoxX = (CANVAS_WIDTH - luckyBoxWidth) / 2;

  // 抽獎號碼背景 - KONST 漸層
  const luckyGradient = ctx.createLinearGradient(luckyBoxX, yPos, luckyBoxX + luckyBoxWidth, yPos + luckyBoxHeight);
  luckyGradient.addColorStop(0, COLORS.konstBlue);
  luckyGradient.addColorStop(1, COLORS.konstBlueDark);
  ctx.fillStyle = luckyGradient;
  ctx.beginPath();
  ctx.roundRect(luckyBoxX, yPos, luckyBoxWidth, luckyBoxHeight, 12);
  ctx.fill();

  // 抽獎號碼文字
  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('抽獎號碼', CANVAS_WIDTH / 2, yPos + 25);

  ctx.font = 'bold 32px "Orbitron", "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(employeeData.luckyNumber, CANVAS_WIDTH / 2, yPos + 58);
  yPos += luckyBoxHeight + 45;

  // 分隔線
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, yPos);
  ctx.lineTo(CANVAS_WIDTH - 120, yPos);
  ctx.stroke();
  yPos += 40;

  // ===== 籤詩詩句 =====
  ctx.font = '26px "Noto Serif TC", serif';
  ctx.fillStyle = COLORS.darkText;

  const poemParts = poem.split('，');
  poemParts.forEach((part, i) => {
    // 增加詩句字間距
    const chars = part.split('');
    const spacedText = chars.join(' ') + (i < poemParts.length - 1 ? ' ，' : '');
    ctx.fillText(spacedText, CANVAS_WIDTH / 2, yPos);
    yPos += 45;
  });
  yPos += 25;

  // ===== AI 解籤 =====
  const leftMargin = 100;
  ctx.textAlign = 'left';

  ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlue;
  ctx.fillText('【 AI 解籤 】', leftMargin, yPos);
  yPos += 40;

  ctx.font = '20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;

  // 自動換行
  const maxWidth = CANVAS_WIDTH - 200;
  const words = advice.split('');
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, leftMargin, yPos);
      line = words[i];
      yPos += 35;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, leftMargin, yPos);
  yPos += 50;

  // ===== 事業運 =====
  ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText('事業運', leftMargin, yPos);
  yPos += 35;

  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;

  const workWords = workInterp.split('');
  line = '';

  for (let i = 0; i < workWords.length; i++) {
    const testLine = line + workWords[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, leftMargin, yPos);
      line = workWords[i];
      yPos += 32;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, leftMargin, yPos);
  yPos += 45;

  // ===== 生活運 =====
  ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.konstBlueDark;
  ctx.fillText('生活運', leftMargin, yPos);
  yPos += 35;

  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkText;

  const lifeWords = lifeInterp.split('');
  line = '';

  for (let i = 0; i < lifeWords.length; i++) {
    const testLine = line + lifeWords[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, leftMargin, yPos);
      line = lifeWords[i];
      yPos += 32;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, leftMargin, yPos);
  yPos += 50;

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

  // ===== 關鍵字 =====
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px "Noto Sans TC", sans-serif';

  // 關鍵字漸層色
  const keywordGradient = ctx.createLinearGradient(
    CANVAS_WIDTH / 2 - 100, yPos,
    CANVAS_WIDTH / 2 + 100, yPos
  );
  keywordGradient.addColorStop(0, COLORS.konstBlue);
  keywordGradient.addColorStop(0.5, COLORS.cyberGlow);
  keywordGradient.addColorStop(1, COLORS.konstBlue);
  ctx.fillStyle = keywordGradient;
  ctx.fillText(`✦  ${keyword}  ✦`, CANVAS_WIDTH / 2, yPos);

  // ===== 底部 KONST Logo =====
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

// Print the image - 專門為小型熱感應印表機優化
export function printImage(dataUrl, printerType = 'thermal') {
  const printWindow = window.open('', '', 'width=400,height=600');
  if (printWindow) {
    const styles = printerType === 'thermal'
      ? `
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          width: 80mm;
        }
        img {
          width: 80mm;
          height: auto;
        }
      `
      : `
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        img { max-width: 100%; max-height: 100vh; }
        @media print {
          body { margin: 0; }
          img { width: 100%; height: auto; }
        }
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

// 直接列印到熱感應印表機
export async function printToThermalPrinter(dataUrl) {
  try {
    const img = await loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    const targetWidth = 576;
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

// 心情選項
export const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊', label: '開心愉快', desc: '今天心情超好！' },
  { id: 'calm', emoji: '😌', label: '平靜從容', desc: '內心安定踏實' },
  { id: 'excited', emoji: '🔥', label: '熱血沸騰', desc: '充滿幹勁！' },
  { id: 'tired', emoji: '😴', label: '有點疲憊', desc: '需要充電中...' },
  { id: 'confused', emoji: '🤔', label: '有點迷茫', desc: '在思考人生方向' },
  { id: 'neutral', emoji: '😐', label: '普普通通', desc: '平凡的一天' },
];
