// teacher.js — Teacher dashboard

const Teacher = {
  render(section = 'dashboard') {
    const user = Auth.currentUser();
    const groups = DB.get('groups') || [];
    const users = DB.get('users') || [];
    const students = users.filter(u => u.role === 'student');

    const nav = `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="${user.photo || 'assets/placeholder.svg'}" class="avatar" alt="Фото" style="width:60px;height:60px;object-fit:cover;border-radius:50%;">
          <h3>${user.name}</h3>
          <p class="role-badge">Оқытушы</p>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-link ${section==='dashboard'?'active':''}" data-page="teacher">Басты бет</a>
          <a href="#" class="nav-link ${section==='groups'?'active':''}" data-page="teacher-groups">Топтар</a>
          <a href="#" class="nav-link ${section==='materials'?'active':''}" data-page="teacher-materials">Материалдар</a>
          <a href="#" class="nav-link ${section==='tests'?'active':''}" data-page="teacher-tests">Тесттер</a>
          <a href="#" class="nav-link ${section==='messages'?'active':''}" data-page="teacher-messages">Хабарламалар${(() => { const c = Messages._getUnreadCount(user.id); return c > 0 ? ` <span style="background:var(--danger);color:#fff;border-radius:50%;padding:1px 6px;font-size:0.7rem;margin-left:4px;">${c}</span>` : ''; })()}</a>
        </nav>
        <button class="btn btn-logout" onclick="Auth.logout()">Шығу</button>
      </aside>
      <main class="main-content">
        ${this.renderSection(section, user, groups, students)}
      </main>
    </div>`;
    return nav;
  },

  renderSection(section, user, groups, students) {
    switch(section) {
      case 'groups': return this.renderGroups(groups, students);
      case 'materials': return Materials.render('teacher');
      case 'tests': return Tests.renderTeacher();
      case 'messages': return Messages.renderTeacher();
      default: return this.renderDashboard(user, groups, students);
    }
  },

  renderDashboard(user, groups, students) {
    const tests = DB.get('tests') || [];
    const results = DB.get('results') || [];
    return `
    <h2>Оқытушы панелі</h2>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-num">${groups.length}</span><span class="stat-label">Топтар</span></div>
      <div class="stat-card"><span class="stat-num">${students.length}</span><span class="stat-label">Студенттер</span></div>
      <div class="stat-card"><span class="stat-num">${tests.length}</span><span class="stat-label">Тесттер</span></div>
      <div class="stat-card"><span class="stat-num">${results.length}</span><span class="stat-label">Нәтижелер</span></div>
    </div>
    <div class="card profile-card">
      <div class="card-header">
        <h3>Оқытушы профилі</h3>
        <button class="btn btn-sm" id="editProfileBtn" style="background:#8b5cf6;color:#fff;">Өңдеу</button>
      </div>
      <div id="profileView">
        <div class="profile-info">
          <img src="${user.photo || 'assets/placeholder.svg'}" class="avatar-lg" alt="Фото" style="width:120px;height:150px;object-fit:cover;border-radius:12px;">
          <div>
            <p><strong>Аты-жөні:</strong> ${user.name}</p>
            <p><strong>Лауазымы:</strong> ${user.position || '—'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Телефон:</strong> ${user.phone || '—'}</p>
            <p><strong>Telegram:</strong> ${user.telegram || '—'}</p>
            <p><strong>Өзі туралы:</strong> ${user.bio || '—'}</p>
          </div>
        </div>
      </div>
      <form id="profileEditForm" style="display:none;">
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div class="profile-info" style="align-items:flex-start;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
              <img src="${user.photo || 'assets/placeholder.svg'}" id="profilePhotoPreview" class="avatar-lg" alt="Фото" style="width:120px;height:150px;object-fit:cover;border-radius:12px;">
              <input type="text" id="profilePhoto" placeholder="Фото URL" value="${(user.photo || '').replace(/"/g, '&quot;')}" style="width:120px;font-size:0.75rem;">
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">
              <label style="font-size:0.85rem;color:var(--text-muted);">Аты-жөні</label>
              <input type="text" id="profileName" value="${user.name.replace(/"/g, '&quot;')}" required>
              <label style="font-size:0.85rem;color:var(--text-muted);">Лауазымы</label>
              <input type="text" id="profilePosition" value="${(user.position || '').replace(/"/g, '&quot;')}" placeholder="Лауазымы">
              <label style="font-size:0.85rem;color:var(--text-muted);">Email</label>
              <input type="email" id="profileEmail" value="${user.email.replace(/"/g, '&quot;')}" required>
              <label style="font-size:0.85rem;color:var(--text-muted);">Телефон</label>
              <input type="text" id="profilePhone" value="${(user.phone || '').replace(/"/g, '&quot;')}" placeholder="+7 (777) 123-45-67">
              <label style="font-size:0.85rem;color:var(--text-muted);">Telegram</label>
              <input type="text" id="profileTelegram" value="${(user.telegram || '').replace(/"/g, '&quot;')}" placeholder="@username">
              <label style="font-size:0.85rem;color:var(--text-muted);">Өзі туралы</label>
              <textarea id="profileBio" rows="3" placeholder="Өзіңіз туралы қысқаша ақпарат">${user.bio || ''}</textarea>
            </div>
          </div>
          <div style="display:flex;gap:0.75rem;">
            <button type="submit" class="btn btn-primary" style="background:#8b5cf6;">Сақтау</button>
            <button type="button" class="btn btn-secondary" id="cancelProfileBtn">Бас тарту</button>
          </div>
        </div>
      </form>
    </div>
    <div class="card" style="border-left:4px solid #8b5cf6;">
      <h3>🤖 OpenAI API баптаулары</h3>
      <p style="color:#666;margin-bottom:12px;">Тесттерді автоматты жасау және ИИ түсіндірмелері үшін OpenAI API кілтін енгізіңіз.</p>
      <form id="apiKeyForm" class="inline-form" style="display:flex;gap:8px;align-items:center;">
        <input type="password" id="apiKeyInput" placeholder="sk-..." value="${OpenAI.getKey()}" style="flex:1;">
        <button type="submit" class="btn btn-primary" style="background:#8b5cf6;">Сақтау</button>
      </form>
      <p id="apiKeyStatus" style="margin-top:8px;font-size:0.85rem;color:#666;">${OpenAI.getKey() ? '✅ API кілті орнатылған' : '⚠️ API кілті орнатылмаған'}</p>
    </div>
    ${this.renderRating(groups, students, results)}`;
  },

  renderRating(groups, students, results) {
    if (students.length === 0) return '';

    // Calculate stats per student
    const rating = students.map(s => {
      const sr = results.filter(r => r.userId === s.id);
      const total = sr.length;
      const avg = total > 0 ? Math.round(sr.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / total) : 0;
      const group = groups.find(g => g.id === s.groupId);
      return { id: s.id, name: s.name, group: group ? group.name : '—', total, avg };
    }).sort((a, b) => b.avg - a.avg || b.total - a.total);

    const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    const statusBadge = (avg, total) => {
      if (total === 0) return '<span style="background:#f1f5f9;color:#64748b;padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">Тест тапсырмаған</span>';
      if (avg >= 80) return '<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">Жарайсың!</span>';
      if (avg >= 60) return '<span style="background:#fef9c3;color:#854d0e;padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">Жақсы</span>';
      return '<span style="background:#fef2f2;color:#991b1b;padding:2px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;">Көмек қажет</span>';
    };
    const bar = (avg) => `<div style="width:100%;background:#f1f5f9;border-radius:100px;height:8px;"><div style="width:${avg}%;height:100%;border-radius:100px;background:${avg >= 80 ? 'var(--success)' : avg >= 60 ? '#f59e0b' : 'var(--danger)'};"></div></div>`;

    let html = `<div class="card">
      <div class="card-header"><h3>Студенттер рейтингі</h3></div>
      <div style="overflow-x:auto;">
        <table class="results-table" style="width:100%;">
          <thead><tr>
            <th style="width:40px;">#</th>
            <th>Студент</th>
            <th>Топ</th>
            <th style="width:80px;">Тесттер</th>
            <th style="width:200px;">Орташа балл</th>
            <th>Деңгей</th>
          </tr></thead>
          <tbody>`;

    rating.forEach((s, i) => {
      html += `<tr>
        <td style="text-align:center;font-size:1.1rem;">${medal(i)}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.group}</td>
        <td style="text-align:center;">${s.total}</td>
        <td><div style="display:flex;align-items:center;gap:8px;">${bar(s.avg)}<span style="font-weight:700;min-width:36px;">${s.avg}%</span></div></td>
        <td>${statusBadge(s.avg, s.total)}</td>
      </tr>`;
    });

    html += '</tbody></table></div></div>';
    return html;
  },

  renderGroups(groups, students) {
    let html = `<h2>Топтарды басқару</h2>
    <div class="card form-card">
      <h3>Топ құру</h3>
      <form id="addGroupForm" class="inline-form">
        <input type="text" id="groupName" placeholder="Топ атауы (мыс. ИС-203)" required>
        <button type="submit" class="btn btn-primary">Құру</button>
      </form>
    </div>
    <div class="card form-card">
      <h3>Студенттерді қосу</h3>
      <form id="bulkAddStudentsForm">
        <select id="bulkGroup" required>
          <option value="">Топты таңдаңыз</option>
          ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
        </select>
        <textarea id="bulkNames" rows="6" placeholder="Студенттердің аты-жөнін енгізіңіз (әр жолға бір адам):&#10;Иванов Алексей&#10;Петрова Мария&#10;Сергеев Дмитрий" required></textarea>
        <button type="submit" class="btn btn-primary">Аккаунттарды генерациялау</button>
      </form>
      <div id="bulkResult" style="display:none;margin-top:1rem;">
        <h4>Құрылған аккаунттар:</h4>
        <table class="bulk-table" style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <thead><tr><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border);">Аты-жөні</th><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border);">Логин</th><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border);">Құпия сөз</th></tr></thead>
          <tbody id="bulkResultBody"></tbody>
        </table>
        <button class="btn btn-sm" id="copyBulkBtn" style="margin-top:0.75rem;">Кестені көшіру</button>
      </div>
    </div>`;

    groups.forEach(g => {
      const groupStudents = students.filter(s => s.groupId === g.id);
      html += `
      <div class="card">
        <div class="card-header">
          <h4>${g.name}</h4>
          <button class="btn btn-danger btn-sm" onclick="Teacher.deleteGroup('${g.id}')">Жою</button>
        </div>
        <p>${groupStudents.length} студент</p>
        ${groupStudents.length > 0 ? `<ul class="student-list">${groupStudents.map(s => `<li style="display:flex;justify-content:space-between;align-items:center;">${s.name} (${s.email}) <button class="btn btn-danger btn-sm" onclick="Teacher.deleteStudent('${s.id}')" style="margin-left:8px;padding:2px 8px;font-size:0.75rem;">Жою</button></li>`).join('')}</ul>` : ''}
      </div>`;
    });
    return html;
  },

  bind(section) {
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        App.navigate(link.dataset.page);
      });
    });

    // Profile edit
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
      document.getElementById('profileView').style.display = 'none';
      document.getElementById('profileEditForm').style.display = 'block';
      document.getElementById('editProfileBtn').style.display = 'none';
    });
    document.getElementById('cancelProfileBtn')?.addEventListener('click', () => {
      document.getElementById('profileView').style.display = '';
      document.getElementById('profileEditForm').style.display = 'none';
      document.getElementById('editProfileBtn').style.display = '';
    });
    document.getElementById('profilePhoto')?.addEventListener('input', e => {
      const preview = document.getElementById('profilePhotoPreview');
      preview.src = e.target.value || 'assets/placeholder.svg';
    });
    document.getElementById('profileEditForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const user = Auth.currentUser();
      const updated = {
        ...user,
        name: document.getElementById('profileName').value.trim(),
        position: document.getElementById('profilePosition').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        telegram: document.getElementById('profileTelegram').value.trim(),
        bio: document.getElementById('profileBio').value.trim(),
        photo: document.getElementById('profilePhoto').value.trim()
      };
      // Update in users array
      const users = DB.get('users') || [];
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) users[idx] = { ...users[idx], ...updated };
      DB.set('users', users);
      // Update currentUser
      DB.set('currentUser', updated);
      App.navigate('teacher');
    });

    // API key form on dashboard
    document.getElementById('apiKeyForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const key = document.getElementById('apiKeyInput').value.trim();
      OpenAI.setKey(key);
      const status = document.getElementById('apiKeyStatus');
      status.textContent = key ? '✅ API кілті сақталды!' : '⚠️ API кілті жойылды';
      status.style.color = key ? '#22c55e' : '#e74c3c';
    });

    if (section === 'groups') {
      document.getElementById('addGroupForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const groups = DB.get('groups') || [];
        groups.push({ id: 'g' + DB.generateId(), name: document.getElementById('groupName').value, createdAt: Date.now() });
        DB.set('groups', groups);
        App.navigate('teacher-groups');
      });

      document.getElementById('bulkAddStudentsForm')?.addEventListener('submit', e => {
        e.preventDefault();
        const groupId = document.getElementById('bulkGroup').value;
        const raw = document.getElementById('bulkNames').value.trim();
        if (!groupId || !raw) return;

        const names = raw.split('\n').map(n => n.trim()).filter(n => n.length > 0);
        if (names.length === 0) return;

        const users = DB.get('users') || [];
        const created = [];

        names.forEach(name => {
          const translitName = Teacher._transliterate(name.split(/\s+/).slice(0, 2).join('.')).toLowerCase();
          let email = translitName + '@student.edu';
          // Ensure unique email
          let suffix = 1;
          while (users.find(u => u.email === email)) {
            email = translitName + suffix + '@student.edu';
            suffix++;
          }
          const password = Teacher._generatePassword();
          const user = {
            id: 'stu-' + DB.generateId(),
            email,
            password,
            name,
            role: 'student',
            groupId
          };
          users.push(user);
          created.push({ name, email, password });
        });

        DB.set('users', users);

        // Show results
        const resultDiv = document.getElementById('bulkResult');
        const tbody = document.getElementById('bulkResultBody');
        tbody.innerHTML = created.map(c =>
          `<tr><td style="padding:6px;border-bottom:1px solid var(--border);">${c.name}</td><td style="padding:6px;border-bottom:1px solid var(--border);">${c.email}</td><td style="padding:6px;border-bottom:1px solid var(--border);font-family:monospace;">${c.password}</td></tr>`
        ).join('');
        resultDiv.style.display = '';

        document.getElementById('copyBulkBtn')?.addEventListener('click', () => {
          const text = 'Аты-жөні\tЛогин\tҚұпия сөз\n' + created.map(c => `${c.name}\t${c.email}\t${c.password}`).join('\n');
          navigator.clipboard.writeText(text).then(() => {
            document.getElementById('copyBulkBtn').textContent = 'Көшірілді!';
            setTimeout(() => { document.getElementById('copyBulkBtn').textContent = 'Кестені көшіру'; }, 2000);
          });
        });
      });
    }
    if (section === 'materials') Materials.bind();
    if (section === 'tests') Tests.bindTeacher();
    if (section === 'messages') Messages.bind('teacher');
  },

  _transliterate(str) {
    const map = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',ә:'a',і:'i',ң:'n',ғ:'g',ү:'u',ұ:'u',қ:'k',ө:'o',һ:'h'};
    return str.split('').map(c => {
      const lower = c.toLowerCase();
      if (map[lower] !== undefined) return c === lower ? map[lower] : map[lower].charAt(0).toUpperCase() + map[lower].slice(1);
      return c;
    }).join('');
  },
  _generatePassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  },
  deleteStudent(id) {
    let users = DB.get('users') || [];
    users = users.filter(u => u.id !== id);
    DB.set('users', users);
    App.navigate('teacher-groups');
  },
  deleteGroup(id) {
    let groups = DB.get('groups') || [];
    groups = groups.filter(g => g.id !== id);
    DB.set('groups', groups);
    App.navigate('teacher-groups');
  }
};
