// auth.js — Authentication

const Auth = {
  currentUser() {
    return DB.get('currentUser');
  },
  login(email, password) {
    const users = DB.get('users') || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    DB.set('currentUser', user);
    return user;
  },
  register(name, email, password, groupId) {
    const users = DB.get('users') || [];
    if (users.find(u => u.email === email)) return { error: 'Бұл email тіркелген' };
    const user = {
      id: 'stu-' + DB.generateId(),
      email, password, name,
      role: 'student',
      groupId
    };
    users.push(user);
    DB.set('users', users);
    DB.set('currentUser', user);
    return user;
  },
  logout() {
    localStorage.removeItem('currentUser');
    App.navigate('login');
  },
  renderLogin() {
    const groups = DB.get('groups') || [];
    return `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">EduPlatform</h1>
        <p class="auth-subtitle">Оқыту платформасы</p>
        <div class="tabs">
          <button class="tab active" data-tab="login">Кіру</button>
          <button class="tab" data-tab="register">Тіркелу</button>
        </div>
        <form id="loginForm" class="auth-form">
          <input type="email" id="loginEmail" placeholder="Email" required>
          <input type="password" id="loginPass" placeholder="Құпия сөз" required>
          <button type="submit" class="btn btn-primary">Кіру</button>
          <p id="loginError" class="error-msg"></p>
          <p class="hint">Оқытушы: teacher@edu.kz / admin123</p>
        </form>
        <form id="registerForm" class="auth-form hidden">
          <input type="text" id="regName" placeholder="Аты-жөні" required>
          <input type="email" id="regEmail" placeholder="Email" required>
          <input type="password" id="regPass" placeholder="Құпия сөз" required minlength="6">
          <select id="regGroup" required>
            <option value="">Топты таңдаңыз</option>
            ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
          </select>
          <button type="submit" class="btn btn-primary">Тіркелу</button>
          <p id="regError" class="error-msg"></p>
        </form>
      </div>
    </div>`;
  },
  bindLogin() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('loginForm').classList.toggle('hidden', tab.dataset.tab !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', tab.dataset.tab !== 'register');
      });
    });
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const user = Auth.login(
        document.getElementById('loginEmail').value,
        document.getElementById('loginPass').value
      );
      if (user) {
        App.navigate(user.role === 'teacher' ? 'teacher' : 'student');
      } else {
        document.getElementById('loginError').textContent = 'Email немесе құпия сөз қате';
      }
    });
    document.getElementById('registerForm').addEventListener('submit', e => {
      e.preventDefault();
      const res = Auth.register(
        document.getElementById('regName').value,
        document.getElementById('regEmail').value,
        document.getElementById('regPass').value,
        document.getElementById('regGroup').value
      );
      if (res.error) {
        document.getElementById('regError').textContent = res.error;
      } else {
        App.navigate('student');
      }
    });
  }
};
