// Fortune Canvas Generator - 傳統廟宇籤詩風格
// Generates traditional temple fortune slip style image

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1600;

// 傳統配色
const COLORS = {
  background: '#F5E6D3', // 古紙色
  paper: '#FFF8E7', // 籤紙米白
  border: '#8B4513', // 深木色邊框
  gold: '#DAA520', // 金色
  red: '#B22222', // 傳統紅
  darkRed: '#8B0000', // 深紅
  black: '#1a1a1a', // 墨黑
  brown: '#5D4037', // 木頭棕
};

// 天干地支
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 籤詩等級
const FORTUNE_LEVELS = [
  { level: '上上籤', color: '#FFD700', desc: '大吉大利' },
  { level: '上籤', color: '#FF6B6B', desc: '諸事順遂' },
  { level: '中上籤', color: '#4ECDC4', desc: '穩中求進' },
  { level: '中籤', color: '#95A5A6', desc: '平安是福' },
  { level: '中下籤', color: '#E67E22', desc: '小心謹慎' },
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

// 繪製傳統裝飾邊框
function drawTraditionalBorder(ctx, x, y, width, height) {
  const borderWidth = 8;

  // 外框 - 深色
  ctx.strokeStyle = COLORS.brown;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(x, y, width, height);

  // 內框 - 金色
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 15, y + 15, width - 30, height - 30);

  // 角落裝飾
  const cornerSize = 30;
  ctx.fillStyle = COLORS.gold;

  // 四個角落畫裝飾
  [[x + 15, y + 15], [x + width - 15, y + 15], [x + 15, y + height - 15], [x + width - 15, y + height - 15]].forEach(([cx, cy], i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 繪製直式文字
function drawVerticalText(ctx, text, x, y, lineHeight) {
  const chars = text.split('');
  chars.forEach((char, i) => {
    ctx.fillText(char, x, y + i * lineHeight);
  });
}

// 根據心情判斷運勢等級
function getFortuneLevel(mood) {
  const moodToLevel = {
    happy: 0,      // 上上籤
    excited: 1,    // 上籤
    calm: 2,       // 中上籤
    neutral: 3,    // 中籤
    confused: 3,   // 中籤
    tired: 4,      // 中下籤
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

  if (num < 10) return `第${chineseNums[num]}首`;
  if (ones === 0) return `第${chineseNums[tens]}拾首`;
  return `第${chineseNums[tens]}拾${chineseNums[ones]}首`;
}

// 主要生成函數
export async function generateFortuneImage(employeeData, photoDataUrl, mood = 'neutral') {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 背景 - 古紙質感
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 加入紙張紋理效果
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#8B4513';
    ctx.fillRect(
      Math.random() * CANVAS_WIDTH,
      Math.random() * CANVAS_HEIGHT,
      Math.random() * 2,
      Math.random() * 2
    );
  }
  ctx.globalAlpha = 1;

  // 主要籤紙區域
  const paperX = 50;
  const paperY = 50;
  const paperWidth = CANVAS_WIDTH - 100;
  const paperHeight = CANVAS_HEIGHT - 100;

  // 籤紙底色
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(paperX, paperY, paperWidth, paperHeight);

  // 傳統邊框
  drawTraditionalBorder(ctx, paperX, paperY, paperWidth, paperHeight);

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

  // 頂部：年份標題
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Noto Serif TC", "Noto Sans TC", serif';
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText(`貳零貳陸 歲次${yearGanzhi}`, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 籤號
  ctx.font = 'bold 42px "Noto Serif TC", "Noto Sans TC", serif';
  ctx.fillStyle = COLORS.black;
  ctx.fillText(fortuneNumber, CANVAS_WIDTH / 2, yPos);
  yPos += 60;

  // 運勢等級 - 大字
  ctx.font = 'bold 72px "Noto Serif TC", "Noto Sans TC", serif';
  ctx.fillStyle = fortuneLevel.color;
  // 描邊效果
  ctx.strokeStyle = COLORS.brown;
  ctx.lineWidth = 2;
  ctx.strokeText(fortuneLevel.level, CANVAS_WIDTH / 2, yPos);
  ctx.fillText(fortuneLevel.level, CANVAS_WIDTH / 2, yPos);
  yPos += 40;

  // 運勢描述
  ctx.font = '28px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.brown;
  ctx.fillText(fortuneLevel.desc, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 分隔線
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, yPos);
  ctx.lineTo(CANVAS_WIDTH - 100, yPos);
  ctx.stroke();
  yPos += 40;

  // 照片區域（兩欄式：左邊預演/右邊實拍）
  const photoAreaY = yPos;
  const photoWidth = 380;
  const photoHeight = 280;

  // 左側：AI 預演穿搭圖（使用實際照片模擬）
  ctx.fillStyle = COLORS.brown;
  ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
  ctx.fillText('AI 預演穿搭圖', 250, photoAreaY);

  // 右側：現場實拍照
  ctx.fillText('現場實拍照', 750, photoAreaY);

  // 繪製照片框
  const leftPhotoX = 60;
  const rightPhotoX = 520;
  const photoY = photoAreaY + 20;

  // 照片框裝飾
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(leftPhotoX, photoY, photoWidth, photoHeight);
  ctx.strokeRect(rightPhotoX, photoY, photoWidth, photoHeight);

  // 繪製照片
  try {
    const img = await loadImage(photoDataUrl);

    // 計算裁切
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

    // 左側照片（加濾鏡效果模擬 AI 預演）
    ctx.save();
    ctx.beginPath();
    ctx.rect(leftPhotoX, photoY, photoWidth, photoHeight);
    ctx.clip();
    ctx.filter = 'saturate(1.3) contrast(1.1)';
    ctx.drawImage(img, sx, sy, sWidth, sHeight, leftPhotoX, photoY, photoWidth, photoHeight);
    ctx.restore();

    // 右側照片（原圖）
    ctx.save();
    ctx.beginPath();
    ctx.rect(rightPhotoX, photoY, photoWidth, photoHeight);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sWidth, sHeight, rightPhotoX, photoY, photoWidth, photoHeight);
    ctx.restore();

  } catch (e) {
    // 照片載入失敗的備用方案
    ctx.fillStyle = '#ddd';
    ctx.fillRect(leftPhotoX, photoY, photoWidth, photoHeight);
    ctx.fillRect(rightPhotoX, photoY, photoWidth, photoHeight);
  }

  yPos = photoY + photoHeight + 50;

  // 分隔線
  ctx.strokeStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(100, yPos);
  ctx.lineTo(CANVAS_WIDTH - 100, yPos);
  ctx.stroke();
  yPos += 40;

  // 員工身份標籤
  ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText(`【 ${employeeData.name} • ${employeeData.phrase} 】`, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 籤詩詩句
  ctx.font = '30px "Noto Serif TC", "Noto Sans TC", serif';
  ctx.fillStyle = COLORS.black;

  // 詩句分行顯示
  const poemParts = poem.split('，');
  poemParts.forEach((part, i) => {
    ctx.fillText(part + (i < poemParts.length - 1 ? '，' : ''), CANVAS_WIDTH / 2, yPos);
    yPos += 42;
  });
  yPos += 20;

  // 解籤區域
  ctx.font = 'bold 26px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.brown;
  ctx.textAlign = 'left';

  const leftMargin = 100;

  // AI 解籤
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText('【AI 解籤】', leftMargin, yPos);
  yPos += 38;

  ctx.font = '24px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.black;

  // 自動換行處理
  const maxWidth = CANVAS_WIDTH - 200;
  const words = advice.split('');
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, leftMargin, yPos);
      line = words[i];
      yPos += 34;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, leftMargin, yPos);
  yPos += 50;

  // 事業運
  ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText('事業運：', leftMargin, yPos);
  ctx.font = '22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.black;
  ctx.fillText(workInterp, leftMargin + 90, yPos);
  yPos += 40;

  // 生活運
  ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText('生活運：', leftMargin, yPos);
  ctx.font = '22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.black;
  ctx.fillText(lifeInterp, leftMargin + 90, yPos);
  yPos += 50;

  // 關鍵字
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.gold;
  ctx.strokeStyle = COLORS.brown;
  ctx.lineWidth = 1;
  ctx.strokeText(`✦ ${keyword} ✦`, CANVAS_WIDTH / 2, yPos);
  ctx.fillText(`✦ ${keyword} ✦`, CANVAS_WIDTH / 2, yPos);
  yPos += 50;

  // 獎金區域
  const prizeY = yPos;
  const prizeBoxWidth = 300;
  const prizeBoxHeight = 60;
  const prizeBoxX = (CANVAS_WIDTH - prizeBoxWidth) / 2;

  // 獎金背景
  ctx.fillStyle = employeeData.fortune.isSpecial ? COLORS.gold : COLORS.red;
  ctx.beginPath();
  ctx.roundRect(prizeBoxX, prizeY, prizeBoxWidth, prizeBoxHeight, 10);
  ctx.fill();

  // 獎金文字
  ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
  ctx.fillStyle = 'white';
  const prizeText = employeeData.fortune.isSpecial
    ? `特獎 $${employeeData.fortune.specialPrize.toLocaleString()}`
    : `普獎 $${employeeData.fortune.prize}`;
  ctx.fillText(prizeText, CANVAS_WIDTH / 2, prizeY + 42);
  yPos += 90;

  // 底部資訊
  ctx.font = '22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.brown;
  ctx.fillText(`編號 ${employeeData.id}`, CANVAS_WIDTH / 2, yPos);
  yPos += 30;

  // KONST AI Logo 區域
  ctx.font = 'bold 28px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.darkRed;
  ctx.fillText('KONST AI', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);

  ctx.font = '20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = COLORS.brown;
  ctx.fillText('2026 尾牙 • AI 個性靈籤', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);

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
export function printImage(dataUrl) {
  const printWindow = window.open('', '', 'width=800,height=1200');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KONST AI 籤詩</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

// 心情分析結果
export const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊', label: '開心愉快', desc: '今天心情超好！' },
  { id: 'calm', emoji: '😌', label: '平靜從容', desc: '內心安定踏實' },
  { id: 'excited', emoji: '🔥', label: '熱血沸騰', desc: '充滿幹勁！' },
  { id: 'tired', emoji: '😴', label: '有點疲憊', desc: '需要充電中...' },
  { id: 'confused', emoji: '🤔', label: '有點迷茫', desc: '在思考人生方向' },
  { id: 'neutral', emoji: '😐', label: '普普通通', desc: '平凡的一天' },
];
