/**
 * 2026 국립한국해양대학교 가을 대동제 모바일 웹 초대장
 * Full Interactive Logic (Login, Persistent Ticket, Guestbook Refresh, Image Fallbacks)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  initLandmarkCarousel();
  initScheduleTabs();
  initAuthSystem();
  initPersistentGuestbook();
  initRsvpAndTickets();
  initShareFeatures();
  initBackgroundCanvas();
  initWebAudioBgm();
  checkExistingTicket();
  initImageFallbackHandler();
});

/* =========================================================
   0. Image Path Fallback Handler (For Korean / Encoding Safe Load)
========================================================= */
function initImageFallbackHandler() {
  const imageMap = {
    '사진/한나라호.jpeg': 'images/hannara.jpeg',
    '사진/앵카탑.jpeg': 'images/anchor.jpeg',
    '사진/해사대학관.jpeg': 'images/maritime.jpeg',
    '사진/아치해변.jpeg': 'images/beach.jpeg',
    '사진/에스파.jpeg': 'images/aespa.jpeg',
    '사진/리센느.jpeg': 'images/rescene.jpeg'
  };

  // Check background images in elements
  document.querySelectorAll('[style*="background-image"]').forEach(el => {
    const style = el.getAttribute('style');
    for (const [krPath, enPath] of Object.entries(imageMap)) {
      if (style && style.includes(krPath)) {
        // Preload image test
        const img = new Image();
        img.onerror = () => {
          el.style.backgroundImage = `url('${enPath}')`;
        };
        img.src = krPath;
      }
    }
  });
}

/* =========================================================
   1. Realtime D-Day Countdown Timer
========================================================= */
function initCountdownTimer() {
  const festivalTargetDate = new Date('2026-10-28T17:00:00+09:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const distance = festivalTargetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* =========================================================
   2. Campus Landmark Interactive Carousel
========================================================= */
function initLandmarkCarousel() {
  const slides = document.querySelectorAll('.landmark-slide');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      showSlide(idx);
      startAutoplay();
    });
  });

  function startAutoplay() {
    timer = setInterval(nextSlide, 4000);
  }

  startAutoplay();
}

/* =========================================================
   3. Schedule Day 1 & Day 2 Tab Switcher
========================================================= */
function initScheduleTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const contentDay1 = document.getElementById('content-day1');
  const contentDay2 = document.getElementById('content-day2');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetDay = btn.getAttribute('data-day');
      if (targetDay === 'day1') {
        contentDay1.classList.add('active');
        contentDay2.classList.remove('active');
      } else {
        contentDay1.classList.remove('active');
        contentDay2.classList.add('active');
      }
    });
  });
}

/* =========================================================
   4. User Authentication (Student Portal vs Guest Non-member)
========================================================= */
let currentUser = null;

