/* =========================================================
   SINTAKSIS KOPI — KODE 01 NEW UPDATE
   PEMBARUAN 01 — FULL JAVASCRIPT

   Perbaikan yang diterapkan (ringkasan):
   [JS-FIX-01]  Hapus override .hero-tagline (dulu menimpa HTML)
   [JS-FIX-02]  Tambah html.js-loaded di akhir init
                (wajib untuk fallback .reveal di CSS)
   [JS-FIX-03]  Scroll-spy selector aman (section[id] langsung)
   [JS-FIX-04]  Coffee tilt tidak menimpa transform penuh
                (pakai CSS custom property)
   [JS-FIX-05]  Reset menu reveal saat close
   [JS-FIX-06]  aria-label toggle menu dinamis
   [JS-FIX-07]  Guard prefers-reduced-motion untuk cursor/smoke
   [JS-FIX-08]  Reset stagger/reveal order-card saat filter
   [JS-FIX-09]  Skip cursor smoke kalau reduced-motion aktif

   Catatan:
   - Perilaku asli yang tidak bermasalah dipertahankan.
   - Komentar asli dipertahankan & ditambah tag [JS-FIX-XX].
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const cursor = document.querySelector(".cursor");
  const menuPage = document.querySelector("#menuPage");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuClose = document.querySelector(".menu-close");
  const menuOpenButtons = document.querySelectorAll("[data-menu-open]");
  const menuCloseLinks = document.querySelectorAll(".menu-close-link");
  const menuCategories = document.querySelectorAll(".menu-category");
  const orderCards = document.querySelectorAll(".order-card");
  const navLinks = document.querySelectorAll(".nav-link");
  const revealElements = document.querySelectorAll(".reveal");

  /* =========================================================
     [JS-FIX-07] DETEKSI PREFERS-REDUCED-MOTION
     Jika pengguna memilih "reduce motion", cursor smoke
     tidak dijalankan, dan beberapa animasi tambahan dilewati.
  ========================================================= */

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     NAVBAR — SCROLL STATE
  ========================================================= */

  const updateNavbar = () => {
    if (!navbar) return;

    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );
  };

  updateNavbar();

  window.addEventListener(
    "scroll",
    updateNavbar,
    { passive: true }
  );


  /* =========================================================
     CUSTOM CURSOR + SMOKE
  ========================================================= */

  if (
    cursor &&
    window.matchMedia("(pointer: fine)").matches &&
    !prefersReducedMotion // [JS-FIX-07]
  ) {
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    let lastSmokeX = mouseX;
    let lastSmokeY = mouseY;

    const smokeParticles = [];


    /* -------------------------
       CURSOR POSITION
    ------------------------- */

    document.addEventListener(
      "mousemove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        const distance = Math.hypot(
          mouseX - lastSmokeX,
          mouseY - lastSmokeY
        );

        if (distance >= 16) {
          lastSmokeX = mouseX;
          lastSmokeY = mouseY;

          const smoke =
            document.createElement("div");

          smoke.className =
            "cursor-smoke";

          const size =
            Math.random() * 12 + 9;

          smoke.style.left =
            `${mouseX}px`;

          smoke.style.top =
            `${mouseY}px`;

          smoke.style.width =
            `${size}px`;

          smoke.style.height =
            `${size}px`;

          document.body.appendChild(smoke);

          smokeParticles.push({
            element: smoke,
            life: 0,
            seed: Math.random() * 10
          });
        }
      }
    );


    /* -------------------------
       CURSOR ANIMATION
    ------------------------- */

    const animateCursor = () => {
      currentX +=
        (mouseX - currentX) * 0.22;

      currentY +=
        (mouseY - currentY) * 0.22;

      cursor.style.left =
        `${currentX}px`;

      cursor.style.top =
        `${currentY}px`;


      /* -------------------------
         SMOKE ANIMATION
      ------------------------- */

      for (
        let i = smokeParticles.length - 1;
        i >= 0;
        i--
      ) {
        const particle =
          smokeParticles[i];

        particle.life += 0.025;

        const driftX =
          Math.sin(
            particle.life * 8 +
            particle.seed
          ) * 10;

        const driftY =
          particle.life * -28;

        const scale =
          1 + particle.life * 1.8;

        particle.element.style.transform =
          `translate(
            calc(-50% + ${driftX}px),
            calc(-50% + ${driftY}px)
          ) scale(${scale})`;

        particle.element.style.opacity =
          Math.max(
            0,
            0.3 -
            particle.life * 0.38
          );

        if (particle.life >= 0.8) {
          particle.element.remove();

          smokeParticles.splice(
            i,
            1
          );
        }
      }

      requestAnimationFrame(
        animateCursor
      );
    };

    animateCursor();


    /* -------------------------
       CURSOR HOVER
    ------------------------- */

    const hoverTargets =
      document.querySelectorAll(
        "a, button, .coffee-item, .order-card, .menu-big-link, .experience-row"
      );

    hoverTargets.forEach(
      (element) => {
        element.addEventListener(
          "mouseenter",
          () => {
            cursor.classList.add(
              "hover"
            );
          }
        );

        element.addEventListener(
          "mouseleave",
          () => {
            cursor.classList.remove(
              "hover"
            );
          }
        );
      }
    );
  }


  /* =========================================================
     SCROLL REVEAL
  ========================================================= */

  if (revealElements.length) {
    const revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "visible"
              );

              revealObserver.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -40px 0px"
        }
      );

    revealElements.forEach(
      (element) => {
        revealObserver.observe(
          element
        );
      }
    );
  }


  /* =========================================================
     ACTIVE NAVIGATION
     [JS-FIX-03] Selector aman.
     Di HTML PEMBARUAN 01, <main> sudah ada. Selector
     "main > section[id]" tetap dipakai, tapi ada fallback
     ke "section[id]" kalau <main> tidak ada.
  ========================================================= */

  let sections =
    document.querySelectorAll(
      "main > section[id]"
    );

  // [JS-FIX-03] Fallback — kalau <main> tidak ditemukan.
  if (!sections.length) {
    sections =
      document.querySelectorAll(
        "section[id]"
      );
  }

  const updateActiveNav = () => {
    const position =
      window.scrollY + 220;

    let current = "home";

    sections.forEach(
      (section) => {
        if (
          position >=
            section.offsetTop &&
          position <
            section.offsetTop +
            section.offsetHeight
        ) {
          current =
            section.id;
        }
      }
    );

    navLinks.forEach(
      (link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") ===
            `#${current}`
        );
      }
    );
  };

  window.addEventListener(
    "scroll",
    updateActiveNav,
    { passive: true }
  );

  updateActiveNav();


  /* =========================================================
     HERO PARALLAX
  ========================================================= */

  const heroCircle =
    document.querySelector(
      ".hero-circle"
    );

  const hero =
    document.querySelector(
      ".hero"
    );

  if (
    hero &&
    heroCircle &&
    window.matchMedia(
      "(pointer: fine)"
    ).matches &&
    !prefersReducedMotion // [JS-FIX-07]
  ) {
    hero.addEventListener(
      "mousemove",
      (event) => {
        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX -
            rect.left) /
            rect.width -
          0.5;

        const y =
          (event.clientY -
            rect.top) /
            rect.height -
          0.5;

        heroCircle.style.marginLeft =
          `${x * 12}px`;

        heroCircle.style.marginTop =
          `${y * 12}px`;
      }
    );

    hero.addEventListener(
      "mouseleave",
      () => {
        heroCircle.style.marginLeft =
          "";

        heroCircle.style.marginTop =
          "";
      }
    );
  }


  /* =========================================================
     MAGNETIC BUTTONS
  ========================================================= */

  if (
    window.matchMedia(
      "(pointer: fine)"
    ).matches &&
    !prefersReducedMotion // [JS-FIX-07]
  ) {
    document
      .querySelectorAll(
        ".main-btn, .nav-order, .story-btn, .contact-mail"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "mousemove",
            (event) => {
              const rect =
                button.getBoundingClientRect();

              const x =
                event.clientX -
                rect.left -
                rect.width / 2;

              const y =
                event.clientY -
                rect.top -
                rect.height / 2;

              button.style.transform =
                `translate(
                  ${x * 0.07}px,
                  ${y * 0.07}px
                )`;
            }
          );

          button.addEventListener(
            "mouseleave",
            () => {
              button.style.transform =
                "";
            }
          );
        }
      );
  }


  /* =========================================================
     COFFEE CARD TILT
     [JS-FIX-04] Sebelumnya JS menimpa transform penuh
     (scale + perspective + rotate). CSS :hover juga set
     scale(1.045). Sekarang JS HANYA set perspective + rotate
     via CSS custom property, dan scale tetap dari CSS :hover.
     Hasilnya tidak ada dua sumber transform yang bentrok.
  ========================================================= */

  if (
    window.matchMedia(
      "(pointer: fine)"
    ).matches &&
    !prefersReducedMotion // [JS-FIX-07]
  ) {
    document
      .querySelectorAll(
        ".coffee-item"
      )
      .forEach(
        (item) => {
          const image =
            item.querySelector(
              ".coffee-image"
            );

          if (!image) {
            return;
          }

          item.addEventListener(
            "mousemove",
            (event) => {
              const rect =
                item.getBoundingClientRect();

              const x =
                event.clientX -
                rect.left;

              const y =
                event.clientY -
                rect.top;

              const rotateX =
                ((y / rect.height) -
                  0.5) *
                -3.5;

              const rotateY =
                ((x / rect.width) -
                  0.5) *
                3.5;

              // [JS-FIX-04] Hanya set rotate, bukan scale.
              // Scale dari CSS :hover tetap berlaku.
              image.style.setProperty(
                "--tilt-x",
                `${rotateX}deg`
              );
              image.style.setProperty(
                "--tilt-y",
                `${rotateY}deg`
              );
              image.style.transform =
                `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
          );

          item.addEventListener(
            "mouseleave",
            () => {
              image.style.transform =
                "";
              image.style.removeProperty("--tilt-x");
              image.style.removeProperty("--tilt-y");
            }
          );
        }
      );
  }


  /* =========================================================
     STATS COUNTER
  ========================================================= */

  const counters =
    document.querySelectorAll(
      "[data-target]"
    );

  if (counters.length) {
    const counterObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const counter =
                entry.target;

              const target =
                Number(
                  counter.dataset.target
                );

              const start =
                performance.now();

              const duration =
                1200;

              const tick = (now) => {
                const progress =
                  Math.min(
                    (now - start) /
                      duration,
                    1
                  );

                const eased =
                  1 -
                  Math.pow(
                    1 - progress,
                    3
                  );

                counter.textContent =
                  Math.floor(
                    target * eased
                  );

                if (
                  progress < 1
                ) {
                  requestAnimationFrame(
                    tick
                  );
                } else {
                  counter.textContent =
                    target;
                }
              };

              requestAnimationFrame(
                tick
              );

              counterObserver.unobserve(
                counter
              );
            }
          );
        },
        {
          threshold: 0.7
        }
      );

    counters.forEach(
      (counter) => {
        counterObserver.observe(
          counter
        );
      }
    );
  }


  /* =========================================================
     STORY SLIDER — 4 IMAGE AUTO CAROUSEL
  ========================================================= */

  const storySlides =
    document.querySelectorAll(
      ".story-slide"
    );

  const storySlideContainer =
    document.querySelector(
      ".story-slides"
    );

  const storySlideNumber =
    document.querySelector(
      ".story-slide-number"
    );

  let currentStorySlide = 0;
  let storyInterval = null;


  /* -------------------------
     UPDATE STORY SLIDE
  ------------------------- */

  const updateStorySlide = (
    index,
    animate = true
  ) => {
    if (
      !storySlideContainer ||
      !storySlides.length
    ) {
      return;
    }

    currentStorySlide =
      index;

    storySlideContainer.style.transition =
      animate
        ? "transform 1s cubic-bezier(.77,0,.18,1)"
        : "none";

    storySlideContainer.style.transform =
      `translateX(-${index * 100}%)`;

    storySlides.forEach(
      (slide, i) => {
        slide.classList.toggle(
          "active",
          i === index
        );
      }
    );

    if (storySlideNumber) {
      storySlideNumber.textContent =
        String(index + 1)
          .padStart(2, "0");
    }
  };


  /* -------------------------
     NEXT STORY SLIDE
  ------------------------- */

  const nextStorySlide = () => {
    if (
      storySlides.length <= 1
    ) {
      return;
    }

    updateStorySlide(
      (currentStorySlide + 1) %
        storySlides.length
    );
  };


  /* -------------------------
     START STORY SLIDER
  ------------------------- */

  const startStorySlider = () => {
    if (
      storySlides.length <= 1
    ) {
      return;
    }

    clearInterval(
      storyInterval
    );

    // [JS-FIX-07] Jika reduce motion, jangan auto-slide.
    if (prefersReducedMotion) {
      return;
    }

    storyInterval =
      setInterval(
        nextStorySlide,
        4000
      );
  };


  /* -------------------------
     INITIALIZE STORY
  ------------------------- */

  if (storySlides.length) {
    updateStorySlide(
      0,
      false
    );

    startStorySlider();

    const storyVisual =
      document.querySelector(
        ".story-visual"
      );

    if (storyVisual) {
      storyVisual.addEventListener(
        "mouseenter",
        () => {
          clearInterval(
            storyInterval
          );
        }
      );

      storyVisual.addEventListener(
        "mouseleave",
        startStorySlider
      );
    }
  }


  /* =========================================================
     MENU PAGE — OPEN / CLOSE
  ========================================================= */

  const openMenu = () => {
    if (!menuPage) {
      return;
    }

    menuPage.classList.add(
      "is-open"
    );

    menuPage.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add(
      "menu-open"
    );

    if (menuToggle) {
      menuToggle.classList.add(
        "is-open"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      // [JS-FIX-06] aria-label dinamis
      menuToggle.setAttribute(
        "aria-label",
        "Close menu"
      );
    }


    // Trigger reflow agar transisi CSS restart.
    // Lalu tambahkan visible di frame berikutnya.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .querySelectorAll(
            ".menu-page .reveal"
          )
          .forEach(
            (element) => {
              element.classList.add(
                "visible"
              );
            }
          );
      });
    });
  };


  const closeMenu = () => {
    if (!menuPage) {
      return;
    }

    menuPage.classList.remove(
      "is-open"
    );

    menuPage.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove(
      "menu-open"
    );

    if (menuToggle) {
      menuToggle.classList.remove(
        "is-open"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      // [JS-FIX-06] aria-label dinamis
      menuToggle.setAttribute(
        "aria-label",
        "Open menu"
      );
    }

    // [JS-FIX-05] Reset reveal menu saat ditutup.
    document
      .querySelectorAll(
        ".menu-page .reveal"
      )
      .forEach(
        (element) => {
          element.classList.remove(
            "visible"
          );
        }
      );
  };


  /* -------------------------
     MENU TOGGLE
  ------------------------- */

  menuToggle?.addEventListener(
    "click",
    () => {
      menuPage?.classList.contains(
        "is-open"
      )
        ? closeMenu()
        : openMenu();
    }
  );


  /* -------------------------
     OPEN MENU BUTTONS
  ------------------------- */

  menuOpenButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          openMenu();
        }
      );
    }
  );


  /* -------------------------
     CLOSE BUTTON
  ------------------------- */

  menuClose?.addEventListener(
    "click",
    closeMenu
  );


  /* -------------------------
     ESC TO CLOSE
  ------------------------- */

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        menuPage?.classList.contains(
          "is-open"
        )
      ) {
        closeMenu();
      }
    }
  );


  /* =========================================================
     MENU NAVIGATION
  ========================================================= */

  menuCloseLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        (event) => {
          const href =
            link.getAttribute(
              "href"
            );

          if (!href) {
            return;
          }

          if (
            href === "#order-menu"
          ) {
            event.preventDefault();

            menuPage.scrollTo({
              top: 0,
              behavior: "smooth"
            });

            return;
          }

  /* =========================================================
     MENU NAVIGATION
  ========================================================= */

  menuCloseLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        (event) => {
          const href = link.getAttribute("href");

          if (!href) {
            return;
          }

          if (!href.startsWith("#")) {
            return; 
          }

          event.preventDefault();
          closeMenu();

          setTimeout(
            () => {
              const target = document.querySelector(href);

              if (target) {
                target.scrollIntoView({
                  behavior: "smooth",
                  block: "start"
                });
              }
            },
            500
          );
        }
      );
    }
  );

          event.preventDefault();

          closeMenu();

          setTimeout(
            () => {
              const target =
                document.querySelector(
                  href
                );

              if (target) {
                target.scrollIntoView({
                  behavior: "smooth",
                  block: "start"
                });
              }
            },
            500
          );
        }
      );
    }
  );


  /* =========================================================
     MENU CATEGORY FILTER
  ========================================================= */

  menuCategories.forEach(
    (categoryButton) => {
      categoryButton.addEventListener(
        "click",
        () => {
          const filter =
            categoryButton.dataset.filter;

          menuCategories.forEach(
            (button) => {
              button.classList.remove(
                "active"
              );
            }
          );

          categoryButton.classList.add(
            "active"
          );

          orderCards.forEach(
            (card) => {
              const show =
                filter === "all" ||
                card.dataset.category ===
                  filter;

              card.classList.toggle(
                "is-hidden",
                !show
              );

              if (show) {
                card.style.animation =
                  "none";

                void card.offsetWidth;

                card.style.animation =
                  "cardIn .55s cubic-bezier(.2,.8,.2,1) both";
              }
            }
          );
        }
      );
    }
  );


  /* =========================================================
     INTERNAL LINKS — SMOOTH SCROLL
  ========================================================= */

  document
    .querySelectorAll(
      'a[href^="#"]:not([data-menu-open]):not(.menu-close-link)'
    )
    .forEach(
      (link) => {
        link.addEventListener(
          "click",
          (event) => {
            const href =
              link.getAttribute(
                "href"
              );

            if (
              !href ||
              href === "#"
            ) {
              return;
            }

            const target =
              document.querySelector(
                href
              );

            if (!target) {
              return;
            }

            event.preventDefault();

            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        );
      }
    );


  /* =========================================================
     IMAGE FALLBACK
  ========================================================= */

  document
    .querySelectorAll("img")
    .forEach(
      (image) => {
        image.addEventListener(
          "error",
          () => {
            image.style.opacity =
              "0.25";

            image.style.filter =
              "grayscale(1)";
          }
        );
      }
    );


  /* =========================================================
     INITIAL STATE
  ========================================================= */

  menuPage?.setAttribute(
    "aria-hidden",
    "true"
  );

  menuToggle?.setAttribute(
    "aria-expanded",
    "false"
  );

  document.documentElement.classList.add(
    "js-loaded"
  );
});