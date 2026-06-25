/*
 ╔ *══════════════════════════════════════════════════════════════════╗
 ║   SCRIPT.JS — Toàn bộ JavaScript cho VN Digital Landing Page   ║
 ║   Ngôn ngữ: Vanilla JavaScript (JS thuần — không có thư viện) ║
 ╠══════════════════════════════════════════════════════════════════╣
 ║   MỤC LỤC:                                                      ║
 ║   1. Khởi tạo — chạy khi trang tải xong                        ║
 ║   2. Navbar — điều hướng và hamburger menu                      ║
 ║   3. NetworkCanvas — vẽ mạng lưới chấm kết nối                 ║
 ║   4. ScrollObserver — theo dõi cuộn để kích animation           ║
 ║   5. CounterAnimation — đếm số từ 0 lên                        ║
 ║   6. QRCodeGenerator — vẽ mã QR giả                            ║
 ║   7. AppCards — thẻ ứng dụng mở/đóng khi click                 ║
 ║   8. ActiveNavLink — đánh dấu mục menu đang xem                ║
 ╚══════════════════════════════════════════════════════════════════╝
 */


/* ════════════════════════════════════════════════════════════════
 * 1. KHỞI TẠO — SỰ KIỆN DOMContentLoaded
 * DOMContentLoaded: kích hoạt khi HTML đã tải và phân tích xong
 * (nhanh hơn window.onload — không cần chờ ảnh tải xong)
 * ════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  /*
   * Gọi lần lượt từng module để khởi tạo toàn bộ tính năng
   * Thứ tự quan trọng: canvas trước, sau đó observer, rồi các tính năng nhỏ
   */

  initNavbar();           // Khởi tạo thanh điều hướng
  initNetworkCanvas();    // Vẽ mạng lưới chấm ở hero
  initScrollObserver();   // Theo dõi cuộn trang
  initQRCode();           // Vẽ mã QR giả
  initAppCards();         // Tính năng thẻ ứng dụng
  initActiveNavLink();    // Đánh dấu link menu active

  // Ghi log để biết script đã chạy thành công
  console.log('%c🇻🇳 VN Digital — Script khởi động thành công!',
              'color: #FFCD00; background: #DA251D; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
});


/* ════════════════════════════════════════════════════════════════
 * 2. NAVBAR — THANH ĐIỀU HƯỚNG
 * Xử lý: cuộn trang (thêm nền), menu hamburger (mở/đóng)
 * ════════════════════════════════════════════════════════════════ */
