// openai.js — OpenAI API integration for test generation and AI explanations

const OpenAI = {
  getKey() {
    return DB.get('openai_key') || '';
  },
  setKey(key) {
    DB.set('openai_key', key);
  },

  async chat(messages) {
    const key = this.getKey();
    if (!key) throw new Error('OpenAI API кілті орнатылмаған. Баптаулардан кілтті енгізіңіз.');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key, messages })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `OpenAI қатесі: ${res.status}`);
    }
    return data.choices[0].message.content;
  },

  async extractTextFromPDF(url) {
    const pdf = await pdfjsLib.getDocument(url).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.trim();
  },

  async generateTest(pdfUrl, numQuestions) {
    const text = await this.extractTextFromPDF(pdfUrl);
    if (text.length < 50) throw new Error('PDF файлынан мәтін алу мүмкін болмады. Файл суреттерден тұруы мүмкін.');

    const trimmed = text.substring(0, 8000);
    const prompt = `Сен оқытушының көмекшісісің. Берілген лекция мәтіні бойынша ${numQuestions} тест сұрағын жаса.

Лекция мәтіні:
"""
${trimmed}
"""

Жауапты тек JSON форматында бер, басқа мәтін жазба:
[
  {
    "q": "Сұрақ мәтіні",
    "opts": ["Нұсқа A", "Нұсқа B", "Нұсқа C", "Нұсқа D"],
    "answer": 0
  }
]

Ережелер:
- Әр сұрақта 4 нұсқа болсын
- "answer" — дұрыс жауаптың индексі (0-3)
- Сұрақтар лекция мазмұнына негізделсін
- Сұрақтар қазақ тілінде болсын
- Тек JSON қайтар, басқа мәтін жазба`;

    const response = await this.chat([{ role: 'user', content: prompt }]);

    // Extract JSON from response
    let json = response;
    const match = response.match(/\[[\s\S]*\]/);
    if (match) json = match[0];

    try {
      const questions = JSON.parse(json);
      if (!Array.isArray(questions) || questions.length === 0) throw new Error('Бос');
      return questions.map(q => ({
        q: q.q,
        opts: q.opts.slice(0, 4),
        answer: typeof q.answer === 'number' ? q.answer : 0
      }));
    } catch (e) {
      throw new Error('ИИ жауабын өңдеу мүмкін болмады. Қайталап көріңіз.');
    }
  },

  async explainAnswer(question, userAnswer, correctAnswer) {
    const prompt = `Студент тест тапсырып жатыр. Ол қате жауап берді. Оған неліктен жауабы қате екенін және дұрыс жауапты түсіндір.

Сұрақ: ${question.q}
Нұсқалар: ${question.opts.map((o, i) => `${i + 1}) ${o}`).join(', ')}
Студенттің жауабы: ${userAnswer} (${question.opts[userAnswer]})
Дұрыс жауап: ${correctAnswer + 1} (${question.opts[correctAnswer]})

Қысқа және түсінікті түсіндір (3-5 сөйлем). Қазақ тілінде жаз.`;

    return await this.chat([{ role: 'user', content: prompt }]);
  }
};
