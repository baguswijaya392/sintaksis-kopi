document.addEventListener("DOMContentLoaded", () => {
  
  /* =========================================================
     1. KURSOR CUSTOM SMOKE
  ========================================================= */
  const cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let currentX = mouseX, currentY = mouseY;
    let lastSmokeX = mouseX, lastSmokeY = mouseY;
    const smokeParticles = [];

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX; mouseY = event.clientY;
      const distance = Math.hypot(mouseX - lastSmokeX, mouseY - lastSmokeY);
      if (distance >= 16) {
        lastSmokeX = mouseX; lastSmokeY = mouseY;
        const smoke = document.createElement("div");
        smoke.className = "cursor-smoke";
        const size = Math.random() * 12 + 9;
        smoke.style.left = `${mouseX}px`; smoke.style.top = `${mouseY}px`;
        smoke.style.width = `${size}px`; smoke.style.height = `${size}px`;
        document.body.appendChild(smoke);
        smokeParticles.push({ element: smoke, life: 0, seed: Math.random() * 10 });
      }
    });

    const animateCursor = () => {
      currentX += (mouseX - currentX) * 0.22;
      currentY += (mouseY - currentY) * 0.22;
      cursor.style.left = `${currentX}px`; cursor.style.top = `${currentY}px`;
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const particle = smokeParticles[i];
        particle.life += 0.025;
        const driftX = Math.sin(particle.life * 8 + particle.seed) * 10;
        const driftY = particle.life * -28;
        const scale = 1 + particle.life * 1.8;
        particle.element.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(${scale})`;
        particle.element.style.opacity = Math.max(0, 0.3 - particle.life * 0.38);
        if (particle.life >= 0.8) { particle.element.remove(); smokeParticles.splice(i, 1); }
      }
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button, .coffee-item").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });
  }

  /* =========================================================
     2. ANIMASI SCROLL REVEAL
  ========================================================= */
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* =========================================================
     LOGIKA FILTER MENU DENGAN ANIMASI TRANSISI
  ========================================================= */
  const filterButtons = document.querySelectorAll(".menu-category");
  const menuGroups = document.querySelectorAll(".menu-group");

  if (filterButtons.length > 0 && menuGroups.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        
        // 1. Ubah status tombol
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        const filterValue = button.getAttribute("data-filter");

        // 2. Fade Out: Buat semua grup memudar hilang
        menuGroups.forEach(group => {
          group.style.opacity = "0";
        });

        // 3. Tunggu 300ms (setengah detik) sampai proses memudar selesai
        setTimeout(() => {
          menuGroups.forEach(group => {
            const groupCategory = group.getAttribute("data-group");
            
            if (filterValue === "all" || filterValue === groupCategory) {
              // Jika cocok: Munculkan grupnya
              group.classList.remove("is-hidden");
              
              // Trik restart animasi (Slide Up + Fade In)
              group.classList.remove("animate-in");
              void group.offsetWidth; // Memaksa browser me-restart animasi
              group.classList.add("animate-in");
              
              // Kembalikan opacity-nya
              group.style.opacity = "1";
            } else {
              // Jika tidak cocok: Sembunyikan mutlak
              group.classList.add("is-hidden");
              group.classList.remove("animate-in");
            }
          });
        }, 300); // Waktu tunggu 300ms
      });
    });
  }
});