function initNavbar () {

  /* Lấy các phần tử DOM cần thao tác */
  const navbar    = document.getElementById('navbar');      // Thanh nav
  const navToggle = document.getElementById('navToggle');   // Nút hamburger
  const navMenu   = document.getElementById('navMenu');     // Danh sách menu
  const navLinks  = document.querySelectorAll('.nav-link'); // Tất cả link

  /*
   * XỬ LÝ SỰ KIỆN CUỘN TRANG
   * window.addEventListener('scroll') chạy mỗi khi người dùng cuộn
   * window.scrollY: số pixel đã cuộn từ đầu trang xuống
   */
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      // Đã cuộn hơn 50px — thêm class .scrolled để CSS đổi nền navbar
      navbar.classList.add('scrolled');
    } else {
      // Chưa cuộn nhiều — xóa class .scrolled để navbar trong suốt lại
      navbar.classList.remove('scrolled');
    }
  });

  /*
   * XỬ LÝ NÚT HAMBURGER
   * toggle(): nếu có class thì xóa, nếu không có thì thêm
   */
  navToggle.addEventListener('click', function () {
    // Kiểm tra menu hiện đang mở hay đóng
    const isOpen = navMenu.classList.contains('open');

    // Đổi trạng thái
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');

    // Cập nhật aria-expanded để screen reader biết trạng thái
    navToggle.setAttribute('aria-expanded', !isOpen);
  });

  /*
   * ĐÓNG MENU KHI BẤM VÀO LINK
   * forEach: lặp qua từng link và gán sự kiện click
   */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      // Xóa các class mở menu
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /*
   * ĐÓNG MENU KHI BẤM RA NGOÀI
   * event.target: phần tử người dùng vừa click
   * contains(): kiểm tra phần tử có nằm trong navbar không
   */
  document.addEventListener('click', function (event) {
    const isInsideNav = navbar.contains(event.target);
    if (!isInsideNav && navMenu.classList.contains('open')) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ════════════════════════════════════════════════════════════════
 * 3. NETWORK CANVAS — VẼ MẠNG LƯỚI CHẤM KẾT NỐI
 * Sử dụng HTML5 Canvas API để vẽ đồ họa 2D bằng JavaScript
 * Kỹ thuật: Particle System (hệ thống hạt)
 * ════════════════════════════════════════════════════════════════ */
function initNetworkCanvas () {

  /* Lấy thẻ canvas và context 2D (bút vẽ) */
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return; // Nếu không có canvas thì thoát hàm

  // ctx (context): đối tượng có các hàm vẽ như fillRect, arc, lineTo...
  const ctx = canvas.getContext('2d');

  /* === CÀI ĐẶT === */
  const PARTICLE_COUNT  = 80;   // Số lượng chấm
  const MAX_DISTANCE    = 130;  // Khoảng cách tối đa để vẽ đường kết nối
  const SPEED_RANGE     = 0.4;  // Tốc độ di chuyển tối đa
  const PARTICLE_RADIUS = 2;    // Kích thước chấm

  // Màu sắc — lấy từ biến CSS
  const COLOR_PARTICLE   = 'rgba(0, 212, 255,';   // Cyan
  const COLOR_CONNECTION = 'rgba(218, 37, 29,';    // Đỏ

  /*
   * MẢNG LƯU TẤT CẢ CÁC CHẤM
   * Mỗi chấm là một Object với: tọa độ x,y; vận tốc vx,vy
   */
  let particles = [];

  /*
   * HÀM ĐẶT KÍCH THƯỚC CANVAS = KÍCH THƯỚC CỬA SỔ
   * Mỗi khi người dùng thay đổi kích thước cửa sổ, gọi lại hàm này
   */
  function resizeCanvas () {
    canvas.width  = canvas.offsetWidth;   // Chiều rộng thực của canvas trên DOM
    canvas.height = canvas.offsetHeight;  // Chiều cao thực
  }

  /*
   * HÀM TẠO MỘT CHẤM NGẪU NHIÊN
   * Math.random(): số thực ngẫu nhiên từ 0 đến 1
   * Math.random() * N: số từ 0 đến N
   * (Math.random() - 0.5) * N: số từ -N/2 đến N/2
   */
  function createParticle () {
    return {
      x: Math.random() * canvas.width,          // Vị trí X ngẫu nhiên
      y: Math.random() * canvas.height,          // Vị trí Y ngẫu nhiên
      vx: (Math.random() - 0.5) * SPEED_RANGE,  // Vận tốc X (âm = trái, dương = phải)
      vy: (Math.random() - 0.5) * SPEED_RANGE,  // Vận tốc Y (âm = lên, dương = xuống)
      radius: PARTICLE_RADIUS + Math.random() * 1.5, // Bán kính ngẫu nhiên
      opacity: 0.3 + Math.random() * 0.5,        // Độ trong suốt ngẫu nhiên
    };
  }

  /*
   * HÀM KHỞI TẠO TẤT CẢ CHẤM
   * Tạo mảng particles với PARTICLE_COUNT phần tử
   */
  function initParticles () {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  /*
   * HÀM CẬP NHẬT VỊ TRÍ CHẤM MỖI FRAME
   * Mỗi frame: di chuyển chấm theo vận tốc, nảy lại nếu chạm biên
   */
  function updateParticles () {
    particles.forEach(function (p) {
      // Di chuyển: vị trí mới = vị trí cũ + vận tốc
      p.x += p.vx;
      p.y += p.vy;

      // Nảy lại khi chạm biên trái hoặc phải
      if (p.x < 0 || p.x > canvas.width)  { p.vx *= -1; }
      // Nảy lại khi chạm biên trên hoặc dưới
      if (p.y < 0 || p.y > canvas.height) { p.vy *= -1; }
    });
  }

  /*
   * HÀM VẼ TẤT CẢ CHẤM
   * ctx.beginPath(): bắt đầu đường vẽ mới
   * ctx.arc(x, y, r, 0, Math.PI*2): vẽ hình tròn tại (x,y), bán kính r
   */
  function drawParticles () {
    particles.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      // fillStyle: màu tô bên trong
      ctx.fillStyle = COLOR_PARTICLE + p.opacity + ')';
      ctx.fill();
    });
  }

  /*
   * HÀM VẼ ĐƯỜNG KẾT NỐI GIỮA CÁC CHẤM GẦN NHAU
   * Tính khoảng cách giữa 2 điểm: công thức Pythagoras
   * d = √((x2-x1)² + (y2-y1)²)
   * Đường càng mờ khi 2 chấm càng xa nhau
   */
  function drawConnections () {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        // Tính khoảng cách giữa 2 chấm
        const dx = p1.x - p2.x;   // Hiệu tọa độ X
        const dy = p1.y - p2.y;   // Hiệu tọa độ Y
        const distance = Math.sqrt(dx * dx + dy * dy);  // Pythagoras

        // Chỉ vẽ nếu khoảng cách đủ gần
        if (distance < MAX_DISTANCE) {
          // Opacity của đường tỉ lệ nghịch với khoảng cách
          // (1 - distance/MAX_DISTANCE): = 1 khi gần, = 0 khi xa
          const opacity = (1 - distance / MAX_DISTANCE) * 0.4;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);    // Bắt đầu từ chấm 1
          ctx.lineTo(p2.x, p2.y);    // Vẽ đến chấm 2

          ctx.strokeStyle = COLOR_CONNECTION + opacity + ')'; // Màu đường
          ctx.lineWidth   = 0.8;      // Độ dày đường
          ctx.stroke();               // Thực sự vẽ đường
        }
      }
    }
  }

  /*
   * VÒNG LẶP ANIMATION CHÍNH
   * requestAnimationFrame: yêu cầu trình duyệt gọi hàm animate ở frame tiếp theo
   * Tốc độ: ~60 lần/giây (60 FPS)
   */
  function animate () {
    // Xóa canvas (vẽ lại từ đầu mỗi frame)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cập nhật và vẽ lại
    updateParticles();
    drawConnections();   // Vẽ đường trước (nằm dưới)
    drawParticles();     // Vẽ chấm sau (nằm trên)

    // Yêu cầu frame tiếp theo → tạo vòng lặp vô tận
    requestAnimationFrame(animate);
  }

  /*
   * XỬ LÝ THAY ĐỔI KÍCH THƯỚC CỬA SỔ
   * debounce: trì hoãn 250ms để tránh gọi quá nhiều lần liên tiếp
   */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeCanvas();
      initParticles();
    }, 250);
  });

  /* THEO DÕI CHUỘT — chấm gần chuột sáng hơn */
  canvas.addEventListener('mousemove', function (event) {
    const rect   = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    particles.forEach(function (p) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Chấm trong vùng 80px xung quanh chuột sẽ sáng lên
      if (dist < 80) {
        p.opacity = Math.min(1, p.opacity + 0.05);
      }
    });
  });

  /* KHỞI ĐỘNG */
  resizeCanvas();
  initParticles();
  animate();  // Bắt đầu vòng lặp animation
}


