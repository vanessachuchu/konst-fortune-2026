// 風格圖片生成器
// 根據形容詞+名詞組合配對穿搭風格

// 8 種風格定義
export const STYLE_TYPES = {
  tech: {
    id: 'tech',
    name: '科技潮流',
    description: '深藍+銀灰、智能配飾、未來感',
    colors: ['#1E3A5F', '#C0C0C0', '#00D4FF'],
    keywords: ['熱血', '工程師', '斜槓', 'Coder', '程式', '技術'],
    suggestion: '建議搭配深藍色襯衫或polo衫，配上銀灰色外套，展現專業科技感',
    emoji: '💻',
  },
  minimal: {
    id: 'minimal',
    name: '簡約自然',
    description: '白色+米色、棉麻質感、清新舒適',
    colors: ['#FFFFFF', '#F5F5DC', '#D4C4A8'],
    keywords: ['佛系', '設計師', '文青', '藝術', '創意'],
    suggestion: '建議穿著白色或米色系服裝，簡單大方，展現從容氣質',
    emoji: '🌿',
  },
  sporty: {
    id: 'sporty',
    name: '活力運動',
    description: '亮色系、運動風、青春活力',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
    keywords: ['社牛', '早鳥', '健身', '運動', '活力'],
    suggestion: '建議穿著亮色系polo衫或休閒T恤，展現活潑開朗的個性',
    emoji: '🏃',
  },
  elegant: {
    id: 'elegant',
    name: '優雅知性',
    description: '深色西裝、俐落剪裁、專業形象',
    colors: ['#2C3E50', '#34495E', '#ECF0F1'],
    keywords: ['內捲', '主管', '專業', '領導', '菁英'],
    suggestion: '建議穿著深色西裝外套，搭配白色襯衫，展現專業權威感',
    emoji: '👔',
  },
  casual: {
    id: 'casual',
    name: '休閒舒適',
    description: '針織衫、柔和色調、放鬆自在',
    colors: ['#A0522D', '#DEB887', '#F5DEB3'],
    keywords: ['躺平', '爆肝', '打工人', '上班族', '社畜'],
    suggestion: '建議穿著舒適的針織衫或衛衣，柔和色系讓人感到親切',
    emoji: '🛋️',
  },
  cool: {
    id: 'cool',
    name: '個性潮酷',
    description: '黑色+螢光、街頭風、獨特個性',
    colors: ['#000000', '#39FF14', '#FF00FF'],
    keywords: ['社恐', '夜貓子', '獨立', '個性', '叛逆'],
    suggestion: '建議穿著黑色為主的服裝，可加入螢光色配飾，展現獨特風格',
    emoji: '🖤',
  },
  vintage: {
    id: 'vintage',
    name: '復古文藝',
    description: '格紋、復古配色、文藝氣息',
    colors: ['#8B4513', '#CD853F', '#D2691E'],
    keywords: ['貓奴', '吃貨', '小資族', '文青', '復古'],
    suggestion: '建議穿著格紋襯衫或復古色系服裝，展現文藝氣質',
    emoji: '📚',
  },
  glamour: {
    id: 'glamour',
    name: '華麗閃耀',
    description: '亮片、金屬色系、派對焦點',
    colors: ['#FFD700', '#C0C0C0', '#FF69B4'],
    keywords: ['網美', '時尚', '公關', '派對', '閃耀'],
    suggestion: '建議穿著帶有亮片或金屬光澤的服裝，成為全場焦點',
    emoji: '✨',
  },
};

// 關鍵詞權重映射
const KEYWORD_WEIGHTS = {
  // 形容詞
  '熱血': { tech: 3, sporty: 2 },
  '佛系': { minimal: 3, casual: 2 },
  '斜槓': { tech: 2, cool: 2 },
  '爆肝': { casual: 3, cool: 1 },
  '躺平': { casual: 3, minimal: 1 },
  '內捲': { elegant: 3, tech: 1 },
  '社恐': { cool: 3, minimal: 1 },
  '社牛': { sporty: 3, glamour: 2 },

  // 名詞
  '工程師': { tech: 3, casual: 1 },
  '設計師': { minimal: 3, cool: 2 },
  '小資族': { vintage: 2, casual: 2 },
  '打工人': { casual: 3, vintage: 1 },
  '吃貨': { vintage: 2, casual: 2 },
  '貓奴': { vintage: 3, minimal: 1 },
  '夜貓子': { cool: 3, casual: 1 },
  '早鳥': { sporty: 3, elegant: 1 },

  // 其他可能的詞
  '主管': { elegant: 3 },
  '文青': { minimal: 2, vintage: 2 },
  '網美': { glamour: 3 },
  '健身': { sporty: 3 },
  'Coder': { tech: 3, cool: 1 },
};

