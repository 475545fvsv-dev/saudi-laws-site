const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  // السماح بطلبات OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // السماح بـ POST فقط
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method Not Allowed"
      })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const question = String(body.question || "").trim();

    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "لم يتم إرسال السؤال"
        })
      };
    }

    // مسار قاعدة البيانات القانونية
    const lawPath = path.join(
      process.cwd(),
      "data",
      "laws",
      "nizam-mukafahat-alihtiyal-almali-wa-khiyanat-alamana.json"
    );

    // التأكد من وجود الملف
    if (!fs.existsSync(lawPath)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "ملف النظام القانوني غير موجود في المسار المحدد"
        })
      };
    }

    // قراءة النظام
    const file = fs.readFileSync(lawPath, "utf8");
    const articles = JSON.parse(file);

    // تطبيع النص العربي
    function normalize(text) {
      return String(text || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/[إأآا]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[^\u0600-\u06FF0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    const normalizedQuestion = normalize(question);

    // كلمات لا نحتاج البحث عنها
    const stopWords = [
      "ما",
      "هي",
      "هو",
      "هل",
      "من",
      "في",
      "على",
      "عن",
      "الى",
      "إلى",
      "مع",
      "هذا",
      "هذه",
      "ذلك",
      "تلك",
      "و",
      "او",
      "أو",
      "وما",
      "وهي",
      "التي",
      "الذي",
      "كيف",
      "كم",
      "متى",
      "أين",
      "ماهي",
      "ماهي",
      "السعودية"
    ];

    // استخراج الكلمات المهمة
    const keywords = normalizedQuestion
      .split(/\s+/)
      .filter(word => word.length >= 3)
      .filter(word => !stopWords.includes(word));

    // البحث بدرجات تطابق
    const results = articles
      .map(article => {
        const articleText = normalize(article.article_text);

        let score = 0;
        let matchedKeywords = [];

        keywords.forEach(keyword => {
          if (articleText.includes(keyword)) {
            score += 1;
            matchedKeywords.push(keyword);
          }
        });

        return {
          article,
          score,
          matchedKeywords
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    // أفضل النتائج
    const topResults = results.slice(0, 5);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        question: question,
        law_name: "نظام مكافحة الاحتيال المالي وخيانة الأمانة",
        total_articles: articles.length,
        matched_articles: topResults.map(result => ({
          article_number: result.article.article_number,
          article_text: result.article.article_text,
          matched_keywords: result.matchedKeywords,
          score: result.score
        }))
      })
    };

  } catch (error) {

    console.error("Search error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "حدث خطأ أثناء البحث في النظام",
        details: error.message
      })
    };
  }
};
