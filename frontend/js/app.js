// app.js — Router & initialization

const App = {
  init() {
    DB.init();
    const user = Auth.currentUser();
    if (user) {
      this.navigate(user.role === 'teacher' ? 'teacher' : 'student');
    } else {
      this.navigate('login');
    }
  },

  navigate(page) {
    const app = document.getElementById('app');
    let html = '';
    let section = 'dashboard';

    if (page === 'login') {
      html = Auth.renderLogin();
      app.innerHTML = html;
      Auth.bindLogin();
      return;
    }

    const user = Auth.currentUser();
    if (!user) { this.navigate('login'); return; }

    if (page.startsWith('teacher')) {
      if (user.role !== 'teacher') { this.navigate('login'); return; }
      if (page === 'teacher-groups') section = 'groups';
      else if (page === 'teacher-materials') section = 'materials';
      else if (page === 'teacher-tests') section = 'tests';
      html = Teacher.render(section);
      app.innerHTML = html;
      Teacher.bind(section);
    } else if (page.startsWith('student')) {
      if (user.role !== 'student') { this.navigate('login'); return; }
      if (page === 'student-materials') section = 'materials';
      else if (page === 'student-tests') section = 'tests';
      else if (page === 'student-ai') section = 'ai';
      html = Student.render(section);
      app.innerHTML = html;
      Student.bind(section);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