/**
 * 根據形容詞和名詞計算最適合的風格
 */
export function calculateStyle(adjective, noun) {
  const scores = {};

  // 初始化所有風格分數
  Object.keys(STYLE_TYPES).forEach(key => {
    scores[key] = 0;
  });

  // 計算形容詞權重
  if (KEYWORD_WEIGHTS[adjective]) {
    Object.entries(KEYWORD_WEIGHTS[adjective]).forEach(([style, weight]) => {
      scores[style] += weight;
    });
  }

  // 計算名詞權重
  if (KEYWORD_WEIGHTS[noun]) {
    Object.entries(KEYWORD_WEIGHTS[noun]).forEach(([style, weight]) => {
      scores[style] += weight;
    });
  }

  // 如果沒有匹配的關鍵詞，使用模糊匹配
  if (Object.values(scores).every(s => s === 0)) {
    // 根據字面意思猜測
    const phrase = adjective + noun;
    Object.entries(STYLE_TYPES).forEach(([key, style]) => {
      style.keywords.forEach(keyword => {
        if (phrase.includes(keyword) || keyword.includes(adjective) || keyword.includes(noun)) {
          scores[key] += 1;
        }
      });
    });
  }

  // 如果還是沒有分數，給一個預設風格
  if (Object.values(scores).every(s => s === 0)) {
    scores.casual = 1; // 預設休閒舒適
  }

  // 找出最高分的風格
  const maxScore = Math.max(...Object.values(scores));
  const topStyles = Object.entries(scores)
    .filter(([, score]) => score === maxScore)
    .map(([key]) => key);

  // 如果有多個同分，隨機選一個
  const selectedStyleKey = topStyles[Math.floor(Math.random() * topStyles.length)];

  return STYLE_TYPES[selectedStyleKey];
}

/**
 * 生成風格建議卡片（Canvas 圖片）
 */
export async function generateStyleCard(name, adjective, noun, style) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // 背景漸層
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, style.colors[0]);
  gradient.addColorStop(0.5, style.colors[1] || style.colors[0]);
  gradient.addColorStop(1, style.colors[2] || style.colors[0]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 半透明疊加層
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

  // 邊框
  ctx.strokeStyle = style.colors[0];
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // 標題
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText('KONST AI 尾牙穿搭建議', canvas.width / 2, 100);

  // 風格 Emoji
  ctx.font = '80px Arial';
  ctx.fillText(style.emoji, canvas.width / 2, 200);

  // 風格名稱
  ctx.font = 'bold 36px "Noto Sans TC", sans-serif';
  ctx.fillStyle = style.colors[0];
  ctx.fillText(style.name, canvas.width / 2, 280);

  // 風格描述
  ctx.font = '20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText(style.description, canvas.width / 2, 320);

  // 分隔線
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(canvas.width - 80, 360);
  ctx.stroke();

  // 員工資訊
  ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText(`${name}`, canvas.width / 2, 410);

  ctx.font = '22px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText(`「${adjective}${noun}」`, canvas.width / 2, 450);

  // 穿搭建議
  ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
  ctx.fillStyle = style.colors[0];
  ctx.fillText('穿搭建議', canvas.width / 2, 510);

  // 建議文字（自動換行）
  ctx.font = '18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#444';
  const suggestion = style.suggestion;
  const maxWidth = canvas.width - 120;
  const words = suggestion.split('');
  let line = '';
  let y = 550;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, canvas.width / 2, y);
      line = words[i];
      y += 30;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // 配色展示
  const colorBoxY = 680;
  const colorBoxSize = 40;
  const colorBoxGap = 20;
  const totalWidth = style.colors.length * colorBoxSize + (style.colors.length - 1) * colorBoxGap;
  let colorX = (canvas.width - totalWidth) / 2;

  ctx.font = '14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('建議配色', canvas.width / 2, colorBoxY - 15);

  style.colors.forEach(color => {
    ctx.fillStyle = color;
    ctx.fillRect(colorX, colorBoxY, colorBoxSize, colorBoxSize);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(colorX, colorBoxY, colorBoxSize, colorBoxSize);
    colorX += colorBoxSize + colorBoxGap;
  });

  // 底部
  ctx.font = '14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = '#999';
  ctx.fillText('KONST AI 2026 尾牙', canvas.width / 2, canvas.height - 60);

  return canvas.toDataURL('image/png');
}

/**
 * 獲取風格資訊（不生成圖片）
 */
export function getStyleInfo(adjective, noun) {
  return calculateStyle(adjective, noun);
}

/**
 * 所有風格列表
 */
export function getAllStyles() {
  return Object.values(STYLE_TYPES);
}
