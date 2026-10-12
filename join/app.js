(() => {
  // ---- ذخیره اسم‌ها (Supabase) ----
  const SB_URL = "https://fjzhkprnxznijwmjrlka.supabase.co";
  const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqemhrcHJueHpuaWp3bWpybGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTQyOTksImV4cCI6MjEwMjc5MDI5OX0.5ruiJfuISuZ28NEMMSZ9XY3-UeKLOe99FLA2hT4wOEA";
  const KEY = "visitor_name";

  const $ = (id) => document.getElementById(id);
  const gate = $("gate"), links = $("links"), form = $("nameForm");
  const input = $("name"), err = $("err"), go = $("go");

  const show = (name) => {
    $("hello").textContent = `سلام ${name} 👋 اینم لینک‌ها`;
    gate.hidden = true; links.hidden = false;
    links.classList.remove("pop"); void links.offsetWidth; links.classList.add("pop");
  };
  const fail = (m) => { err.textContent = m; err.hidden = false; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    err.hidden = true;
    if (name.length < 2) return fail("اسمت باید حداقل ۲ حرف باشه");
    go.disabled = true; go.textContent = "صبر کن...";
    try {
      const r = await fetch(`${SB_URL}/rest/v1/join_site_names`, {
        method: "POST",
        headers: {
          apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
          "Content-Type": "application/json", Prefer: "return=minimal",
        },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) throw new Error(r.status);
    } catch (_) {
      // حتی اگه ذخیره نشد، لینک‌ها رو بده
    }
    try { localStorage.setItem(KEY, name); } catch (_) {}
    go.disabled = false; go.textContent = "ثبت کن و لینک‌ها رو بده";
    show(name);
  });

  $("change").addEventListener("click", () => {
    try { localStorage.removeItem(KEY); } catch (_) {}
    links.hidden = true; gate.hidden = false; input.value = ""; input.focus();
  });

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  if (saved) show(saved); else gate.classList.add("pop");

  // ---- پس‌زمینه: شبکه‌ی ذره‌ها ----
  const cv = $("bg"), ctx = cv.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dots = [], mouse = { x: -999, y: -999 };
  const colors = ["#19E3C5", "#FFB547", "#FF5C8A", "#9FB0E0"];

  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(90, Math.floor(innerWidth * innerHeight / 14000));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
      r: 1.4 + Math.random() * 2, c: colors[(Math.random() * colors.length) | 0],
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of dots) {
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { p.x += dx * .008; p.y += dy * .008; }
      }
    }
    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      for (let j = i + 1; j < dots.length; j++) {
        const b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.strokeStyle = `rgba(159,176,224,${(1 - d / 120) * .35})`;
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = a.c; ctx.shadowColor = a.c; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }
    if (!still) requestAnimationFrame(draw);
  }
  addEventListener("resize", () => { size(); if (still) draw(); });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  size(); draw();
})();