function initAuthSystem() {
  const btnAuthHeader = document.getElementById('btn-auth-header');
  const authStatusText = document.getElementById('auth-status-text');
  const loginModal = document.getElementById('login-modal');
  const btnCloseLogin = document.getElementById('btn-close-login');
  const btnOpenLogin = document.getElementById('btn-open-login');

  const tabStudent = document.getElementById('tab-btn-student');
  const tabGuest = document.getElementById('tab-btn-guest');
  const studentForm = document.getElementById('student-login-form');
  const guestForm = document.getElementById('guest-login-form');

  // Load saved session
  const savedAuth = localStorage.getItem('kmou_auth_user');
  if (savedAuth) {
    try {
      currentUser = JSON.parse(savedAuth);
      updateAuthUI();
    } catch (e) {}
  }

  function openLoginModal() {
    loginModal.classList.add('open');
  }

  function closeLoginModal() {
    loginModal.classList.remove('open');
  }

  btnAuthHeader.addEventListener('click', () => {
    if (currentUser) {
      if (confirm(`현재 [${currentUser.name}]님으로 로그인되어 있습니다. 로그아웃 하시겠습니까?`)) {
        logoutUser();
      }
    } else {
      openLoginModal();
    }
  });

  btnOpenLogin.addEventListener('click', openLoginModal);
  btnCloseLogin.addEventListener('click', closeLoginModal);
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
  });

  // Switch Login Tabs
  tabStudent.addEventListener('click', () => {
    tabStudent.classList.add('active');
    tabGuest.classList.remove('active');
    studentForm.classList.add('active');
    guestForm.classList.remove('active');
  });

  tabGuest.addEventListener('click', () => {
    tabGuest.classList.add('active');
    tabStudent.classList.remove('active');
    guestForm.classList.add('active');
    studentForm.classList.remove('active');
  });

  // Student Submit
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const stuId = document.getElementById('login-stu-id').value.trim();
    const name = document.getElementById('login-stu-name').value.trim();
    const dept = document.getElementById('login-stu-dept').value;

    currentUser = {
      type: 'STUDENT',
      id: stuId,
      name: name,
      affiliation: dept
    };

    localStorage.setItem('kmou_auth_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeLoginModal();
    showToast(`⚓ ${name} 학우님, 한국해양대 포털 로그인 완료!`);
  });

  // Guest Submit
  guestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('login-gst-name').value.trim();
    const phone = document.getElementById('login-gst-phone').value.trim();
    const org = document.getElementById('login-gst-org').value.trim();

    currentUser = {
      type: 'GUEST',
      id: phone,
      name: name,
      affiliation: org
    };

    localStorage.setItem('kmou_auth_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeLoginModal();
    showToast(`✨ ${name} 님, 비회원 게스트 로그인 완료!`);
  });
}