/* ════════════════════════════════════════════════════════════════
 * 4. SCROLL OBSERVER — THEO DÕI CUỘN ĐỂ KÍCH ANIMATION
 * Sử dụng IntersectionObserver API — hiệu quả hơn sự kiện scroll
 * IntersectionObserver: quan sát khi phần tử xuất hiện trong viewport
 * ════════════════════════════════════════════════════════════════ */
function initScrollObserver () {

  /*
   * TẠO OBSERVER VỚI CALLBACK VÀ OPTIONS
   * callback: hàm chạy khi trạng thái giao nhau thay đổi
   * options: cài đặt ngưỡng quan sát
   */
  const observer = new IntersectionObserver(
    function (entries) {
      /*
       * entries: mảng các phần tử đang được quan sát
       * Mỗi entry có:
       *   - isIntersecting: true nếu phần tử đang hiện trong màn hình
       *   - target: phần tử DOM
       */
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Phần tử xuất hiện → thêm class .visible để kích CSS animation
          entry.target.classList.add('visible');

          // Dừng theo dõi phần tử này sau khi đã kích animation
          // (không cần quan sát nữa — tiết kiệm bộ nhớ)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // threshold: 0.1 nghĩa là quan sát khi 10% phần tử xuất hiện trong màn hình
      threshold: 0.1,
      // rootMargin: thu nhỏ vùng quan sát 50px từ đáy màn hình
      // (-50px ở bottom = kích animation sớm hơn khi còn 50px)
      rootMargin: '0px 0px -50px 0px',
    }
  );

  /*
   * CHỌN CÁC PHẦN TỬ CẦN QUAN SÁT
   * querySelectorAll: trả về NodeList tất cả phần tử khớp selector
   */
  const animatedElements = document.querySelectorAll(
    '.stat-card, .pillar-card, .timeline-item, .app-card'
  );

  // observe(): bắt đầu quan sát từng phần tử
  animatedElements.forEach(function (el) {
    observer.observe(el);
  });

  /*
   * KÍCH HOẠT ĐẾM SỐ KHI STATS SECTION XUẤT HIỆN
   * Observer riêng cho section stats để bắt đầu đếm số
   */
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          // Bắt đầu đếm tất cả counter
          startAllCounters();
          // Dừng quan sát sau khi đã chạy
          statsObserver.unobserve(statsSection);
        }
      },
      { threshold: 0.3 }  // Quan sát khi 30% section xuất hiện
    );
    statsObserver.observe(statsSection);
  }
}


