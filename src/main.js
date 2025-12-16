document.addEventListener("DOMContentLoaded", () => {

  // --- 1. ИНИЦИАЛИЗАЦИЯ ---
  // Регистрируем плагины GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Иконки
  lucide.createIcons();

  // Плавный скролл (Lenis)
  const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // --- 2. CANVAS ФОН (ЧАСТИЦЫ) ---
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
      const ctx = canvas.getContext('2d');
      let width, height;
      const particles = [];

      function resize() {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      class Particle {
          constructor() {
              this.x = Math.random() * width;
              this.y = Math.random() * height;
              this.vx = (Math.random() - 0.5) * 0.5;
              this.vy = (Math.random() - 0.5) * 0.5;
              this.size = Math.random() * 2;
              this.alpha = Math.random() * 0.5 + 0.1;
          }
          update() {
              this.x += this.vx;
              this.y += this.vy;
              if (this.x < 0) this.x = width;
              if (this.x > width) this.x = 0;
              if (this.y < 0) this.y = height;
              if (this.y > height) this.y = 0;
          }
          draw() {
              ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
              ctx.fill();
          }
      }

      // Генерируем 100 частиц
      for (let i = 0; i < 100; i++) {
          particles.push(new Particle());
      }

      function animateCanvas() {
          ctx.clearRect(0, 0, width, height);
          particles.forEach(p => { p.update(); p.draw(); });
          requestAnimationFrame(animateCanvas);
      }
      animateCanvas();
  }

  // --- 3. АНИМАЦИИ ИНТЕРФЕЙСА (GSAP) ---

  // А. Текстовые заголовки (побуквенно)
  document.querySelectorAll('.reveal-text').forEach((element) => {
      if (!element.innerText.trim()) return; // Пропуск пустых

      const text = new SplitType(element, { types: 'chars, words' });

      gsap.from(text.chars, {
          scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
          },
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.02,
          ease: 'power3.out'
      });
  });

  // Б. Списки и Сетки (Stagger эффект) - ИСПРАВЛЕНО
  // Используем индивидуальный триггер для каждого элемента
  const staggerItems = document.querySelectorAll('[data-anim="stagger"]');
  staggerItems.forEach((item, index) => {
      gsap.fromTo(item,
          { opacity: 0, y: 50 }, // Начальное состояние
          {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              // Небольшая задержка для эффекта "лесенки" внутри одной строки
              delay: (index % 3) * 0.1,
              scrollTrigger: {
                  trigger: item,
                  start: "top 90%", // Срабатывает чуть раньше
                  toggleActions: "play none none reverse"
              }
          }
      );
  });

  // В. Одиночные элементы (Fade)
  document.querySelectorAll('[data-anim="fade"]').forEach(el => {
      gsap.fromTo(el,
          { opacity: 0 },
          {
              opacity: 1,
              duration: 1,
              scrollTrigger: {
                  trigger: el,
                  start: "top 90%",
                  toggleActions: "play none none reverse"
              }
          }
      );
  });

  // Г. Хелпер для направленных анимаций (Slide/Zoom)
  const animateElem = (selector, fromVars) => {
      document.querySelectorAll(selector).forEach(el => {
          gsap.fromTo(el,
              { opacity: 0, ...fromVars },
              {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  duration: 1,
                  ease: "power2.out",
                  scrollTrigger: {
                      trigger: el,
                      start: "top 85%",
                      toggleActions: "play none none reverse"
                  }
              }
          );
      });
  };

  // Запуск анимаций
  animateElem('[data-anim="slide-up"]', { y: 50 });
  animateElem('[data-anim="slide-right"]', { x: -50 });
  animateElem('[data-anim="slide-left"]', { x: 50 });
  animateElem('[data-anim="zoom-in"]', { scale: 0.9 });


  // --- 4. МОБИЛЬНОЕ МЕНЮ ---
  const burgerBtn = document.querySelector('.header__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuLinks = document.querySelectorAll('.mobile-menu__link');

  if(burgerBtn) {
      burgerBtn.addEventListener('click', () => {
          const isActive = burgerBtn.classList.toggle('is-active');
          mobileMenu.classList.toggle('is-active');

          // Блокируем/разблокируем скролл Lenis
          if (isActive) {
              lenis.stop();
              document.body.style.overflow = 'hidden';
          } else {
              lenis.start();
              document.body.style.overflow = '';
          }
      });

      menuLinks.forEach(link => {
          link.addEventListener('click', () => {
              burgerBtn.classList.remove('is-active');
              mobileMenu.classList.remove('is-active');
              lenis.start();
              document.body.style.overflow = '';
          });
      });
  }

  // --- 5. КОНТАКТНАЯ ФОРМА ---
  const form = document.getElementById('leadForm');
  if (form) {
      const captchaLabel = document.getElementById('captchaLabel');
      const captchaInput = document.getElementById('captchaInput');
      const successMsg = document.getElementById('formSuccess');

      // Генерация примера
      const num1 = Math.floor(Math.random() * 10);
      const num2 = Math.floor(Math.random() * 10);
      const sum = num1 + num2;
      if(captchaLabel) captchaLabel.innerText = `Сколько будет ${num1} + ${num2}?`;

      form.addEventListener('submit', (e) => {
          e.preventDefault();

          // Сброс классов ошибок
          document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

          let isFormValid = true;

          // Получаем значения
          const nameVal = form.name.value.trim();
          const emailVal = form.email.value.trim();
          const phoneVal = form.phone.value.trim();
          const captchaVal = parseInt(captchaInput.value);

          // Проверки
          if (nameVal.length < 2) {
              form.name.parentElement.classList.add('error');
              isFormValid = false;
          }
          // Простой Regex для email
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
              form.email.parentElement.classList.add('error');
              isFormValid = false;
          }
          // Минимум 10 цифр
          if (phoneVal.replace(/[^0-9]/g, '').length < 10) {
              form.phone.parentElement.classList.add('error');
              isFormValid = false;
          }
          // Капча
          if (captchaVal !== sum) {
              captchaInput.parentElement.classList.add('error');
              isFormValid = false;
          }

          // Если все ок
          if (isFormValid) {
              const btn = form.querySelector('button');
              const originalText = btn.innerText;
              btn.innerText = 'Отправка...';
              btn.disabled = true;

              // Имитация отправки
              setTimeout(() => {
                  btn.style.display = 'none';
                  successMsg.classList.add('is-visible');
                  form.reset();
                  // Вернуть капчу или кнопку можно тут, если нужно
              }, 1500);
          }
      });
  }

  // --- 6. COOKIE POPUP ---
  const cookiePopup = document.getElementById('cookiePopup');
  const acceptBtn = document.getElementById('acceptCookie');

  if (cookiePopup && !localStorage.getItem('cookieAccepted')) {
      setTimeout(() => {
          cookiePopup.classList.add('is-visible');
      }, 2000);
  }

  if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
          localStorage.setItem('cookieAccepted', 'true');
          cookiePopup.classList.remove('is-visible');
      });
  }
});