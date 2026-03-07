// student.js — Student dashboard

const Student = {
  render(section = 'dashboard') {
    const user = Auth.currentUser();
    const groups = DB.get('groups') || [];
    const group = groups.find(g => g.id === user.groupId);

    return `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="avatar-initials">${user.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <h3>${user.name}</h3>
          <p class="role-badge student-badge">${group ? group.name : 'Студент'}</p>
        </div>
        <nav class="sidebar-nav">
          <a href="#" class="nav-link ${section==='dashboard'?'active':''}" data-page="student">Главная</a>
          <a href="#" class="nav-link ${section==='materials'?'active':''}" data-page="student-materials">Материалы</a>
          <a href="#" class="nav-link ${section==='tests'?'active':''}" data-page="student-tests">Тесты</a>
          <a href="#" class="nav-link ${section==='ai'?'active':''}" data-page="student-ai">ИИ-помощник</a>
        </nav>
        <button class="btn btn-logout" onclick="Auth.logout()">Выйти</button>
      </aside>
      <main class="main-content">
        ${this.renderSection(section, user, group)}
      </main>
    </div>`;
  },

  renderSection(section, user, group) {
    switch(section) {
      case 'materials': return Materials.render('student');
      case 'tests': return Tests.renderStudent();
      case 'ai': return AIHelper.render();
      default: return this.renderDashboard(user, group);
    }
  },

  renderDashboard(user, group) {
    const results = (DB.get('results') || []).filter(r => r.userId === user.id);
    const tests = (DB.get('tests') || []).filter(t => t.groupIds.includes(user.groupId));
    const avgScore = results.length > 0 ? Math.round(results.reduce((s,r) => s + (r.score/r.total)*100, 0) / results.length) : 0;

    return `
    <h2>Добро пожаловать, ${user.name.split(' ')[0]}!</h2>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-num">${group ? group.name : '—'}</span><span class="stat-label">Группа</span></div>
      <div class="stat-card"><span class="stat-num">${tests.length}</span><span class="stat-label">Доступно тестов</span></div>
      <div class="stat-card"><span class="stat-num">${results.length}</span><span class="stat-label">Пройдено</span></div>
      <div class="stat-card"><span class="stat-num">${avgScore}%</span><span class="stat-label">Средний балл</span></div>
    </div>
    <div class="card">
      <h3>Информация о преподавателе</h3>
      ${this.renderTeacherInfo()}
    </div>`;
  },

  renderTeacherInfo() {
    const users = DB.get('users') || [];
    const teacher = users.find(u => u.role === 'teacher');
    if (!teacher) return '<p>Информация недоступна</p>';
    return `
    <div class="profile-info">
      <img src="${teacher.photo || 'assets/placeholder.svg'}" class="avatar-lg" alt="Фото" style="width:120px;height:150px;object-fit:cover;border-radius:12px;">
      <div>
        <p><strong>${teacher.name}</strong></p>
        <p>${teacher.position || ''}</p>
        <p>${teacher.bio || ''}</p>
        <p>Email: <a href="mailto:${teacher.email}">${teacher.email}</a></p>
        <p>Телефон: ${teacher.phone || '—'}</p>
        <p>Telegram: ${teacher.telegram || '—'}</p>
      </div>
    </div>`;
  },

  bind(section) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        App.navigate(link.dataset.page);
      });
    });
    if (section === 'ai') AIHelper.bind();
  }
};