/* ════════════════════════════════════════════════════════════════
 * 5. COUNTER ANIMATION — ĐẾM SỐ TỪ 0 LÊN
 * Kỹ thuật: requestAnimationFrame + hàm easing (làm mềm chuyển động)
 * ════════════════════════════════════════════════════════════════ */

/*
 * HÀM ĐẾM MỘT PHẦN TỬ
 * element: thẻ <span class="counter">
 * targetValue: giá trị cần đếm đến
 * duration: thời gian đếm (ms)
 */
function animateCounter (element, targetValue, duration) {
  // Lấy giá trị bắt đầu từ nội dung hiện tại của span
  const startValue = parseInt(element.textContent) || 0;
  const startTime  = performance.now(); // Thời điểm bắt đầu (ms)
  const range      = targetValue - startValue; // Khoảng cần đếm

  /*
   * HÀM EASING — LÀM CHUYỂN ĐỘNG MỀM MẠI HƠN
   * Không dùng: đếm đều đặn (nhàm)
   * Dùng easeOutQuart: đếm nhanh lúc đầu, chậm dần về cuối
   * t: tiến độ từ 0 đến 1
   */
  function easeOutQuart (t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /*
   * HÀM CHẠY MỖI FRAME
   * currentTime: thời điểm hiện tại (do requestAnimationFrame truyền vào)
   */
  function tick (currentTime) {
    // Tính tiến độ: đã trôi qua bao nhiêu phần trăm thời gian
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // Tối đa = 1 (100%)

    // Áp dụng easing để tiến độ không đều
    const easedProgress = easeOutQuart(progress);

    // Tính giá trị hiện tại và làm tròn
    const currentValue = Math.round(startValue + range * easedProgress);

    // Cập nhật nội dung phần tử
    element.textContent = currentValue.toLocaleString('vi-VN'); // Định dạng số Việt Nam

    // Nếu chưa xong → yêu cầu frame tiếp theo
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  // Bắt đầu vòng lặp
  requestAnimationFrame(tick);
}

/*
 * HÀM BẮT ĐẦU ĐẾM TẤT CẢ CÁC COUNTER TRÊN TRANG
 * querySelectorAll('.counter'): lấy tất cả phần tử có class counter
 */
function startAllCounters () {
  const counters = document.querySelectorAll('.counter');

  counters.forEach(function (counter, index) {
    // data-target: giá trị đích được lưu trong thuộc tính HTML
    const target = parseInt(counter.dataset.target) || 0;

    // Delay mỗi counter một chút để xuất hiện lần lượt
    // index * 200: counter 0 bắt đầu ngay, counter 1 sau 200ms, ...
    setTimeout(function () {
      animateCounter(counter, target, 2000); // 2000ms = 2 giây
    }, index * 200);
  });
}


/* ════════════════════════════════════════════════════════════════
 * 6. QR CODE GENERATOR — VẼ MÃ QR GIẢ
 * Dùng CSS Grid và JS để tạo mã QR nhìn có vẻ thật
 * (Đây là mã QR minh họa, không phải mã quét được thực tế)
 * ════════════════════════════════════════════════════════════════ */
function initQRCode () {
  const qrGrid = document.getElementById('qrGrid');
  if (!qrGrid) return;

  const SIZE = 15; // Ma trận 15x15 ô

  /*
   * ĐỊNH NGHĨA CÁC Ô CỐ ĐỊNH CỦA MÃ QR
   * Mã QR thật có 3 ô vuông định vị ở 3 góc
   * Ta sẽ tạo các ô này theo tọa độ (row, col)
   */

  // Hàm kiểm tra xem ô (r, c) có thuộc vùng định vị không
  function isFinderPattern (r, c) {
    // Góc trên-trái: hàng 0-6, cột 0-6
    const topLeft     = r <= 6 && c <= 6;
    // Góc trên-phải: hàng 0-6, cột 8-14
    const topRight    = r <= 6 && c >= 8;
    // Góc dưới-trái: hàng 8-14, cột 0-6
    const bottomLeft  = r >= 8 && c <= 6;

    return topLeft || topRight || bottomLeft;
  }

  // Hàm xác định màu của ô định vị (tạo hình vuông trong vuông)
  function getFinderColor (r, c) {
    /*
     * Mỗi vùng định vị có 3 lớp:
     * - Lớp ngoài cùng (viền): đen
     * - Lớp giữa: trắng
     * - Lớp trong cùng: đen
     */

    // Góc trên-trái (offset từ (0,0))
    if (r <= 6 && c <= 6) {
      const dr = Math.min(r, 6 - r);  // Khoảng cách đến biên theo hàng
      const dc = Math.min(c, 6 - c);  // Khoảng cách đến biên theo cột
      const layer = Math.min(dr, dc); // Lớp = min khoảng cách
      // layer 0 hoặc 2: đen; layer 1: trắng
      return layer === 1 ? false : true;
    }

    // Góc trên-phải (offset từ (0,8))
    if (r <= 6 && c >= 8) {
      const localC = 14 - c;
      const dr = Math.min(r, 6 - r);
      const dc = Math.min(localC, 6 - localC);
      const layer = Math.min(dr, dc);
      return layer === 1 ? false : true;
    }

    // Góc dưới-trái (offset từ (8,0))
    if (r >= 8 && c <= 6) {
      const localR = 14 - r;
      const dr = Math.min(localR, 6 - localR);
      const dc = Math.min(c, 6 - c);
      const layer = Math.min(dr, dc);
      return layer === 1 ? false : true;
    }

    return null; // Không nằm trong vùng định vị
  }

  /*
   * TẠO CÁC Ô QR
   * Dùng DocumentFragment để tạo DOM hiệu quả hơn
   * (thêm tất cả vào fragment, rồi mới gắn vào DOM một lần)
   */
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'qr-cell';

      let isDark;

      if (isFinderPattern(row, col)) {
        // Ô thuộc vùng định vị → màu theo cấu trúc cố định
        isDark = getFinderColor(row, col);
      } else {
        // Ô dữ liệu → màu ngẫu nhiên (tỉ lệ 50%)
        isDark = Math.random() > 0.5;
      }

      // Gán class màu
      cell.classList.add(isDark ? 'qr-cell--dark' : 'qr-cell--light');
      fragment.appendChild(cell);
    }
  }

  // Gắn tất cả ô vào DOM một lần
  qrGrid.appendChild(fragment);
}


