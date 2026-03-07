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
          <a href="#" class="nav-link ${section==='dashboard'?'active':''}" data-page="teacher">Главная</a>
          <a href="#" class="nav-link ${section==='groups'?'active':''}" data-page="teacher-groups">Группы</a>
          <a href="#" class="nav-link ${section==='materials'?'active':''}" data-page="teacher-materials">Материалы</a>
          <a href="#" class="nav-link ${section==='tests'?'active':''}" data-page="teacher-tests">Тесты</a>
        </nav>
        <button class="btn btn-logout" onclick="Auth.logout()">Выйти</button>
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
      default: return this.renderDashboard(user, groups, students);
    }
  },

  renderDashboard(user, groups, students) {
    const tests = DB.get('tests') || [];
    const results = DB.get('results') || [];
    return `
    <h2>Панель преподавателя</h2>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-num">${groups.length}</span><span class="stat-label">Групп</span></div>
      <div class="stat-card"><span class="stat-num">${students.length}</span><span class="stat-label">Студентов</span></div>
      <div class="stat-card"><span class="stat-num">${tests.length}</span><span class="stat-label">Тестов</span></div>
      <div class="stat-card"><span class="stat-num">${results.length}</span><span class="stat-label">Результатов</span></div>
    </div>
    <div class="card profile-card">
      <div class="card-header">
        <h3>Профиль преподавателя</h3>
        <button class="btn btn-sm" id="editProfileBtn" style="background:#8b5cf6;color:#fff;">Өңдеу</button>
      </div>
      <div id="profileView">
        <div class="profile-info">
          <img src="${user.photo || 'assets/placeholder.svg'}" class="avatar-lg" alt="Фото" style="width:120px;height:150px;object-fit:cover;border-radius:12px;">
          <div>
            <p><strong>ФИО:</strong> ${user.name}</p>
            <p><strong>Должность:</strong> ${user.position || '—'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Телефон:</strong> ${user.phone || '—'}</p>
            <p><strong>Telegram:</strong> ${user.telegram || '—'}</p>
            <p><strong>О себе:</strong> ${user.bio || '—'}</p>
          </div>
        </div>
      </div>
      <form id="profileEditForm" style="display:none;">
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div class="profile-info" style="align-items:flex-start;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
              <img src="${user.photo || 'assets/placeholder.svg'}" id="profilePhotoPreview" class="avatar-lg" alt="Фото" style="width:120px;height:150px;object-fit:cover;border-radius:12px;">
              <input type="text" id="profilePhoto" placeholder="URL фото" value="${(user.photo || '').replace(/"/g, '&quot;')}" style="width:120px;font-size:0.75rem;">
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">
              <label style="font-size:0.85rem;color:var(--text-muted);">ФИО</label>
              <input type="text" id="profileName" value="${user.name.replace(/"/g, '&quot;')}" required>
              <label style="font-size:0.85rem;color:var(--text-muted);">Должность</label>
              <input type="text" id="profilePosition" value="${(user.position || '').replace(/"/g, '&quot;')}" placeholder="Должность">
              <label style="font-size:0.85rem;color:var(--text-muted);">Email</label>
              <input type="email" id="profileEmail" value="${user.email.replace(/"/g, '&quot;')}" required>
              <label style="font-size:0.85rem;color:var(--text-muted);">Телефон</label>
              <input type="text" id="profilePhone" value="${(user.phone || '').replace(/"/g, '&quot;')}" placeholder="+7 (777) 123-45-67">
              <label style="font-size:0.85rem;color:var(--text-muted);">Telegram</label>
              <input type="text" id="profileTelegram" value="${(user.telegram || '').replace(/"/g, '&quot;')}" placeholder="@username">
              <label style="font-size:0.85rem;color:var(--text-muted);">О себе</label>
              <textarea id="profileBio" rows="3" placeholder="Краткая информация о себе">${user.bio || ''}</textarea>
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
    </div>`;
  },

  renderGroups(groups, students) {
    let html = `<h2>Управление группами</h2>
    <div class="card form-card">
      <h3>Создать группу</h3>
      <form id="addGroupForm" class="inline-form">
        <input type="text" id="groupName" placeholder="Название группы (напр. ИС-203)" required>
        <button type="submit" class="btn btn-primary">Создать</button>
      </form>
    </div>`;

    groups.forEach(g => {
      const groupStudents = students.filter(s => s.groupId === g.id);
      html += `
      <div class="card">
        <div class="card-header">
          <h4>${g.name}</h4>
          <button class="btn btn-danger btn-sm" onclick="Teacher.deleteGroup('${g.id}')">Удалить</button>
        </div>
        <p>${groupStudents.length} студент(ов)</p>
        ${groupStudents.length > 0 ? `<ul class="student-list">${groupStudents.map(s => `<li>${s.name} (${s.email})</li>`).join('')}</ul>` : ''}
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
    }
    if (section === 'materials') Materials.bind();
    if (section === 'tests') Tests.bindTeacher();
  },

  deleteGroup(id) {
    let groups = DB.get('groups') || [];
    groups = groups.filter(g => g.id !== id);
    DB.set('groups', groups);
    App.navigate('teacher-groups');
  }
};
