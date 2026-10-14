const $ = (selector, root = document) => root.querySelector(selector);
const validRoutes = new Set(['home', 'about', 'research', 'teaching', 'portfolio', 'posts', 'collection', 'cv']);
let language = 'zh';
try { const stored = localStorage.getItem('iris-language'); if (['zh', 'en'].includes(stored)) language = stored; } catch {}
let filter = 'all';
let githubData = null;
let githubFailed = false;
let githubRequest = null;
let githubLoading = false;
const GITHUB_USER = 'Iris-YixinXu';
const GITHUB_CACHE_KEY = 'xu-yixin-github-v2';
const GITHUB_CACHE_TTL = 5 * 60 * 1000;
const t = (zh, en) => language === 'zh' ? zh : en;
const icon = (name) => {
  const paths = {
    pin: '<path d="M12 21s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/>',
    school: '<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 11v7c4 3 8 3 12 0v-7M21 9v8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    github: '<path d="M9 20c-5 1.5-5-2.5-7-3m14 4v-3.9c0-1.1-.3-1.8-.9-2.4 3-.3 6.1-1.5 6.1-6.8 0-1.5-.5-2.7-1.4-3.7.2-.4.6-1.7-.1-3.3 0 0-1.1-.4-3.7 1.4a12.7 12.7 0 0 0-6.7 0C6.7.5 5.5.9 5.5.9c-.7 1.6-.3 2.9-.1 3.3C4.5 5.2 4 6.4 4 7.9c0 5.3 3.1 6.5 6.1 6.8-.5.5-.8 1.2-.8 2.4V21"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const projects = [
  {
    id: 'deepguardian', title: 'DeepGuardian', category: 'ai', year: '2025–2026', visual: 'vision',
    label: ['计算机视觉 · 多模态 AI', 'COMPUTER VISION · MULTIMODAL AI'],
    subtitle: ['光流驱动的多模态视频理解', 'Optical-flow-based multimodal video understanding'],
    intro: ['从视频中的运动变化出发，提取关键画面，将视觉描述转化为可检索的风险记录。', 'From motion in video to representative keyframes and searchable, structured risk records.'],
    tags: ['Python', 'OpenCV', 'PyTorch', 'Qwen'],
    goal: ['针对校园监控视频，探索自适应采样、光流分析与多模态理解的结合。', 'Explore adaptive sampling, optical-flow analysis, and multimodal understanding for campus surveillance video.'],
    contributions: [
      ['实现自适应帧采样、稠密光流分析、关键帧提取和多模态视频理解流程。', 'Implemented a pipeline for adaptive frame sampling, dense optical flow, keyframe extraction, and multimodal video understanding.'],
      ['融合光流幅值、运动像素比例、灰度差异及局部峰值变化，结合动态阈值与时间约束筛选关键帧。', 'Combined flow magnitude, moving-pixel ratio, grayscale differences, and local peak changes with dynamic thresholds and temporal constraints.'],
      ['连接 Qwen 视觉描述与 DeepSeek 结构化处理，输出 JSON / JSONL 风险记录。', 'Connected Qwen visual descriptions with DeepSeek-based structuring to produce JSON / JSONL risk records.'],
    ],
    outcome: ['科研简历记录：在覆盖 8 个测试视频的 12 次运行中，363 帧预览画面被筛选为 57 帧代表性关键帧，减少约 84.3%。该指标反映帧数量变化。', 'The research CV reports 12 runs across eight test videos: 363 preview frames were reduced to 57 representative keyframes, an 84.3% reduction in frame count.'],
  },
  {
    id: 'nipt', title: 'NIPT Risk Analysis', category: 'data', year: '2025', visual: 'risk',
    label: ['数据分析 · 数学建模', 'DATA ANALYSIS · MODELING'],
    subtitle: ['数据分析与风险分类', 'Data analysis and risk classification'],
    intro: ['整理高维临床数据，参与统计与机器学习模型优化，分析风险分类结果。', 'Preprocessing high-dimensional clinical records, refining models, and interpreting classification results.'],
    tags: ['Python', 'Machine Learning', 'Data Analysis'],
    goal: ['数学建模竞赛项目：分析 NIPT 检测数据中的关联、分层检测时间与风险分类问题。', 'A mathematical modeling contest project on NIPT data correlations, stratified detection timing, and risk classification.'],
    contributions: [
      ['处理 1,200 余条高维临床记录，进行变量选择、异常值处理、标准化和分层分析。', 'Processed 1,200+ high-dimensional clinical records through variable selection, outlier handling, normalization, and stratification.'],
      ['参与模型代码优化与运行，整理分类实验和结果解释。', 'Contributed to refining and running model code, and interpreting classification experiments.'],
      ['撰写项目报告中的数据分析与技术说明。', 'Wrote analytical and technical sections of the project report.'],
    ],
    outcome: ['简历记录的分类结果为 ROC-AUC 0.881、F1-score 0.705；具体数据集与实验设置将在完整项目说明中补充。', 'The CV reports ROC-AUC 0.881 and F1-score 0.705. Dataset details and experimental settings will be added to the full project write-up.'],
  },
  {
    id: 'reservation', title: 'Reservation Platform', category: 'web', year: '2025', visual: 'booking',
    label: ['软件工程 · Web 开发', 'SOFTWARE ENGINEERING · WEB'],
    subtitle: ['剧本杀预约管理平台', 'Murder mystery game reservation platform'],
    intro: ['围绕预约、支付、用户认证与后台管理，构建完整的课程设计项目。', 'A course project connecting reservations, payments, authentication, and administration.'],
    tags: ['Django', 'MySQL', 'Bootstrap'],
    goal: ['面向顾客、商家和管理员，设计剧本、场次、订单与预约管理流程。', 'Designed script, session, order, and reservation workflows for customers, merchants, and administrators.'],
    contributions: [
      ['使用 Django 与 MySQL 建立用户、剧本、场次、订单等数据模型和功能模块。', 'Built data models and modules for users, scripts, sessions, and orders with Django and MySQL.'],
      ['实现用户认证、前端预约流程和 Django Admin 内容管理。', 'Implemented authentication, front-end reservation flows, and Django Admin content management.'],
      ['使用数据库事务与乐观锁，处理并发预约中的一致性和超售问题。', 'Used database transactions and optimistic locking to address consistency and overselling under concurrent reservations.'],
    ],
    outcome: ['完成预约、支付、认证和管理功能，并进行功能与压力测试。', 'Completed reservation, payment, authentication, and administration functionality with functional and stress testing.'],
  },
];
const pair = (value) => language === 'zh' ? value[0] : value[1];

function heroArt() {
  return `<div class="hero-art" role="img" aria-label="${t('鸢尾花与轨道插画','A flower with delicate orbital lines')}"><svg viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="petal" x1="130" y1="80" x2="260" y2="240" gradientUnits="userSpaceOnUse"><stop stop-color="#e4d9f4"/><stop offset="1" stop-color="#b49bd4"/></linearGradient><linearGradient id="leaf" x1="190" y1="280" x2="260" y2="350"><stop stop-color="#b1c3ac"/><stop offset="1" stop-color="#dbe3d3"/></linearGradient></defs><g opacity=".7"><ellipse cx="204" cy="179" rx="147" ry="100" transform="rotate(-27 204 179)" stroke="#c4b3d9" stroke-width=".7"/><ellipse cx="204" cy="179" rx="129" ry="134" transform="rotate(22 204 179)" stroke="#d6c9e5" stroke-width=".7"/><g class="orbit"><circle cx="66" cy="173" r="4" fill="#bda9d6"/><circle cx="322" cy="127" r="3" fill="#c6b4dd"/><path d="M335 252v12m-6-6h12" stroke="#b19cc9"/></g></g><g class="flower"><path d="M204 326c3-54 2-109-3-149" stroke="#a4b799" stroke-width="3"/><path d="M205 305c-35-25-62-67-62-103 36 21 55 55 62 103Z" fill="url(#leaf)" opacity=".8"/><path d="M205 324c42-17 64-52 64-85-38 17-58 49-64 85Z" fill="#b4c4a5" opacity=".65"/><path d="M200 182c-69-21-76-89-46-100 30-11 47 48 46 100Z" fill="url(#petal)" stroke="#ac91c9" stroke-width=".7"/><path d="M205 182c52-27 76-82 51-99-28-19-54 44-51 99Z" fill="#d4c4e8" stroke="#b49ed0" stroke-width=".7"/><path d="M201 167c-31-43-21-117 4-122 25 8 31 82-4 122Z" fill="url(#petal)" stroke="#b49bd0" stroke-width=".7"/><path d="M202 179c-40-17-84-3-88 37 31 22 76 6 88-37Z" fill="#bca5d7" stroke="#a58abf" stroke-width=".7"/><path d="M203 179c40-16 89 5 90 44-39 16-80-2-90-44Z" fill="#c9b5e2" stroke="#b098cf" stroke-width=".7"/><path d="M201 176c-24 20-27 61-2 76 29-19 28-57 2-76Z" fill="#ab8acb" stroke="#997bb7" stroke-width=".7"/><path d="m192 179 8 26 11-23" stroke="#e3c982" stroke-width="2.6"/><path d="M153 103c12 16 24 35 40 64M243 108c-14 20-24 34-36 59M204 70c-2 36-4 58-4 85M134 213c16-6 36-15 55-26M221 188c21 10 36 22 50 31M198 204v31" stroke="#eee5f8" stroke-width=".8" opacity=".7"/></g><g fill="#a48db7" font-family="Georgia,serif" font-style="italic" font-size="11"><text x="43" y="92">learn</text><text x="301" y="73">adapt</text><text x="292" y="310">curiosity</text></g><path d="M80 286h17m-8.5-8.5v17" stroke="#c4b2d7" stroke-width=".8"/><circle cx="300" cy="37" r="1.8" fill="#bba6cf"/><circle cx="67" cy="227" r="1.8" fill="#bba6cf"/></svg><span class="hero-art-label">a quiet place for curious ideas.</span></div>`;
}

function projectVisual(type) {
  if (type === 'vision') return `<svg viewBox="0 0 420 150" fill="none" aria-hidden="true"><rect x="14" y="8" width="236" height="120" rx="8" fill="#faf7fd" stroke="#d2c1e5"/><path d="M14 31h236" stroke="#e0d4ec"/><circle cx="27" cy="20" r="2" fill="#c3abdd"/><circle cx="36" cy="20" r="2" fill="#dbccec"/><circle cx="45" cy="20" r="2" fill="#dbccec"/><rect x="30" y="46" width="78" height="64" rx="4" fill="#e8dff2"/><path d="M41 90c10-25 21-10 31-25s18-12 23-8" stroke="#bba3d3"/><rect x="48" y="65" width="23" height="31" rx="2" stroke="#9573b8" stroke-dasharray="3 2"/><path d="m114 72 14 0m-4-4 4 4-4 4" stroke="#bba3d3"/><rect x="136" y="46" width="96" height="28" rx="4" fill="#efE8f5"/><rect x="147" y="55" width="58" height="3" rx="1.5" fill="#cab7de"/><rect x="147" y="62" width="40" height="2" rx="1" fill="#d9cbe7"/><rect x="136" y="81" width="96" height="29" rx="4" fill="#efe8f5"/><path d="m146 96 5 4 9-11" stroke="#bca1d1"/><path d="M168 94h42m-42 7h29" stroke="#d0bdE1" stroke-width="2"/><path d="M260 72h29m-6-5 6 5-6 5" stroke="#b9a2cd"/><rect x="303" y="28" width="100" height="81" rx="6" fill="#faf7fd" stroke="#d2c1e5"/><text x="315" y="48" font-family="monospace" font-size="10" fill="#a587c0">{ risk_record }</text><path d="M316 65h59m-59 11h43m-43 11h50" stroke="#d3c2e3" stroke-width="3"/><circle cx="379" cy="119" r="4" fill="#ccbaDF"/></svg>`;
  if (type === 'risk') return `<svg viewBox="0 0 350 150" fill="none" aria-hidden="true"><path d="M30 24v95h285" stroke="#b5c9bc"/><path d="M30 88h285M30 57h285M95 24v95M165 24v95M235 24v95" stroke="#d3e1d7" stroke-dasharray="3 4"/><path d="M40 106c32-1 35-31 71-26 32 5 42-43 70-42 40 2 51-13 113-13" stroke="#8faa97" stroke-width="2"/><path d="M40 106c32-1 35-31 71-26 32 5 42-43 70-42 40 2 51-13 113-13v94H40Z" fill="#b7cdbe" fill-opacity=".22"/><circle cx="111" cy="80" r="4" fill="#f7faf8" stroke="#92ad9b"/><circle cx="181" cy="38" r="4" fill="#f7faf8" stroke="#92ad9b"/><rect x="231" y="83" width="80" height="39" rx="5" fill="#f8fbf9" stroke="#bdcec3"/><text x="242" y="98" fill="#8da596" font-family="monospace" font-size="8">DATA → MODEL</text><path d="M242 110h52" stroke="#ccded2" stroke-width="3"/></svg>`;
  return `<svg viewBox="0 0 350 150" fill="none" aria-hidden="true"><rect x="32" y="12" width="282" height="112" rx="7" fill="#fffaf5" stroke="#e0cdbf"/><path d="M32 34h282" stroke="#e8d8cb"/><circle cx="45" cy="23" r="2" fill="#d4b9a7"/><path d="M57 23h52" stroke="#e3cfbf" stroke-width="3"/><rect x="48" y="49" width="66" height="59" rx="4" fill="#ecdcd0"/><path d="M60 88h42m-42-8h30" stroke="#d4bca8" stroke-width="2"/><rect x="130" y="48" width="64" height="11" rx="3" fill="#e9d8c9"/><path d="M130 71h107m-107 10h83" stroke="#e4d1c1" stroke-width="3"/><rect x="130" y="94" width="70" height="14" rx="4" fill="#d5b9a2"/><rect x="244" y="48" width="52" height="60" rx="4" fill="#f3e8df"/><path d="M252 63h35m-35 10h35m-35 10h35m-35 10h24" stroke="#d9c1ad" stroke-width="2"/></svg>`;
}

function renderProfile() {
  $('#profile').innerHTML = `<div class="avatar"><span class="avatar-photo-frame"><img class="profile-photo" src="assets/profile.png" alt="${t('个人头像插画','Profile illustration')}" width="1374" height="1147"></span><span class="avatar-spark" aria-hidden="true">✧</span></div><h2>Xu Yixin</h2><div class="chinese-name">COMPUTER SCIENCE</div><p class="role">${t('澳门大学 · 计算机科学硕士在读<br>研究方向：持续学习（CL）','Master’s student in Computer Science.<br>Research: Continual Learning (CL).')}</p><div class="since">${t('2026.09 — 至今','SEP 2026 — PRESENT')}</div><p class="profile-advisor">${t('导师：黄治文教授','Advisor: Prof. 黄治文')}</p><ul class="profile-links"><li>${icon('pin')}<span>Macau SAR, China</span></li><li>${icon('school')}<a href="https://www.um.edu.mo/" target="_blank" rel="noopener noreferrer">University of Macau</a></li><li>${icon('globe')}<a href="https://iris-yixinxu.github.io/" target="_blank" rel="noopener noreferrer">Website</a></li><li class="email-item">${icon('mail')}<a href="mailto:mc65300@um.edu.mo">mc65300@um.edu.mo</a></li><li>${icon('github')}<a href="https://github.com/Iris-YixinXu" target="_blank" rel="noopener noreferrer">GitHub</a></li></ul><div class="profile-separator"></div><p class="profile-note">Stay curious. Keep growing.<small>${t('研究 · 创造 · 记录','RESEARCH · CREATE · REFLECT')}</small></p>`;
}

function card(project) {
  return `<article class="project-card"><div class="project-visual ${project.visual}">${projectVisual(project.visual)}<span class="visual-caption">${t('概念示意','CONCEPT DIAGRAM')}</span></div><div class="card-body"><div class="card-topline"><span>${pair(project.label)}</span><span aria-hidden="true">↗</span></div><h3>${project.title}</h3><p>${pair(project.intro)}</p><div class="card-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="card-bottom"><button class="project-open" type="button" data-project="${project.id}" aria-label="${t('查看项目','Explore project')}: ${project.title}">${t('查看项目','Explore project')} <span aria-hidden="true">↗</span></button><span class="year">${project.year}</span></div></div></article>`;
}

function timeline() {
  return `<ol class="timeline"><li><time>2026.09 — ${t('至今','PRESENT')}</time><h3>${t('澳门大学 · 计算机科学硕士在读','University of Macau · Master’s study')}</h3><p>${t('研究方向：持续学习（CL）；导师：黄治文教授。','Continual Learning (CL), advised by Prof. 黄治文.')}</p></li><li><time>2025.06 — 2025.08</time><h3>${t('科大讯飞 · 算法工程实习','iFLYTEK · Algorithm engineering internship')}</h3><p>${t('大语言模型、训练流程与数据处理。','LLM workflows, training pipelines, and data processing.')}</p></li><li><time>2022.09 — 2026.06</time><h3>${t('澳门科技大学 · 计算机科学本科','MUST · B.Sc. in Computer Science')}</h3><p>${t('从软件开发走向计算机视觉与智能系统。','From software development to vision and intelligent systems.')}</p></li></ol>`;
}

function githubSection() {
  return `<section class="section" aria-labelledby="github-heading"><div class="section-heading"><h2 id="github-heading">On GitHub <span style="display:block;margin:5px 0 0">${t('代码里的日常','A little code, every day')}</span></h2><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap"><button id="github-refresh" class="project-open" type="button" data-github-refresh>${t('刷新数据 ↻','Refresh data ↻')}</button><a class="text-link" href="https://github.com/Iris-YixinXu" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div><div class="github-panel"><div><h3>Building, learning.</h3><p>${t('我的公开项目与开源足迹。','My public projects and open-source journey.')}</p></div><div class="github-stats"><div><strong data-github="repos">—</strong><small>${t('公开仓库','PUBLIC REPOS')}</small></div><div><strong data-github="stars">—</strong><small>${t('仓库获星','REPO STARS')}</small></div><div><strong data-github="followers">—</strong><small>${t('关注者','FOLLOWERS')}</small></div></div></div><p class="github-status" id="github-status" aria-live="polite">${t('正在读取 GitHub 公开数据…','Loading public GitHub data…')}</p></section>`;
}

function homePage() {
  return `<div class="eyebrow">A LITTLE ABOUT ME</div><section class="hero" aria-labelledby="hello-title"><div class="hero-copy"><div class="hero-label"><i></i> RESEARCH & BEYOND</div><h1 id="hello-title">Hello,<br>I’m <em>Xu Yixin.</em></h1><p class="intro">${t('欢迎来到我的小小空间。<br>我在<strong>澳门大学</strong>攻读计算机科学硕士，<br>研究方向为<strong>持续学习（CL）</strong>，<br>在这里记录研究、项目与沿途的灵感。','Welcome to my little corner.<br>I’m a Computer Science master’s student at the <strong>University of Macau</strong>, researching <strong>Continual Learning (CL)</strong>. Here I share my research, projects, and ideas.')}</p><div class="hero-actions"><a class="button" href="#portfolio">${t('探索我的项目','Explore my work')} <span aria-hidden="true">↗</span></a><a class="button secondary" href="#cv">${t('查看简历','View my CV')} <span aria-hidden="true">↗</span></a></div></div>${heroArt()}</section><div class="interest-strip"><span>Current research</span><span class="chip">Continual Learning</span><span class="chip">CL</span></div><section class="section" aria-labelledby="projects-heading"><div class="section-heading"><h2 id="projects-heading">Selected work <span>${t('精选项目','Things I’ve worked on')}</span></h2><a class="text-link" href="#portfolio">${t('所有项目','All projects')} ↗</a></div><div class="project-grid">${projects.slice(0, 2).map(card).join('')}</div></section><div class="home-second-row"><section class="section" aria-labelledby="journey-heading"><div class="section-heading"><h2 id="journey-heading">My journey <span>${t('学习与探索','Learning & exploring')}</span></h2><a class="text-link" href="#about">${t('了解更多','More about me')} ↗</a></div>${timeline()}</section><section class="section" aria-labelledby="notes-heading"><div class="section-heading"><h2 id="notes-heading">Little notes <span>${t('最近文章','From my notebook')}</span></h2><a class="text-link" href="#posts">${t('博客','All notes')} ↗</a></div><div class="journal-placeholder"><span class="asterisk" aria-hidden="true">✳</span><span class="mini-label">A NOTEBOOK IN THE MAKING</span><h3>${t('把灵感，慢慢写下来。','Ideas, waiting to become words.')}</h3><p>${t('第一篇笔记还在整理中。<br>这里将记录研究、技术和生活里的发现。','My first note is on its way.<br>A place for discoveries in research, technology, and everyday life.')}</p></div></section></div>${githubSection()}${contactBox()}`;
}

function contactBox() {
  return `<section class="contact-box"><div><h3>${t('Let’s stay in touch.','Let’s stay in touch.')}</h3><p>${t('欢迎交流研究、项目，或打个招呼。','For research, projects, or just a friendly hello.')}</p></div><a class="button secondary" href="mailto:mc65300@um.edu.mo">${t('给我写信','Say hello')} <span aria-hidden="true">↗</span></a></section>`;
}

function biography() {
  const paragraphs = [
    ['我是许艺馨，英文名 Iris。目前在澳门大学攻读计算机科学硕士，于2026年9月入学，导师为黄治文教授。我的研究方向是持续学习（Continual Learning，CL），希望探索模型如何在不断变化的任务与数据中学习、适应，并在获取新知识的同时保留已有能力。',
     'My name is Xu Yixin (许艺馨), and my English name is Iris. I began my master’s studies in Computer Science at the University of Macau in September 2026, advised by Prof. 黄治文. My research focuses on Continual Learning (CL). I hope to explore how models can learn and adapt to changing tasks and data while retaining their existing capabilities.'],
    ['本科期间，我在澳门科技大学学习计算机科学，参与过多模态视频理解、数据分析与 Web 应用开发等项目。其中，DeepGuardian 项目让我接触了光流分析、关键帧提取和大模型协作，也让我更关注算法如何回应实际场景中的问题。',
     'During my undergraduate studies in Computer Science at Macau University of Science and Technology, I worked on projects in multimodal video understanding, data analysis, and web application development. DeepGuardian introduced me to optical-flow analysis, keyframe extraction, and collaboration between large models, and encouraged me to think more closely about how algorithms can address real-world problems.'],
    ['我曾在科大讯飞参与算法工程实习，也参与过李良教授指导的量子点实验室项目。从代码与数据到材料与实验，这些经历让我接触了不同的研究方法，并认识到理解问题、认真验证和清楚表达的重要性。',
     'I have completed an algorithm engineering internship at iFLYTEK and participated in a Quantum Dot Laboratory project guided by Prof. Li Liang. From code and data to materials and experiments, these experiences exposed me to different research methods and taught me the value of understanding a problem, testing carefully, and communicating clearly.'],
    ['研究之外，我喜欢击剑，也有过击剑教练经历，曾获得安徽省女子击剑锦标赛亚军。我享受这项运动中的专注、判断与节奏，也珍惜训练和比赛带来的成长。闲暇时，我喜欢玩 Steam 游戏，在不同的游戏世界里放松，享受探索、挑战和逐步掌握新玩法的乐趣。',
     'Outside research, I enjoy fencing. I have also coached fencing and was runner-up in the Anhui Women’s Fencing Championship. I enjoy the focus, judgment, and rhythm of the sport, as well as the growth that comes through training and competition. In my free time, I like playing games on Steam, exploring different worlds, taking on challenges, and gradually mastering new ways to play.'],
    ['我希望给研究和兴趣都留出空间：认真对待值得探索的问题，也享受生活中的小发现。这个网站是我的个人记录空间，我会在这里分享研究进展、项目实践和学习笔记，偶尔也聊聊击剑、游戏与日常。欢迎交流研究与技术，也欢迎来打个招呼。',
     'I hope to make room for both research and my interests: to take worthwhile questions seriously while enjoying small discoveries in everyday life. This website is my personal notebook, where I share research progress, project work, and learning notes, with occasional thoughts on fencing, games, and daily life. I’m always happy to talk about research and technology, or simply say hello.'],
  ];
  return `<section class="biography" aria-label="${t('个人简介','Personal biography')}">${paragraphs.map(paragraph => `<p>${pair(paragraph)}</p>`).join('')}</section>`;
}

function aboutPage() {
  return `<div class="eyebrow">THE PERSON BEHIND THE WORK</div>
    <h1 class="page-title">About me<span style="color:var(--iris)">.</span></h1>
    ${biography()}
    <div class="bio-interests"><span class="chip">${t('持续学习','Continual Learning')}</span><span class="chip">${t('击剑','Fencing')}</span><span class="chip">Steam Games</span></div>
    <section class="content-panel"><h2>${t('学习与经历','Education & experience')}</h2>${timeline()}
      <h3>${t('量子点实验室 · 项目指导：李良教授','Quantum Dot Laboratory · Project advisor: Prof. Li Liang')}</h3>
      <span class="date">2023.12 — 2024.12 · MUST</span>
      <p>${t('参与介孔二氧化硅纳米颗粒制备，并通过实时荧光信号观察药物递送路径。在跨学科实验中积累研究与工程实践经验。','Participated in preparing mesoporous silica nanoparticles and observing drug-delivery pathways through real-time fluorescence signals, gaining hands-on experience in cross-disciplinary research.')}</p>
    </section>
    <section class="content-panel"><h2>${t('我的工具箱','My toolkit')}</h2><div class="skill-row">${['Python', 'C++', 'MATLAB', 'Java', 'OpenCV', 'PyTorch', 'Django', 'MySQL', 'JavaScript'].map(s => `<span class="chip">${s}</span>`).join('')}</div></section>
    ${contactBox()}`;
}

function researchPage() {
  return `<div class="eyebrow">CONTINUAL LEARNING · RESEARCH</div><h1 class="page-title">Research<span style="color:var(--iris)">.</span></h1><p class="page-lead">${t('我的研究方向为持续学习（Continual Learning，CL）。目前在澳门大学攻读计算机科学硕士，导师为黄治文教授。下面也收录了既往的计算机科研与跨学科项目经历。','My research focuses on Continual Learning (CL). I’m a Computer Science master’s student at the University of Macau, advised by Prof. 黄治文. Below are selected prior research and interdisciplinary project experiences.')}</p><div class="skill-row"><span class="chip">Continual Learning</span><span class="chip">CL</span></div><section class="content-panel current-research"><span class="date">2026.09 — ${t('至今','PRESENT')} · UNIVERSITY OF MACAU</span><h2 style="margin-top:12px">Continual Learning (CL)</h2><p>${t('持续学习是我目前的硕士研究方向。','Continual Learning is the focus of my current master’s research.')}</p><h3>${t('硕士导师：黄治文教授','Master’s advisor: Prof. 黄治文')}</h3></section><div class="section-heading"><h2>${t('既往科研与项目','Prior research & projects')}</h2></div><section class="content-panel"><span class="date">2025 — 2026 · ${t('本科毕业论文与研究项目','UNDERGRADUATE THESIS & RESEARCH')}</span><h2 style="margin-top:12px">DeepGuardian</h2><p>${pair(projects[0].goal)}</p><h3>${t('方法与贡献','Method & contributions')}</h3><ul>${projects[0].contributions.map(c => `<li>${pair(c)}</li>`).join('')}</ul><div class="research-metrics"><div><strong>363 → 57</strong><small>${t('预览帧 → 关键帧','Preview frames → keyframes')}</small></div><div><strong>84.3%</strong><small>${t('帧数量减少','Reduction in frame count')}</small></div><div><strong>8 / 12</strong><small>${t('测试视频 / 运行次数','Test videos / runs')}</small></div></div><div class="card-bottom"><button class="project-open" data-project="deepguardian" type="button">${t('阅读项目说明','Explore the project')} ↗</button></div></section><section class="content-panel"><span class="date">2025 · ${t('数学建模竞赛','MATHEMATICAL MODELING CONTEST')}</span><h2 style="margin-top:12px">NIPT Risk Analysis</h2><p>${pair(projects[1].intro)}</p><p>${pair(projects[1].contributions[0])}</p><div class="card-bottom"><button class="project-open" data-project="nipt" type="button">${t('查看分析项目','View the analysis project')} ↗</button></div></section><section class="content-panel"><span class="date">2025.06 — 2025.08 · iFLYTEK</span><h2 style="margin-top:12px">${t('算法工程实习','Algorithm engineering internship')}</h2><p>${t('参与星火大语言模型相关实验，开展提示词开发、数据集整理与训练流程准备；编写 Python 脚本，支持数据处理、实验调度和文本分类分析。','Supported Spark LLM experimentation through prompt development, dataset curation, and training-workflow preparation. Developed Python scripts for data processing, experiment scheduling, and text-classification analysis.')}</p></section>`;
}

function portfolioPage() {
  const options = [['all', t('全部','All work')], ['ai','AI & Vision'], ['data',t('数据分析','Data analysis')], ['web',t('Web 开发','Web development')]];
  return `<div class="eyebrow">THINGS I’VE BUILT & EXPLORED</div><h1 class="page-title">Portfolio<span style="color:var(--iris)">.</span></h1><p class="page-lead">${t('从视频理解到数据分析，再到完整的 Web 应用。这里收藏我做过的研究与工程项目。','From video understanding and data analysis to complete web applications. A selection of my research and engineering projects.')}</p><div class="filter-row" role="group" aria-label="${t('筛选项目','Filter projects')}">${options.map(([id, label]) => `<button type="button" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`).join('')}</div><div class="project-grid portfolio-grid">${projects.filter(p => filter === 'all' || p.category === filter).map(card).join('')}</div>${contactBox()}`;
}

function emptyPage(route) {
  const pages = {
    teaching: ['SHARING WHAT I LEARN', 'Teaching', '知识，值得被分享。', 'Knowledge is meant to be shared.', '这里将整理课程、助教经历与教学资料，目前还没有发布内容。', 'A future home for courses, teaching-assistant experience, and learning materials. No materials have been published yet.', ['Courses', 'Learning materials']],
    posts: ['A PLACE FOR THOUGHTS', 'Posts', '把灵感，慢慢写下来。', 'Ideas, waiting to become words.', '研究中的发现、解决问题的过程，还有生活里的小小灵感。第一篇笔记正在整理中。', 'Research discoveries, the process of solving problems, and little sparks from everyday life. My first note is in the making.', ['Research notes', 'Tech & code', 'Life']],
    collection: ['THINGS WORTH KEEPING', 'Collection', '收藏让我停下来的事物。', 'Things that make me pause.', '这里将收集喜欢的资源、书籍、工具和影像。收藏内容会在整理后陆续加入。', 'A future collection of resources, books, tools, and images I enjoy. Curated items will be added as I gather them.', ['Resources', 'Books', 'Inspiration']],
  };
  const p = pages[route];
  return `<div class="eyebrow">${p[0]}</div><h1 class="page-title">${p[1]}<span style="color:var(--iris)">.</span></h1><section class="empty-page"><img src="assets/iris.svg" alt=""><h2>${t(p[2], p[3])}</h2><p>${t(p[4], p[5])}</p><div>${p[6].map(tag => `<span class="chip">${tag}</span>`).join('')}</div></section>${contactBox()}`;
}

function cvPage() {
  return `<div class="eyebrow">MY EXPERIENCE, AT A GLANCE</div><h1 class="page-title">Curriculum vitae<span style="color:var(--iris)">.</span></h1><p class="page-lead">${t('澳门大学计算机科学硕士在读（2026 年 9 月起）。以下为已有的两份简历文件；澳门大学在读信息已更新在网页中，下载文件仍为原版本。','Master’s student in Computer Science at the University of Macau since September 2026. The website includes this update; the downloadable files below are the original CV versions.')}</p><div class="cv-grid"><section class="content-panel"><div class="file-icon" aria-hidden="true">01.</div><h2>${t('科研简历','Research CV')}</h2><p>${t('计算机视觉、多模态 AI、机器学习项目与算法实习。','Computer vision, multimodal AI, machine-learning projects, and algorithm engineering experience.')}</p><a class="button" href="downloads/Yixin_Xu_Research_CV.docx" download>${t('下载科研简历','Download research CV')} <span aria-hidden="true">↓</span></a><p class="date" style="margin-top:12px">DOCX · ${t('原始版本','ORIGINAL VERSION')}</p></section><section class="content-panel"><div class="file-icon" aria-hidden="true">02.</div><h2>${t('综合经历简历','General CV')}</h2><p>${t('教育背景、项目、实验室、校园活动与击剑经历。','Education, projects, laboratory experience, campus activities, and fencing.')}</p><a class="button secondary" href="downloads/XuyixinCV.pdf" download>${t('下载综合简历','Download general CV')} <span aria-hidden="true">↓</span></a><p class="date" style="margin-top:12px">PDF · ${t('原始版本','ORIGINAL VERSION')}</p></section></div><section class="content-panel"><h2>${t('教育背景','Education')}</h2><h3>${t('澳门大学 · 计算机科学硕士在读','University of Macau · Master’s student in Computer Science')}</h3><span class="date">2026.09 — ${t('至今','PRESENT')}</span><h3>${t('澳门科技大学 · 计算机科学学士','Macau University of Science and Technology · B.Sc. in Computer Science')}</h3><span class="date">2022.09 — 2026.06</span></section>${contactBox()}`;
}

function labResearchSection() {
  return `<section class="content-panel lab-research"><span class="date">2023.12 — 2024.12 · ${t('澳门科技大学 · 跨学科科研','MUST · CROSS-DISCIPLINARY RESEARCH')}</span><h2 style="margin-top:12px">${t('量子点实验室 · 项目科研经历','Quantum Dot Laboratory · Research project')}</h2><p>${t('参与纳米材料制备与药物递送相关实验，在材料科学与生物医学的交叉研究中积累实验经验。','Participated in nanomaterial preparation and drug-delivery experiments, gaining experience at the intersection of materials science and biomedical research.')}</p><p class="project-advisor"><strong>${t('项目指导老师：李良教授','Project advisor: Prof. Li Liang')}</strong></p><h3>${t('研究内容与参与工作','Research activities & contributions')}</h3><ul><li>${t('学习纳米复合材料制备，参与介孔二氧化硅纳米颗粒（MSN）的制备。','Learned nanocomposite preparation and participated in preparing mesoporous silica nanoparticles (MSN).')}</li><li>${t('参考 Sol–Gel 方法和自组装模板机制，开展材料制备相关实验。','Worked on material-preparation experiments using the Sol–Gel method and self-assembled template mechanisms.')}</li><li>${t('通过实时荧光信号追踪药物递送路径与分布，研究特定刺激下的药物释放。','Tracked drug-delivery pathways and distribution through real-time fluorescence signals, and studied drug release under specific stimuli.')}</li></ul><div class="skill-row"><span class="chip">${t('纳米材料','Nanomaterials')}</span><span class="chip">${t('荧光成像','Fluorescence imaging')}</span><span class="chip">${t('药物递送','Drug delivery')}</span><span class="chip">${t('跨学科研究','Interdisciplinary research')}</span></div></section>`;
}

function route() { const candidate = location.hash.slice(1); return validRoutes.has(candidate) ? candidate : 'home'; }
function renderPage(focusMain = false) {
  if ($('#project-dialog').open) $('#project-dialog').close();
  const current = route();
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = `Xu Yixin — ${current === 'home' ? 'Research & Beyond' : current === 'cv' ? 'CV' : current[0].toUpperCase() + current.slice(1)}`;
  $('meta[name="description"]').content = t('Xu Yixin，澳门大学计算机科学硕士在读，研究方向为持续学习（Continual Learning）。','Xu Yixin, a Computer Science master’s student at the University of Macau, researching Continual Learning (CL).');
  renderProfile();
  const content = current === 'home' ? homePage() : current === 'about' ? aboutPage() : current === 'research' ? researchPage() : current === 'portfolio' ? portfolioPage() : current === 'cv' ? cvPage() : emptyPage(current);
  $('#main').innerHTML = `<div class="page-enter">${content}${current === 'research' ? labResearchSection() : ''}</div>`;
  document.querySelectorAll('#navigation a').forEach(a => {
    if (a.hash.slice(1) === (current === 'home' ? 'about' : current)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-language]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.language === language)));
  $('#footer').innerHTML = `<span>© 2026 Xu Yixin <span aria-hidden="true"> · </span><a href="mailto:mc65300@um.edu.mo">${t('联系我','Contact')}</a></span><span class="footer-note">Made with curiosity.</span>`;
  if (current === 'home') { updateGithub(); loadGithub(); }
  if (focusMain) { $('#main').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
}

function openProject(id) {
  const p = projects.find(project => project.id === id);
  if (!p) return;
  $('#dialog-content').innerHTML = `<div class="eyebrow">${pair(p.label)}</div><h2 id="dialog-title">${p.title}</h2><p style="font-size:12px;color:var(--muted)">${pair(p.subtitle)} · ${p.year}</p><div class="project-visual ${p.visual} dialog-visual">${projectVisual(p.visual)}<span class="visual-caption">${t('概念示意','CONCEPT DIAGRAM')}</span></div><div class="dialog-body"><h3>${t('项目目标','Project goal')}</h3><p>${pair(p.goal)}</p><h3>${t('我的工作','My contributions')}</h3><ul>${p.contributions.map(c => `<li>${pair(c)}</li>`).join('')}</ul><h3>${t('成果与记录','Results & notes')}</h3><p>${pair(p.outcome)}</p><div class="skill-row">${p.tags.map(tag => `<span class="chip">${tag}</span>`).join('')}</div><div class="media-note">${t('演示视频、动图与项目仓库链接将在整理后加入。','Demo videos, animations, and project repository links will be added when available.')}</div></div>`;
  $('#project-dialog').showModal();
  $('#project-dialog').scrollTop = 0;
}

function updateGithub() {
  const status = $('#github-status');
  if (!status) return;
  const refreshButton = $('#github-refresh');
  if (refreshButton) {
    refreshButton.disabled = githubLoading;
    refreshButton.setAttribute('aria-busy', String(githubLoading));
    refreshButton.textContent = githubLoading ? t('刷新中…', 'Refreshing…') : t('刷新数据 ↻', 'Refresh data ↻');
  }
  let timestamp = '';
  if (githubData) {
    Object.entries({repos: githubData.repos, stars: githubData.stars, followers: githubData.followers}).forEach(([key, value]) => {
      const node = $(`[data-github="${key}"]`); if (node) node.textContent = String(value);
    });
    timestamp = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en', {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(githubData.updated));
  }
  if (githubLoading) status.textContent = t('正在刷新 GitHub 公开数据…', 'Refreshing public GitHub data…');
  else if (githubFailed) status.textContent = githubData
    ? t(`更新暂时失败，当前为 ${timestamp} 的数据，可点击“刷新数据”重试。`, `Refresh failed. Showing data from ${timestamp}; use Refresh data to retry.`)
    : t('暂时无法读取公开数据，可点击“刷新数据”重试。', 'Public data is temporarily unavailable. Use Refresh data to retry.');
  else if (githubData) status.textContent = t(`GitHub 公开数据 · 更新于 ${timestamp} · 获星为公开仓库的 Stars 合计。`, `Public GitHub data · Updated ${timestamp} · Stars are summed across public owned repositories.`);
}

function validGithubCache(cached) {
  return cached && cached.user === GITHUB_USER
    && [cached.repos, cached.stars, cached.followers].every(value => Number.isInteger(value) && value >= 0)
    && Number.isFinite(cached.updated) && Date.now() >= cached.updated;
}

function freshGithubCache(cached) {
  return validGithubCache(cached) && Date.now() - cached.updated < GITHUB_CACHE_TTL;
}

async function loadGithub({force = false} = {}) {
  if (githubRequest) return githubRequest;
  if (!force) {
    if (freshGithubCache(githubData)) { updateGithub(); return; }
    try {
      const cached = JSON.parse(localStorage.getItem(GITHUB_CACHE_KEY) || 'null');
      if (validGithubCache(cached)) githubData = cached;
      if (freshGithubCache(cached)) { updateGithub(); return; }
    } catch {}
  }
  githubLoading = true;
  githubFailed = false;
  updateGithub();
  githubRequest = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const get = async path => {
      const response = await fetch(`https://api.github.com/${path}`, {signal:controller.signal,cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
      if (!response.ok) throw new Error('GitHub data unavailable');
      return response.json();
    };
    try {
      const [user, initialRepos] = await Promise.all([get(`users/${GITHUB_USER}`), get(`users/${GITHUB_USER}/repos?per_page=100&type=owner&page=1`)]);
      if (!Number.isInteger(user.public_repos) || user.public_repos < 0 || !Number.isInteger(user.followers) || user.followers < 0 || !Array.isArray(initialRepos)) throw new Error('Invalid public GitHub data');
      let repos = [...initialRepos];
      for (let page = 2; (page - 1) * 100 < user.public_repos; page++) {
        const batch = await get(`users/${GITHUB_USER}/repos?per_page=100&type=owner&page=${page}`);
        if (!Array.isArray(batch)) throw new Error('Invalid public repositories');
        repos.push(...batch); if (batch.length < 100) break;
      }
      githubData = {user:GITHUB_USER,repos:user.public_repos,followers:user.followers,stars:repos.filter(repo => repo.private !== true).reduce((total, repo) => total + (repo.stargazers_count || 0), 0),updated:Date.now()};
      try { localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(githubData)); } catch {}
    } catch { githubFailed = true; }
    finally { clearTimeout(timeout); githubLoading = false; githubRequest = null; updateGithub(); }
  })();
  return githubRequest;
}

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault(); $('#main').focus({preventScroll:true}); $('#main').scrollIntoView({block:'start'}); return;
  }
  const button = event.target.closest('button');
  if (button?.dataset.language) {
    language = button.dataset.language;
    try { localStorage.setItem('iris-language', language); } catch {}
    renderPage();
  } else if (button?.hasAttribute('data-github-refresh')) loadGithub({force:true});
  else if (button?.dataset.project) openProject(button.dataset.project);
  else if (button?.dataset.filter) {
    filter = button.dataset.filter; renderPage();
    $(`[data-filter="${filter}"]`)?.focus({preventScroll:true});
  } else if (button?.classList.contains('dialog-close')) $('#project-dialog').close();
  else if (button?.classList.contains('menu-toggle')) {
    const isOpen = $('#navigation').classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  }
  if (event.target.closest('#navigation a, .brand')) {
    $('#navigation').classList.remove('open');
    $('.menu-toggle').setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#navigation').classList.contains('open')) {
    $('#navigation').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded','false'); $('.menu-toggle').focus();
  }
});
$('#project-dialog').addEventListener('click', event => {
  if (event.target !== $('#project-dialog')) return;
  const rect = $('#project-dialog').getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#project-dialog').close();
});
window.addEventListener('hashchange', () => renderPage(true));
renderPage();