/* ════════════════════════════════════════════════════════════════
 * 7. APP CARDS — THẺ ỨNG DỤNG MỞ/ĐÓNG KHI CLICK
 * Kỹ thuật: Toggle class, ARIA attributes, Keyboard support
 * ════════════════════════════════════════════════════════════════ */
function initAppCards () {
  // Lấy tất cả thẻ ứng dụng
  const appCards = document.querySelectorAll('.app-card');

  appCards.forEach(function (card) {
    /*
     * CLICK ĐỂ MỞ/ĐÓNG
     * Nếu đang đóng → mở thẻ này và đóng các thẻ khác
     * Nếu đang mở → đóng lại
     */
    function toggleCard () {
      const isExpanded = card.classList.contains('expanded');

      // Đóng tất cả thẻ đang mở
      appCards.forEach(function (c) {
        c.classList.remove('expanded');
        c.setAttribute('aria-expanded', 'false');
      });

      // Nếu thẻ chưa mở → mở thẻ này
      if (!isExpanded) {
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
      }
    }

    // Sự kiện click chuột
    card.addEventListener('click', toggleCard);

    /*
     * HỖ TRỢ BÀN PHÍM
     * tabindex="0" cho phép focus bằng Tab
     * Enter hoặc Space → kích giống click
     */
    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();  // Ngăn trang cuộn khi bấm Space
        toggleCard();
      }
    });
  });

  /*
   * ĐÓNG CARD KHI BẤM PHÍM ESC
   * Tốt cho accessibility
   */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      appCards.forEach(function (card) {
        card.classList.remove('expanded');
        card.setAttribute('aria-expanded', 'false');
      });
    }
  });
}


