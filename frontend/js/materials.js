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

    let html = '<div class="materials-section"><h2>Курс материалдары</h2>';

    if (role === 'teacher') {
      html += `
      <div class="card form-card">
        <h3>Материал қосу</h3>
        <form id="addMaterialForm">
          <input type="text" id="matTopic" placeholder="Тақырып" required>
          <input type="text" id="matTitle" placeholder="Атауы" required>
          <select id="matType">
            <option value="pdf">PDF</option>
            <option value="video">Бейне (YouTube embed URL)</option>
            <option value="link">Сілтеме</option>
            <option value="file">Компьютерден файл</option>
          </select>
          <div id="matSourceBlock">
            <div id="matUrlBlock">
              <input type="url" id="matUrl" placeholder="URL" required>
            </div>
            <div id="matFileBlock" style="display:none;">
              <input type="file" id="matFile" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.png">
              <p id="matFileName" style="margin:0.25rem 0 0;font-size:0.85rem;color:#666;"></p>
            </div>
          </div>
          <div class="checkbox-group">
            ${groups.map(g => `<label><input type="checkbox" name="matGroups" value="${g.id}"> ${g.name}</label>`).join('')}
          </div>
          <button type="submit" class="btn btn-primary">Қосу</button>
        </form>
      </div>`;
    }

    if (Object.keys(byTopic).length === 0) {
      html += '<p class="empty-state">Материалдар әлі қосылмаған</p>';
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
          ${m.type === 'video' ? `<div class="video-embed"><iframe src="${m.url}" allowfullscreen></iframe></div>` : `<a href="#" class="btn btn-sm" onclick="Materials.open('${m.id}');return false;">Ашу</a>`}
          ${role === 'teacher' ? `<button class="btn btn-danger btn-sm" onclick="Materials.delete('${m.id}')">Жою</button>` : ''}
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

    const typeSelect = document.getElementById('matType');
    const urlBlock = document.getElementById('matUrlBlock');
    const fileBlock = document.getElementById('matFileBlock');
    const matUrl = document.getElementById('matUrl');
    const matFile = document.getElementById('matFile');
    const matFileName = document.getElementById('matFileName');

    typeSelect.addEventListener('change', () => {
      const isFile = typeSelect.value === 'file';
      urlBlock.style.display = isFile ? 'none' : '';
      fileBlock.style.display = isFile ? '' : 'none';
      matUrl.required = !isFile;
    });

    if (matFile) {
      matFile.addEventListener('change', () => {
        matFileName.textContent = matFile.files[0] ? matFile.files[0].name : '';
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const isFile = typeSelect.value === 'file';

      if (isFile) {
        const file = matFile.files[0];
        if (!file) { alert('Файлды таңдаңыз'); return; }
        const reader = new FileReader();
        reader.onload = () => {
          Materials._saveMaterial(file.name.split('.').pop().toLowerCase(), reader.result, file.name);
        };
        reader.readAsDataURL(file);
      } else {
        Materials._saveMaterial(typeSelect.value, matUrl.value);
      }
    });
  },
  _saveMaterial(type, url, fileName) {
    const materials = DB.get('materials') || [];
    const groupIds = [...document.querySelectorAll('[name=matGroups]:checked')].map(c => c.value);
    const entry = {
      id: 'm' + DB.generateId(),
      topic: document.getElementById('matTopic').value,
      title: document.getElementById('matTitle').value,
      type,
      url,
      groupIds
    };
    if (fileName) entry.fileName = fileName;
    materials.push(entry);
    DB.set('materials', materials);
    App.navigate(Auth.currentUser().role === 'teacher' ? 'teacher-materials' : 'student');
  },
  open(id) {
    const materials = DB.get('materials') || [];
    const m = materials.find(mat => mat.id === id);
    if (!m) return;
    this.preview(m.url, m.title);
  },
  _dataUrlToBlob(dataUrl) {
    const [header, b64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: mime }));
  },
  preview(url, title) {
    const old = document.getElementById('materialModal');
    if (old) old.remove();

    const isDataUrl = url.startsWith('data:');
    const ext = isDataUrl ? (url.match(/data:[^/]+\/([^;,]+)/) || [])[1] || '' : url.split('.').pop().toLowerCase();
    const isPdf = ext === 'pdf' || (isDataUrl && url.startsWith('data:application/pdf'));
    const isImage = ['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext) || (isDataUrl && url.startsWith('data:image/'));
    const canPreview = isPdf || isImage;
    const fileName = isDataUrl ? (title || 'файл') : url.split('/').pop();

    // Convert data URL to blob URL for reliable rendering
    const viewUrl = isDataUrl ? this._dataUrlToBlob(url) : url;
    const downloadUrl = isDataUrl ? viewUrl : url;

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

    // Clean up blob URL when modal closes
    const cleanup = () => { if (isDataUrl) URL.revokeObjectURL(viewUrl); };

    if (canPreview) {
      let contentHtml;
      if (isImage) {
        contentHtml = `<div style="flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:16px;background:#f5f5f5;"><img src="${viewUrl}" alt="${title}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;"></div>`;
      } else {
        contentHtml = `<iframe src="${viewUrl}" style="flex:1;border:none;width:100%;"></iframe>`;
      }
      modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:90%;height:90%;display:flex;flex-direction:column;overflow:hidden;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid #eee;">
            <strong style="font-size:1.1rem;">${title}</strong>
            <div>
              <a href="${downloadUrl}" download="${title}.${ext}" class="btn btn-sm" style="margin-right:8px;">⬇ Жүктеу</a>
              <button id="modalCloseBtn" class="btn btn-sm" style="background:#e74c3c;color:#fff;">✕ Жабу</button>
            </div>
          </div>
          ${contentHtml}
        </div>`;
    } else {
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;width:500px;max-width:90%;padding:40px;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">${info.icon}</div>
          <h3 style="margin:0 0 8px;">${title}</h3>
          <p style="color:#666;margin:0 0 4px;">${info.label}</p>
          <p style="color:#999;font-size:0.85rem;margin:0 0 24px;">${fileName}</p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <a href="${downloadUrl}" download="${title}" class="btn btn-primary" style="padding:10px 24px;text-decoration:none;">⬇ Файлды жүктеу</a>
            <button id="modalCloseBtn" class="btn" style="padding:10px 24px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer;">✕ Жабу</button>
          </div>
        </div>`;
    }

    const closeModal = () => { cleanup(); modal.remove(); };
    modal.querySelector('#modalCloseBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
  },
  delete(id) {
    let materials = DB.get('materials') || [];
    materials = materials.filter(m => m.id !== id);
    DB.set('materials', materials);
    App.navigate('teacher-materials');
  }
};
