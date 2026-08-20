document.addEventListener("DOMContentLoaded", () => {

  // Touch device detection
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch-device");
  }

  gsap.registerPlugin(ScrollTrigger);

  // ============================================
  // SOUND ENGINE (Web Audio API)
  // ============================================
  const SoundEngine = {
    ctx: null,
    enabled: true,

    init() {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.enabled = false;
      }
    },

    resume() {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },

    play(type) {
      if (!this.enabled || !this.ctx) return;
      this.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case "click":
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case "hover":
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case "nav":
          osc.type = "triangle";
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case "boot":
          osc.type = "sine";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;

        case "tick":
          osc.type = "square";
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.start(now);
          osc.stop(now + 0.02);
          break;
      }
    },

    toggle() {
      this.enabled = !this.enabled;
      const icon = document.getElementById("soundIcon");
      const toggle = document.getElementById("soundToggle");
      if (this.enabled) {
        icon.className = "fas fa-volume-high";
        toggle.classList.remove("muted");
        this.play("click");
      } else {
        icon.className = "fas fa-volume-xmark";
        toggle.classList.add("muted");
      }
      localStorage.setItem("sound", this.enabled ? "on" : "off");
    }
  };

  SoundEngine.init();

  const savedSound = localStorage.getItem("sound");
  if (savedSound === "off") {
    SoundEngine.enabled = false;
    const icon = document.getElementById("soundIcon");
    const toggle = document.getElementById("soundToggle");
    if (icon) icon.className = "fas fa-volume-xmark";
    if (toggle) toggle.classList.add("muted");
  }

  const soundToggleBtn = document.getElementById("soundToggle");
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => SoundEngine.toggle());
  }

  document.querySelectorAll("[data-sound]").forEach(el => {
    const soundType = el.getAttribute("data-sound");
    el.addEventListener("mouseenter", () => {
      if (soundType === "hover") SoundEngine.play("hover");
    });
    el.addEventListener("click", () => {
      if (soundType === "click") SoundEngine.play("click");
    });
  });

  // ============================================
  // BOOT SEQUENCE LOADER
  // ============================================
  const loader = document.getElementById("loader");
  const loaderCounter = document.getElementById("loaderCounter");
  const loaderBar = document.getElementById("loaderBar");
  const loaderStatus = document.getElementById("loaderStatus");

  const bootMessages = [
    "initializing system...",
    "loading modules...",
    "configuring ui...",
    "preparing assets...",
    "setting up workspace...",
    "calibrating interfaces...",
    "syncing data...",
    "rendering components...",
    "optimizing layout...",
    "system ready."
  ];

  let count = 0;
  const targetCount = 99;
  const totalDuration = 2400;
  const stepTime = totalDuration / targetCount;

  function runBootSequence() {
    const interval = setInterval(() => {
      count++;
      if (count > targetCount) count = targetCount;

      loaderCounter.textContent = count < 10 ? "0" + count : count;
      loaderBar.style.width = count + "%";

      const msgIndex = Math.floor((count / targetCount) * (bootMessages.length - 1));
      loaderStatus.textContent = bootMessages[msgIndex];

      if (count % 10 === 0) SoundEngine.play("tick");

      if (count >= targetCount) {
        clearInterval(interval);
        SoundEngine.play("boot");

        setTimeout(() => {
          loader.classList.add("hidden");
          initMainAnimations();
        }, 500);
      }
    }, stepTime);
  }

  setTimeout(runBootSequence, 300);

  // ============================================
  // MAIN ANIMATIONS (after loader)
  // ============================================
  function initMainAnimations() {

    // --- CUSTOM CURSOR ---
    const cursorDot = document.getElementById("cursorDot");
    const cursorRing = document.getElementById("cursorRing");
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.left = mouseX + "px";
        cursorDot.style.top = mouseY + "px";
      }
    });

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (cursorRing) {
        cursorRing.style.left = ringX + "px";
        cursorRing.style.top = ringY + "px";
      }
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll("a, button, .btn, .nav-link").forEach(el => {
      el.addEventListener("mouseenter", () => cursorRing && cursorRing.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursorRing && cursorRing.classList.remove("hover"));
    });

    // --- SCROLL PROGRESS ---
    const progressBar = document.getElementById("scrollProgress");
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) progressBar.style.width = (scrollTop / docHeight) * 100 + "%";
    });

    // --- NAV SCROLL BEHAVIOR ---
    const nav = document.getElementById("nav");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 80) {
        nav && nav.classList.add("scrolled");
      } else {
        nav && nav.classList.remove("scrolled");
      }
    });

    // --- MOBILE NAV TOGGLE ---
    const navToggle = document.getElementById("navToggle");
    const mobileNav = document.getElementById("mobileNav");

    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", () => {
        SoundEngine.play("click");
        navToggle.classList.toggle("active");
        mobileNav.classList.toggle("active");
        document.body.style.overflow = mobileNav.classList.contains("active") ? "hidden" : "";
      });

      mobileNav.querySelectorAll(".mobile-link").forEach(link => {
        link.addEventListener("click", () => {
          SoundEngine.play("nav");
          navToggle.classList.remove("active");
          mobileNav.classList.remove("active");
          document.body.style.overflow = "";
        });
      });
    }

    // --- HERO ENTRANCE ---
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .to('#home [data-animate="fade-up"]', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 });

    // --- SCROLL: FADE UP ---
    gsap.utils.toArray('.section [data-animate="fade-up"]').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- SCROLL: SLIDE LEFT ---
    gsap.utils.toArray('[data-animate="slide-left"]').forEach(el => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- SCROLL: SLIDE RIGHT ---
    gsap.utils.toArray('[data-animate="slide-right"]').forEach(el => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- SCROLL: SCALE IN (staggered cards) ---
    gsap.utils.toArray('[data-animate="scale-in"]').forEach((el, i, arr) => {
      const parent = el.parentElement;
      const siblings = Array.from(parent.children).filter(c => c.hasAttribute("data-animate"));
      const indexInGroup = siblings.indexOf(el);

      gsap.to(el, {
        opacity: 1, scale: 1, duration: 0.6, ease: "power3.out",
        delay: indexInGroup * 0.1,
        scrollTrigger: { trigger: parent, start: "top 85%", toggleActions: "play none none none" }
      });
    });

    // --- SCROLL: CLIP REVEAL (section titles) ---
    gsap.utils.toArray('[data-animate="clip-reveal"]').forEach(el => {
      gsap.to(el, {
        opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });

    // --- SCROLL: PORTRAIT PARALLAX ---
    gsap.to(".portrait-frame", {
      y: -30,
      scrollTrigger: { trigger: ".hero", start: "top center", end: "bottom top", scrub: 1 }
    });

    // --- FLOATING FA ICONS ---
    const iconsContainer = document.getElementById("floatingIcons");
    if (iconsContainer) {
      const faIcons = [
        "fab fa-html5",
        "fab fa-css3-alt",
        "fab fa-js",
        "fab fa-react",
        "fab fa-node-js",
        "fab fa-python",
        "fab fa-git-alt",
        "fab fa-github",
        "fab fa-figma",
        "fab fa-npm",
        "fab fa-yarn",
        "fab fa-linux",
        "fab fa-windows",
        "fab fa-chrome",
        "fab fa-vscode"
      ];

      const iconCount = 22;

      for (let i = 0; i < iconCount; i++) {
        const el = document.createElement("i");
        const iconClass = faIcons[i % faIcons.length];
        el.className = `floating-icon ${iconClass}`;
        el.setAttribute("aria-hidden", "true");

        const size = 1.2 + Math.random() * 1.5;
        const startX = Math.random() * 100;
        const startOffY = Math.random() * 100;

        el.style.fontSize = size + "rem";
        el.style.left = startX + "%";
        el.style.top = startOffY + "%";
        el.style.opacity = 0.08 + Math.random() * 0.1;

        if (Math.random() > 0.6) {
          el.style.color = "#D4AF37";
          el.style.textShadow = "0 0 20px rgba(212, 175, 55, 0.3)";
        }

        iconsContainer.appendChild(el);

        const floatDuration = 20 + Math.random() * 30;
        const floatDelay = Math.random() * 15;

        gsap.fromTo(el,
          { y: window.innerHeight + 100 },
          {
            y: -150,
            duration: floatDuration,
            ease: "none",
            repeat: -1,
            delay: floatDelay
          }
        );

        gsap.to(el, {
          x: () => (Math.random() - 0.5) * 120,
          duration: 4 + Math.random() * 6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });

        gsap.to(el, {
          rotation: () => -15 + Math.random() * 30,
          duration: 6 + Math.random() * 8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });

        gsap.to(el, {
          opacity: () => 0.08 + Math.random() * 0.12,
          duration: 3 + Math.random() * 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
    }

    // --- MAGNETIC HOVER ON BUTTONS ---
    document.querySelectorAll(".btn").forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      });
    });

    // --- 3D TILT ON CARDS ---
    document.querySelectorAll(".project-card, .skill-card, .portrait-frame").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(card, {
          rotateX, rotateY, scale: 1.02, duration: 0.4, ease: "power2.out", transformPerspective: 800
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.6)", transformPerspective: 800
        });
      });
    });

    // --- SMOOTH SCROLL NAV ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          SoundEngine.play("nav");
          gsap.to(window, { scrollTo: { y: target, offsetY: 40 }, duration: 1, ease: "power3.inOut" });
        }
      });
    });

    // --- NAV ACTIVE STATE ---
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    function updateActiveNav() {
      let current = "";
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) current = section.getAttribute("id");
      });
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active");
      });
    }
    window.addEventListener("scroll", updateActiveNav);

    // --- AUTO TYPING (starts after boot sequence completes) ---
    const dynamicWords = ["Software Developer", "UI/UX Designer", "Problem Solver", "Digital Marketer"];
    let arrayPointer = 0;
    let stringLetterPointer = 0;
    let removalFlag = false;
    const typingElement = document.querySelector(".typing");

    function processTypingLoop() {
      if (!typingElement) return;
      const contextWord = dynamicWords[arrayPointer];

      if (removalFlag) {
        typingElement.textContent = contextWord.substring(0, stringLetterPointer - 1);
        stringLetterPointer--;
      } else {
        typingElement.textContent = contextWord.substring(0, stringLetterPointer + 1);
        stringLetterPointer++;
      }

      let speed = removalFlag ? 40 : 80;

      if (!removalFlag && stringLetterPointer === contextWord.length) {
        speed = 1600;
        removalFlag = true;
      } else if (removalFlag && stringLetterPointer === 0) {
        removalFlag = false;
        arrayPointer = (arrayPointer + 1) % dynamicWords.length;
        speed = 400;
      }

      setTimeout(processTypingLoop, speed);
    }
    setTimeout(processTypingLoop, 500);
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      SoundEngine.play("click");

      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          contactForm.reset();
          btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
          btn.classList.add("btn-success");
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove("btn-success");
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error(result.error || "Something went wrong");
        }
      } catch (err) {
        btn.innerHTML = '<span>Failed to send — try again</span><i class="fas fa-exclamation-triangle"></i>';
        btn.classList.add("btn-error");
        console.error("Form error:", err);
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove("btn-error");
          btn.disabled = false;
        }, 4000);
      }
    });
  }

  // ============================================
  // CASE STUDY TOGGLE
  // ============================================
  document.querySelectorAll(".btn-case-study").forEach(btn => {
    btn.addEventListener("click", () => {
      SoundEngine.play("click");
      const panel = btn.closest(".project-body").querySelector(".case-study-panel");
      if (panel) {
        btn.classList.toggle("active");
        panel.classList.toggle("active");
      }
    });
  });

  // ============================================
  // CASE STUDY MODAL
  // ============================================
  const caseStudies = {
    "launch-path": {
      tag: "AI Platform",
      title: "LaunchPath AI",
      body: `
        <h3>Overview</h3>
        <p>LaunchPath AI is an AI-powered career development platform designed to help students and aspiring professionals become internship-ready. The platform combines skills assessment, portfolio analysis, interview preparation, internship matching, and application tracking into a single personalized experience.</p>
        <h3>The Challenge</h3>
        <p>Many students struggle to transition from learning technical skills to securing real-world opportunities. Existing platforms often focus on job listings rather than helping students understand their readiness and improve their chances of success.</p>
        <h3>Solution</h3>
        <p>LaunchPath AI acts as a digital career mentor, continuously evaluating a student's profile, identifying growth opportunities, and recommending actions that improve internship readiness.</p>
        <h3>Key Features</h3>
        <ul>
          <li><strong>AI Career Readiness Score</strong> - A dynamic score measuring preparedness for internship opportunities</li>
          <li><strong>GitHub & Portfolio Analysis</strong> - Actionable insights into project quality and portfolio effectiveness</li>
          <li><strong>Internship Matching</strong> - Recommends relevant opportunities based on profile data</li>
          <li><strong>Interview Simulator</strong> - AI-generated interview questions with personalized feedback</li>
          <li><strong>Application Tracker</strong> - Helps users organize and monitor internship applications</li>
        </ul>
        <h3>Outcome</h3>
        <p>LaunchPath AI transforms the internship search process from disconnected activities into a guided career development journey.</p>
      `
    },
    "aeris": {
      tag: "Aviation Platform",
      title: "Aeris",
      body: `
        <h3>Overview</h3>
        <p>Aeris is a modern aviation intelligence platform designed to make aviation data more accessible, understandable, and visually engaging. The platform bridges the gap between complex aviation information and users seeking insights into airlines, airports, aircraft fleets, routes, and industry developments.</p>
        <h3>The Challenge</h3>
        <p>Most aviation websites suffer from one of two problems: they provide large amounts of information but poor user experience, or they focus heavily on enthusiasts while excluding casual users. Users often struggle to discover meaningful insights without navigating through cluttered interfaces.</p>
        <h3>Research & Insights</h3>
        <ul>
          <li><strong>Information Hierarchy</strong> - Aviation data can become overwhelming very quickly</li>
          <li><strong>Editorial Experience</strong> - Combining data, storytelling, and premium UX creates a superior experience</li>
          <li><strong>Progressive Disclosure</strong> - Revealing complexity gradually prevents user overwhelm</li>
          <li><strong>Visual Clutter</strong> - Reducing noise improves information retention and engagement</li>
        </ul>
        <h3>Solution</h3>
        <p>Aeris organizes aviation information into a clean, structured, and accessible experience focusing on aviation intelligence, airline and airport information, fleet and route analysis, and editorial-style content presentation.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, TypeScript, Vite, React Router</li>
          <li><strong>Architecture</strong> - Component-based with reusable UI systems, custom hooks, and design token system</li>
          <li><strong>UX</strong> - Responsive layouts, scroll-triggered animations, accessibility enhancements, focus management</li>
        </ul>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>Product Thinking</li>
          <li>TypeScript</li>
          <li>React Architecture</li>
          <li>Accessibility</li>
          <li>Responsive Design</li>
          <li>Design Systems</li>
          <li>Information Architecture</li>
        </ul>
        <h3>Outcome</h3>
        <p>The final result is a premium aviation experience demonstrating the ability to combine data-heavy products with thoughtful user experience design.</p>
      `
    },
    "velaire": {
      tag: "Luxury Fashion",
      title: "VELAIRE",
      body: `
        <h3>Overview</h3>
        <p>VELAIRE is a luxury fashion house concept designed to position itself alongside brands such as Prada, Saint Laurent, Loewe, and The Row. Rather than functioning as a traditional e-commerce website, the platform is envisioned as a digital brand world that communicates culture, craftsmanship, and modern luxury.</p>
        <h3>The Challenge</h3>
        <p>Many emerging fashion brands make the mistake of building websites that look like online stores. They prioritize product grids, discounts, sales messaging, and aggressive conversion tactics. Luxury brands operate differently — they sell belonging, identity, and culture before they sell products.</p>
        <h3>Design Philosophy</h3>
        <p>The design language was inspired by Prada, Saint Laurent, Loewe, The Row, Monocle, and Aesop. Key principles included large-scale editorial imagery, sophisticated typography, architectural layouts, minimal visual noise, deliberate pacing, and generous whitespace.</p>
        <h3>Solution</h3>
        <p>VELAIRE is designed as a digital luxury house rather than an e-commerce storefront. The experience focuses on editorial storytelling, brand philosophy, campaign imagery, cultural content, fashion lookbooks, and craftsmanship narratives.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, Vite, React Router, JavaScript</li>
          <li><strong>Architecture</strong> - Component-based with Context API, reusable UI systems, and responsive design</li>
          <li><strong>Quality</strong> - Oxlint and performance-focused implementation</li>
        </ul>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>Product Strategy</li>
          <li>Luxury Brand Design</li>
          <li>Information Architecture</li>
          <li>React Development</li>
          <li>Editorial Experience Design</li>
          <li>Component Architecture</li>
          <li>UX Design</li>
        </ul>
        <h3>Outcome</h3>
        <p>VELAIRE demonstrates the ability to think beyond interfaces and approach digital products from a branding and experience-design perspective, creating a luxury brand ecosystem rather than a simple retail website.</p>
      `
    },
    "vicfalls-one": {
      tag: "Tourism Platform",
      title: "VicFalls One",
      body: `
        <h3>Overview</h3>
        <p>VicFalls One is a digital tourism ecosystem designed to centralize the Victoria Falls travel experience into a single platform — a unified gateway where visitors can discover, plan, and manage their entire trip.</p>
        <h3>The Challenge</h3>
        <p>Visitors planning a trip to Victoria Falls often need to use multiple websites for accommodation, activities, restaurants, transportation, and trip planning. This fragmented experience increases complexity and reduces convenience.</p>
        <h3>Solution</h3>
        <p>VicFalls One brings together tourism services into a single ecosystem where users can explore hotels and lodges, discover activities, browse restaurants, build itineraries, and plan trips more efficiently.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, Styled Components, Framer Motion</li>
          <li><strong>Backend</strong> - Node.js, Express, PostgreSQL, Sequelize</li>
          <li><strong>Security</strong> - JWT Authentication, protected routes, secure API architecture</li>
        </ul>
        <h3>Challenges</h3>
        <p>The biggest challenge was creating a structure capable of supporting multiple tourism categories while maintaining a simple user experience. This was addressed through modular architecture, reusable components, consistent navigation patterns, and scalable database design.</p>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>Full-Stack Development</li>
          <li>System Design</li>
          <li>Database Design</li>
          <li>Authentication</li>
          <li>API Development</li>
          <li>Product Strategy</li>
        </ul>
        <h3>Outcome</h3>
        <p>VicFalls One demonstrates full-stack product thinking and the ability to design platforms that solve real-world business problems.</p>
      `
    },
    "flyta-vertex": {
      tag: "Transfers Platform",
      title: "Flyta Vertex",
      body: `
        <h3>Overview</h3>
        <p>Flyta Vertex is a digital airport transfers platform designed to simplify transportation between airports, hotels, tourism destinations, and business locations through a streamlined booking experience.</p>
        <h3>The Challenge</h3>
        <p>Airport transportation is often fragmented. Travelers frequently encounter unclear pricing, unreliable operators, complex booking processes, lack of trust, and poor user experiences — especially when arriving in unfamiliar destinations.</p>
        <h3>Solution</h3>
        <p>Flyta Vertex was designed as a centralized airport transfers platform that allows users to schedule transfers, choose transportation options, manage bookings, and access clear travel information.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, JavaScript, JSX, Styled Components</li>
          <li><strong>Libraries</strong> - React Router, React Hook Form, Framer Motion</li>
          <li><strong>Integrations</strong> - REST APIs</li>
          <li><strong>UX</strong> - Responsive Design, SPA Architecture, Form Validation, Booking Workflows</li>
        </ul>
        <h3>Building User Trust</h3>
        <p>Transportation services rely heavily on trust. Users need confidence that drivers will arrive on time, pricing is transparent, and bookings are secure. This was addressed through clear booking flows, consistent visual design, strong information hierarchy, and immediate user feedback.</p>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>Product Design</li>
          <li>Booking Platform Design</li>
          <li>React Development</li>
          <li>API Integration</li>
          <li>Form Architecture</li>
          <li>UX Research</li>
          <li>Responsive Development</li>
        </ul>
        <h3>Outcome</h3>
        <p>Flyta Vertex demonstrates the ability to build service-oriented digital products that solve real-world transportation challenges while maintaining a focus on usability and customer confidence.</p>
      `
    },
    "mbano-manor": {
      tag: "Hospitality Website",
      title: "Mbano Manor",
      body: `
        <h3>Overview</h3>
        <p>Mbano Manor is a luxury hospitality website concept inspired by premium safari lodges and boutique hotels. The goal was to create an online experience that reflects the elegance, exclusivity, and storytelling associated with luxury hospitality brands.</p>
        <h3>The Challenge</h3>
        <p>Many hospitality websites rely heavily on generic templates that fail to communicate the emotional value of a destination. Luxury guests expect experiences that begin long before they arrive.</p>
        <h3>Solution</h3>
        <p>Mbano Manor was designed around immersive storytelling using large imagery, elegant typography, carefully structured content, and smooth interactions to create a premium digital experience.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, Vite, React Router, Styled Components</li>
          <li><strong>State Management</strong> - Context API</li>
          <li><strong>Design</strong> - Responsive design, premium typography, reusable component system</li>
        </ul>
        <h3>Creating Luxury Through Design</h3>
        <p>Luxury is difficult to communicate digitally. The approach focused on whitespace, typography, visual rhythm, and content hierarchy instead of relying on excessive visual effects.</p>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>Luxury UX Design</li>
          <li>Brand Experience</li>
          <li>Component Architecture</li>
          <li>Responsive Development</li>
          <li>UI Design</li>
        </ul>
        <h3>Outcome</h3>
        <p>The project demonstrates the ability to design emotionally engaging experiences that support luxury branding and storytelling.</p>
      `
    },
    "netflix-clone": {
      tag: "Streaming Platform",
      title: "Netflix Clone",
      body: `
        <h3>Overview</h3>
        <p>The Netflix Clone project was built to deepen understanding of modern React development by recreating the core experience of a streaming platform.</p>
        <h3>The Challenge</h3>
        <p>Streaming platforms must manage large amounts of content while maintaining fast navigation and engaging user experiences.</p>
        <h3>Solution</h3>
        <p>Key Netflix features were recreated including movie browsing, content categorization, dynamic content rendering, and responsive layouts using the TMDB API.</p>
        <h3>Technical Implementation</h3>
        <ul>
          <li><strong>Frontend</strong> - React, JavaScript, React Router</li>
          <li><strong>API</strong> - TMDB (The Movie Database) API</li>
          <li><strong>Patterns</strong> - Component design, state management, responsive UI</li>
        </ul>
        <h3>Managing Dynamic Data</h3>
        <p>Working with third-party APIs introduced challenges around loading states, error handling, and data consistency. These were addressed through structured state management and reusable components.</p>
        <h3>Skills Demonstrated</h3>
        <ul>
          <li>React</li>
          <li>API Integration</li>
          <li>Component Design</li>
          <li>Responsive UI</li>
          <li>State Management</li>
        </ul>
        <h3>Outcome</h3>
        <p>The project strengthened understanding of React fundamentals, API integration, component architecture, and responsive development.</p>
      `
    },
    "smoke-house": {
      tag: "Restaurant Website",
      title: "Smoke House Redesign",
      body: `
        <h3>Overview</h3>
        <p>The Smoke House Redesign project aimed to transform the restaurant's online presence into a premium digital experience that reflects its atmosphere, cuisine, and brand identity. The goal was to create a visually immersive website that inspires visitors while making reservations and menu exploration effortless.</p>
        <h3>The Challenge</h3>
        <p>The existing experience did not fully communicate the restaurant's unique atmosphere or encourage online engagement. The redesign needed to:</p>
        <ul>
          <li>Capture the restaurant's personality visually</li>
          <li>Present the menu in an engaging format</li>
          <li>Increase reservation opportunities</li>
          <li>Showcase food photography effectively</li>
          <li>Deliver excellent performance on mobile devices</li>
        </ul>
        <h3>The Process</h3>
        <p>The project began with research into premium restaurant websites and hospitality experiences.</p>
        <ul>
          <li>Studying restaurant UX best practices</li>
          <li>Developing a visual direction inspired by the restaurant's atmosphere</li>
          <li>Creating a cinematic hero section</li>
          <li>Designing an intuitive menu browsing experience</li>
          <li>Building a responsive gallery system</li>
          <li>Optimizing performance through image compression and lazy loading</li>
        </ul>
        <h3>Key Features</h3>
        <ul>
          <li><strong>Immersive Hero Experience</strong> - A visually striking hero section introduces visitors to the restaurant's atmosphere immediately.</li>
          <li><strong>Interactive Menu</strong> - Guests can browse menu categories smoothly without leaving the page.</li>
          <li><strong>Visual Gallery</strong> - A curated gallery highlights signature dishes, interiors, and the dining experience.</li>
          <li><strong>Reservation Journey</strong> - Clear booking pathways help visitors make reservations quickly.</li>
          <li><strong>Mobile Optimization</strong> - The experience remains fast and engaging across all devices.</li>
        </ul>
        <h3>Design Decisions</h3>
        <ul>
          <li>Rich imagery creates an emotional connection</li>
          <li>Dark, atmospheric visuals reinforce the restaurant's identity</li>
          <li>Generous spacing improves content readability</li>
          <li>Smooth transitions enhance the premium feel</li>
        </ul>
        <h3>Result</h3>
        <p>The redesigned Smoke House website delivers a sophisticated digital experience that reflects the restaurant's atmosphere, showcases its offerings beautifully, and makes reservations simple for potential guests.</p>
      `
    },
    "malika-elite": {
      tag: "Luxury Brand",
      title: "Malika Elite",
      body: `
        <h3>Overview</h3>
        <p>Malika Elite is a fictional African luxury house designed to redefine how premium African brands are experienced in the digital space. Inspired by the sophistication of global luxury brands while celebrating African heritage, the project explores how storytelling, craftsmanship, and modern technology can create a distinctive luxury experience.</p>
        <p>The platform was designed as a mobile-first luxury lifestyle application that combines brand storytelling, curated collections, exclusive experiences, and seamless digital interactions into a single premium ecosystem.</p>
        <h3>The Challenge</h3>
        <p>Most luxury-inspired digital experiences either rely heavily on traditional European luxury aesthetics or lean too far into cultural stereotypes. The challenge was to create a modern African luxury brand that feels internationally competitive while remaining authentic, sophisticated, and culturally grounded.</p>
        <ul>
          <li>Establish a premium and recognizable visual identity</li>
          <li>Balance African heritage with contemporary luxury design</li>
          <li>Deliver a seamless mobile-first experience</li>
          <li>Create emotional engagement through storytelling</li>
          <li>Communicate exclusivity without overwhelming users</li>
        </ul>
        <h3>Research & Discovery</h3>
        <p>The project began with an analysis of leading luxury brands including Rolex, Hennessy, Louis Vuitton, Aman, and Prada. Key insights included:</p>
        <ul>
          <li>Luxury brands prioritize storytelling over products</li>
          <li>Simplicity often communicates prestige better than complexity</li>
          <li>Strong typography creates a sense of authority and confidence</li>
          <li>Whitespace increases perceived value</li>
          <li>Premium experiences rely on subtle interactions rather than excessive animation</li>
        </ul>
        <h3>Design Strategy</h3>
        <p>The core design principle was: "African Heritage, Refined for the Modern World".</p>
        <p>The visual language combines editorial-inspired layouts, large cinematic imagery, elegant typography, refined color palettes, and minimal but purposeful interactions, creating an experience that feels timeless rather than trendy.</p>
        <h3>The Process</h3>
        <ul>
          <li><strong>Brand Foundation</strong> - Defined the luxury positioning through brand mission, visual identity, color system, typography selection, and art direction.</li>
          <li><strong>User Experience Design</strong> - Mapped the user journey from discovery to engagement, structured around exploration, storytelling, collections, exclusive experiences, and brand heritage.</li>
          <li><strong>Interface Design</strong> - Designed a mobile-first interface with touch-friendly navigation, a consistent spacing system, reusable design components, and clear visual hierarchy.</li>
          <li><strong>Motion & Interaction</strong> - Implemented smooth transitions, content reveals, refined hover states, and micro-interactions that reward exploration.</li>
        </ul>
        <h3>Key Features</h3>
        <ul>
          <li><strong>Luxury Brand Storytelling</strong> - A narrative-driven experience introducing users to the world of Malika Elite through heritage, craftsmanship, and culture.</li>
          <li><strong>Curated Collections</strong> - Premium product and experience showcases presented through immersive visual layouts.</li>
          <li><strong>Editorial Design System</strong> - A design language inspired by luxury magazines and premium brand campaigns.</li>
          <li><strong>Mobile-First Experience</strong> - Optimized layouts and interactions for modern mobile users without compromising the premium feel.</li>
          <li><strong>Seamless Navigation</strong> - Intuitive pathways that encourage discovery while maintaining simplicity.</li>
        </ul>
        <h3>Visual Identity</h3>
        <ul>
          <li><strong>Color Palette</strong> - Warm Ivory, Deep Emerald, Antique Gold, Charcoal Black, and Soft Stone create a timeless luxury aesthetic while differentiating the brand from conventional black-and-gold designs.</li>
          <li><strong>Typography</strong> - Elegant serif headlines combined with modern sans-serif body text create contrast, sophistication, and readability.</li>
        </ul>
        <h3>Outcome</h3>
        <p>The final result is a premium digital experience that positions Malika Elite as a contemporary African luxury house, demonstrating how luxury branding, user experience design, visual storytelling, and mobile-first principles can work together to create an immersive and memorable experience.</p>
        <h3>What I Learned</h3>
        <p>This project reinforced the importance of restraint in luxury design. Rather than relying on excessive visuals or complex interactions, the strongest experiences emerged from thoughtful storytelling, strong typography, consistent branding, and carefully crafted details.</p>
      `
    },
    "delta": {
      tag: "Production Company",
      title: "Delta Production",
      body: `
        <h3>Overview</h3>
        <p>Delta Production is a modern production company website designed to showcase creative work, establish credibility, and generate client inquiries. The project focused on presenting a strong portfolio while reinforcing trust through social proof and a polished user experience.</p>
        <h3>The Challenge</h3>
        <p>Production companies often struggle to balance showcasing their creative work with building trust among potential clients. The website needed to:</p>
        <ul>
          <li>Highlight portfolio projects effectively</li>
          <li>Build credibility through client success stories</li>
          <li>Deliver a premium visual experience</li>
          <li>Maintain fast performance across devices</li>
          <li>Guide visitors toward making inquiries</li>
        </ul>
        <h3>The Process</h3>
        <p>The design process focused on creating a portfolio-first experience:</p>
        <ul>
          <li>Analyzed leading production agency websites</li>
          <li>Structured content around featured projects</li>
          <li>Designed a cinematic hero section to create impact</li>
          <li>Incorporated testimonials and client logos for trust</li>
          <li>Optimized layouts for both desktop and mobile users</li>
          <li>Improved performance through image optimization and efficient code practices</li>
        </ul>
        <h3>Key Features</h3>
        <ul>
          <li><strong>Portfolio Showcase</strong> - Featured projects are displayed prominently with engaging visuals and clear project information.</li>
          <li><strong>Client Trust Section</strong> - Testimonials, client logos, and company achievements help establish credibility.</li>
          <li><strong>Smooth User Experience</strong> - Subtle scroll animations and transitions create a polished browsing experience.</li>
          <li><strong>Responsive Design</strong> - Layouts adapt seamlessly across desktop, tablet, and mobile devices.</li>
          <li><strong>Clear Call-to-Actions</strong> - Strategically placed inquiry buttons encourage potential clients to get in touch.</li>
        </ul>
        <h3>Design Decisions</h3>
        <ul>
          <li>Large visuals emphasize creative work</li>
          <li>Minimalist layouts keep attention on portfolio content</li>
          <li>Dark, professional aesthetics reinforce a premium production brand</li>
          <li>Consistent spacing and typography improve readability</li>
        </ul>
        <h3>Result</h3>
        <p>The final product is a modern production company website that effectively showcases creative work, builds trust, and creates a strong first impression for potential clients.</p>
      `
    },
    "jumpstart": {
      tag: "Landing Page",
      title: "Jumpstart",
      body: `
        <h3>Overview</h3>
        <p>A conversion-focused educational product landing page designed to build credibility and drive enrolments.</p>
        <h3>The Challenge</h3>
        <p>Educational products need to establish credibility quickly, communicate curriculum value, and convert visitors into enrolled students.</p>
        <h3>The Process</h3>
        <ul>
          <li>Analysed top-performing course landing pages for conversion patterns</li>
          <li>Designed a layout with clear social proof sections</li>
          <li>Created structured curriculum breakdowns for transparency</li>
          <li>Placed a prominent enrollment CTA at key decision points</li>
        </ul>
        <h3>Key Features</h3>
        <ul>
          <li>Social proof and testimonials section</li>
          <li>Clear curriculum breakdown with module details</li>
          <li>Multiple strategically placed CTAs</li>
          <li>Fast, accessible page build</li>
        </ul>
        <h3>Result</h3>
        <p>A high-trust landing page that balances rich information with focused conversion paths, making it easy for visitors to enrol.</p>
      `
    },
    "vicfalls": {
      tag: "Community Platform",
      title: "VicFalls Televivi",
      body: `
        <h3>Overview</h3>
        <p>VicFalls Televivi is a digital community and media platform created to serve as a central hub for Victoria Falls events, local content, news, and community engagement. The platform was designed to provide residents and visitors with easy access to information in a clean and organized interface.</p>
        <h3>The Challenge</h3>
        <p>The platform needed to bring together multiple content types while maintaining simplicity and ease of navigation. Key goals included:</p>
        <ul>
          <li>Organizing large amounts of content effectively</li>
          <li>Promoting local events and community activities</li>
          <li>Supporting media-rich content</li>
          <li>Ensuring accessibility across all devices</li>
          <li>Creating a scalable structure for future growth</li>
        </ul>
        <h3>The Process</h3>
        <p>The project followed a content-first approach:</p>
        <ul>
          <li>Researched media and community platforms</li>
          <li>Defined content categories and user flows</li>
          <li>Designed event-focused layouts</li>
          <li>Created responsive navigation structures</li>
          <li>Optimized images and content loading</li>
          <li>Tested usability across different screen sizes</li>
        </ul>
        <h3>Key Features</h3>
        <ul>
          <li><strong>Event Listings</strong> - Users can browse upcoming community events with clear visual hierarchy and easy discovery.</li>
          <li><strong>Content Categories</strong> - News, videos, events, and community content are organized into intuitive sections.</li>
          <li><strong>Media Integration</strong> - Image-rich content is presented in a way that remains fast and engaging.</li>
          <li><strong>Mobile-First Experience</strong> - The platform works seamlessly on smartphones, tablets, and desktops.</li>
          <li><strong>Community Focus</strong> - The design encourages exploration of local information and community activities.</li>
        </ul>
        <h3>Design Decisions</h3>
        <ul>
          <li>Clean layouts reduce information overload</li>
          <li>Card-based content organization improves scanning</li>
          <li>Consistent navigation supports content discovery</li>
          <li>Responsive grids adapt to varying content types</li>
        </ul>
        <h3>Result</h3>
        <p>VicFalls Televivi became a clean, accessible digital platform that successfully showcases community content, promotes local events, and provides an engaging user experience for residents and visitors alike.</p>
      `
    }
  };

  const modal = document.getElementById("caseModal");
  const modalTag = document.getElementById("caseModalTag");
  const modalTitle = document.getElementById("caseModalTitle");
  const modalBody = document.getElementById("caseModalBody");
  const modalClose = document.getElementById("caseModalClose");
  const modalBackdrop = modal ? modal.querySelector(".case-modal-backdrop") : null;

  function openCaseModal(key) {
    const study = caseStudies[key];
    if (!study || !modal) return;
    modalTag.textContent = study.tag;
    modalTitle.textContent = study.title;
    modalBody.innerHTML = study.body;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    SoundEngine.play("click");
  }

  function closeCaseModal() {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    SoundEngine.play("click");
  }

  document.querySelectorAll(".btn-read-more").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      if (card) {
        const key = card.getAttribute("data-case");
        openCaseModal(key);
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeCaseModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeCaseModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCaseModal();
  });

});
