// data.js — localStorage helpers & seed data

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  init() {
    if (!this.get('users')) {
      this.set('users', [
        {
          id: 'teacher-1',
          email: 'teacher@edu.kz',
          password: 'admin123',
          name: 'Куспанова Сауле Умбеткалиевна',
          role: 'teacher',
          position: 'Арнайы пән оқытушысы, педагог-шебер, техника ғылымдарының магистрі',
          phone: '+7 (777) 123-45-67',
          telegram: '@saule_teacher',
          bio: 'Ақтөбе көлік, байланыс және жаңа технологиялар колледжінің арнайы пән оқытушысы. «Үздік педагог — 2019» республикалық байқауының техникалық және кәсіби білім беру саласы бойынша жеңімпазы. «Ы.Алтынсарин» төс белгісінің иегері.',
          photo: 'assets/professor.jpg'
        }
      ]);
    }
    if (!this.get('groups')) {
      this.set('groups', [
        { id: 'g1', name: 'ИС-201', createdAt: Date.now() },
        { id: 'g2', name: 'ИС-202', createdAt: Date.now() }
      ]);
    }
    if (!this.get('materials')) {
      this.set('materials', [
        // Сызба негіздері
        { id: 'm1',  topic: 'Сызба негіздері', title: 'Сызба туралы', type: 'pdf', url: 'lectures_pdf/1.сызба туралы.pdf', groupIds: ['g1','g2'] },
        { id: 'm2',  topic: 'Сызба негіздері', title: 'Геометриялық тұрғызулар', type: 'pdf', url: 'lectures_pdf/2.Геометриялық тұрғызулар .pdf', groupIds: ['g1','g2'] },
        { id: 'm3',  topic: 'Сызба негіздері', title: 'Проекциялық сызба', type: 'pdf', url: 'lectures_pdf/3.Проекциялық сызба .pdf', groupIds: ['g1','g2'] },
        // Проекциялар
        { id: 'm4',  topic: 'Проекциялар', title: 'Геом. дене проекциялар', type: 'pdf', url: 'lectures_pdf/4.Геом.дене проекциялар.pdf', groupIds: ['g1','g2'] },
        { id: 'm5',  topic: 'Проекциялар', title: 'Геом. дене жазықтықпен қию', type: 'pdf', url: 'lectures_pdf/5.Геом.дене жаз.қию.pdf', groupIds: ['g1','g2'] },
        { id: 'm6',  topic: 'Проекциялар', title: 'Екі көрініс арқылы 3 көріністі табу', type: 'pdf', url: 'lectures_pdf/6.Екі көрініс арқылы 3 көр. табу.pdf', groupIds: ['g1','g2'] },
        { id: 'm7',  topic: 'Проекциялар', title: 'Проекция түрлері. Нүкте', type: 'pdf', url: 'lectures_pdf/Проекц.түрл.Нүкте.pdf', groupIds: ['g1','g2'] },
        { id: 'm8',  topic: 'Проекциялар', title: 'Аксонометриялық проекция', type: 'pdf', url: 'lectures_pdf/Акс.проекция.pdf', groupIds: ['g1','g2'] },
        { id: 'm9',  topic: 'Проекциялар', title: 'Геом. дене проекциялар (қосымша)', type: 'pdf', url: 'lectures_pdf/Геом.дене проекциялар.pdf', groupIds: ['g1','g2'] },
        // Тіліктер мен қималар
        { id: 'm10', topic: 'Тіліктер мен қималар', title: 'Тіліктер', type: 'pdf', url: 'lectures_pdf/8.Тіліктер.pdf', groupIds: ['g1','g2'] },
        { id: 'm11', topic: 'Тіліктер мен қималар', title: 'Қима', type: 'pdf', url: 'lectures_pdf/Қима.pdf', groupIds: ['g1','g2'] },
        // Бұранда
        { id: 'm12', topic: 'Бұранда', title: 'Бұранда', type: 'pdf', url: 'lectures_pdf/9.Бұранда.pdf', groupIds: ['g1','g2'] },
        { id: 'm13', topic: 'Бұранда', title: 'Бұранда түрлері, сызбада белгілеу', type: 'pdf', url: 'lectures_pdf/Бұранда_түрлері,сызбада_белгілеу.pdf', groupIds: ['g1','g2'] },
        // Берілістер мен сызбалар
        { id: 'm14', topic: 'Берілістер мен сызбалар', title: 'Тісті беріліс', type: 'pdf', url: 'lectures_pdf/11.Тісті беріліс.pdf', groupIds: ['g1','g2'] },
        { id: 'm15', topic: 'Берілістер мен сызбалар', title: 'Құрастыру сызбасы бойынша бөлшектеу', type: 'pdf', url: 'lectures_pdf/құрастыру_сызбасы_бойынша_бөлшектеу.pdf', groupIds: ['g1','g2'] },
        { id: 'm16', topic: 'Берілістер мен сызбалар', title: 'Құрылыс сызбасы', type: 'pdf', url: 'lectures_pdf/Құрылыс сызбасы.pdf', groupIds: ['g1','g2'] },
        { id: 'm17', topic: 'Берілістер мен сызбалар', title: 'Эскиз', type: 'pdf', url: 'lectures_pdf/ПрезентЭСКИЗ.pdf', groupIds: ['g1','g2'] },
        // Құжаттар
        { id: 'm18', topic: 'Құжаттар', title: 'Дәрістер жинағы', type: 'pdf', url: 'lectures_pdf/Дәрістер жинағы.pdf', groupIds: ['g1','g2'] },
        { id: 'm19', topic: 'Құжаттар', title: 'Тәжірибелік жұмыстарға әдістемелік нұсқау', type: 'pdf', url: 'lectures_pdf/Тәжірибелік_жұмыстарға_әдістемелік_нұсқау.pdf', groupIds: ['g1','g2'] },
        { id: 'm20', topic: 'Құжаттар', title: 'Тест жинағы', type: 'pdf', url: 'lectures_pdf/Тест жинағыdocx.pdf', groupIds: ['g1','g2'] }
      ]);
    }
    if (!this.get('tests')) {
      this.set('tests', [
        {
          id: 't1',
          title: 'Тест: Основы HTML',
          groupIds: ['g1','g2'],
          questions: [
            { q: 'Какой тег создаёт заголовок первого уровня?', opts: ['<h1>','<head>','<header>','<title>'], answer: 0 },
            { q: 'Какой атрибут задаёт ссылку в теге <a>?', opts: ['src','link','href','url'], answer: 2 },
            { q: 'Какой тег используется для списка?', opts: ['<list>','<ul>','<ol>','<ul> и <ol>'], answer: 3 }
          ]
        },
        {
          id: 't2',
          title: 'Тест: SQL Основы',
          groupIds: ['g1'],
          questions: [
            { q: 'Какая команда выбирает данные из таблицы?', opts: ['GET','FETCH','SELECT','RETRIEVE'], answer: 2 },
            { q: 'Какой оператор фильтрует строки?', opts: ['WHERE','FILTER','HAVING','IF'], answer: 0 }
          ]
        }
      ]);
    }
    if (!this.get('results')) {
      this.set('results', []);
    }
  },
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
};