function updateAuthUI() {
  const authStatusText = document.getElementById('auth-status-text');
  const btnAuthHeader = document.getElementById('btn-auth-header');
  const authBoxType = document.getElementById('auth-box-type');
  const authBoxName = document.getElementById('auth-box-name');
  const authBoxAvatar = document.getElementById('auth-box-avatar');
  const btnOpenLogin = document.getElementById('btn-open-login');

  const userNameInput = document.getElementById('user-name');
  const userAffilInput = document.getElementById('user-affiliation');
  const typeRadios = document.querySelectorAll('input[name="ticketType"]');

  if (currentUser) {
    authStatusText.textContent = `${currentUser.name} 님`;
    btnAuthHeader.classList.add('logged-in');

    authBoxType.textContent = currentUser.type === 'STUDENT' ? '국립한국해양대학교 재학생' : '외부인 / 일반 게스트';
    authBoxName.textContent = `${currentUser.name} (${currentUser.affiliation})`;
    authBoxAvatar.innerHTML = currentUser.type === 'STUDENT' ? '<i class="fa-solid fa-graduation-cap"></i>' : '<i class="fa-solid fa-user-check"></i>';
    btnOpenLogin.innerHTML = '계정 변경 <i class="fa-solid fa-arrows-rotate"></i>';

    userNameInput.value = currentUser.name;
    userAffilInput.value = currentUser.affiliation;

    typeRadios.forEach(r => {
      if (r.value === currentUser.type) r.checked = true;
    });
  } else {
    authStatusText.textContent = '로그인';
    btnAuthHeader.classList.remove('logged-in');
    authBoxType.textContent = '로그인 필요';
    authBoxName.textContent = '로그인 후 티켓 발권이 가능합니다.';
    authBoxAvatar.innerHTML = '<i class="fa-regular fa-user"></i>';
    btnOpenLogin.innerHTML = '로그인 하기 <i class="fa-solid fa-arrow-right-to-bracket"></i>';
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('kmou_auth_user');
  updateAuthUI();
  showToast('로그아웃 되었습니다.');
}

/* =========================================================
   5. Persistent Guestbook & Realtime Interactive Refresh
========================================================= */
const INITIAL_CHEERS = [
  { name: '이동현', dept: '해사대학 항해학부', time: '방금 전', msg: '에스파 보러 해양대로 출항합니다! 광어잡이도 꼭 1등할게요 🔥' },
  { name: '김지민', dept: '해양과학기술융합대', time: '10분 전', msg: '요트체험 재학생 무료라니 친구들이랑 바로 신청했어요! ⛵' },
  { name: '박서준', dept: '해양인문사회과학대', time: '30분 전', msg: '정도윤님 단독 콘서트 라이브 너무 기대됩니다 ㅠㅠ' },
  { name: '최유나', dept: '부산대 (외부인 방문)', time: '1시간 전', msg: '해양대 섬 캠퍼스 뷰 진짜 예쁘다고 들어서 친구들이랑 놀러갑니다!' },
  { name: '강태우', dept: '해양대 동문 (17학번)', time: '3시간 전', msg: '오랜만에 아치캠퍼스 방문하네요. 후배님들 축제 안전하고 신나게 즐기세요!' }
];

const RANDOM_NEW_CHEERS = [
  { name: '조현우', dept: '해사대 기관공학부', time: '방금 전', msg: '10월 28일 축제날 실습선 야경 뷰 진짜 레전드일 듯!' },
  { name: '손유진', dept: '해양융합디자인학부', time: '방금 전', msg: '리센느 YoYo 라이브 들으러 2일차 칼퇴하고 달려갑니다 💖' },
  { name: '한상민', dept: '해양행정학과', time: '방금 전', msg: '바비큐 닭꼬치 푸드트럭 싹 쓸어버리겠습니다 🍢' },
  { name: '윤채원', dept: '부경대 (타대생)', time: '방금 전', msg: '친구랑 190번 버스 타고 영도로 출격합니다!' },
  { name: '배준성', dept: '해양경찰학과', time: '방금 전', msg: '조정부 로잉머신 챌린지 1등 상품 제가 가져갑니다 💪' }
];

function getStoredCheers() {
  try {
    const data = localStorage.getItem('kmou_festival_cheers');
    return data ? JSON.parse(data) : INITIAL_CHEERS;
  } catch (e) {
    return INITIAL_CHEERS;
  }
}

function saveCheersToStorage(list) {
  try {
    localStorage.setItem('kmou_festival_cheers', JSON.stringify(list));
  } catch (e) {}
}

function initPersistentGuestbook() {
  renderGuestbookList();

  const btnRefresh = document.getElementById('btn-refresh-cheers');
  const refreshIcon = document.getElementById('refresh-icon');

  btnRefresh.addEventListener('click', () => {
    refreshIcon.classList.add('rotating');

    setTimeout(() => {
      refreshIcon.classList.remove('rotating');

      const randomCheer = RANDOM_NEW_CHEERS[Math.floor(Math.random() * RANDOM_NEW_CHEERS.length)];
      const currentList = getStoredCheers();
      
      currentList.unshift({
        ...randomCheer,
        time: '방금 전'
      });

      if (currentList.length > 20) currentList.pop();

      saveCheersToStorage(currentList);
      renderGuestbookList();
      showToast('✨ 최신 축제 응원글이 새로고침 되었습니다!');
    }, 600);
  });
}

function renderGuestbookList() {
  const cheerContainer = document.getElementById('cheer-feed');
  cheerContainer.innerHTML = '';

  const list = getStoredCheers();
  list.forEach(item => {
    const bubble = document.createElement('div');
    bubble.className = 'cheer-bubble';
    bubble.innerHTML = `
      <div class="cheer-bubble-header">
        <span class="cheer-author">${escapeHtml(item.name)} <small style="color:#64748b;font-weight:normal;">(${escapeHtml(item.dept)})</small></span>
        <span>${escapeHtml(item.time || '오늘')}</span>
      </div>
      <p class="cheer-msg">${escapeHtml(item.msg)}</p>
    `;
    cheerContainer.appendChild(bubble);
  });
}

function addNewCheer(name, dept, msg) {
  const currentList = getStoredCheers();
  currentList.unshift({
    name: name,
    dept: dept,
    time: '방금 전',
    msg: msg
  });
  saveCheersToStorage(currentList);
  renderGuestbookList();
}

/* =========================================================
   6. RSVP & Ticket Issuing (Login Required + Cancellation Notice)
========================================================= */
function initRsvpAndTickets() {
  const rsvpForm = document.getElementById('rsvp-form');
  const ticketModal = document.getElementById('ticket-modal');
  const btnCloseTicket = document.getElementById('btn-close-ticket');
  const btnSaveTicket = document.getElementById('btn-save-ticket');
  const btnShareTicket = document.getElementById('btn-share-ticket');
  const liveAttendeeCountEl = document.getElementById('live-attendee-count');
  const btnReopenTicket = document.getElementById('btn-reopen-my-ticket');

  let attendeeCount = parseInt(localStorage.getItem('kmou_attendee_count')) || 1489;
  liveAttendeeCountEl.textContent = attendeeCount.toLocaleString();

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('⚠️ 먼저 로그인을 진행해 주세요.');
      document.getElementById('login-modal').classList.add('open');
      return;
    }

    const formData = new FormData(rsvpForm);
    const ticketType = formData.get('ticketType');
    const userName = formData.get('userName').trim();
    const userAffiliation = formData.get('userAffiliation').trim();
    const attendDays = formData.get('attendDays');
    const userCompanions = formData.get('userCompanions');
    const userMessage = formData.get('userMessage').trim();

    const ticketRandomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = ticketType === 'STUDENT' ? 'KMOU-STU' : 'KMOU-GST';
    const ticketNo = `${prefix}-2026-${ticketRandomNum}`;

    const ticketData = {
      type: ticketType,
      name: userName,
      affiliation: userAffiliation,
      date: attendDays,
      party: userCompanions,
      ticketNo: ticketNo
    };

    localStorage.setItem('kmou_saved_ticket', JSON.stringify(ticketData));

    renderTicketModal(ticketData);

    attendeeCount += 1;
    localStorage.setItem('kmou_attendee_count', attendeeCount);
    liveAttendeeCountEl.textContent = attendeeCount.toLocaleString();

    if (userMessage) {
      addNewCheer(userName, userAffiliation, userMessage);
    }

    showMyTicketBanner(ticketData);

    ticketModal.classList.add('open');
    showToast('🎉 모바일 축제 티켓이 성공적으로 발권되었습니다!');
  });

  btnCloseTicket.addEventListener('click', () => {
    ticketModal.classList.remove('open');
  });

  ticketModal.addEventListener('click', (e) => {
    if (e.target === ticketModal) ticketModal.classList.remove('open');
  });

  btnSaveTicket.addEventListener('click', () => {
    showToast('📸 티켓 화면을 캡처하여 축제 입장 시 제시해 주세요!');
  });

  btnShareTicket.addEventListener('click', () => {
    shareFestivalInvitation();
  });

  btnReopenTicket.addEventListener('click', () => {
    const saved = localStorage.getItem('kmou_saved_ticket');
    if (saved) {
      renderTicketModal(JSON.parse(saved));
      ticketModal.classList.add('open');
    }
  });
}

