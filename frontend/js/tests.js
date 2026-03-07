// tests.js — Tests & quizzes with AI generation and explanations

const Tests = {
  renderTeacher() {
    const tests = DB.get('tests') || [];
    const groups = DB.get('groups') || [];
    const results = DB.get('results') || [];
    const materials = DB.get('materials') || [];

    let html = `<div class="tests-section"><h2>Тесты и задания</h2>

    <!-- AI Auto-generate section -->
    <div class="card form-card" style="border-left:4px solid #8b5cf6;">
      <h3>🤖 Автогенерация теста из лекции (ИИ)</h3>
      <form id="aiGenerateForm">
        <label>Лекцияны таңдаңыз:</label>
        <select id="aiLecture" required>
          <option value="">-- Лекция таңдаңыз --</option>
          ${materials.map(m => `<option value="${m.url}">${m.title}</option>`).join('')}
        </select>
        <label>Сұрақтар саны:</label>
        <select id="aiNumQuestions">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
        <input type="text" id="aiTestTitle" placeholder="Тест атауы (бос қалдырсаңыз автоматты жасалады)">
        <div class="checkbox-group">
          <label><strong>Группы:</strong></label>
          ${groups.map(g => `<label><input type="checkbox" name="aiGroups" value="${g.id}"> ${g.name}</label>`).join('')}
        </div>
        <button type="submit" class="btn btn-primary" id="aiGenerateBtn" style="background:#8b5cf6;">🤖 Тест жасау (ИИ)</button>
        <div id="aiStatus" style="margin-top:10px;display:none;"></div>
      </form>
    </div>

    <!-- Manual create section -->
    <div class="card form-card">
      <h3>Создать тест вручную</h3>
      <form id="createTestForm">
        <input type="text" id="testTitle" placeholder="Название теста" required>
        <div class="checkbox-group">
          <label><strong>Группы:</strong></label>
          ${groups.map(g => `<label><input type="checkbox" name="testGroups" value="${g.id}"> ${g.name}</label>`).join('')}
        </div>
        <div id="questionsContainer">
          <h4>Вопросы</h4>
        </div>
        <button type="button" class="btn btn-secondary" id="addQuestionBtn">+ Добавить вопрос</button>
        <button type="submit" class="btn btn-primary" style="margin-top:1rem">Создать тест</button>
      </form>
    </div>
    <h3>Существующие тесты</h3>`;

    if (tests.length === 0) {
      html += '<p class="empty-state">Тестов пока нет</p>';
    }
    tests.forEach(t => {
      const testResults = results.filter(r => r.testId === t.id);
      html += `
      <div class="card">
        <div class="card-header">
          <h4>${t.title}</h4>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-sm" onclick="Tests.editTest('${t.id}')" style="background:#8b5cf6;color:#fff;">Өңдеу</button>
            <button class="btn btn-danger btn-sm" onclick="Tests.delete('${t.id}')">Удалить</button>
          </div>
        </div>
        <p>${t.questions.length} вопрос(ов) · Группы: ${t.groupIds.map(gid => (groups.find(g=>g.id===gid)||{}).name || gid).join(', ')}</p>
        ${testResults.length > 0 ? `
        <details><summary>Результаты (${testResults.length})</summary>
          <table class="results-table">
            <tr><th>Студент</th><th>Балл</th><th>Дата</th></tr>
            ${testResults.map(r => {
              const users = DB.get('users') || [];
              const stu = users.find(u => u.id === r.userId) || {};
              return `<tr><td>${stu.name || 'N/A'}</td><td>${r.score}/${r.total}</td><td>${new Date(r.date).toLocaleDateString('ru')}</td></tr>`;
            }).join('')}
          </table>
        </details>` : '<p class="hint">Результатов пока нет</p>'}
      </div>`;
    });
    html += '</div>';
    return html;
  },

  bindTeacher() {
    // Manual test creation
    let qCount = 0;
    const container = document.getElementById('questionsContainer');
    const addQ = () => {
      qCount++;
      const div = document.createElement('div');
      div.className = 'question-block';
      div.innerHTML = `
        <label>Вопрос ${qCount}</label>
        <input type="text" class="q-text" placeholder="Текст вопроса" required>
        <input type="text" class="q-opt" placeholder="Вариант 1" required>
        <input type="text" class="q-opt" placeholder="Вариант 2" required>
        <input type="text" class="q-opt" placeholder="Вариант 3" required>
        <input type="text" class="q-opt" placeholder="Вариант 4" required>
        <select class="q-answer">
          <option value="0">Правильный: Вариант 1</option>
          <option value="1">Правильный: Вариант 2</option>
          <option value="2">Правильный: Вариант 3</option>
          <option value="3">Правильный: Вариант 4</option>
        </select>`;
      container.appendChild(div);
    };
    document.getElementById('addQuestionBtn').addEventListener('click', addQ);
    addQ();

    document.getElementById('createTestForm').addEventListener('submit', e => {
      e.preventDefault();
      const tests = DB.get('tests') || [];
      const groupIds = [...document.querySelectorAll('[name=testGroups]:checked')].map(c => c.value);
      const blocks = document.querySelectorAll('.question-block');
      const questions = [...blocks].map(b => {
        const opts = [...b.querySelectorAll('.q-opt')].map(i => i.value);
        return { q: b.querySelector('.q-text').value, opts, answer: parseInt(b.querySelector('.q-answer').value) };
      });
      tests.push({ id: 't' + DB.generateId(), title: document.getElementById('testTitle').value, groupIds, questions });
      DB.set('tests', tests);
      App.navigate('teacher-tests');
    });

    // AI test generation
    document.getElementById('aiGenerateForm').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('aiGenerateBtn');
      const status = document.getElementById('aiStatus');
      const lectureUrl = document.getElementById('aiLecture').value;
      const numQ = parseInt(document.getElementById('aiNumQuestions').value);
      const groupIds = [...document.querySelectorAll('[name=aiGroups]:checked')].map(c => c.value);

      if (!lectureUrl) { alert('Лекцияны таңдаңыз'); return; }
      if (groupIds.length === 0) { alert('Кем дегенде бір группаны таңдаңыз'); return; }
      if (!OpenAI.getKey()) { alert('OpenAI API кілтін баптаулардан енгізіңіз!'); return; }

      btn.disabled = true;
      btn.textContent = '⏳ Генерация...';
      status.style.display = 'block';
      status.innerHTML = '<p style="color:#8b5cf6;">📄 PDF файлынан мәтін алынуда...</p>';

      try {
        status.innerHTML = '<p style="color:#8b5cf6;">🤖 ИИ сұрақтар жасап жатыр... Күте тұрыңыз...</p>';
        const questions = await OpenAI.generateTest(lectureUrl, numQ);

        const materials = DB.get('materials') || [];
        const lecture = materials.find(m => m.url === lectureUrl);
        const title = document.getElementById('aiTestTitle').value || `Тест: ${lecture ? lecture.title : 'ИИ тест'}`;

        // Show preview/edit form instead of saving immediately
        Tests._editingTestId = null;
        Tests.showEditPreview(title, groupIds, questions);
      } catch (err) {
        status.innerHTML = `<p style="color:#e74c3c;">❌ Қате: ${err.message}</p>`;
        btn.disabled = false;
        btn.textContent = '🤖 Тест жасау (ИИ)';
      }
    });
  },

  renderStudent() {
    const user = Auth.currentUser();
    const tests = (DB.get('tests') || []).filter(t => t.groupIds.includes(user.groupId));
    const results = (DB.get('results') || []).filter(r => r.userId === user.id);

    let html = '<div class="tests-section"><h2>Менің тесттерім</h2>';
    if (tests.length === 0) {
      html += '<p class="empty-state">Сіздің группаңыз үшін тест жоқ</p>';
    }
    tests.forEach(t => {
      const myResult = results.find(r => r.testId === t.id);
      html += `
      <div class="card">
        <h4>${t.title}</h4>
        <p>${t.questions.length} сұрақ</p>
        ${myResult
          ? `<p class="score">Нәтиже: <strong>${myResult.score}/${myResult.total}</strong> (${Math.round(myResult.score/myResult.total*100)}%)</p>
             <button class="btn btn-secondary btn-sm" onclick="Tests.reviewTest('${t.id}')">📋 Жауаптарды қарау</button>`
          : `<button class="btn btn-primary" onclick="Tests.startTest('${t.id}')">Тестті бастау</button>`}
      </div>`;
    });

    if (results.length > 0) {
      html += '<h3>Нәтижелер тарихы</h3><div class="results-grid">';
      results.forEach(r => {
        const test = (DB.get('tests') || []).find(t => t.id === r.testId);
        html += `<div class="card result-card">
          <strong>${test ? test.title : 'Тест жойылған'}</strong>
          <span class="score">${r.score}/${r.total}</span>
          <span class="date">${new Date(r.date).toLocaleDateString('ru')}</span>
        </div>`;
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  },

  startTest(testId) {
    const test = (DB.get('tests') || []).find(t => t.id === testId);
    if (!test) return;
    const app = document.getElementById('app');
    let html = `<div class="test-taking" style="max-width:800px;margin:20px auto;padding:20px;">
      <h2>${test.title}</h2>
      <form id="takeTestForm">`;
    test.questions.forEach((q, i) => {
      html += `<div class="question-card card" style="margin-bottom:16px;padding:16px;">
        <p><strong>${i + 1}. ${q.q}</strong></p>
        ${q.opts.map((o, j) => `<label class="radio-label" style="display:block;padding:6px 0;cursor:pointer;"><input type="radio" name="q${i}" value="${j}" required> ${o}</label>`).join('')}
      </div>`;
    });
    html += `<button type="submit" class="btn btn-primary">Жіберу</button></form></div>`;
    app.innerHTML = html;

    document.getElementById('takeTestForm').addEventListener('submit', e => {
      e.preventDefault();
      const user = Auth.currentUser();
      let score = 0;
      const answers = [];
      test.questions.forEach((q, i) => {
        const selected = document.querySelector(`[name=q${i}]:checked`);
        const userAnswer = selected ? parseInt(selected.value) : -1;
        const correct = userAnswer === q.answer;
        if (correct) score++;
        answers.push(userAnswer);
      });

      const results = DB.get('results') || [];
      results.push({ testId, userId: user.id, score, total: test.questions.length, date: Date.now(), answers });
      DB.set('results', results);

      // Show results with correct/wrong indicators
      Tests.showResults(test, answers, score);
    });
  },

  showResults(test, userAnswers, score) {
    const app = document.getElementById('app');
    const pct = Math.round(score / test.questions.length * 100);
    const color = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#e74c3c';

    let html = `<div style="max-width:800px;margin:20px auto;padding:20px;">
      <div class="card" style="text-align:center;padding:24px;margin-bottom:20px;border-left:4px solid ${color};">
        <h2>Нәтиже: ${score}/${test.questions.length}</h2>
        <p style="font-size:2rem;color:${color};font-weight:bold;">${pct}%</p>
        <p>${pct >= 70 ? '🎉 Жарайсың!' : pct >= 50 ? '📚 Жақсы, бірақ жақсарту қажет' : '⚠️ Материалды қайта оқу ұсынылады'}</p>
      </div>
      <h3>Сұрақтарды талдау:</h3>`;

    test.questions.forEach((q, i) => {
      const userAns = userAnswers[i];
      const correct = userAns === q.answer;
      const borderColor = correct ? '#22c55e' : '#e74c3c';
      const icon = correct ? '✅' : '❌';

      html += `<div class="card" style="margin-bottom:12px;padding:16px;border-left:4px solid ${borderColor};">
        <p><strong>${icon} ${i + 1}. ${q.q}</strong></p>`;

      q.opts.forEach((o, j) => {
        let style = 'padding:4px 8px;border-radius:4px;margin:2px 0;display:block;';
        if (j === q.answer) style += 'background:#dcfce7;color:#166534;font-weight:bold;';
        else if (j === userAns && !correct) style += 'background:#fef2f2;color:#991b1b;text-decoration:line-through;';
        html += `<span style="${style}">${j === q.answer ? '✓' : j === userAns ? '✗' : '  '} ${o}</span>`;
      });

      if (!correct) {
        html += `<div style="margin-top:8px;">
          <button class="btn btn-sm" onclick="Tests.explainAnswer(${i}, '${test.id}')" id="explainBtn${i}" style="background:#8b5cf6;color:#fff;">🤖 Неліктен? (ИИ түсіндірсін)</button>
          <div id="explanation${i}" style="margin-top:8px;"></div>
        </div>`;
      }
      html += '</div>';
    });

    html += `<button class="btn btn-primary" onclick="App.navigate('student-tests')" style="margin-top:16px;">← Тесттерге оралу</button></div>`;
    app.innerHTML = html;
  },

  async explainAnswer(qIndex, testId) {
    const test = (DB.get('tests') || []).find(t => t.id === testId);
    if (!test) return;
    const q = test.questions[qIndex];
    const results = DB.get('results') || [];
    const user = Auth.currentUser();
    const myResult = results.filter(r => r.testId === testId && r.userId === user.id).pop();
    const userAnswer = myResult ? myResult.answers[qIndex] : -1;

    const btn = document.getElementById(`explainBtn${qIndex}`);
    const div = document.getElementById(`explanation${qIndex}`);
    btn.disabled = true;
    btn.textContent = '⏳ ИИ ойлануда...';
    div.innerHTML = '<p style="color:#888;">Күте тұрыңыз...</p>';

    try {
      const explanation = await OpenAI.explainAnswer(q, userAnswer, q.answer);
      div.innerHTML = `<div style="background:#f3f0ff;border-radius:8px;padding:12px;border:1px solid #ddd6fe;">
        <strong>🤖 ИИ түсіндірмесі:</strong>
        <p style="margin:8px 0 0;white-space:pre-wrap;">${explanation}</p>
      </div>`;
      btn.style.display = 'none';
    } catch (err) {
      div.innerHTML = `<p style="color:#e74c3c;">❌ Қате: ${err.message}</p>`;
      btn.disabled = false;
      btn.textContent = '🤖 Неліктен? (ИИ түсіндірсін)';
    }
  },

  reviewTest(testId) {
    const test = (DB.get('tests') || []).find(t => t.id === testId);
    if (!test) return;
    const user = Auth.currentUser();
    const results = DB.get('results') || [];
    const myResult = results.filter(r => r.testId === testId && r.userId === user.id).pop();
    if (!myResult || !myResult.answers) { App.navigate('student-tests'); return; }
    Tests.showResults(test, myResult.answers, myResult.score);
  },

  editTest(testId) {
    const tests = DB.get('tests') || [];
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    // Reuse showEditPreview but pass testId to update instead of create
    Tests._editingTestId = testId;
    Tests.showEditPreview(test.title, test.groupIds, test.questions);
  },

  showEditPreview(title, groupIds, questions) {
    const app = document.getElementById('app');
    const user = Auth.currentUser();

    let html = `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="${user.photo || 'assets/placeholder.svg'}" class="avatar" alt="Фото" style="width:60px;height:60px;object-fit:cover;border-radius:50%;">
          <h3>${user.name}</h3>
          <p class="role-badge">Оқытушы</p>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-link" data-page="teacher">Главная</a>
          <a href="#" class="nav-link" data-page="teacher-groups">Группы</a>
          <a href="#" class="nav-link" data-page="teacher-materials">Материалы</a>
          <a href="#" class="nav-link active" data-page="teacher-tests">Тесты</a>
        </nav>
        <button class="btn btn-logout" onclick="Auth.logout()">Выйти</button>
      </aside>
      <main class="main-content">
        <div class="tests-section">
          <div class="edit-preview-header">
            <h2>Сұрақтарды тексеру және өңдеу</h2>
            <p style="color:var(--text-muted);margin-bottom:1rem;">ИИ жасаған сұрақтарды тексеріңіз. Қажет болса мәтінді өңдеңіз, сұрақтарды жойыңыз немесе дұрыс жауапты өзгертіңіз.</p>
          </div>
          <div class="card form-card" style="border-left:4px solid #8b5cf6;margin-bottom:1rem;">
            <label><strong>Тест атауы:</strong></label>
            <input type="text" id="editTestTitle" value="${title.replace(/"/g, '&quot;')}">
          </div>
          <div id="editQuestionsContainer">`;

    questions.forEach((q, i) => {
      html += `
            <div class="card edit-question-block" data-index="${i}" style="border-left:4px solid #8b5cf6;">
              <div class="card-header">
                <label><strong>Сұрақ ${i + 1}</strong></label>
                <button class="btn btn-danger btn-sm remove-question-btn" data-index="${i}">Жою</button>
              </div>
              <input type="text" class="eq-text" value="${q.q.replace(/"/g, '&quot;')}">
              <div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.5rem;">
                <input type="text" class="eq-opt" value="${q.opts[0].replace(/"/g, '&quot;')}" placeholder="Нұсқа 1">
                <input type="text" class="eq-opt" value="${q.opts[1].replace(/"/g, '&quot;')}" placeholder="Нұсқа 2">
                <input type="text" class="eq-opt" value="${q.opts[2].replace(/"/g, '&quot;')}" placeholder="Нұсқа 3">
                <input type="text" class="eq-opt" value="${q.opts[3].replace(/"/g, '&quot;')}" placeholder="Нұсқа 4">
              </div>
              <select class="eq-answer" style="margin-top:0.5rem;">
                <option value="0" ${q.answer === 0 ? 'selected' : ''}>Дұрыс: Нұсқа 1</option>
                <option value="1" ${q.answer === 1 ? 'selected' : ''}>Дұрыс: Нұсқа 2</option>
                <option value="2" ${q.answer === 2 ? 'selected' : ''}>Дұрыс: Нұсқа 3</option>
                <option value="3" ${q.answer === 3 ? 'selected' : ''}>Дұрыс: Нұсқа 4</option>
              </select>
            </div>`;
    });

    html += `
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:1rem;">
            <button class="btn btn-primary" id="saveEditedTestBtn" style="background:#8b5cf6;">Тестті сақтау</button>
            <button class="btn btn-secondary" id="cancelEditBtn">Бас тарту</button>
          </div>
        </div>
      </main>
    </div>`;

    app.innerHTML = html;
    Tests.bindEditPreview(groupIds);
  },

  bindEditPreview(groupIds) {
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        App.navigate(link.dataset.page);
      });
    });

    // Remove question buttons
    document.querySelectorAll('.remove-question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.edit-question-block');
        block.remove();
        // Re-number remaining questions
        document.querySelectorAll('.edit-question-block').forEach((b, i) => {
          b.querySelector('label strong').textContent = `Сұрақ ${i + 1}`;
        });
      });
    });

    // Cancel
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      App.navigate('teacher-tests');
    });

    // Save
    document.getElementById('saveEditedTestBtn').addEventListener('click', () => {
      const blocks = document.querySelectorAll('.edit-question-block');
      if (blocks.length === 0) {
        alert('Кем дегенде бір сұрақ болуы керек!');
        return;
      }

      const title = document.getElementById('editTestTitle').value.trim();
      if (!title) {
        alert('Тест атауын енгізіңіз!');
        return;
      }

      const questions = [...blocks].map(b => {
        const opts = [...b.querySelectorAll('.eq-opt')].map(i => i.value);
        return {
          q: b.querySelector('.eq-text').value,
          opts,
          answer: parseInt(b.querySelector('.eq-answer').value)
        };
      });

      const tests = DB.get('tests') || [];
      const editingId = Tests._editingTestId;

      if (editingId) {
        // Update existing test
        const idx = tests.findIndex(t => t.id === editingId);
        if (idx !== -1) {
          tests[idx].title = title;
          tests[idx].groupIds = groupIds;
          tests[idx].questions = questions;
        }
        Tests._editingTestId = null;
      } else {
        // Create new test
        tests.push({ id: 't' + DB.generateId(), title, groupIds, questions });
      }

      DB.set('tests', tests);
      App.navigate('teacher-tests');
    });
  },

  delete(id) {
    let tests = DB.get('tests') || [];
    tests = tests.filter(t => t.id !== id);
    DB.set('tests', tests);
    App.navigate('teacher-tests');
  }
};
