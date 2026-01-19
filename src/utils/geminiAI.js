// Gemini AI 整合 - 生成籤詩內容和穿搭圖片
// 使用 Google Gemini API

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAqXTQmUtPX716L0LgsqvDSxr4cEjdVICQ';

/**
 * 使用 Gemini AI 生成穿搭建議圖片
 * @param {Object} params - 參數
 * @param {string} params.name - 員工姓名
 * @param {string} params.adjective - 形容詞
 * @param {string} params.noun - 名詞
 * @returns {Promise<Object>} - { imageUrl: string, suggestion: string }
 */
export async function generateStyleImageWithGemini({ name, adjective, noun }) {
  if (!GEMINI_API_KEY) {
    console.log('Gemini API Key 未設定，使用備用方案');
    return { imageUrl: null, suggestion: getDefaultSuggestion(adjective, noun) };
  }

  const prompt = `Generate a fashion outfit illustration for a company year-end party.

Character style: "${adjective}${noun}" personality
Occasion: Corporate year-end party (semi-formal)

Requirements:
- Full body fashion illustration style
- Clean, modern aesthetic
- Outfit suitable for "${adjective}${noun}" personality
- White or light gradient background
- No detailed facial features (stylized/abstract face is fine)
- Professional yet trendy outfit
- High quality fashion illustration

Style: Modern fashion illustration, clean lines, elegant`;

  // 重試機制：最多重試 2 次，每次間隔增加
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 如果不是第一次嘗試，等待一段時間
      if (attempt > 0) {
        const waitTime = attempt * 2000; // 2秒、4秒
        console.log(`Gemini API 重試中... (等待 ${waitTime/1000} 秒)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      });

      // 處理 429 錯誤（太多請求）
      if (response.status === 429) {
        console.warn(`Gemini API 429 錯誤 (嘗試 ${attempt + 1}/${maxRetries + 1})`);
        lastError = new Error('API 請求過於頻繁');
        continue; // 重試
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini Image API 錯誤:', errorData);
        throw new Error(`Gemini Image API 錯誤: ${response.status}`);
      }

      const data = await response.json();

      // 從回應中提取圖片和文字
      let imageUrl = null;
      let suggestion = getDefaultSuggestion(adjective, noun);

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts;
        for (const part of parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } else if (part.text) {
            suggestion = part.text;
          }
        }
      }

      return { imageUrl, suggestion };
    } catch (error) {
      console.error(`Gemini 圖片生成失敗 (嘗試 ${attempt + 1}):`, error);
      lastError = error;
    }
  }

  // 所有重試都失敗，返回備用方案
  console.warn('Gemini API 重試耗盡，使用備用方案');
  return { imageUrl: null, suggestion: getDefaultSuggestion(adjective, noun) };
}

/**
 * 獲取預設穿搭建議文字
 */
function getDefaultSuggestion(adjective, noun) {
  const suggestions = {
    '熱血': '建議穿著亮色系襯衫搭配深色西裝外套，展現活力與專業並重的形象。',
    '佛系': '建議穿著米白色或淺灰色系服裝，簡約大方，散發從容自在的氣質。',
    '躺平': '建議穿著舒適的針織衫或休閒西裝，柔和色調讓人感到親切放鬆。',
    '斜槓': '建議穿著有設計感的單品混搭，展現多元風格和獨特品味。',
    '內捲': '建議穿著深色正裝搭配精緻配件，展現專業幹練的職場形象。',
    '社恐': '建議穿著低調有質感的深色系服裝，搭配特色小配件展現個性。',
    '社牛': '建議穿著亮眼的派對服裝，大膽配色讓你成為全場焦點。',
  };
  return suggestions[adjective] || '建議穿著舒適得體的服裝，展現最好的自己。';
}

/**
 * 使用 Gemini AI 生成籤詩內容
 * @param {Object} params - 參數
 * @param {string} params.name - 員工姓名
 * @param {string} params.adjective - 形容詞
 * @param {string} params.noun - 名詞
 * @param {string} params.wish - 願望
 * @returns {Promise<Object>} - 籤詩內容
 */
export async function generateFortuneWithGemini({ name, adjective, noun, wish }) {
  // 如果沒有 API Key，使用本地生成
  if (!GEMINI_API_KEY) {
    console.log('Gemini API Key 未設定，使用本地生成');
    return generateLocalFortune({ name, adjective, noun, wish });
  }

  const prompt = `你是一位專精於傳統籤詩和現代人生哲學的 AI 智者。
請為以下這位員工生成一個專屬的2026年運勢籤詩：

員工資訊：
- 姓名：${name}
- 自我形容：${adjective}${noun}
- 2026年願望：${wish || '順利平安'}

請生成以下格式的 JSON 回應（只回傳 JSON，不要其他文字）：
{
  "level": "上上籤/上籤/中上籤/中籤/中下籤",
  "levelDesc": "對應等級的吉祥描述（如：大吉大利、萬事亨通等）",
  "mainPoem": "四句七言詩，符合該員工的形容詞+名詞特質，押韻",
  "interpretation": "解籤文字，結合員工的形容詞+名詞和願望，給出具體、正面的指引（50-80字）",
  "luckyItem": "幸運物品（1個，與員工特質相關）",
  "luckyColor": "幸運顏色（1個）",
  "advice": "一句話建議（針對該員工的特質給出的實用建議）"
}

要求：
1. 籤詩內容要結合「${adjective}${noun}」的特質
2. 解籤要正面、具體，與願望「${wish || '順利平安'}」相關
3. 語言風格：傳統籤詩的韻味 + 現代職場的實用性
4. 必須是有效的 JSON 格式，不要包含 markdown 代碼塊`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API 錯誤: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // 嘗試解析 JSON（移除可能的 markdown 代碼塊標記）
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('無法解析 Gemini 回應');
  } catch (error) {
    console.error('Gemini AI 生成失敗:', error);
    // 回退到本地生成
    return generateLocalFortune({ name, adjective, noun, wish });
  }
}

/**
 * 本地生成籤詩（當 API 不可用時的備用方案）
 */
function generateLocalFortune({ name, adjective, noun, wish }) {
  // 根據形容詞+名詞組合決定籤詩風格
  const fortuneStyles = {
    // 熱血系
    '熱血': { level: '上上籤', theme: 'passion', color: '紅色' },
    '斜槓': { level: '上籤', theme: 'versatile', color: '金色' },
    '內捲': { level: '中上籤', theme: 'hardwork', color: '藍色' },
    // 佛系
    '佛系': { level: '上籤', theme: 'calm', color: '白色' },
    '躺平': { level: '中籤', theme: 'relax', color: '綠色' },
    '社恐': { level: '中上籤', theme: 'introvert', color: '紫色' },
    // 活力系
    '社牛': { level: '上上籤', theme: 'social', color: '橙色' },
    '早鳥': { level: '上籤', theme: 'diligent', color: '黃色' },
    // 默認
    'default': { level: '中上籤', theme: 'neutral', color: '銀色' },
  };

  const style = fortuneStyles[adjective] || fortuneStyles['default'];

  // 預設籤詩庫 - 根據主題選擇
  const poems = {
    passion: [
      '熱血滿腔志氣高，乘風破浪展英豪。',
      '蛇年運轉添新氣，事業騰飛步步高。'
    ],
    versatile: [
      '斜槓人生路寬廣，多元發展創輝煌。',
      '蛇行曲徑通幽處，條條大路任君闖。'
    ],
    hardwork: [
      '辛勤耕耘終有報，默默付出見成效。',
      '蛇年轉運迎新機，苦盡甘來春意鬧。'
    ],
    calm: [
      '心如止水映明月，萬事隨緣自安然。',
      '蛇年清靜福自來，無為而治得周全。'
    ],
    relax: [
      '閒雲野鶴任逍遙，不爭不搶亦不躁。',
      '蛇年悠然見南山，知足常樂最重要。'
    ],
    introvert: [
      '獨處靜思有深意，內斂光華終綻放。',
      '蛇年貴人來相助，默默發力最芬芳。'
    ],
    social: [
      '廣結善緣路路通，八方來財樂融融。',
      '蛇年人脈更精進，逢人便是好運逢。'
    ],
    diligent: [
      '晨起早行多得利，勤勞致富不是虛。',
      '蛇年先發占先機，早起的鳥有蟲吃。'
    ],
    neutral: [
      '穩紮穩打基礎牢，循序漸進步步高。',
      '蛇年平安是福氣，順心如意樂逍遙。'
    ],
  };

  const interpretations = {
    passion: `${adjective}${noun}的你，2026蛇年熱情如火！工作上將有重大突破，把握機會展現實力。${wish ? `你的願望「${wish}」指日可待，` : ''}保持初心，成功在望。`,
    versatile: `身為${adjective}${noun}，你的多元才能在蛇年將大放異彩。${wish ? `關於「${wish}」的心願，` : ''}多方嘗試終會找到最適合的道路。`,
    hardwork: `${adjective}${noun}的付出終將被看見！蛇年是你收穫的時刻，${wish ? `「${wish}」的願望` : '你的努力'}將化為甜美果實。`,
    calm: `${adjective}${noun}的你深諳以靜制動之道。蛇年保持平常心，${wish ? `「${wish}」` : '所求之事'}自然水到渠成。`,
    relax: `作為${adjective}${noun}，你懂得生活的真諦。蛇年適度放鬆反而帶來好運，${wish ? `「${wish}」的心願` : '美好的事物'}會在不經意間實現。`,
    introvert: `${adjective}${noun}的你有著深藏的實力。蛇年是你厚積薄發之時，${wish ? `「${wish}」` : '心中所想'}終會實現，耐心等待花開。`,
    social: `${adjective}${noun}的人緣在蛇年更上一層！貴人多助，${wish ? `「${wish}」的夢想` : '事業發展'}將因好人緣而加速實現。`,
    diligent: `${adjective}${noun}的勤勉將在蛇年帶來豐碩回報。早起的鳥兒有蟲吃，${wish ? `「${wish}」` : '你的目標'}即將達成。`,
    neutral: `${adjective}${noun}的你在蛇年穩中求進。踏實前行，${wish ? `「${wish}」的願望` : '心中所求'}將逐步實現。`,
  };

  const luckyItems = {
    passion: '紅色手環',
    versatile: '多功能筆記本',
    hardwork: '咖啡杯',
    calm: '白水晶',
    relax: '綠植盆栽',
    introvert: '耳機',
    social: '名片夾',
    diligent: '鬧鐘',
    neutral: '蛇年吊飾',
  };

  const advice = {
    passion: '保持熱情，但記得適時休息充電',
    versatile: '專注核心能力，其他作為加分項',
    hardwork: '效率比時間更重要，聰明地努力',
    calm: '隨緣不是隨便，該把握的要把握',
    relax: '適度躺平無妨，但別忘了站起來的力量',
    introvert: '獨處是充電，但也別錯過重要社交',
    social: '廣結善緣之餘，深耕幾段核心關係',
    diligent: '早起有優勢，但確保睡眠品質',
    neutral: '穩健前行，偶爾也可以小冒險',
  };

  const poemLines = poems[style.theme] || poems.neutral;

  return {
    level: style.level,
    levelDesc: getLevelDesc(style.level),
    mainPoem: poemLines.join('\n'),
    interpretation: interpretations[style.theme] || interpretations.neutral,
    luckyItem: luckyItems[style.theme] || luckyItems.neutral,
    luckyColor: style.color,
    advice: advice[style.theme] || advice.neutral,
  };
}

function getLevelDesc(level) {
  const descs = {
    '上上籤': '大吉大利',
    '上籤': '萬事亨通',
    '中上籤': '漸入佳境',
    '中籤': '平安順遂',
    '中下籤': '先苦後甘',
  };
  return descs[level] || '平安是福';
}

export default generateFortuneWithGemini;