function renderTicketModal(data) {
  document.getElementById('t-user-name').textContent = data.name;
  document.getElementById('t-user-dept').textContent = data.affiliation;
  document.getElementById('t-user-date').textContent = data.date;
  document.getElementById('t-user-party').textContent = data.party;
  document.getElementById('t-ticket-no').textContent = data.ticketNo;

  const typeBadge = document.getElementById('t-pass-type-badge');
  const benefitEl = document.getElementById('t-user-benefit');

  if (data.type === 'STUDENT') {
    typeBadge.textContent = '재학생 VIP PASS';
    typeBadge.className = 'ticket-pass-type';
    benefitEl.textContent = '요트체험 무료 (0원) · 광어잡이 5천원';
    benefitEl.className = 'val highlight-benefit';
  } else {
    typeBadge.textContent = '외부인 / 일반 GUEST PASS';
    typeBadge.className = 'ticket-pass-type guest-badge';
    benefitEl.textContent = '광어잡이 1만원 · 요트체험 5천원';
    benefitEl.className = 'val highlight-benefit';
  }
}

function checkExistingTicket() {
  const saved = localStorage.getItem('kmou_saved_ticket');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      showMyTicketBanner(data);
      document.getElementById('already-issued-box').style.display = 'flex';
    } catch (e) {}
  }
}

