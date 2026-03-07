// materials.js — Course materials

const Materials = {
  render(role) {
    const materials = DB.get('materials') || [];
    const user = Auth.currentUser();
    const groups = DB.get('groups') || [];

    // Group materials by topic
    const byTopic = {};
    materials.forEach(m => {
      if (role === 'student' && !m.groupIds.includes(user.groupId)) return;
      if (!byTopic[m.topic]) byTopic[m.topic] = [];
      byTopic[m.topic].push(m);
    });

    const typeIcon = { pdf: '📄', video: '🎬', link: '🔗', file: '📁' };

    let html = '<div class="materials-section"><h2>Материалы курса</h2>';

    if (role === 'teacher') {
      html += `
      <div class="card form-card">
        <h3>Добавить материал</h3>
        <form id="addMaterialForm">
          <input type="text" id="matTopic" placeholder="Тема" required>
          <input type="text" id="matTitle" placeholder="Название" required>
          <select id="matType">
            <option value="pdf">PDF</option>
            <option value="video">Видео (YouTube embed URL)</option>
            <option value="link">Ссылка</option>
          </select>
          <input type="url" id="matUrl" placeholder="URL" required>
          <div class="checkbox-group">
            ${groups.map(g => `<label><input type="checkbox" name="matGroups" value="${g.id}"> ${g.name}</label>`).join('')}
          </div>
          <button type="submit" class="btn btn-primary">Добавить</button>
        </form>
      </div>`;
    }

    if (Object.keys(byTopic).length === 0) {
      html += '<p class="empty-state">Материалы пока не добавлены</p>';
    }

    for (const [topic, items] of Object.entries(byTopic)) {
      html += `<div class="topic-group"><h3>${topic}</h3><div class="materials-grid">`;
      items.forEach(m => {
        html += `
        <div class="card material-card">
          <span class="material-icon">${typeIcon[m.type] || '📁'}</span>
          <div class="material-info">
            <strong>${m.title}</strong>
            <span class="badge badge-${m.type}">${m.type.toUpperCase()}</span>
          </div>
          ${m.type === 'video' ? `<div class="video-embed"><iframe src="${m.url}" allowfullscreen></iframe></div>` : `<a href="#" class="btn btn-sm" onclick="Materials.preview('${m.url}','${m.title.replace(/'/g,"\\'")}');return false;">Открыть</a>`}
          ${role === 'teacher' ? `<button class="btn btn-danger btn-sm" onclick="Materials.delete('${m.id}')">Удалить</button>` : ''}
        </div>`;
      });
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  },
  bind() {
    const form = document.getElementById('addMaterialForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const materials = DB.get('materials') || [];
      const groupIds = [...document.querySelectorAll('[name=matGroups]:checked')].map(c => c.value);
      materials.push({
        id: 'm' + DB.generateId(),
        topic: document.getElementById('matTopic').value,
        title: document.getElementById('matTitle').value,
        type: document.getElementById('matType').value,
        url: document.getElementById('matUrl').value,
        groupIds
      });
      DB.set('materials', materials);
      App.navigate(Auth.currentUser().role === 'teacher' ? 'teacher-materials' : 'student');
    });
  },
  preview(url, title) {
    const old = document.getElementById('materialModal');
    if (old) old.remove();

    const ext = url.split('.').pop().toLowerCase();
    const canPreview = ['pdf'].includes(ext);
    const fileName = url.split('/').pop();

    // File type info
    const extInfo = {
      ppt: { icon: '📊', label: 'PowerPoint презентация' },
      pptx: { icon: '📊', label: 'PowerPoint презентация' },
      doc: { icon: '📝', label: 'Word құжат' },
      docx: { icon: '📝', label: 'Word құжат' },
      pdf: { icon: '📄', label: 'PDF файл' }
    };
    const info = extInfo[ext] || { icon: '📁', label: ext.toUpperCase() };

    const modal = document.createElement('div');
    modal.id = 'materialModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';

    if (canPreview) {
      modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:90%;height:90%;display:flex;flex-direction:column;overflow:hidden;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid #eee;">
            <strong style="font-size:1.1rem;">${title}</strong>
            <div>
              <a href="${url}" download class="btn btn-sm" style="margin-right:8px;">⬇ Скачать</a>
              <button onclick="document.getElementById('materialModal').remove()" class="btn btn-sm" style="background:#e74c3c;color:#fff;">✕ Закрыть</button>
            </div>
          </div>
          <iframe src="${url}" style="flex:1;border:none;width:100%;"></iframe>
        </div>`;
    } else {
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;width:500px;max-width:90%;padding:40px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">${info.icon}</div>
          <h3 style="margin:0 0 8px;">${title}</h3>
          <p style="color:#666;margin:0 0 4px;">${info.label}</p>
          <p style="color:#999;font-size:0.85rem;margin:0 0 24px;">${fileName}</p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <a href="${url}" download class="btn btn-primary" style="padding:10px 24px;text-decoration:none;">⬇ Скачать файл</a>
            <button onclick="document.getElementById('materialModal').remove()" class="btn" style="padding:10px 24px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer;">✕ Закрыть</button>
          </div>
        </div>`;
    }

    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  },
  delete(id) {
    let materials = DB.get('materials') || [];
    materials = materials.filter(m => m.id !== id);
    DB.set('materials', materials);
    App.navigate('teacher-materials');
  }
};