/* ════════════════════════════════════════════════════════════════
 * 8. ACTIVE NAV LINK — ĐÁNH DẤU LINK MENU ĐANG XEM
 * Kỹ thuật: IntersectionObserver quan sát từng section
 * Khi section xuất hiện nhiều nhất trong màn hình → link tương ứng active
 * ════════════════════════════════════════════════════════════════ */
function initActiveNavLink () {
  const sections = document.querySelectorAll('section[id]'); // Tất cả section có ID
  const navLinks = document.querySelectorAll('.nav-link');    // Tất cả link menu

  /*
   * LƯU SECTION ĐANG HIỆN TRONG MÀN HÌNH
   * Dùng Set để lưu các section đang hiện
   */
  const visibleSections = new Set();

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target.id);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      // Cập nhật link active
      updateActiveLink();
    },
    {
      // Quan sát khi ít nhất 20% section hiện trong màn hình
      threshold: [0.2],
    }
  );

  // Quan sát từng section
  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /*
   * HÀM CẬP NHẬT LINK ACTIVE
   * Link active = link tương ứng với section đầu tiên đang hiện
   */
  function updateActiveLink () {
    // Lấy section đầu tiên trong danh sách đang hiện
    // (dùng thứ tự trong DOM để xác định "đầu tiên")
    let activeId = null;
    sections.forEach(function (section) {
      if (visibleSections.has(section.id) && !activeId) {
        activeId = section.id;
      }
    });

    // Cập nhật class active cho link
    navLinks.forEach(function (link) {
      // Lấy phần sau dấu # trong href: "#hero" → "hero"
      const linkTarget = link.getAttribute('href').substring(1);

      if (linkTarget === activeId) {
        link.classList.add('nav-link--active');
        link.style.color = '#FFFFFF'; // Chữ trắng rõ hơn
      } else {
        link.classList.remove('nav-link--active');
        link.style.color = ''; // Reset về màu CSS mặc định
      }
    });
  }
}