function showMyTicketBanner(data) {
  const banner = document.getElementById('my-ticket-banner');
  const nameEl = document.getElementById('banner-user-name');
  const typeEl = document.getElementById('banner-user-type');
  const btnView = document.getElementById('btn-view-saved-ticket');

  nameEl.textContent = data.name;
  typeEl.textContent = data.type === 'STUDENT' ? '재학생' : '일반 게스트';
  banner.style.display = 'flex';

  btnView.onclick = () => {
    renderTicketModal(data);
    document.getElementById('ticket-modal').classList.add('open');
  };
}

/* =========================================================
   7. Share & Copy Link Functionality
========================================================= */
function initShareFeatures() {
  const btnShareTop = document.getElementById('btn-share-top');
  const btnShareKakao = document.getElementById('btn-share-kakao');
  const btnCopyLink = document.getElementById('btn-copy-link');

  btnShareTop.addEventListener('click', shareFestivalInvitation);
  btnShareKakao.addEventListener('click', shareFestivalInvitation);
  
  btnCopyLink.addEventListener('click', () => {
    copyToClipboard(window.location.href);
  });
}

function shareFestivalInvitation() {
  const shareData = {
    title: '2026 국립한국해양대학교 가을 축제 초대장 🌊✨',
    text: '10.28(수)~10.29(목) aespa, 정도윤, 리센느 출연! 광어잡이, 요트체험, 푸드트럭까지! 함께 가요!',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {
      copyToClipboard(window.location.href);
    });
  } else {
    copyToClipboard(window.location.href);
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✨ 초대 링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
      legacyCopy(text);
    });
  } else {
    legacyCopy(text);
  }
}

function legacyCopy(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast('✨ 초대 링크가 클립보드에 복사되었습니다!');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* =========================================================
   8. Background Ocean Sparkle & Floating Leaf Canvas
========================================================= */
function initBackgroundCanvas() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1;
      this.speedY = -(Math.random() * 0.35 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.15;
      this.fadeSpeed = (Math.random() * 0.006 + 0.002);
      const colors = ['#0284c7', '#38bdf8', '#0ea5e9', '#f59e0b', '#fb923c'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fadeSpeed;

      if (this.opacity <= 0 || this.y < 0) {
        this.reset();
        this.y = height + 10;
        this.opacity = Math.random() * 0.6 + 0.15;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* =========================================================
   9. Web Audio API Festival BGM
========================================================= */
function initWebAudioBgm() {
  const btnAudio = document.getElementById('btn-audio-toggle');
  let audioCtx = null;
  let isPlaying = false;
  let sequenceTimer = null;

  const notes = [
    [349.23, 440.00, 523.25, 659.25], // Fmaj7
    [392.00, 493.88, 587.33, 783.99], // G
    [329.63, 392.00, 493.88, 587.33], // Em7
    [440.00, 523.25, 659.25, 880.00]  // Am7
  ];

  let currentChord = 0;

  function playChord(chordNotes) {
    if (!audioCtx || !isPlaying) return;

    chordNotes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.3);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.4);
    });
  }

  function startBgm() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    btnAudio.classList.add('active');
    btnAudio.innerHTML = '<i class="fa-solid fa-volume-high"></i>';

    function loop() {
      if (!isPlaying) return;
      playChord(notes[currentChord]);
      currentChord = (currentChord + 1) % notes.length;
      sequenceTimer = setTimeout(loop, 2200);
    }
    loop();
    showToast('🎵 감성 오션 BGM이 재생됩니다.');
  }

  function stopBgm() {
    isPlaying = false;
    clearTimeout(sequenceTimer);
    btnAudio.classList.remove('active');
    btnAudio.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    showToast('🔇 BGM이 음소거되었습니다.');
  }

  btnAudio.addEventListener('click', () => {
    if (isPlaying) stopBgm();
    else startBgm();
  });
}
