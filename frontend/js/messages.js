// messages.js — Student-Teacher messaging

const Messages = {
  _selectedStudentId: null,

  renderStudent() {
    const user = Auth.currentUser();
    const users = DB.get('users') || [];
    const teacher = users.find(u => u.role === 'teacher');
    if (!teacher) return '<p>Оқытушы табылмады</p>';

    const msgs = (DB.get('messages') || []).filter(m =>
      (m.fromId === user.id && m.toId === teacher.id) ||
      (m.fromId === teacher.id && m.toId === user.id)
    ).sort((a, b) => a.date - b.date);

    // Mark incoming as read
    Messages._markRead(teacher.id, user.id);

    return `
    <div class="messages-section">
      <h2>Хабарламалар</h2>
      <div class="msg-chat-box">
        <div class="msg-chat-header">
          <img src="${teacher.photo || 'assets/placeholder.svg'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
          <div>
            <strong>${teacher.name}</strong>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:0;">Оқытушы</p>
          </div>
        </div>
        <div class="msg-chat-messages" id="msgChatMessages">
          ${msgs.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:2rem;">Хабарлама жоқ. Оқытушыға жазыңыз!</p>' : ''}
          ${msgs.map(m => `
            <div class="msg-bubble ${m.fromId === user.id ? 'msg-out' : 'msg-in'}">
              <div class="msg-text">${Messages._escapeHtml(m.text)}</div>
              <div class="msg-time">${Messages._formatTime(m.date)}</div>
            </div>
          `).join('')}
        </div>
        <form id="msgSendForm" class="msg-chat-input">
          <input type="text" id="msgInput" placeholder="Хабарлама жазыңыз..." autocomplete="off" required>
          <button type="submit" class="btn btn-primary">Жіберу</button>
        </form>
      </div>
    </div>`;
  },

  renderTeacher() {
    const user = Auth.currentUser();
    const users = DB.get('users') || [];
    const students = users.filter(u => u.role === 'student');
    const allMsgs = DB.get('messages') || [];
    const groups = DB.get('groups') || [];

    // Build conversation list
    const convos = students.map(s => {
      const msgs = allMsgs.filter(m =>
        (m.fromId === s.id && m.toId === user.id) ||
        (m.fromId === user.id && m.toId === s.id)
      );
      const last = msgs.sort((a, b) => b.date - a.date)[0];
      const unread = msgs.filter(m => m.fromId === s.id && !m.read).length;
      const group = groups.find(g => g.id === s.groupId);
      return { student: s, last, unread, group };
    }).filter(c => c.last || c.unread > 0).sort((a, b) => {
      if (!a.last) return 1;
      if (!b.last) return -1;
      return b.last.date - a.last.date;
    });

    const selectedId = Messages._selectedStudentId;
    const selectedStudent = selectedId ? students.find(s => s.id === selectedId) : null;

    // Chat messages for selected student
    let chatHtml = '';
    if (selectedStudent) {
      const msgs = allMsgs.filter(m =>
        (m.fromId === selectedStudent.id && m.toId === user.id) ||
        (m.fromId === user.id && m.toId === selectedStudent.id)
      ).sort((a, b) => a.date - b.date);

      Messages._markRead(selectedStudent.id, user.id);

      const sg = groups.find(g => g.id === selectedStudent.groupId);
      chatHtml = `
        <div class="msg-chat-header">
          <div class="avatar-initials" style="width:36px;height:36px;font-size:0.85rem;">${selectedStudent.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <div>
            <strong>${selectedStudent.name}</strong>
            <p style="font-size:0.8rem;color:var(--text-muted);margin:0;">${sg ? sg.name : ''}</p>
          </div>
        </div>
        <div class="msg-chat-messages" id="msgChatMessages">
          ${msgs.map(m => `
            <div class="msg-bubble ${m.fromId === user.id ? 'msg-out' : 'msg-in'}">
              <div class="msg-text">${Messages._escapeHtml(m.text)}</div>
              <div class="msg-time">${Messages._formatTime(m.date)}</div>
            </div>
          `).join('')}
        </div>
        <form id="msgSendForm" class="msg-chat-input">
          <input type="text" id="msgInput" placeholder="Жауап жазыңыз..." autocomplete="off" required>
          <button type="submit" class="btn btn-primary">Жіберу</button>
        </form>`;
    } else {
      chatHtml = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">Студентті таңдаңыз</div>';
    }

    return `
    <div class="messages-section">
      <h2>Хабарламалар</h2>
      <div class="msg-layout">
        <div class="msg-sidebar">
          ${convos.length === 0 ? '<p style="padding:1rem;color:var(--text-muted);text-align:center;font-size:0.9rem;">Хабарламалар жоқ</p>' : ''}
          ${convos.map(c => `
            <div class="msg-convo ${c.student.id === selectedId ? 'msg-convo-active' : ''}" data-student-id="${c.student.id}">
              <div class="avatar-initials" style="width:40px;height:40px;font-size:0.85rem;flex-shrink:0;">${c.student.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:0.9rem;">${c.student.name}</strong>
                  ${c.unread > 0 ? `<span class="msg-unread-badge">${c.unread}</span>` : ''}
                </div>
                <p style="margin:0;font-size:0.8rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.last ? Messages._escapeHtml(c.last.text).slice(0, 40) : ''}</p>
              </div>
            </div>
          `).join('')}
          ${students.filter(s => !convos.find(c => c.student.id === s.id)).length > 0 ? `
            <div style="padding:0.75rem 1rem;border-top:1px solid var(--border);">
              <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">Барлық студенттер:</p>
              ${students.filter(s => !convos.find(c => c.student.id === s.id)).map(s => `
                <div class="msg-convo ${s.id === selectedId ? 'msg-convo-active' : ''}" data-student-id="${s.id}">
                  <div class="avatar-initials" style="width:32px;height:32px;font-size:0.75rem;flex-shrink:0;">${s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                  <span style="font-size:0.85rem;">${s.name}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="msg-chat-box">
          ${chatHtml}
        </div>
      </div>
    </div>`;
  },

  bind(role) {
    if (role === 'teacher') {
      // Conversation clicks
      document.querySelectorAll('.msg-convo').forEach(el => {
        el.addEventListener('click', () => {
          Messages._selectedStudentId = el.dataset.studentId;
          App.navigate('teacher-messages');
        });
      });
    }

    // Send form
    const form = document.getElementById('msgSendForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('msgInput');
      const text = input.value.trim();
      if (!text) return;

      const user = Auth.currentUser();
      const users = DB.get('users') || [];
      let toId;

      if (role === 'student') {
        const teacher = users.find(u => u.role === 'teacher');
        toId = teacher.id;
      } else {
        toId = Messages._selectedStudentId;
      }
      if (!toId) return;

      const messages = DB.get('messages') || [];
      messages.push({
        id: 'msg' + DB.generateId(),
        fromId: user.id,
        toId,
        text,
        date: Date.now(),
        read: false
      });
      DB.set('messages', messages);

      App.navigate(role === 'teacher' ? 'teacher-messages' : 'student-messages');
    });

    // Scroll to bottom
    const chatEl = document.getElementById('msgChatMessages');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
  },

  _markRead(fromId, toId) {
    const messages = DB.get('messages') || [];
    let changed = false;
    messages.forEach(m => {
      if (m.fromId === fromId && m.toId === toId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) DB.set('messages', messages);
  },

  _getUnreadCount(userId) {
    const msgs = DB.get('messages') || [];
    return msgs.filter(m => m.toId === userId && !m.read).length;
  },

  _formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const time = d.toLocaleTimeString('kk', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    return d.toLocaleDateString('kk', { day: 'numeric', month: 'short' }) + ' ' + time;
  },

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
