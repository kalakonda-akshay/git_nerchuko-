// shared.js - Shared preferences, 3D tilt interaction, and theme initialization for GitQuest
(function(){
  function getGQ(){
    try { return JSON.parse(localStorage.getItem("gq")) || {}; }
    catch(e){ return {}; }
  }

  window.applyGQTheme = function(){
    const gq = getGQ();
    const termTheme = gq.termTheme || "default";
    document.documentElement.dataset.termTheme = termTheme;

    const siteTheme = localStorage.getItem("gq_site_theme");
    if (siteTheme) {
      document.documentElement.dataset.theme = siteTheme;
    }
  };

  window.applyGQTheme();
  window.addEventListener("storage", window.applyGQTheme);

  // Keypress audio feedback if enabled
  document.addEventListener("keydown", function(e){
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      if (e.key && e.key.length === 1 && window.playGQSound) {
        window.playGQSound("key");
      }
    }
  });

  // 3D parallax tilt effect for cards
  document.addEventListener("mousemove", function(e){
    const cards = document.querySelectorAll(".tilt-card, .gq-diff-card");
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const rx = -(y - yc) / 12;
        const ry = (x - xc) / 12;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      } else {
        if (!card.classList.contains("selected")) {
          card.style.transform = "";
        } else {
          card.style.transform = "translateY(-3px)";
        }
      }
    });
  });
})();