/* ════════════════════════════════════════════════════════════════
 * BONUS: SMOOTH SCROLL ĐẶC BIỆT CHO NÚT "XEM LẠI TỪ ĐẦU"
 * Cuộn mượt lên đầu trang khi bấm nút
 * ════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href="#hero"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Ngăn hành động mặc định (nhảy ngay)

  // Cuộn lên đầu trang mượt mà
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  });
});


/* ════════════════════════════════════════════════════════════════
 * BONUS: HIỆU ỨNG RIPPLE KHI BẤM NÚT
 * Tạo vòng tròn lan rộng từ điểm bấm
 * ════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.btn').forEach(function (btn) {
  btn.addEventListener('click', function (event) {
    // Lấy tọa độ bấm so với nút
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Tạo phần tử vòng tròn
    const ripple = document.createElement('span');
    ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    width: 0;
    height: 0;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    animation: ripple-expand 0.6s ease-out forwards;
    pointer-events: none;
    `;

    btn.appendChild(ripple);

    // Xóa phần tử sau khi animation xong
    setTimeout(function () {
      ripple.remove();
    }, 600);
  });
});

/*
 * Thêm CSS animation ripple vào trang
 * (Không thể để trong style.css vì cần dynamic injection ở đây)
 */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
@keyframes ripple-expand {
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}
`;
document.head.appendChild(rippleStyle);


/* ════════════════════════════════════════════════════════════════
 * BONUS: LAZY LOADING ANIMATION CHO HERO TITLE
 * Đảm bảo chữ hero xuất hiện đúng thứ tự ngay cả khi JS load chậm
 * ════════════════════════════════════════════════════════════════ */

// Sau 3 giây, hiện scroll indicator (opacity animation bắt đầu từ 0)
setTimeout(function () {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.style.animation = 'float 3s ease-in-out infinite';
    scrollIndicator.style.opacity   = '1';
  }
}, 2500);


/* ════════════════════════════════════════════════════════════════
 * BONUS: PARALLAX NHẸ CHO HERO
 * Canvas dịch chuyển nhẹ khi cuộn trang — tạo chiều sâu
 * ════════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', function () {
  const scrolled = window.scrollY;
  const canvas   = document.getElementById('networkCanvas');
  const heroContent = document.querySelector('.hero-content');

  if (canvas && scrolled < window.innerHeight) {
    // Canvas dịch chuyển xuống 30% tốc độ cuộn → hiệu ứng parallax
    canvas.style.transform = `translateY(${scrolled * 0.3}px)`;

    // Nội dung hero dịch chuyển nhẹ và mờ dần khi cuộn
    if (heroContent) {
      const opacity = 1 - (scrolled / (window.innerHeight * 0.7));
      heroContent.style.opacity = Math.max(0, opacity);
      heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
    }
  }
}, { passive: true }); // passive: true → không gọi preventDefault() → mượt hơn


/*
 * ════════════════════════════════════════════════════════════════
 * GHI CHÚ KỸ THUẬT CHO HỌC SINH KHI THUYẾT TRÌNH:
 * ════════════════════════════════════════════════════════════════
 *
 * 1. CANVAS API (initNetworkCanvas):
 *    - HTML5 <canvas> cho phép vẽ 2D/3D bằng JavaScript
 *    - requestAnimationFrame tạo vòng lặp animation 60fps
 *    - Particle System: mỗi chấm là một Object với x, y, vx, vy
 *    - Thuật toán kết nối: O(n²) — mọi cặp chấm đều kiểm tra khoảng cách
 *
 * 2. INTERSECTION OBSERVER API (initScrollObserver):
 *    - Quan sát phần tử có xuất hiện trong viewport hay không
 *    - Hiệu quả hơn window.scroll vì không cần tính toán mỗi pixel
 *    - Browser tự động quản lý — lập trình viên chỉ cần xử lý callback
 *
 * 3. ANIMATION TIMING (animateCounter):
 *    - easeOutQuart: f(t) = 1 - (1-t)^4 — hàm toán học tạo hiệu ứng mềm
 *    - performance.now(): thời gian cực chính xác (micro-giây)
 *    - requestAnimationFrame: đồng bộ với màn hình (không giật)
 * ════════════════════════════════════════════════════════════════
 */
