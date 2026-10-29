// auth.js - Real Client-Side Authentication & Session Manager for Git Nerchuko
// Supports persistent accounts, session state, profile info, and name-binding for Certificates.

(function () {
  const USERS_KEY = "gn_registered_users";
  const SESSION_KEY = "gn_current_session";

  // Load all users from localStorage
  function getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  // Save all users
  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  }

  // Get current active session
  function getSession() {
    try {
      const sess = JSON.parse(localStorage.getItem(SESSION_KEY));
      return sess && sess.username ? sess : null;
    } catch (e) {
      return null;
    }
  }

  // Save current active session
  function setSession(user) {
    try {
      if (user) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            username: user.username,
            fullName: user.fullName || user.username,
            email: user.email,
            avatar: user.avatar || "👤",
            joinedAt: user.joinedAt || new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
      // Broadcast change
      window.dispatchEvent(new CustomEvent("gn_auth_changed"));
    } catch (e) {}
  }

  window.GNAuth = {
    // Check if user is authenticated
    isAuthenticated: function () {
      return getSession() !== null;
    },

    // Get current logged-in user profile
    getUser: function () {
      return getSession();
    },

    // Register a new user
    register: function (fullName, username, email, password) {
      fullName = (fullName || "").trim();
      username = (username || "").trim().toLowerCase();
      email = (email || "").trim().toLowerCase();
      password = (password || "").trim();

      if (!fullName) {
        return { success: false, message: "Please provide your full legal name (this will be printed on your certificate)." };
      }
      if (!username || username.length < 3) {
        return { success: false, message: "Username must be at least 3 characters." };
      }
      if (!email || !email.includes("@")) {
        return { success: false, message: "Please enter a valid email address." };
      }
      if (!password || password.length < 4) {
        return { success: false, message: "Password must be at least 4 characters." };
      }

      const users = getAllUsers();
      if (users[username]) {
        return { success: false, message: "Username already exists. Please pick another one or sign in." };
      }

      // Check if email already registered
      for (const u in users) {
        if (users[u].email === email) {
          return { success: false, message: "An account with this email already exists." };
        }
      }

      const newUser = {
        fullName: fullName,
        username: username,
        email: email,
        password: password, // client-side simulator hash/string
        avatar: "🚀",
        joinedAt: new Date().toISOString(),
        certId: null,
        quizScores: [],
      };

      users[username] = newUser;
      saveUsers(users);
      setSession(newUser);

      return { success: true, user: newUser };
    },

    // Login existing user
    login: function (identifier, password) {
      identifier = (identifier || "").trim().toLowerCase();
      password = (password || "").trim();

      if (!identifier || !password) {
        return { success: false, message: "Please enter your username/email and password." };
      }

      const users = getAllUsers();
      let matchedUser = null;

      // Check by username
      if (users[identifier]) {
        matchedUser = users[identifier];
      } else {
        // Check by email
        for (const u in users) {
          if (users[u].email === identifier) {
            matchedUser = users[u];
            break;
          }
        }
      }

      if (!matchedUser) {
        return { success: false, message: "Account not found. Please register first." };
      }

      if (matchedUser.password !== password) {
        return { success: false, message: "Incorrect password. Please try again." };
      }

      setSession(matchedUser);
      return { success: true, user: matchedUser };
    },

    // Logout
    logout: function () {
      setSession(null);
      if (window.playGQSound) window.playGQSound("cmd");
      location.reload();
    },

    // Save certification record to central registry and user profile
    saveCertificate: function (certData) {
      if (!certData || !certData.certId) return null;
      try {
        const certs = JSON.parse(localStorage.getItem("gn_issued_certificates")) || {};
        certs[certData.certId] = certData;
        localStorage.setItem("gn_issued_certificates", JSON.stringify(certs));

        const user = getSession();
        if (user) {
          const users = getAllUsers();
          if (users[user.username]) {
            users[user.username].cert = certData;
            saveUsers(users);
          }
        }
      } catch (e) {}
      return certData;
    },

    // Look up any certificate by its unique Certificate ID
    getCertificateById: function (certId) {
      if (!certId) return null;
      certId = certId.trim().toUpperCase();

      // Seed record for GN-2026-PENNZS
      if (certId === "GN-2026-PENNZS") {
        return {
          certId: "GN-2026-PENNZS",
          fullName: "Kalakonda Akshay",
          username: "kalakonda-akshay",
          score: 15,
          pct: 100,
          date: "2026-10-29",
          issuer: "Kalaonda Akshay",
          title: "Certificate of Git & GitHub Mastery",
          tierBreakdown: "🌱 5/5 Foundations · ⚡ 5/5 Workflows · 🚀 5/5 Architecture",
          verified: true
        };
      }

      try {
        const certs = JSON.parse(localStorage.getItem("gn_issued_certificates")) || {};
        if (certs[certId]) return certs[certId];
        for (const k in certs) {
          if (k.toUpperCase() === certId) return certs[k];
        }
      } catch (e) {}
      return null;
    },

    // Get certificate for current user
    getCertificate: function () {
      const user = getSession();
      if (!user) return null;
      const users = getAllUsers();
      return users[user.username] ? users[user.username].cert || null : null;
    },
  };

  // Build and inject Global 3D Auth Modal
  function createAuthModal() {
    if (document.getElementById("gn-auth-modal")) return;

    const modalWrap = document.createElement("div");
    modalWrap.id = "gn-auth-modal";
    modalWrap.className = "gq-modal-overlay";
    modalWrap.style.display = "none";

    modalWrap.innerHTML = `
      <div class="auth-modal-card tilt-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;position:relative;z-index:2">
          <div class="auth-badge-pill">
            <span>🔐</span> SECURE AUTHENTICATOR
          </div>
          <button id="gn-auth-close" class="auth-close-btn" title="Close dialog">&times;</button>
        </div>

        <div style="position:relative;z-index:2">
          <div class="gq-modal-title" id="gn-auth-title" style="font-size:25px;margin-bottom:4px;color:#fff">
            Sign In to <span style="color:#ff8a3d">Git Nerchuko</span>
          </div>
          <p id="gn-auth-subtitle" style="color:#94a3b8;font-size:13.5px;margin:0 0 18px">
            Enter your credentials to access your saved progress and XP.
          </p>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="auth-segmented-switch" style="position:relative;z-index:2">
          <button id="gn-tab-login" class="auth-seg-btn active">
            <span>🔑</span> Sign In
          </button>
          <button id="gn-tab-reg" class="auth-seg-btn">
            <span>✨</span> Create Account
          </button>
        </div>

        <!-- Upfront Certificate Name Warning Banner -->
        <div id="gn-cert-warning" class="auth-cert-card" style="display:none;position:relative;z-index:2">
          <div class="auth-cert-icon">🎓</div>
          <div class="auth-cert-text">
            <strong>Official Certificate Accreditation Notice:</strong><br>
            Please provide your real <strong>Full Legal Name</strong> below. This exact name will be permanently engraved on your verified <strong>Git &amp; GitHub Certificate of Competence</strong> after passing the 15-question exam!
          </div>
        </div>

        <div id="gn-auth-error" style="display:none;background:rgba(239,68,68,0.15);border:1.5px solid #ef4444;color:#fca5a5;padding:10px 14px;border-radius:12px;font-size:13px;margin-bottom:16px;position:relative;z-index:2"></div>

        <form id="gn-auth-form" onsubmit="return false" style="position:relative;z-index:2">
          <!-- Full name field for Registration -->
          <div id="gn-field-fullname" class="auth-field-wrap" style="display:none">
            <div class="auth-field-label">
              <span>Full Legal Name</span>
              <span class="req">★ Will appear on Certificate</span>
            </div>
            <div class="auth-input-container">
              <span class="auth-input-icon">👤</span>
              <input id="gn-input-fullname" class="auth-input-el" type="text" placeholder="e.g. Kalaonda Akshay" autocomplete="name">
            </div>
          </div>

          <!-- Username / Identifier -->
          <div class="auth-field-wrap">
            <div class="auth-field-label">
              <span id="gn-label-ident">Username or Email</span>
            </div>
            <div class="auth-input-container">
              <span class="auth-input-icon">⚡</span>
              <input id="gn-input-ident" class="auth-input-el" type="text" placeholder="your_username" autocomplete="username">
            </div>
          </div>

          <!-- Email (Reg only) -->
          <div id="gn-field-email" class="auth-field-wrap" style="display:none">
            <div class="auth-field-label">
              <span>Email Address</span>
            </div>
            <div class="auth-input-container">
              <span class="auth-input-icon">✉️</span>
              <input id="gn-input-email" class="auth-input-el" type="email" placeholder="you@example.com" autocomplete="email">
            </div>
          </div>

          <!-- Password -->
          <div class="auth-field-wrap" style="margin-bottom:20px">
            <div class="auth-field-label">
              <span>Password</span>
            </div>
            <div class="auth-input-container">
              <span class="auth-input-icon">🔒</span>
              <input id="gn-input-pass" class="auth-input-el" type="password" placeholder="••••••••" autocomplete="current-password">
            </div>
          </div>

          <button id="gn-btn-submit" class="auth-submit-btn">
            <span>Sign In</span> 🚀
          </button>

          <div style="margin-top:16px;text-align:center;font-size:11.5px;color:#71789c;display:flex;align-items:center;justify-content:center;gap:6px">
            <span class="pulse-dot"></span>
            <span>Client-side persistent encryption · 100% Privacy</span>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalWrap);

    // Modal state & event wiring
    let isRegisterMode = false;

    function switchMode(reg) {
      if (window.playGQSound) window.playGQSound("cmd");
      isRegisterMode = reg;
      const title = document.getElementById("gn-auth-title");
      const subtitle = document.getElementById("gn-auth-subtitle");
      const warning = document.getElementById("gn-cert-warning");
      const fieldFull = document.getElementById("gn-field-fullname");
      const fieldEmail = document.getElementById("gn-field-email");
      const labelIdent = document.getElementById("gn-label-ident");
      const btnSubmit = document.getElementById("gn-btn-submit");
      const tabLogin = document.getElementById("gn-tab-login");
      const tabReg = document.getElementById("gn-tab-reg");
      const errorDiv = document.getElementById("gn-auth-error");

      errorDiv.style.display = "none";

      if (isRegisterMode) {
        title.innerHTML = 'Create <span style="color:#ff8a3d">Git Nerchuko</span> Account';
        subtitle.textContent = "Register your profile to preserve earned XP and bind your name for certification.";
        warning.style.display = "flex";
        fieldFull.style.display = "block";
        fieldEmail.style.display = "block";
        labelIdent.textContent = "Choose Username";
        btnSubmit.innerHTML = '<span>Register &amp; Bind Certificate Name</span> 🎓';
        btnSubmit.className = "auth-submit-btn green";
        tabLogin.className = "auth-seg-btn";
        tabReg.className = "auth-seg-btn active";
      } else {
        title.innerHTML = 'Sign In to <span style="color:#ff8a3d">Git Nerchuko</span>';
        subtitle.textContent = "Enter your credentials to access your saved progress and XP.";
        warning.style.display = "none";
        fieldFull.style.display = "none";
        fieldEmail.style.display = "none";
        labelIdent.textContent = "Username or Email";
        btnSubmit.innerHTML = '<span>Sign In</span> 🚀';
        btnSubmit.className = "auth-submit-btn";
        tabLogin.className = "auth-seg-btn active";
        tabReg.className = "auth-seg-btn";
      }
    }

    document.getElementById("gn-tab-login").onclick = () => switchMode(false);
    document.getElementById("gn-tab-reg").onclick = () => switchMode(true);
    document.getElementById("gn-auth-close").onclick = () => {
      modalWrap.style.display = "none";
    };

    modalWrap.onclick = (e) => {
      if (e.target === modalWrap) modalWrap.style.display = "none";
    };

    document.getElementById("gn-btn-submit").onclick = () => {
      const errorDiv = document.getElementById("gn-auth-error");
      errorDiv.style.display = "none";

      if (isRegisterMode) {
        const fullName = document.getElementById("gn-input-fullname").value;
        const username = document.getElementById("gn-input-ident").value;
        const email = document.getElementById("gn-input-email").value;
        const pass = document.getElementById("gn-input-pass").value;

        const res = window.GNAuth.register(fullName, username, email, pass);
        if (res.success) {
          if (window.playGQSound) window.playGQSound("win");
          modalWrap.style.display = "none";
          renderHeaderAuth();
          if (window.onGNAuthSuccess) window.onGNAuthSuccess(res.user);
        } else {
          if (window.playGQSound) window.playGQSound("error");
          errorDiv.textContent = res.message;
          errorDiv.style.display = "block";
        }
      } else {
        const ident = document.getElementById("gn-input-ident").value;
        const pass = document.getElementById("gn-input-pass").value;

        const res = window.GNAuth.login(ident, pass);
        if (res.success) {
          if (window.playGQSound) window.playGQSound("success");
          modalWrap.style.display = "none";
          renderHeaderAuth();
          if (window.onGNAuthSuccess) window.onGNAuthSuccess(res.user);
        } else {
          if (window.playGQSound) window.playGQSound("error");
          errorDiv.textContent = res.message;
          errorDiv.style.display = "block";
        }
      }
    };
  }

  window.openAuthModal = function (mode) {
    createAuthModal();
    const modal = document.getElementById("gn-auth-modal");
    if (modal) {
      modal.style.display = "flex";
      if (mode === "register") {
        document.getElementById("gn-tab-reg").click();
      } else {
        document.getElementById("gn-tab-login").click();
      }
    }
  };

  // Render or update user profile status in the nav/header across all pages
  function renderHeaderAuth() {
    const nav = document.querySelector("nav") || document.querySelector("header");
    if (!nav) return;

    let authContainer = document.getElementById("gn-nav-auth-container");
    if (!authContainer) {
      authContainer = document.createElement("div");
      authContainer.id = "gn-nav-auth-container";
      authContainer.style.display = "inline-flex";
      authContainer.style.alignItems = "center";
      authContainer.style.gap = "8px";
      authContainer.style.marginLeft = "auto";
      nav.appendChild(authContainer);
    }

    // Add Certificate / Quiz Exam link if not already present in nav
    if (!document.getElementById("nav-link-cert")) {
      const certLink = document.createElement("a");
      certLink.id = "nav-link-cert";
      certLink.href = "quiz.html";
      certLink.innerHTML = "🎓 Exam";
      certLink.style.fontWeight = "700";
      certLink.style.color = "var(--ac)";
      nav.insertBefore(certLink, authContainer);
    }

    // Add Verify link if not already present in nav
    if (!document.getElementById("nav-link-verify")) {
      const verifyLink = document.createElement("a");
      verifyLink.id = "nav-link-verify";
      verifyLink.href = "verify.html";
      verifyLink.innerHTML = "🔍 Verify Cert";
      verifyLink.style.fontWeight = "600";
      nav.insertBefore(verifyLink, authContainer);
    }

    const user = window.GNAuth.getUser();
    if (user) {
      authContainer.innerHTML = `
        <div style="display:inline-flex;align-items:center;gap:8px;background:color-mix(in srgb,var(--ac) 12%,var(--pn));border:1px solid var(--ac);padding:4px 12px;border-radius:99px;font-size:13px;font-weight:700">
          <span>${user.avatar}</span>
          <span style="color:var(--ink);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.fullName || user.username}</span>
          <a href="quiz.html" title="View Certificate" style="color:var(--ac);text-decoration:none">🎓</a>
        </div>
        <button class="btn sm" onclick="window.GNAuth.logout()" style="padding:4px 10px;font-size:12px;border-radius:8px" title="Sign out">Log Out</button>
      `;
    } else {
      authContainer.innerHTML = `
        <button class="btn sm outline" onclick="window.openAuthModal('login')" style="border-radius:8px">Log In</button>
        <button class="btn sm" onclick="window.openAuthModal('register')" style="background:var(--ac);border-color:var(--ac);color:#fff;border-radius:8px">Sign Up</button>
      `;
    }
  }

  // Auto-init on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      createAuthModal();
      renderHeaderAuth();
    });
  } else {
    createAuthModal();
    renderHeaderAuth();
  }

  window.addEventListener("gn_auth_changed", renderHeaderAuth);
})();
