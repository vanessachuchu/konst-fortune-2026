// OpenAI API 整合
// API 文檔: https://platform.openai.com/docs/api-reference

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * 使用 Grok AI 生成穿搭建議（純文字）
 */
export async function generateStyleWithGrok({ name, adjective, noun }) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API Key 未設定，使用備用方案');
    return { suggestion: getDefaultSuggestion(adjective, noun) };
  }

  const prompt = `你是一位時尚顧問，請為這位「${adjective}${noun}」風格的員工提供尾牙派對穿搭建議。

員工特徵：「${adjective}${noun}」
場合：公司尾牙派對（半正式場合）

請提供簡潔的穿搭建議（50-80字），包含：
1. 服裝風格建議
2. 顏色搭配
3. 一個配件建議

語氣要輕鬆友善，用繁體中文回答。直接給出建議，不要有開頭的客套話。`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API 錯誤:', errorData);
      throw new Error(`OpenAI API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices[0].message.content.trim();

    return { suggestion };
  } catch (error) {
    console.error('OpenAI 穿搭建議生成失敗:', error);
    return { suggestion: getDefaultSuggestion(adjective, noun) };
  }
}

/**
 * 使用 OpenAI Vision API 評估穿搭符合度
 * @param {string} photoDataUrl - 照片的 base64 data URL
 * @param {string} styleSuggestion - AI 生成的穿搭建議
 * @param {string} adjective - 形容詞
 * @param {string} noun - 名詞
 * @returns {Promise<{score: number, feedback: string}>} 評分結果（0-100分）和評語
 */
export async function evaluateStyleMatch({ photoDataUrl, styleSuggestion, adjective, noun }) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API Key 未設定，使用本地評分');
    return generateLocalScore(adjective, noun);
  }

  const prompt = `你是一位專業的時尚評審，請根據以下資訊評估這位員工的穿搭符合度：

員工特質：「${adjective}${noun}」
AI 建議的穿搭風格：${styleSuggestion}

請仔細觀察照片中的穿搭，並給出 0-100 分的評分。

評分標準：
- 85分以上：完美符合建議，獲得「AI 時尚大獎」🏆
- 70-84分：符合度高，穿搭得體
- 50-69分：基本符合，有改進空間
- 50分以下：與建議差距較大

請以 JSON 格式回應（只回傳 JSON）：
{
  "score": 分數 (0-100),
  "feedback": "30-50字的評語，說明符合或不符合的地方"
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: photoDataUrl,
                  detail: 'low' // 使用低解析度以節省成本
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI Vision API 錯誤:', errorData);
      throw new Error(`OpenAI API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 解析 JSON
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(0, Math.min(100, result.score)), // 確保分數在 0-100 之間
        feedback: result.feedback || '穿搭符合度良好'
      };
    }

    throw new Error('無法解析 OpenAI 回應');
  } catch (error) {
    console.error('OpenAI 穿搭評分失敗:', error);
    return generateLocalScore(adjective, noun);
  }
}

/**
 * 本地評分（當 API 不可用時）
 */
function generateLocalScore(adjective, noun) {
  // 根據形容詞給予不同分數範圍
  const scoreRanges = {
    '熱血': { min: 75, max: 95 },
    '佛系': { min: 70, max: 85 },
    '躺平': { min: 60, max: 75 },
    '斜槓': { min: 75, max: 90 },
    '內捲': { min: 70, max: 88 },
    '社恐': { min: 65, max: 80 },
    '社牛': { min: 80, max: 95 },
    '早鳥': { min: 72, max: 87 },
  };

  const range = scoreRanges[adjective] || { min: 65, max: 85 };
  const score = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  const feedbacks = [
    `你的${adjective}${noun}風格展現得很好，穿搭符合建議！`,
    `整體搭配不錯，${adjective}的特質有表現出來。`,
    `你的穿著與${adjective}${noun}的風格相當契合。`,
    `很有個人特色，符合${adjective}${noun}的形象。`,
  ];

  return {
    score,
    feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
  };
}

/**
 * 使用 Grok AI 生成籤詩內容
 */
export async function generateFortuneWithGrok({ name, adjective, noun, wish }) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API Key 未設定，使用本地生成');
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
4. 必須是有效的 JSON 格式`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 錯誤: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 嘗試解析 JSON
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('無法解析 OpenAI 回應');
  } catch (error) {
    console.error('OpenAI 籤詩生成失敗:', error);
    return generateLocalFortune({ name, adjective, noun, wish });
  }
}

/**
 * 獲取預設穿搭建議文字
 */
function getDefaultSuggestion(adjective, noun) {
  const suggestions = {
    '熱血': '建議穿著亮色系襯衫搭配深色西裝外套，展現活力與專業並重的形象。配件可選紅色領帶或胸針，讓整體造型更有精神。',
    '佛系': '建議穿著米白色或淺灰色系服裝，簡約大方，散發從容自在的氣質。搭配簡約手錶或素色圍巾更顯質感。',
    '躺平': '建議穿著舒適的針織衫或休閒西裝，柔和色調讓人感到親切放鬆。舒適的皮鞋或乾淨的帆布鞋都很適合！',
    '斜槓': '建議穿著有設計感的單品混搭，展現多元風格和獨特品味。大膽的配飾如特色手錶或設計師眼鏡是加分項。',
    '內捲': '建議穿著深色正裝搭配精緻配件，展現專業幹練的職場形象。袖扣或領帶夾很加分，展現對細節的講究。',
    '社恐': '建議穿著低調有質感的深色系服裝，搭配特色小配件展現個性。無線耳機掛脖或簡約項鍊都很潮！',
    '社牛': '建議穿著亮眼的派對服裝，大膽配色讓你成為全場焦點。閃亮配件或特色領結絕對不能少！',
  };
  return suggestions[adjective] || '建議穿著舒適得體的服裝，展現最好的自己。搭配一件有個人風格的配件，讓造型更有記憶點。';
}

/**
 * 本地生成籤詩（當 API 不可用時的備用方案）
 */
function generateLocalFortune({ name, adjective, noun, wish }) {
  const fortuneStyles = {
    '熱血': { level: '上上籤', theme: 'passion', color: '紅色' },
    '斜槓': { level: '上籤', theme: 'versatile', color: '金色' },
    '內捲': { level: '中上籤', theme: 'hardwork', color: '藍色' },
    '佛系': { level: '上籤', theme: 'calm', color: '白色' },
    '躺平': { level: '中籤', theme: 'relax', color: '綠色' },
    '社恐': { level: '中上籤', theme: 'introvert', color: '紫色' },
    '社牛': { level: '上上籤', theme: 'social', color: '橙色' },
    '早鳥': { level: '上籤', theme: 'diligent', color: '黃色' },
    'default': { level: '中上籤', theme: 'neutral', color: '銀色' },
  };

  const style = fortuneStyles[adjective] || fortuneStyles['default'];

  const poems = {
    passion: '熱血滿腔志氣高，乘風破浪展英豪。\n蛇年運轉添新氣，事業騰飛步步高。',
    versatile: '斜槓人生路寬廣，多元發展創輝煌。\n蛇行曲徑通幽處，條條大路任君闖。',
    hardwork: '辛勤耕耘終有報，默默付出見成效。\n蛇年轉運迎新機，苦盡甘來春意鬧。',
    calm: '心如止水映明月，萬事隨緣自安然。\n蛇年清靜福自來，無為而治得周全。',
    relax: '閒雲野鶴任逍遙，不爭不搶亦不躁。\n蛇年悠然見南山，知足常樂最重要。',
    introvert: '獨處靜思有深意，內斂光華終綻放。\n蛇年貴人來相助，默默發力最芬芳。',
    social: '廣結善緣路路通，八方來財樂融融。\n蛇年人脈更精進，逢人便是好運逢。',
    diligent: '晨起早行多得利，勤勞致富不是虛。\n蛇年先發占先機，早起的鳥有蟲吃。',
    neutral: '穩紮穩打基礎牢，循序漸進步步高。\n蛇年平安是福氣，順心如意樂逍遙。',
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

  const levelDescs = {
    '上上籤': '大吉大利',
    '上籤': '萬事亨通',
    '中上籤': '漸入佳境',
    '中籤': '平安順遂',
    '中下籤': '先苦後甘',
  };

  return {
    level: style.level,
    levelDesc: levelDescs[style.level] || '平安是福',
    mainPoem: poems[style.theme] || poems.neutral,
    interpretation: interpretations[style.theme] || interpretations.neutral,
    luckyItem: luckyItems[style.theme] || luckyItems.neutral,
    luckyColor: style.color,
    advice: advice[style.theme] || advice.neutral,
  };
}

export default generateFortuneWithGrok;
