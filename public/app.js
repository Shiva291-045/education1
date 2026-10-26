// District Educational Office, Jangaon - Complete Portal & Authentication Application
// React 18 Application - 100% Faithful to IMAGE 2 (Original Correct Light Government Version)

const { useState, useEffect, useContext, createContext, useRef } = React;
const { TelanganaEmblem, TelanganaRisingLogo, PencilBanner, SchoolBuildingGraphic, SkylineGraphic } = window.PORTAL_LOGOS;

// Crisp SVG Vector Icons for Portal Top Section (Matching Reference Image)
function HomeSvgIcon({ className = 'w-4 h-4' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', { key: 'p', d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' })
  ]);
}

function BuildingSvgIcon({ className = 'w-6 h-6' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M12 2L2 7.5v2h2v11h16v-11h2v-2L12 2zm-5 16H5v-7h2v7zm4 0H9v-7h2v7zm4 0h-2v-7h2v7zm4 0h-2v-7h2v7zM12 4.2L18.5 7H5.5L12 4.2z'
    })
  ]);
}

function TeachersGroupSvgIcon({ className = 'w-6 h-6' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
    })
  ]);
}

function TeardropPinSvgIcon({ className = 'w-6 h-6' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z'
    })
  ]);
}

function UserSilhouetteSvgIcon({ className = 'w-6 h-6' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21.6h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'
    })
  ]);
}

function GovtBuildingSvgIcon({ className = 'w-4 h-4' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm10-20L2 6v2h19V6L12 2z'
    })
  ]);
}

function BookOpenSvgIcon({ className = 'w-4 h-4' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, [
    React.createElement('path', { key: 'p1', d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
    React.createElement('path', { key: 'p2', d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
  ]);
}

function GradCapSvgIcon({ className = 'w-4 h-4' }) {
  return React.createElement('svg', {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    React.createElement('path', {
      key: 'p',
      d: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 10.6v3.7c0 3.1 3.1 5.7 7 5.7s7-2.6 7-5.7v-3.7l-7 3.8-7-3.8z'
    })
  ]);
}

// ==========================================
// 1. AUTH CONTEXT & BACKEND API CLIENT
// ==========================================
// ==========================================
// 1. AUTH CONTEXT & BACKEND API CLIENT
// ==========================================
const AuthContext = createContext(null);

const API_BASE = (typeof window !== 'undefined' && window.PORTAL_API_BASE)
  ? String(window.PORTAL_API_BASE).replace(/\/$/, '')
  : '';

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'LOGIN' | 'REGISTER' | 'FORGOT'
  const [loginInitialTab, setLoginInitialTab] = useState('ADMIN'); // 'ADMIN' | 'TEACHER'
  const [currentView, setCurrentView] = useState('PORTAL'); // 'PORTAL' | 'DASHBOARD'
  const [officerTab, setOfficerTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'SCHOOLS_INFO'
  const [theme, setTheme] = useState(() => localStorage.getItem('jangaon_portal_theme') || 'light');
  const [currentLang, setCurrentLang] = useState(() => (window.i18n ? window.i18n.getLanguage() : (localStorage.getItem('portal_language') || 'en')));

  const changeLanguage = (newLang) => {
    const l = (newLang === 'te' || newLang === 'తెలుగు') ? 'te' : 'en';
    setCurrentLang(l);
    if (window.i18n) {
      window.i18n.setLanguage(l);
    } else {
      try { localStorage.setItem('portal_language', l); } catch (e) {}
    }
  };

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e && e.detail && e.detail.lang) {
        setCurrentLang(e.detail.lang);
      }
    };
    window.addEventListener('portal-language-change', handleLangChange);
    return () => window.removeEventListener('portal-language-change', handleLangChange);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('jangaon_portal_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const toggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Session check via server-side HttpOnly cookie
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 1. Register Administrative Account (Direct: Name, Role, Mobile, Password - Zero OTP)
  const registerUser = async (formData) => {
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setActiveModal(null);
        setCurrentView('DASHBOARD');
      }
      return data;
    } catch (err) {
      return { success: false, message: "Network connection error during registration." };
    }
  };

  // 2. Login with Password
  const loginWithPassword = async (identifier, password) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setActiveModal(null);
        setCurrentView('DASHBOARD');
      }
      return data;
    } catch (err) {
      return { success: false, message: "Network connection error during login." };
    }
  };

  // 3. Dedicated Teacher Login (Employee ID + Registered Mobile Number)
  const loginTeacher = async (employeeId, mobileNumber) => {
    try {
      const res = await fetch(apiUrl('/api/auth/teacher/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employeeId, mobileNumber })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setActiveModal(null);
        setCurrentView('DASHBOARD');
      }
      return data;
    } catch (err) {
      return { success: false, message: "Connection error during teacher verification." };
    }
  };

  const logout = async () => {
    try {
      await fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setUser(null);
    setCurrentView('PORTAL');
  };

  const openModal = (modalName, tab = 'ADMIN') => {
    setLoginInitialTab(tab);
    setActiveModal(modalName);
  };
  const closeModal = () => {
    setActiveModal(null);
  };

  return React.createElement(AuthContext.Provider, {
    value: {
      user,
      loading,
      activeModal,
      loginInitialTab,
      openModal,
      closeModal,
      registerUser,
      loginWithPassword,
      loginTeacher,
      logout,
      currentView,
      setCurrentView,
      officerTab,
      setOfficerTab,
      theme,
      changeTheme,
      toggleTheme,
      currentLang,
      changeLanguage
    }
  }, children);
}

// ==========================================
// 2. TOP GOVERNMENT ACCESSIBILITY BAR (IMAGE 2: DEEP BLUE #0c4a7e)
// ==========================================
// 2. TOP GOVERNMENT ACCESSIBILITY BAR (IMAGE 2)
// ==========================================
function TopGovtBar({ fontScale, setFontScale }) {
  const { theme, changeTheme, currentLang, changeLanguage } = useContext(AuthContext);

  const handleFontChange = (scale) => {
    setFontScale(scale);
    document.body.className = `bg-[#f0f4f8] dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 antialiased font-scale-${scale}`;
  };

  return React.createElement('div', {
    className: 'bg-[#0c4a7e] dark:bg-[#082a4d] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#08355b] dark:border-blue-950 transition-colors'
  }, [
    React.createElement('div', {
      key: 'top-bar-inner',
      className: 'max-w-7xl mx-auto flex flex-wrap items-center justify-between w-full'
    }, [
    // Left: Government of Telangana
    React.createElement('div', { key: 'l', className: 'flex items-center space-x-2' }, [
      React.createElement('span', { key: 'pin', className: 'text-white' }, '📍'),
      React.createElement('span', { key: 't1', className: 'font-semibold tracking-wide text-white' }, 'Government of Telangana'),
      React.createElement('span', { key: 'sep', className: 'text-blue-200' }, '|'),
      React.createElement('span', { key: 't2', className: 'text-blue-100' }, 'Department of School Education')
    ]),

    // Right: Controls
    React.createElement('div', { key: 'r', className: 'flex items-center space-x-4 mt-1 sm:mt-0' }, [
      // Font size buttons: A- A A+
      React.createElement('div', { key: 'fonts', className: 'flex items-center space-x-1.5 text-xs' }, [
        React.createElement('button', {
          key: 'f-sm',
          onClick: () => handleFontChange('sm'),
          className: `px-1 hover:text-amber-300 font-bold transition-colors cursor-pointer ${fontScale === 'sm' ? 'text-amber-300' : 'text-white'}`
        }, 'A-'),
        React.createElement('button', {
          key: 'f-md',
          onClick: () => handleFontChange('md'),
          className: `px-1 hover:text-amber-300 font-bold transition-colors cursor-pointer ${fontScale === 'md' ? 'text-amber-300' : 'text-white'}`
        }, 'A'),
        React.createElement('button', {
          key: 'f-lg',
          onClick: () => handleFontChange('lg'),
          className: `px-1 hover:text-amber-300 font-bold transition-colors cursor-pointer ${fontScale === 'lg' ? 'text-amber-300' : 'text-white'}`
        }, 'A+')
      ]),

      React.createElement('span', { key: 'sep2', className: 'text-blue-300' }, '|'),

      // Language Select (English <-> Telugu switch)
      React.createElement('div', { key: 'lang', className: 'relative' }, [
        React.createElement('select', {
          id: 'portal-lang-select',
          value: currentLang || 'en',
          onChange: (e) => changeLanguage(e.target.value),
          className: 'bg-transparent text-white rounded text-xs focus:outline-none cursor-pointer font-bold py-0.5 pr-1 hover:text-amber-300'
        }, [
          React.createElement('option', { key: 'en', value: 'en', className: 'text-slate-800' }, 'English ▾'),
          React.createElement('option', { key: 'te', value: 'te', className: 'text-slate-800' }, 'తెలుగు ▾')
        ])
      ]),

      React.createElement('span', { key: 'sep3', className: 'text-blue-300' }, '|'),

      // Icons: Search, Light, Dark toggle (Matching Image 2 exact active pill style)
      React.createElement('button', {
        key: 's-icn',
        onClick: () => {
          const el = document.getElementById('find-school-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
        className: 'hover:text-amber-300 text-white transition-colors cursor-pointer',
        title: "Search Schools"
      }, '🔍'),
      React.createElement('button', {
        key: 'sun-icn',
        onClick: () => changeTheme('light'),
        className: `p-1 transition-all cursor-pointer hover:opacity-100 ${
          theme === 'light' ? 'text-amber-300 drop-shadow-xs font-bold' : 'text-white/80 hover:text-amber-300'
        }`,
        title: "Light Theme"
      }, React.createElement('span', { key: 'i', className: 'text-sm' }, '☀️')),
      React.createElement('button', {
        key: 'moon-icn',
        onClick: () => changeTheme('dark'),
        className: `p-1 transition-all cursor-pointer hover:opacity-100 ${
          theme === 'dark' ? 'text-blue-300 drop-shadow-xs font-bold' : 'text-white/80 hover:text-blue-300'
        }`,
        title: "Dark Theme"
      }, React.createElement('span', { key: 'i', className: 'text-sm' }, '🌙'))
    ])
    ])
  ]);
}

// ==========================================
// 3. MAIN NAVIGATION HEADER (IMAGE 2: PURE WHITE BACKGROUND, COMPACT & PROFESSIONAL)
// ==========================================
function MainHeader() {
  const { user, openModal, logout, currentView, setCurrentView, setOfficerTab } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return React.createElement('header', {
    className: 'bg-white dark:bg-[#101b33] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors'
  }, [
    React.createElement('div', {
      key: 'header-row',
      className: 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between flex-nowrap'
    }, [
      // Left Brand: Telangana Green Emblem + Blue Typography
      React.createElement('div', {
        key: 'brand',
        onClick: () => setCurrentView('PORTAL'),
        className: 'flex items-center space-x-3 cursor-pointer group flex-shrink-0'
      }, [
        React.createElement(TelanganaEmblem, { key: 'crest', className: 'w-12 h-12 flex-shrink-0' }),
        React.createElement('div', { key: 'brand-titles', className: 'flex flex-col' }, [
          React.createElement('h1', {
            key: 'h1',
            className: 'font-extrabold text-[#0c4a7e] dark:text-blue-400 text-sm lg:text-[17px] leading-tight tracking-tight whitespace-nowrap'
          }, 'District Educational Office, Jangaon'),
          React.createElement('span', {
            key: 'sub1',
            className: 'text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight whitespace-nowrap'
          }, 'School Education Department, Telangana'),
          React.createElement('span', {
            key: 'sub2',
            className: 'text-[11px] font-bold text-[#1565c0] dark:text-blue-300 italic leading-tight whitespace-nowrap'
          }, 'Education for a Brighter Tomorrow')
        ])
      ]),

      // Center Navigation Links (Matching Reference Image 2: Home, About, Teachers, Schools, Students, Examinations, Notifications, Contact)
      React.createElement('nav', {
        key: 'nav',
        className: 'hidden md:flex items-center space-x-1.5 lg:space-x-2.5 text-xs lg:text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap mx-1'
      }, [
        React.createElement('button', {
          key: 'home',
          onClick: () => setCurrentView('PORTAL'),
          className: `flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
            currentView === 'PORTAL' ? 'text-[#0c4a7e] dark:text-blue-300 bg-[#e8f2fc] dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/40 font-bold' : 'hover:text-[#0c4a7e] dark:hover:text-blue-300'
          }`
        }, [
          React.createElement(HomeSvgIcon, { key: 'i', className: 'w-3.5 h-3.5 text-[#0c4a7e] dark:text-blue-300' }),
          React.createElement('span', { key: 't' }, 'Home')
        ]),
        React.createElement('span', {
          key: 'abt',
          onClick: () => {
            const el = document.getElementById('find-school-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'About ▾'),
        React.createElement('span', {
          key: 'tch',
          onClick: () => {
            if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
              setOfficerTab('TEACHERS_INFO');
              setCurrentView('DASHBOARD');
            } else if (user && user.role === 'Teacher') {
              setCurrentView('DASHBOARD');
            } else {
              openModal('LOGIN');
            }
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Teachers ▾'),
        React.createElement('span', {
          key: 'sch',
          onClick: () => {
            if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
              setOfficerTab('SCHOOLS_INFO');
              setCurrentView('DASHBOARD');
            } else {
              const el = document.getElementById('find-school-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Schools ▾'),
        React.createElement('span', {
          key: 'stu',
          onClick: () => {
            const el = document.getElementById('find-school-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Students ▾'),
        React.createElement('span', {
          key: 'exam',
          onClick: () => {
            const el = document.getElementById('find-school-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Examinations ▾'),
        React.createElement('span', {
          key: 'notif',
          onClick: () => {
            const el = document.getElementById('find-school-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Notifications'),
        React.createElement('span', {
          key: 'contact',
          onClick: () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          },
          className: 'hover:text-[#0c4a7e] dark:hover:text-blue-300 cursor-pointer'
        }, 'Contact')
      ]),

      // Right Action Buttons (Matching Reference Image)
      React.createElement('div', {
        key: 'actions',
        className: 'flex items-center space-x-1.5 lg:space-x-2 flex-shrink-0'
      }, [
        // 9-dot grid icon
        React.createElement('button', {
          key: 'grid-btn',
          onClick: () => {
            if (user) setCurrentView('DASHBOARD');
            else openModal('LOGIN');
          },
          className: 'text-slate-600 dark:text-slate-400 hover:text-[#0c4a7e] dark:hover:text-blue-300 p-1 text-lg cursor-pointer'
        }, '⠿'),

        !user ? (
          // Logged Out State: [ Login ] [ + Register ]
          React.createElement('div', { key: 'guest-btns', className: 'flex items-center space-x-2' }, [
            // Login button: White background with blue border and blue text
            React.createElement('button', {
              key: 'btn-login',
              id: 'header-login-btn',
              onClick: () => openModal('LOGIN'),
              className: 'flex items-center space-x-1.5 border border-[#0c4a7e] dark:border-blue-400 text-[#0c4a7e] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md font-semibold text-xs lg:text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap'
            }, [
              React.createElement('span', { key: 'icon' }, '👤'),
              React.createElement('span', { key: 'text' }, 'Login')
            ]),

            // Register button: Solid government blue background with white text
            React.createElement('button', {
              key: 'btn-register',
              id: 'header-register-btn',
              onClick: () => openModal('REGISTER'),
              className: 'flex items-center space-x-1.5 bg-[#0c4a7e] hover:bg-[#08355b] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold text-xs lg:text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap'
            }, [
              React.createElement('span', { key: 'icon' }, '+'),
              React.createElement('span', { key: 'text' }, 'Register')
            ])
          ])
        ) : (
          // Authenticated State: [ 👤 User Name ▼ ]
          React.createElement('div', {
            key: 'user-dropdown-container',
            ref: dropdownRef,
            className: 'relative'
          }, [
            React.createElement('button', {
              key: 'user-btn',
              onClick: () => setDropdownOpen(!dropdownOpen),
              className: 'flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all'
            }, [
              React.createElement('div', {
                key: 'avatar',
                className: 'w-7 h-7 rounded-full bg-[#0c4a7e] text-white flex items-center justify-center text-xs font-bold'
              }, user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'),

              React.createElement('div', { key: 'user-details', className: 'text-left max-w-[140px] truncate' }, [
                React.createElement('div', { key: 'un', className: 'text-xs font-bold truncate text-[#0c4a7e] dark:text-blue-400' }, user.fullName),
                React.createElement('div', { key: 'ur', className: 'text-[10px] text-slate-500 dark:text-slate-400' }, user.role)
              ]),

              React.createElement('span', { key: 'caret', className: 'text-xs text-slate-500 dark:text-slate-400' }, dropdownOpen ? '▲' : '▼')
            ]),

            dropdownOpen && React.createElement('div', {
              key: 'dropdown-menu',
              className: 'absolute right-0 mt-2 w-72 bg-white dark:bg-[#131f37] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50'
            }, [
              React.createElement('div', {
                key: 'sum',
                className: 'px-4 py-3 bg-[#e3f2fd] dark:bg-blue-950/70 border-b border-blue-100 dark:border-blue-900/60'
              }, [
                React.createElement('div', { key: 'n', className: 'font-bold text-slate-900 dark:text-white text-sm' }, user.fullName),
                React.createElement('div', { key: 'r', className: 'text-xs text-slate-600 dark:text-slate-300 mt-0.5' }, [
                  React.createElement('span', { key: 'rl', className: 'font-semibold text-[#0c4a7e] dark:text-blue-400' }, user.role),
                  user.mandal ? ` • ${user.mandal} Mandal` : ''
                ]),
                React.createElement('div', { key: 'm', className: 'text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono' }, user.mobileNumber)
              ]),

              React.createElement('div', { key: 'links', className: 'py-1 text-sm text-slate-700 dark:text-slate-200' }, [
                React.createElement('button', {
                  key: 'm-dash',
                  onClick: () => {
                    setDropdownOpen(false);
                    setCurrentView('DASHBOARD');
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 font-semibold text-[#0c4a7e] dark:text-blue-400'
                }, [
                  React.createElement('span', { key: 'i' }, '📊'),
                  React.createElement('span', { key: 't' }, 'My Officer Dashboard')
                ]),

                (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer') && React.createElement('button', {
                  key: 'm-sch',
                  onClick: () => {
                    setDropdownOpen(false);
                    setOfficerTab('SCHOOLS_INFO');
                    setCurrentView('DASHBOARD');
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '🏛️'),
                  React.createElement('span', { key: 't' }, 'Schools Information')
                ]),

                (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO') && React.createElement('button', {
                  key: 'm-tch',
                  onClick: () => {
                    setDropdownOpen(false);
                    setOfficerTab('TEACHERS_INFO');
                    setCurrentView('DASHBOARD');
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '👥'),
                  React.createElement('span', { key: 't' }, 'Teachers Information')
                ]),

                (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer') && React.createElement('button', {
                  key: 'm-ret',
                  onClick: () => {
                    setDropdownOpen(false);
                    setOfficerTab('RETIREMENT_INFO');
                    setCurrentView('DASHBOARD');
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '📅'),
                  React.createElement('span', { key: 't' }, 'Retirement Information')
                ])
              ]),

              React.createElement('div', { key: 'logout-sec', className: 'pt-1 border-t border-slate-100 dark:border-slate-800' }, [
                React.createElement('button', {
                  key: 'm-logout',
                  onClick: () => {
                    setDropdownOpen(false);
                    logout();
                  },
                  className: 'w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '🚪'),
                  React.createElement('span', { key: 't' }, 'Logout')
                ])
              ])
            ])
          ])
        )
      ])
    ])
  ]);
}


// ==========================================
// 4. HERO SECTION (MATCHING REFERENCE IMAGE 1: COMPACT HORIZONTAL ROW, BANNER + SLOGAN ON LEFT, CARDS ON RIGHT)
// ==========================================
function HeroBanner({ onSelectOfficial }) {
  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-1'
  }, [
    React.createElement('div', {
      key: 'hero-grid',
      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-stretch w-full'
    }, [
      // 1. Left Section (Banner Card + Slogan Ribbon Stacked): spans 7 cols on desktop (~58% width matching reference 2)
      React.createElement('div', {
        key: 'left-col',
        className: 'col-span-1 sm:col-span-2 lg:col-span-7 flex flex-col justify-between gap-1.5 h-full w-full'
      }, [
        // Main Banner Card
        React.createElement('div', {
          key: 'main-banner-card',
          className: 'bg-white dark:bg-[#131f37] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-2 sm:p-2.5 shadow-xs flex-1 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 transition-colors w-full'
        }, [
          // Left Emblem
          React.createElement('div', {
            key: 'left-emblem',
            className: 'flex-shrink-0 flex items-center justify-center p-0.5'
          }, [
            React.createElement(TelanganaEmblem, { className: 'w-18 h-18 sm:w-20 sm:h-20 drop-shadow-xs' })
          ]),

          // Center Pencil Graphic & Titles
          React.createElement('div', {
            key: 'center-content',
            className: 'flex-1 w-full flex flex-col items-center justify-center px-1 min-w-0'
          }, [
            React.createElement(PencilBanner, { className: 'w-full' })
          ]),

          // Right Telangana Rising
          React.createElement('div', {
            key: 'right-rising',
            className: 'flex-shrink-0 hidden sm:flex items-center justify-center p-0.5'
          }, [
            React.createElement(TelanganaRisingLogo, { className: 'w-14 h-14 sm:w-16 sm:h-16 drop-shadow-xs' })
          ])
        ]),

        // Bottom Slogan Ribbon (directly beneath banner, matching left column width)
        React.createElement('div', {
          key: 'slogan-bar',
          className: 'bg-[#0c4a7e] dark:bg-[#082a4d] text-white py-1.5 px-3 sm:px-4 rounded-xl shadow-xs border border-blue-900/40 flex items-center justify-between sm:justify-around flex-wrap gap-2 text-[11px] sm:text-xs font-semibold transition-colors w-full'
        }, [
          React.createElement('div', { key: 'p1', className: 'flex items-center space-x-1' }, [
            React.createElement(TeardropPinSvgIcon, { key: 'i', className: 'w-3.5 h-3.5 text-white flex-shrink-0' }),
            React.createElement('span', { key: 't' }, 'Jangaon')
          ]),
          React.createElement('div', { key: 'p2', className: 'flex items-center space-x-1' }, [
            React.createElement(BookOpenSvgIcon, { key: 'i', className: 'w-3.5 h-3.5 text-white flex-shrink-0' }),
            React.createElement('span', { key: 't' }, 'Quality Education')
          ]),
          React.createElement('div', { key: 'p3', className: 'flex items-center space-x-1' }, [
            React.createElement(TeachersGroupSvgIcon, { key: 'i', className: 'w-3.5 h-3.5 text-white flex-shrink-0' }),
            React.createElement('span', { key: 't' }, 'Empowered Teachers')
          ]),
          React.createElement('div', { key: 'p4', className: 'flex items-center space-x-1' }, [
            React.createElement(GradCapSvgIcon, { key: 'i', className: 'w-3.5 h-3.5 text-white flex-shrink-0' }),
            React.createElement('span', { key: 't' }, 'Brighter Future')
          ])
        ])
      ]),

      // 2. Right Section: Combined Official Profile Card for Sri Sandeep Kumar Jha, I.A.S (spans 5 cols on desktop, matching 2nd reference image exactly)
      React.createElement('div', {
        key: 'combined-official-card',
        className: 'col-span-1 sm:col-span-2 lg:col-span-5 bg-[#f0f7fe] dark:bg-[#132238] border border-blue-200/90 dark:border-blue-800/60 rounded-2xl p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all h-full w-full'
      }, [
        // Top Row: "View Profile →" link on right
        React.createElement('div', {
          key: 'top-link-row',
          className: 'flex justify-end w-full'
        }, [
          React.createElement('button', {
            key: 'view-profile-btn',
            onClick: () => onSelectOfficial && onSelectOfficial('SANDEEP_JHA'),
            className: 'text-xs sm:text-[13px] font-semibold text-[#1976d2] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center space-x-1 cursor-pointer whitespace-nowrap hover:underline transition-colors'
          }, [
            React.createElement('span', { key: 'txt' }, 'View Profile'),
            React.createElement('span', { key: 'arr' }, '→')
          ])
        ]),

        // Middle Row: Large Circular Photo on Left, Vertical Divider Line, Prominent Official Details on Right
        React.createElement('div', {
          key: 'details-row',
          className: 'flex items-center gap-3 sm:gap-3.5 my-auto py-0.5'
        }, [
          // Large Circular Portrait Photo (Matching 2nd Reference Image)
          React.createElement('div', {
            key: 'photo-container',
            className: 'w-26 h-26 sm:w-28 sm:h-28 lg:w-[118px] lg:h-[118px] rounded-full ring-2 ring-blue-300/80 dark:ring-blue-700/60 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0 bg-white'
          }, [
            React.createElement('img', {
              key: 'sandeep-photo',
              src: '/assets/officials/district_collector.png',
              alt: 'Sri Sandeep Kumar Jha, I.A.S',
              className: 'w-full h-full rounded-full object-cover scale-95',
              style: { borderRadius: '50%', objectFit: 'cover' }
            })
          ]),

          // Tall Vertical Divider Line
          React.createElement('div', {
            key: 'v-divider',
            className: 'w-px h-20 sm:h-22 lg:h-[88px] bg-blue-200/80 dark:bg-blue-800/80 self-center flex-shrink-0 mx-2'
          }),

          // Names and Both Designations (Bigger, Bolder, Professional Typography)
          React.createElement('div', {
            key: 'text-container',
            className: 'flex-1 min-w-0 pl-1'
          }, [
            // Name: Sri Sandeep Kumar Jha, I.A.S
            React.createElement('h3', {
              key: 'official-name',
              className: 'font-bold text-[15px] sm:text-base lg:text-[17.5px] text-[#0f172a] dark:text-white leading-tight tracking-tight whitespace-nowrap'
            }, 'Sri Sandeep Kumar Jha, I.A.S'),

            // Designation 1: District Collector
            React.createElement('div', {
              key: 'desig-collector',
              className: 'flex items-center space-x-2 mt-1.5 text-xs sm:text-[13.5px] lg:text-[14px] font-semibold text-[#0c4a7e] dark:text-blue-200 whitespace-nowrap'
            }, [
              React.createElement(GovtBuildingSvgIcon, { 
                key: 'icon-collector', 
                className: 'w-4 h-4 text-[#0c4a7e] dark:text-blue-300 flex-shrink-0',
                style: { width: '16px', height: '16px', minWidth: '16px' }
              }),
              React.createElement('span', { key: 'label-collector' }, 'District Collector')
            ]),

            // Designation 2: District Educational Officer
            React.createElement('div', {
              key: 'desig-deo',
              className: 'flex items-center space-x-2 mt-1 text-xs sm:text-[13.5px] lg:text-[14px] font-semibold text-[#0c4a7e] dark:text-blue-200 whitespace-nowrap'
            }, [
              React.createElement(GradCapSvgIcon, { 
                key: 'icon-deo', 
                className: 'w-4 h-4 text-[#0c4a7e] dark:text-blue-300 flex-shrink-0',
                style: { width: '16px', height: '16px', minWidth: '16px' }
              }),
              React.createElement('span', { key: 'label-deo' }, 'District Educational Officer')
            ]),

            // District: Jangaon District
            React.createElement('div', {
              key: 'district-label',
              className: 'text-xs sm:text-[12px] lg:text-[12.5px] text-slate-500 dark:text-slate-400 font-normal ml-6 leading-tight mt-0.5 whitespace-nowrap'
            }, 'Jangaon District')
          ])
        ]),

        // Bottom Row: Enclosed Rounded Quotation Card Box (Matching 2nd Reference Image Exactly)
        React.createElement('div', {
          key: 'quote-card-box',
          className: 'w-full bg-white dark:bg-slate-800/90 border border-blue-100 dark:border-blue-900/40 rounded-2xl px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs mt-2'
        }, [
          React.createElement('span', {
            key: 'q1',
            className: 'text-[#1976d2] dark:text-blue-400 font-serif font-black text-2xl flex-shrink-0 select-none mr-3 leading-none'
          }, '“'),
          React.createElement('p', {
            key: 'qt',
            className: 'flex-1 text-center italic text-xs sm:text-[12px] lg:text-[12.5px] font-medium text-[#1e3a8a] dark:text-slate-200 leading-snug px-1'
          }, [
            React.createElement('span', { key: 'l1', className: 'block' }, 'Committed to inclusive development and'),
            React.createElement('span', { key: 'l2', className: 'block' }, 'quality education for every child.')
          ]),
          React.createElement('span', {
            key: 'q2',
            className: 'text-[#1976d2] dark:text-blue-400 font-serif font-black text-2xl flex-shrink-0 select-none ml-3 leading-none'
          }, '”')
        ])
      ])
    ])
  ]);
}

// SloganRibbon is now integrated inside HeroBanner (returns null for compatibility)
function SloganRibbon() {
  return null;
}

// ==========================================
// 5B. STANDALONE 4 STATISTICS CARDS (MATCHING REFERENCE IMAGE EXACTLY: DIVIDED WHITE BAR)
// ==========================================
function StandaloneStatsCards() {
  const { user, setCurrentView, openModal, setOfficerTab } = useContext(AuthContext);

  const stats = [
    {
      key: 'schools',
      icon: React.createElement(BuildingSvgIcon, { className: 'w-7 h-7 sm:w-8 sm:h-8 text-[#0066cc]' }),
      count: '1,248',
      label: 'Schools',
      action: () => {
        if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
          setOfficerTab('SCHOOLS_INFO');
          setCurrentView('DASHBOARD');
        } else {
          const el = document.getElementById('find-school-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      key: 'teachers',
      icon: React.createElement(TeachersGroupSvgIcon, { className: 'w-7 h-7 sm:w-8 sm:h-8 text-[#007a33]' }),
      count: '3,842',
      label: 'Teachers',
      action: () => {
        if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
          setOfficerTab('TEACHERS_INFO');
          setCurrentView('DASHBOARD');
        } else if (user && user.role === 'Teacher') {
          setCurrentView('DASHBOARD');
        } else {
          openModal('LOGIN');
        }
      }
    },
    {
      key: 'students',
      icon: React.createElement(TeachersGroupSvgIcon, { className: 'w-7 h-7 sm:w-8 sm:h-8 text-[#e65100]' }),
      count: '1,45,620',
      label: 'Students',
      action: () => {
        const el = document.getElementById('find-school-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      key: 'mandals',
      icon: React.createElement(TeardropPinSvgIcon, { className: 'w-7 h-7 sm:w-8 sm:h-8 text-[#7c3aed]' }),
      count: '29',
      label: 'Mandals',
      action: () => {
        const el = document.getElementById('find-school-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3'
  }, [
    React.createElement('div', {
      key: 'stats-container',
      className: 'bg-white dark:bg-[#131f37] rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700/60 p-2 sm:p-2.5 transition-colors'
    }, stats.map((st) => (
      React.createElement('div', {
        key: st.key,
        onClick: st.action || undefined,
        className: `p-2 sm:p-3 flex items-center justify-between group transition-all ${
          st.action ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : ''
        }`
      }, [
        React.createElement('div', {
          key: 'left-info',
          className: 'flex items-center space-x-2.5 sm:space-x-3.5'
        }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: 'flex-shrink-0 group-hover:scale-105 transition-transform'
          }, st.icon),
          React.createElement('div', { key: 'text-wrap' }, [
            React.createElement('div', {
              key: 'count',
              className: 'font-extrabold text-base sm:text-xl lg:text-2xl text-[#0c4a7e] dark:text-blue-400 leading-tight'
            }, st.count),
            React.createElement('div', {
              key: 'label',
              className: 'text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium'
            }, st.label)
          ])
        ]),

        React.createElement('div', {
          key: 'arrow-btn',
          className: 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0c4a7e] dark:text-blue-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs group-hover:bg-[#0c4a7e] group-hover:text-white group-hover:border-[#0c4a7e] dark:group-hover:bg-blue-600 transition-all flex-shrink-0 mr-1'
        }, '›')
      ])
    )))
  ]);
}

// ==========================================
// 6. QUICK SERVICES (MATCHING REFERENCE IMAGE EXACTLY: PASTEL CARDS & CLEAN ICONS)
// ==========================================
function QuickServices() {
  const { user, setCurrentView, openModal, setOfficerTab } = useContext(AuthContext);

  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mb-2'
  }, [
    React.createElement('div', {
      key: 'qs-head',
      className: 'flex items-center justify-between mb-3'
    }, [
      React.createElement('div', { key: 'title', className: 'flex items-center space-x-2' }, [
        React.createElement('div', {
          key: 'icon-circle',
          className: 'w-7 h-7 rounded-full bg-[#0c4a7e] text-white flex items-center justify-center font-bold text-xs shadow-xs'
        }, '⚡'),
        React.createElement('div', { key: 'text' }, [
          React.createElement('h2', { key: 'h2', className: 'text-base sm:text-lg font-bold text-[#0c4a7e] dark:text-white leading-tight' }, 'Quick Services'),
          React.createElement('p', { key: 'p', className: 'text-[11px] text-slate-500 dark:text-slate-400' }, 'Access essential information and services')
        ])
      ]),
      React.createElement('button', {
        key: 'view-all',
        onClick: () => {
          const el = document.getElementById('find-school-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
        className: 'text-xs font-semibold text-[#0c4a7e] dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 flex items-center space-x-1 cursor-pointer'
      }, [
        React.createElement('span', { key: 't' }, 'View All Services'),
        React.createElement('span', { key: 'a' }, '→')
      ])
    ]),

    React.createElement('div', {
      key: 'cards-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
    }, [
      // Left Card: Very light green / pale green background (#f0fdf4) with green circle icon
      React.createElement('div', {
        key: 'c-tch',
        onClick: () => {
          if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
            setOfficerTab('TEACHERS_INFO');
            setCurrentView('DASHBOARD');
          } else if (user && user.role === 'Teacher') {
            setCurrentView('DASHBOARD');
          } else {
            openModal('LOGIN');
          }
        },
        className: 'bg-[#f0fdf4] dark:bg-[#122828] border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 rounded-xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-xs group'
      }, [
        React.createElement('div', { key: 'info', className: 'flex items-center space-x-3.5' }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: 'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#d1fae5] dark:bg-emerald-950/70 text-[#007a33] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform'
          }, [
            React.createElement(UserSilhouetteSvgIcon, { key: 'icn', className: 'w-6 h-6' })
          ]),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 'title', className: 'text-sm sm:text-base font-bold text-[#0c4a7e] dark:text-emerald-300 group-hover:text-blue-900 dark:group-hover:text-emerald-200' }, 'Teachers Information'),
            React.createElement('p', { key: 'sub', className: 'text-xs text-slate-600 dark:text-slate-400' }, 'Transfers, Vacancies, Trainings and More')
          ])
        ]),
        React.createElement('div', {
          key: 'arrow',
          className: 'w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-[#0c4a7e] dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shadow-xs group-hover:bg-[#007a33] group-hover:text-white group-hover:border-[#007a33] transition-all'
        }, '→')
      ]),

      // Right Card: Very light blue background (#f0f7ff) with blue circle icon
      React.createElement('div', {
        key: 'c-sch',
        onClick: () => {
          if (user && (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer' || user.role === 'MEO')) {
            setOfficerTab('SCHOOLS_INFO');
            setCurrentView('DASHBOARD');
          } else {
            const el = document.getElementById('find-school-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        },
        className: 'bg-[#f0f7ff] dark:bg-[#132238] border border-blue-200 dark:border-blue-800/60 hover:border-blue-400 rounded-xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-xs group'
      }, [
        React.createElement('div', { key: 'info', className: 'flex items-center space-x-3.5' }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: 'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#dbeafe] dark:bg-blue-950/70 text-[#0c4a7e] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform'
          }, [
            React.createElement(BuildingSvgIcon, { key: 'icn', className: 'w-6 h-6' })
          ]),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 'title', className: 'text-sm sm:text-base font-bold text-[#0c4a7e] dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-200' }, 'Schools Information'),
            React.createElement('p', { key: 'sub', className: 'text-xs text-slate-600 dark:text-slate-400' }, 'Find Schools in Jangaon District')
          ])
        ]),
        React.createElement('div', {
          key: 'arrow',
          className: 'w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-[#0c4a7e] dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shadow-xs group-hover:bg-[#0c4a7e] group-hover:text-white group-hover:border-[#0c4a7e] transition-all'
        }, '→')
      ])
    ])
  ]);
}

// ==========================================
// 6B. OFFICIAL PROFILE MODAL (DISTRICT COLLECTOR & DEO VERIFIED DETAILS)
// ==========================================
function OfficialProfileModal({ official, onClose }) {
  if (!official) return null;

  const isSandeep = (official === 'SANDEEP_JHA' || official === 'COLLECTOR');
  const officialData = isSandeep ? {
    name: 'Sri Sandeep Kumar Jha, I.A.S',
    title: 'District Collector & District Educational Officer',
    district: 'Jangaon District, Telangana',
    photo: '/assets/officials/sandeep_kumar_jha.png',
    department: 'Revenue, District Administration & Department of School Education',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    office: 'Collectorate Complex, Jangaon District Headquarters, Telangana - 506167',
    contact: 'collector-jgn@telangana.gov.in / deojangaon@gmail.com',
    message: 'Committed to inclusive development, quality education for every child, and streamlined administrative governance across all mandals of Jangaon District.'
  } : {
    name: 'Sri K. Ramesh Kumar',
    title: 'District Educational Officer (DEO)',
    district: 'Jangaon District, Telangana',
    photo: '/assets/officials/district_educational_officer.png',
    department: 'Department of School Education, Telangana',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    office: 'O/o District Educational Officer, Near Collectorate, Jangaon, Telangana - 506167',
    contact: 'deojangaon@gmail.com',
    message: 'Quality education, equitable opportunities, and holistic development for every child across primary, upper primary, and secondary schools in Jangaon District.'
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
  }, [
    React.createElement('div', {
      key: 'modal-card',
      className: 'bg-white dark:bg-[#131f37] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden'
    }, [
      // Top colored bar
      React.createElement('div', {
        key: 'top-bar',
        className: `h-3 ${isSandeep ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800' : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800'}`
      }),

      React.createElement('div', {
        key: 'content',
        className: 'p-6 space-y-4'
      }, [
        React.createElement('div', {
          key: 'header-row',
          className: 'flex items-center justify-between'
        }, [
          React.createElement('span', {
            key: 'badge',
            className: `px-3 py-1 rounded-full text-xs font-bold border ${officialData.badgeColor}`
          }, isCollector ? 'DISTRICT COLLECTOR' : 'DISTRICT EDUCATIONAL OFFICER'),
          React.createElement('button', {
            key: 'close-btn',
            onClick: onClose,
            className: 'text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold cursor-pointer'
          }, '✕')
        ]),

        // Photo & Name
        React.createElement('div', {
          key: 'profile-head',
          className: 'flex items-center space-x-4 pt-1'
        }, [
          React.createElement('div', {
            key: 'photo-container',
            className: `w-20 h-20 rounded-full p-1 ring-3 ${isCollector ? 'ring-blue-300 dark:ring-blue-600' : 'ring-emerald-300 dark:ring-emerald-600'} bg-white dark:bg-slate-800 shadow-md flex-shrink-0 overflow-hidden`
          }, [
            React.createElement('img', {
              key: 'img',
              src: officialData.photo,
              alt: officialData.name,
              className: 'w-full h-full rounded-full object-cover',
              style: { borderRadius: '50%', objectFit: 'cover' }
            })
          ]),
          React.createElement('div', { key: 'titles' }, [
            React.createElement('h3', { key: 'name', className: 'text-lg font-black text-slate-900 dark:text-white leading-snug' }, officialData.name),
            React.createElement('p', { key: 'role', className: 'text-sm font-semibold text-[#0c4a7e] dark:text-blue-400' }, officialData.title),
            React.createElement('p', { key: 'dist', className: 'text-xs text-slate-500 dark:text-slate-400' }, officialData.district)
          ])
        ]),

        // Details grid
        React.createElement('div', {
          key: 'details-box',
          className: 'bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 text-xs border border-slate-200/80 dark:border-slate-700/60'
        }, [
          React.createElement('div', { key: 'dept', className: 'flex justify-between' }, [
            React.createElement('span', { key: 'l', className: 'text-slate-500 dark:text-slate-400 font-medium' }, 'Department:'),
            React.createElement('span', { key: 'v', className: 'font-semibold text-slate-800 dark:text-slate-200 text-right' }, officialData.department)
          ]),
          React.createElement('div', { key: 'office', className: 'flex justify-between' }, [
            React.createElement('span', { key: 'l', className: 'text-slate-500 dark:text-slate-400 font-medium' }, 'Official Office:'),
            React.createElement('span', { key: 'v', className: 'font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[260px]' }, officialData.office)
          ]),
          React.createElement('div', { key: 'email', className: 'flex justify-between' }, [
            React.createElement('span', { key: 'l', className: 'text-slate-500 dark:text-slate-400 font-medium' }, 'Official Email:'),
            React.createElement('span', { key: 'v', className: 'font-semibold text-blue-600 dark:text-blue-400 text-right' }, officialData.contact)
          ])
        ]),

        // Vision Statement
        React.createElement('div', {
          key: 'statement',
          className: 'p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-blue-50/40 dark:bg-slate-800/40'
        }, [
          React.createElement('div', { key: 'lbl', className: 'text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1' }, 'Vision & Leadership Message'),
          React.createElement('p', { key: 'p', className: 'text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed' }, `“${officialData.message}”`)
        ]),

        // Close button
        React.createElement('div', { key: 'btn-row', className: 'pt-2 flex justify-end' }, [
          React.createElement('button', {
            key: 'btn',
            onClick: onClose,
            className: 'px-4 py-2 bg-[#0c4a7e] hover:bg-[#08355b] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs'
          }, 'Close')
        ])
      ])
    ])
  ]);
}


// ==========================================
// 7. LOWER CONTENT CARDS (IMAGE 2: PURE WHITE BACKGROUND, LIGHT PASTELS)
// ==========================================
function NewsThumbnail({ type, className = "w-11 h-11" }) {
  if (type === 'science') {
    return React.createElement('svg', {
      className: `${className} rounded-lg flex-shrink-0 border border-blue-200 shadow-2xs`,
      viewBox: "0 0 48 48",
      fill: "none"
    }, [
      React.createElement('rect', { key: 'bg', width: 48, height: 48, rx: 8, fill: "url(#sciGrad)" }),
      React.createElement('defs', { key: 'defs' }, [
        React.createElement('linearGradient', { key: 'g', id: 'sciGrad', x1: 0, y1: 0, x2: 48, y2: 48 }, [
          React.createElement('stop', { key: 's1', offset: '0%', stopColor: '#0284c7' }),
          React.createElement('stop', { key: 's2', offset: '100%', stopColor: '#0369a1' })
        ])
      ]),
      React.createElement('path', { key: 'flask', d: "M20 14 L28 14 L28 20 L35 32 A 3 3 0 0 1 32 36 L16 36 A 3 3 0 0 1 13 32 L20 20 Z", fill: "#ffffff", fillOpacity: 0.9 }),
      React.createElement('path', { key: 'liquid', d: "M16 32 L32 32 L34 34 L14 34 Z", fill: "#38bdf8" }),
      React.createElement('circle', { key: 'b1', cx: 22, cy: 28, r: 1.5, fill: "#0284c7" }),
      React.createElement('circle', { key: 'b2', cx: 26, cy: 25, r: 1, fill: "#0284c7" })
    ]);
  }
  if (type === 'sports') {
    return React.createElement('svg', {
      className: `${className} rounded-lg flex-shrink-0 border border-amber-200 shadow-2xs`,
      viewBox: "0 0 48 48",
      fill: "none"
    }, [
      React.createElement('rect', { key: 'bg', width: 48, height: 48, rx: 8, fill: "url(#sportGrad)" }),
      React.createElement('defs', { key: 'defs' }, [
        React.createElement('linearGradient', { key: 'g', id: 'sportGrad', x1: 0, y1: 0, x2: 48, y2: 48 }, [
          React.createElement('stop', { key: 's1', offset: '0%', stopColor: '#f59e0b' }),
          React.createElement('stop', { key: 's2', offset: '100%', stopColor: '#d97706' })
        ])
      ]),
      React.createElement('path', { key: 'cup', d: "M18 16 L30 16 L30 25 C 30 29, 18 29, 18 25 Z", fill: "#ffffff" }),
      React.createElement('path', { key: 'h-l', d: "M18 18 C 14 18, 14 23, 18 23", stroke: "#ffffff", strokeWidth: 1.5, fill: "none" }),
      React.createElement('path', { key: 'h-r', d: "M30 18 C 34 18, 34 23, 30 23", stroke: "#ffffff", strokeWidth: 1.5, fill: "none" }),
      React.createElement('rect', { key: 'stem', x: 22, y: 28, width: 4, height: 4, fill: "#ffffff" }),
      React.createElement('rect', { key: 'base', x: 19, y: 32, width: 10, height: 3, rx: 1, fill: "#ffffff" }),
      React.createElement('circle', { key: 'star', cx: 24, cy: 21, r: 1.5, fill: "#f59e0b" })
    ]);
  }
  if (type === 'training') {
    return React.createElement('svg', {
      className: `${className} rounded-lg flex-shrink-0 border border-emerald-200 shadow-2xs`,
      viewBox: "0 0 48 48",
      fill: "none"
    }, [
      React.createElement('rect', { key: 'bg', width: 48, height: 48, rx: 8, fill: "url(#trainGrad)" }),
      React.createElement('defs', { key: 'defs' }, [
        React.createElement('linearGradient', { key: 'g', id: 'trainGrad', x1: 0, y1: 0, x2: 48, y2: 48 }, [
          React.createElement('stop', { key: 's1', offset: '0%', stopColor: '#059669' }),
          React.createElement('stop', { key: 's2', offset: '100%', stopColor: '#047857' })
        ])
      ]),
      React.createElement('rect', { key: 'board', x: 13, y: 13, width: 22, height: 16, rx: 1.5, fill: "#ffffff" }),
      React.createElement('rect', { key: 'screen', x: 15, y: 15, width: 18, height: 12, fill: "#059669" }),
      React.createElement('line', { key: 'stand-l', x1: 17, y1: 29, x2: 15, y2: 35, stroke: "#ffffff", strokeWidth: 1.5 }),
      React.createElement('line', { key: 'stand-r', x1: 31, y1: 29, x2: 33, y2: 35, stroke: "#ffffff", strokeWidth: 1.5 }),
      React.createElement('path', { key: 'chart', d: "M17 24 L21 21 L25 23 L29 18", stroke: "#ffffff", strokeWidth: 1.5, fill: "none" })
    ]);
  }
  return React.createElement('svg', {
    className: `${className} rounded-lg flex-shrink-0 border border-purple-200 shadow-2xs`,
    viewBox: "0 0 48 48",
    fill: "none"
  }, [
    React.createElement('rect', { key: 'bg', width: 48, height: 48, rx: 8, fill: "url(#celebGrad)" }),
    React.createElement('defs', { key: 'defs' }, [
      React.createElement('linearGradient', { key: 'g', id: 'celebGrad', x1: 0, y1: 0, x2: 48, y2: 48 }, [
        React.createElement('stop', { key: 's1', offset: '0%', stopColor: '#7c3aed' }),
        React.createElement('stop', { key: 's2', offset: '100%', stopColor: '#6d28d9' })
      ])
    ]),
    React.createElement('polygon', { key: 'mortar', points: "24,14 36,20 24,26 12,20", fill: "#ffffff" }),
    React.createElement('path', { key: 'skull', d: "M16 23 L16 29 C 16 32, 32 32, 32 29 L32 23", fill: "#ffffff" }),
    React.createElement('line', { key: 'tassel', x1: 24, y1: 20, x2: 34, y2: 24, stroke: "#fbbf24", strokeWidth: 1.5 }),
    React.createElement('circle', { key: 'dot', cx: 34, cy: 25, r: 1.5, fill: "#fbbf24" })
  ]);
}

function PortalCardsGrid() {
  const [mandal, setMandal] = useState('all');
  const [schoolType, setSchoolType] = useState('all');
  const [searchResults, setSearchResults] = useState(null);

  const notifications = [
    { date: '15 Sep 2025', tag: 'Examinations', tagColor: 'bg-[#ede7f6] text-[#5e35b1]', title: 'SSC Public Examinations – Time Table Released', isNew: true },
    { date: '12 Sep 2025', tag: 'Teachers', tagColor: 'bg-[#fff3e0] text-[#e65100]', title: 'Teacher Transfers – Guidelines and Format', isNew: true },
    { date: '08 Sep 2025', tag: 'Schools', tagColor: 'bg-[#e1f5fe] text-[#0277bd]', title: 'School Infrastructure Grants – Utilization Certificates', isNew: true },
    { date: '01 Sep 2025', tag: 'General', tagColor: 'bg-[#e8f5e9] text-[#2e7d32]', title: 'Revised Academic Calendar for 2025-26', isNew: true }
  ];

  const newsItems = [
    { title: 'District Level Science Exhibition', date: '14 Sep 2025', type: 'science' },
    { title: 'Inter School Sports Meet 2025', date: '10 Sep 2025', type: 'sports' },
    { title: 'Teachers Training Program', date: '05 Sep 2025', type: 'training' },
    { title: 'National Education Day Celebrations', date: '01 Sep 2025', type: 'celebration' }
  ];

  const fetchSchools = async (mVal, tVal) => {
    try {
      const qMandal = mVal !== undefined ? mVal : mandal;
      const qType = tVal !== undefined ? tVal : schoolType;
      const res = await fetch(`/api/schools/search?mandal=${encodeURIComponent(qMandal)}&type=${encodeURIComponent(qType)}`);
      const data = await res.json();
      setSearchResults(data.schools || []);
    } catch (e) {
      setSearchResults([]);
    }
  };

  const handleSearchSchool = () => {
    fetchSchools(mandal, schoolType);
  };

  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-8'
  }, [
    React.createElement('div', {
      key: 'three-col-grid',
      className: 'grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch'
    }, [
      // 1. Latest Notifications (White Card, Blue Title, Light Border)
      React.createElement('div', {
        key: 'card-notif',
        className: 'bg-white dark:bg-[#131f37] rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs p-4 flex flex-col justify-between transition-colors'
      }, [
        React.createElement('div', { key: 'c1-content' }, [
          React.createElement('div', {
            key: 'c1-head',
            className: 'flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3'
          }, [
            React.createElement('div', { key: 't', className: 'flex items-center space-x-2' }, [
              React.createElement('span', { key: 'i', className: 'text-[#0c4a7e] font-bold text-sm' }, '🔔'),
              React.createElement('h3', { key: 'title', className: 'font-bold text-[#0c4a7e] text-sm sm:text-base' }, 'Latest Notifications')
            ]),
            React.createElement('button', { key: 'view-all', className: 'text-xs font-semibold text-[#0c4a7e] hover:text-blue-900' }, 'View All →')
          ]),

          React.createElement('div', { key: 'c1-list', className: 'space-y-2' }, [
            notifications.map((item, idx) => {
              const parts = item.date.split(' ');
              return React.createElement('div', {
                key: `notif-${idx}`,
                className: 'flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group'
              }, [
                React.createElement('div', {
                  key: 'date-box',
                  className: 'w-10 h-10 rounded-lg bg-[#e8f0fe] border border-blue-100 flex flex-col items-center justify-center flex-shrink-0'
                }, [
                  React.createElement('span', { key: 'd', className: 'text-xs font-black text-[#1a73e8] leading-none' }, parts[0]),
                  React.createElement('span', { key: 'm', className: 'text-[9px] font-bold text-[#1a73e8] uppercase mt-0.5' }, parts[1])
                ]),

                React.createElement('div', { key: 'details', className: 'flex-1 mx-2.5 min-w-0' }, [
                  React.createElement('div', { key: 'tags', className: 'flex items-center space-x-1.5 mb-0.5' }, [
                    React.createElement('span', {
                      key: 'cat',
                      className: `text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${item.tagColor}`
                    }, item.tag),
                    item.isNew && React.createElement('span', {
                      key: 'new-badge',
                      className: 'bg-[#d32f2f] text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full badge-pulse'
                    }, 'New')
                  ]),
                  React.createElement('p', {
                    key: 't',
                    className: 'text-xs font-medium text-slate-800 truncate group-hover:text-[#0c4a7e] transition-colors'
                  }, item.title)
                ]),

                React.createElement('span', { key: 'arr', className: 'text-slate-400 text-sm group-hover:text-[#0c4a7e] group-hover:translate-x-0.5 transition-all' }, '›')
              ]);
            })
          ])
        ])
      ]),

      // 2. District Education Statistics & Find a School (White Card, Light Pastel Tiles)
      React.createElement('div', {
        key: 'card-stats-search',
        id: 'find-school-section',
        className: 'bg-white dark:bg-[#131f37] rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs p-4 flex flex-col justify-between transition-colors'
      }, [
        React.createElement('div', { key: 'c2-content' }, [
          React.createElement('div', {
            key: 'c2-head',
            className: 'flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3'
          }, [
            React.createElement('div', { key: 't', className: 'flex items-center space-x-2' }, [
              React.createElement('span', { key: 'i', className: 'text-[#0c4a7e] font-bold text-sm' }, '📊'),
              React.createElement('h3', { key: 'title', className: 'font-bold text-[#0c4a7e] text-sm sm:text-base' }, 'District Education Statistics')
            ]),
            React.createElement('button', { key: 'view-all', className: 'text-xs font-semibold text-[#0c4a7e] hover:text-blue-900' }, 'View Details →')
          ]),

          // 4 Metric Tiles with Original Pastel Backgrounds
          React.createElement('div', {
            key: 'metrics-grid',
            className: 'grid grid-cols-2 gap-2 mb-3'
          }, [
            React.createElement('div', {
              key: 'm1',
              className: 'bg-[#e8f5e9] border border-[#c8e6c9] p-2 rounded-lg text-center'
            }, [
              React.createElement('div', { key: 'i', className: 'text-base text-[#2e7d32] mb-0.5' }, '📋'),
              React.createElement('div', { key: 'num', className: 'text-sm font-extrabold text-[#2e7d32]' }, '94.2%'),
              React.createElement('div', { key: 'lbl', className: 'text-[10px] text-slate-600 font-medium' }, 'Pass Percentage')
            ]),
            React.createElement('div', {
              key: 'm2',
              className: 'bg-[#fff3e0] border border-[#ffe0b2] p-2 rounded-lg text-center'
            }, [
              React.createElement('div', { key: 'i', className: 'text-base text-[#e65100] mb-0.5' }, '🏫'),
              React.createElement('div', { key: 'num', className: 'text-sm font-extrabold text-[#e65100]' }, '385'),
              React.createElement('div', { key: 'lbl', className: 'text-[10px] text-slate-600 font-medium' }, 'Government Schools')
            ]),
            React.createElement('div', {
              key: 'm3',
              className: 'bg-[#f3e5f5] border border-[#e1bee7] p-2 rounded-lg text-center'
            }, [
              React.createElement('div', { key: 'i', className: 'text-base text-[#6a1b9a] mb-0.5' }, '👥'),
              React.createElement('div', { key: 'num', className: 'text-sm font-extrabold text-[#6a1b9a]' }, '378'),
              React.createElement('div', { key: 'lbl', className: 'text-[10px] text-slate-600 font-medium' }, 'Students per Teacher')
            ]),
            React.createElement('div', {
              key: 'm4',
              className: 'bg-[#e3f2fd] border border-[#bbdefb] p-2 rounded-lg text-center'
            }, [
              React.createElement('div', { key: 'i', className: 'text-base text-[#1565c0] mb-0.5' }, '💻'),
              React.createElement('div', { key: 'num', className: 'text-sm font-extrabold text-[#1565c0]' }, '72%'),
              React.createElement('div', { key: 'lbl', className: 'text-[10px] text-slate-600 font-medium' }, 'Digital Facilities')
            ])
          ]),

          // Find a School Box with SchoolBuildingGraphic
          React.createElement('div', {
            key: 'find-school-box',
            className: 'bg-[#f8fafc] border border-slate-200 rounded-xl p-2.5'
          }, [
            React.createElement('div', { key: 'fs-head', className: 'flex items-center space-x-1.5 mb-2' }, [
              React.createElement('span', { key: 'i', className: 'text-sm text-[#0c4a7e]' }, '🏛️'),
              React.createElement('div', { key: 't' }, [
                React.createElement('h4', { key: 'title', className: 'text-xs font-bold text-slate-900 leading-tight' }, 'Find a School'),
                React.createElement('p', { key: 'sub', className: 'text-[10px] text-slate-500' }, 'Search schools in Jangaon District')
              ])
            ]),

            React.createElement('div', { key: 'fs-body', className: 'flex items-center gap-2' }, [
              React.createElement('div', { key: 'fs-inputs', className: 'flex-1 space-y-1.5' }, [
                React.createElement('select', {
                  key: 'sel-mandal',
                  value: mandal,
                  onChange: (e) => {
                    const val = e.target.value;
                    setMandal(val);
                    fetchSchools(val, schoolType);
                  },
                  className: 'w-full text-[11px] border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#0c4a7e]'
                }, [
                  React.createElement('option', { key: 'all', value: 'all' }, 'Select Mandal ▾'),
                  React.createElement('option', { key: 'm1', value: 'Bachannapeta' }, 'Bachannapeta'),
                  React.createElement('option', { key: 'm2', value: 'Chilpur' }, 'Chilpur'),
                  React.createElement('option', { key: 'm3', value: 'Devaruppala' }, 'Devaruppala'),
                  React.createElement('option', { key: 'm4', value: 'Ghanpur Stn' }, 'Ghanpur Stn'),
                  React.createElement('option', { key: 'm5', value: 'Jangaon' }, 'Jangaon'),
                  React.createElement('option', { key: 'm6', value: 'Kodakandla' }, 'Kodakandla'),
                  React.createElement('option', { key: 'm7', value: 'Lingalaghanpur' }, 'Lingalaghanpur'),
                  React.createElement('option', { key: 'm8', value: 'Narmetta' }, 'Narmetta'),
                  React.createElement('option', { key: 'm9', value: 'Palakurthi' }, 'Palakurthi'),
                  React.createElement('option', { key: 'm10', value: 'Raghunathpalle' }, 'Raghunathpalle'),
                  React.createElement('option', { key: 'm11', value: 'Tharigoppula' }, 'Tharigoppula'),
                  React.createElement('option', { key: 'm12', value: 'Zaffergadh' }, 'Zaffergadh')
                ]),

                React.createElement('select', {
                  key: 'sel-type',
                  value: schoolType,
                  onChange: (e) => {
                    const val = e.target.value;
                    setSchoolType(val);
                    fetchSchools(mandal, val);
                  },
                  className: 'w-full text-[11px] border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#0c4a7e]'
                }, [
                  React.createElement('option', { key: 'all', value: 'all' }, 'Select School Type ▾'),
                  React.createElement('option', { key: 't1', value: 'MPP/ZPP' }, 'MPP / ZPP (Local Body)'),
                  React.createElement('option', { key: 't2', value: 'Government' }, 'Government High School'),
                  React.createElement('option', { key: 't3', value: 'KGBV' }, 'KGBV Residential'),
                  React.createElement('option', { key: 't4', value: 'Model School' }, 'TS Model School (TGMS)'),
                  React.createElement('option', { key: 't5', value: 'TGWREIS' }, 'Social Welfare Residential'),
                  React.createElement('option', { key: 't6', value: 'Tribal Welfare' }, 'Tribal Welfare Ashram'),
                  React.createElement('option', { key: 't7', value: 'MJPTBC' }, 'BC Welfare Residential'),
                  React.createElement('option', { key: 't8', value: 'Minority' }, 'Minority Residential (TGMRS)'),
                  React.createElement('option', { key: 't9', value: 'Aided' }, 'Aided School'),
                  React.createElement('option', { key: 't10', value: 'Private' }, 'Private School')
                ]),

                React.createElement('button', {
                  key: 'btn-search',
                  onClick: handleSearchSchool,
                  className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-2xs'
                }, [
                  React.createElement('span', { key: 'icon' }, '🔍'),
                  React.createElement('span', { key: 't' }, 'Search Schools')
                ])
              ]),

              React.createElement('div', {
                key: 'fs-graphic',
                className: 'hidden sm:flex items-center justify-center flex-shrink-0'
              }, [
                React.createElement(SchoolBuildingGraphic, { className: 'w-24 h-20 drop-shadow-2xs' })
              ])
            ]),

            searchResults && React.createElement('div', {
              key: 'search-results-box',
              className: 'mt-2 max-h-36 overflow-y-auto space-y-1 p-1 bg-white rounded border border-slate-200'
            }, searchResults.length > 0 ? (
              searchResults.map((s, idx) => React.createElement('div', {
                key: `res-${idx}`,
                className: 'text-[10px] p-1 bg-slate-50 rounded border border-slate-100 flex items-center justify-between'
              }, [
                React.createElement('div', { key: 't', className: 'truncate flex-1 pr-1' }, [
                  React.createElement('div', { key: 'n', className: 'font-bold text-slate-800 truncate', title: s.name }, s.name),
                  React.createElement('div', { key: 'd', className: 'text-[9px] text-slate-500' }, `${s.location || s.mandal} • ${s.medium}`)
                ]),
                React.createElement('span', { key: 'tag', className: 'text-[8px] font-semibold bg-[#e3f2fd] text-[#0c4a7e] px-1 py-0.2 rounded flex-shrink-0 ml-1' }, s.category || s.type)
              ]))
            ) : (
              React.createElement('div', { className: 'text-[11px] text-slate-500 text-center py-1.5' }, 'No schools found for selection.')
            ))
          ])
        ])
      ]),

      // 3. News & Events (White Card, Blue Title, Light Border)
      React.createElement('div', {
        key: 'card-news',
        className: 'bg-white dark:bg-[#131f37] rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs p-4 flex flex-col justify-between transition-colors'
      }, [
        React.createElement('div', { key: 'c3-content' }, [
          React.createElement('div', {
            key: 'c3-head',
            className: 'flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3'
          }, [
            React.createElement('div', { key: 't', className: 'flex items-center space-x-2' }, [
              React.createElement('span', { key: 'i', className: 'text-[#0c4a7e] font-bold text-sm' }, '📅'),
              React.createElement('h3', { key: 'title', className: 'font-bold text-[#0c4a7e] text-sm sm:text-base' }, 'News & Events')
            ]),
            React.createElement('button', { key: 'view-all', className: 'text-xs font-semibold text-[#0c4a7e] hover:text-blue-900' }, 'View All →')
          ]),

          React.createElement('div', { key: 'c3-list', className: 'space-y-2' }, [
            newsItems.map((n, idx) => React.createElement('div', {
              key: `news-${idx}`,
              className: 'flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group'
            }, [
              React.createElement(NewsThumbnail, {
                key: 'thumb',
                type: n.type,
                className: 'w-10 h-10'
              }),

              React.createElement('div', { key: 'details', className: 'flex-1 mx-2.5 min-w-0' }, [
                React.createElement('p', {
                  key: 't',
                  className: 'text-xs font-bold text-slate-800 truncate group-hover:text-[#0c4a7e] transition-colors'
                }, n.title),
                React.createElement('p', {
                  key: 'd',
                  className: 'text-[10px] text-slate-500 mt-0.5'
                }, n.date)
              ]),

              React.createElement('span', { key: 'arr', className: 'text-slate-400 text-sm group-hover:text-[#0c4a7e] group-hover:translate-x-0.5 transition-all' }, '›')
            ]))
          ])
        ])
      ])
    ])
  ]);
}

// ==========================================
// 8. OFFICIAL FOOTER (IMAGE 2: ORIGINAL GOVERNMENT BLUE #0c4a7e)
// ==========================================
function OfficialFooter() {
  return React.createElement('footer', {
    className: 'bg-[#0c4a7e] text-white pt-7 pb-4 border-t-4 border-amber-400 relative'
  }, [
    React.createElement('div', {
      key: 'footer-content',
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-blue-400/20'
    }, [
      React.createElement('div', { key: 'col1', className: 'space-y-2' }, [
        React.createElement('div', { key: 'seal-wrap', className: 'flex items-center space-x-2.5' }, [
          React.createElement(TelanganaEmblem, { key: 'emblem', className: 'w-10 h-10' }),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('div', { key: 't1', className: 'font-bold text-xs sm:text-sm leading-tight text-white' }, 'District Educational Office, Jangaon'),
            React.createElement('div', { key: 't2', className: 'text-[11px] text-blue-200' }, 'School Education Department, Telangana'),
            React.createElement('div', { key: 't3', className: 'text-[10px] text-amber-300 italic' }, 'Education for a Brighter Tomorrow')
          ])
        ]),
        React.createElement('p', { key: 'p', className: 'text-[11px] text-blue-100 leading-relaxed' },
          'Official portal of the District Educational Office, Jangaon District, providing quality school education governance and teacher-student services.'
        )
      ]),

      React.createElement('div', { key: 'col2', className: 'space-y-1.5 text-xs' }, [
        React.createElement('h4', { key: 'title', className: 'text-sm font-bold text-amber-300 mb-1.5' }, 'Contact Us'),
        React.createElement('div', { key: 'addr', className: 'flex items-start space-x-1.5 text-blue-100 text-[11px]' }, [
          React.createElement('span', { key: 'i' }, '📍'),
          React.createElement('span', { key: 't' }, 'Collectorate Road, Jangaon, Telangana – 506167')
        ]),
        React.createElement('div', { key: 'ph', className: 'flex items-center space-x-1.5 text-blue-100 text-[11px]' }, [
          React.createElement('span', { key: 'i' }, '📞'),
          React.createElement('span', { key: 't' }, '+91 8678 222 333')
        ]),
        React.createElement('div', { key: 'email', className: 'flex items-center space-x-1.5 text-blue-100 text-[11px]' }, [
          React.createElement('span', { key: 'i' }, '✉️'),
          React.createElement('span', { key: 't' }, 'deo.jangaon@telangana.gov.in')
        ])
      ]),

      React.createElement('div', { key: 'col3', className: 'space-y-1.5 text-xs text-blue-100' }, [
        React.createElement('h4', { key: 'title', className: 'text-sm font-bold text-amber-300 mb-1.5' }, 'Quick Links'),
        React.createElement('div', { key: 'links-grid', className: 'grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]' }, [
          React.createElement('div', { key: 'l1', className: 'hover:text-amber-300 cursor-pointer' }, '› About DEO'),
          React.createElement('div', { key: 'l2', className: 'hover:text-amber-300 cursor-pointer' }, '› Teachers Info'),
          React.createElement('div', { key: 'l3', className: 'hover:text-amber-300 cursor-pointer' }, '› Schools Directory'),
          React.createElement('div', { key: 'l4', className: 'hover:text-amber-300 cursor-pointer' }, '› Examinations'),
          React.createElement('div', { key: 'l5', className: 'hover:text-amber-300 cursor-pointer' }, '› Notifications'),
          React.createElement('div', { key: 'l6', className: 'hover:text-amber-300 cursor-pointer' }, '› Contact DEO')
        ])
      ]),

      React.createElement('div', { key: 'col4', className: 'space-y-2' }, [
        React.createElement('h4', { key: 'title', className: 'text-sm font-bold text-amber-300' }, 'Follow Us'),
        React.createElement('div', { key: 'socials', className: 'flex items-center space-x-2 text-sm' }, [
          React.createElement('div', { key: 'yt', className: 'w-7 h-7 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:opacity-90' }, '▶'),
          React.createElement('div', { key: 'x', className: 'w-7 h-7 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-800' }, '𝕏'),
          React.createElement('div', { key: 'fb', className: 'w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:opacity-90' }, 'f'),
          React.createElement('div', { key: 'ig', className: 'w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-90' }, '📷')
        ]),
        React.createElement(SkylineGraphic, {
          key: 'skyline',
          className: 'w-44 h-11 opacity-40 pt-1'
        }),
        React.createElement('div', {
          key: 'motto',
          className: 'font-display italic text-amber-200 text-xs sm:text-sm tracking-wide'
        }, 'Together for a Brighter Jangaon')
      ])
    ]),

    React.createElement('div', {
      key: 'footer-bottom',
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-blue-200 gap-2'
    }, [
      React.createElement('div', { key: 'cr' }, '© 2025 District Educational Office, Jangaon. All Rights Reserved.'),
      React.createElement('div', { key: 'legal', className: 'flex items-center space-x-4' }, [
        React.createElement('span', { key: 'sm', className: 'hover:text-white cursor-pointer' }, 'Sitemap'),
        React.createElement('span', { key: 'pp', className: 'hover:text-white cursor-pointer' }, 'Privacy Policy'),
        React.createElement('span', { key: 'tu', className: 'hover:text-white cursor-pointer' }, 'Terms of Use'),
        React.createElement('span', { key: 'ac', className: 'hover:text-white cursor-pointer' }, 'Accessibility')
      ])
    ])
  ]);
}

// ==========================================
// 10. AUTH MODALS: REGISTRATION WORKFLOW (OFFICIAL ADMINISTRATIVE ACCOUNTS)
// ==========================================
function RegisterModal() {
  const { closeModal, openModal, registerUser, setCurrentView } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('APO');
  const [mandal, setMandal] = useState('JANGAON');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || fullName.trim().length < 3) {
      setErrorMsg("Please enter your full name (at least 3 characters).");
      return;
    }
    const cleanedMobile = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setErrorMsg("Invalid mobile number. Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);
    const res = await registerUser({
      fullName,
      role,
      mandal: role === 'MEO' ? mandal : undefined,
      mobileNumber: cleanedMobile,
      password,
      confirmPassword
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Account registered successfully! Redirecting to dashboard...");
      setTimeout(() => {
        closeModal();
        setCurrentView('DASHBOARD');
      }, 700);
    } else {
      setErrorMsg(res.message || "Registration failed. Please try again.");
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4'
  }, [
    React.createElement('div', {
      key: 'reg-card',
      className: 'bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up'
    }, [
      // Header
      React.createElement('div', {
        key: 'modal-head',
        className: 'bg-[#0c4a7e] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400'
      }, [
        React.createElement('div', { key: 'h-info', className: 'flex items-center space-x-3' }, [
          React.createElement(TelanganaEmblem, { key: 'seal', className: 'w-10 h-10' }),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 't', className: 'text-base font-bold text-white' }, 'Register Official Account'),
            React.createElement('p', { key: 's', className: 'text-[11px] text-amber-300' }, 'District Educational Office, Jangaon')
          ])
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: closeModal,
          className: 'text-blue-100 hover:text-white text-lg font-bold p-1 rounded hover:bg-white/10'
        }, '✕')
      ]),

      // Body
      React.createElement('div', { key: 'body', className: 'p-6 max-h-[80vh] overflow-y-auto space-y-4' }, [
        errorMsg && React.createElement('div', {
          key: 'err-alert',
          className: 'p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'i' }, '❌'),
          React.createElement('span', { key: 'm' }, errorMsg)
        ]),

        successMsg && React.createElement('div', {
          key: 'succ-alert',
          className: 'p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold'
        }, successMsg),

        React.createElement('form', {
          key: 'acc-form',
          onSubmit: handleAccountSubmit,
          className: 'space-y-4'
        }, [
          // Full Name
          React.createElement('div', { key: 'f-name' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Full Name (as per official service record) *'),
            React.createElement('input', {
              key: 'i',
              type: 'text',
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              placeholder: 'e.g. Sri. K. Ramesh',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
            })
          ]),

          // Role selection
          React.createElement('div', { key: 'f-role' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Official Role / Designation *'),
            React.createElement('select', {
              key: 's',
              value: role,
              onChange: (e) => setRole(e.target.value),
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#0c4a7e]'
            }, [
              React.createElement('option', { key: 'apo', value: 'APO' }, 'APO — Assistant Programme Officer (District Admin)'),
              React.createElement('option', { key: 'deo', value: 'DEO' }, 'DEO — District Educational Officer (Executive)'),
              React.createElement('option', { key: 'meo', value: 'MEO' }, 'MEO — Mandal Educational Officer (Mandal Incharge)'),
              React.createElement('option', { key: 'off', value: 'Officer' }, 'District Official / Inspector')
            ])
          ]),

          // Mandal selection (if MEO)
          role === 'MEO' && React.createElement('div', { key: 'f-mandal' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Assigned Mandal Jurisdiction *'),
            React.createElement('select', {
              key: 'sm',
              value: mandal,
              onChange: (e) => setMandal(e.target.value),
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#0c4a7e]'
            }, [
              'JANGAON', 'BACHANNAPET', 'DEVARUPPULA', 'GHANPUR_STN', 'JAFFERGADH',
              'KODAKANDLA', 'LINGALAGHANPUR', 'NARMETTA', 'PALAKURTHI', 'RAGHUNATHPALLE',
              'TARIGOPOULA', 'ZAFARGADH'
            ].map(m => React.createElement('option', { key: m, value: m }, m + ' Mandal')))
          ]),

          // Mobile Number
          React.createElement('div', { key: 'f-mob' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Registered Official Mobile Number *'),
            React.createElement('div', { key: 'wrap', className: 'flex rounded-lg border border-slate-300 overflow-hidden' }, [
              React.createElement('span', { key: 'cc', className: 'bg-slate-100 text-slate-600 px-3 py-2 text-sm font-semibold border-r border-slate-300' }, '+91'),
              React.createElement('input', {
                key: 'i',
                type: 'tel',
                maxLength: 10,
                value: mobileNumber,
                onChange: (e) => setMobileNumber(e.target.value.replace(/\D/g, '')),
                placeholder: '10-digit mobile number',
                required: true,
                className: 'flex-1 px-3 py-2 text-sm focus:outline-none'
              })
            ])
          ]),

          // Password
          React.createElement('div', { key: 'f-pwd', className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
            React.createElement('div', { key: 'p1' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Password *'),
              React.createElement('input', {
                key: 'i',
                type: showPassword ? 'text' : 'password',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: 'At least 6 characters',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
              })
            ]),
            React.createElement('div', { key: 'p2' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Confirm Password *'),
              React.createElement('input', {
                key: 'i',
                type: showPassword ? 'text' : 'password',
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                placeholder: 'Re-enter password',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
              })
            ])
          ]),

          React.createElement('div', { key: 'f-toggle', className: 'flex items-center space-x-2 text-xs text-slate-600' }, [
            React.createElement('input', {
              key: 'cb',
              type: 'checkbox',
              id: 'show-reg-pwd',
              checked: showPassword,
              onChange: (e) => setShowPassword(e.target.checked),
              className: 'rounded text-[#0c4a7e]'
            }),
            React.createElement('label', { key: 'lbl', htmlFor: 'show-reg-pwd' }, 'Show passwords')
          ]),

          React.createElement('button', {
            key: 'btn-create-acc',
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-60 cursor-pointer'
          }, [
            loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
            React.createElement('span', { key: 't' }, loading ? 'Creating Account...' : 'Complete Registration →')
          ]),

          React.createElement('div', { key: 'switch-links', className: 'text-center text-xs text-slate-600 pt-3 border-t border-slate-100 space-y-1.5' }, [
            React.createElement('div', { key: 'l1' }, [
              React.createElement('span', { key: 't' }, 'Already have an official account? '),
              React.createElement('button', {
                key: 'btn-to-login',
                type: 'button',
                onClick: () => openModal('LOGIN', 'ADMIN'),
                className: 'text-[#0c4a7e] hover:underline font-bold cursor-pointer'
              }, 'Login here')
            ]),
            React.createElement('div', { key: 'l2', className: 'pt-1' }, [
              React.createElement('span', { key: 't', className: 'text-slate-500' }, 'Are you a Teacher? '),
              React.createElement('button', {
                key: 'btn-to-teacher-login',
                type: 'button',
                onClick: () => openModal('LOGIN', 'TEACHER'),
                className: 'text-emerald-700 hover:underline font-bold cursor-pointer'
              }, 'Teacher Login')
            ])
          ])
        ])
      ])
    ])
  ]);
}
// ==========================================
// 11. AUTH MODALS: LOGIN WORKFLOW (ADMIN & TEACHER LOGIN)
// ==========================================
function LoginModal() {
  const { closeModal, openModal, loginInitialTab, loginWithPassword, loginTeacher } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(loginInitialTab || 'ADMIN'); // 'ADMIN' | 'TEACHER'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin inputs
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Teacher inputs
  const [teacherEmployeeId, setTeacherEmployeeId] = useState('');
  const [teacherMobile, setTeacherMobile] = useState('');

  useEffect(() => {
    if (loginInitialTab) {
      setActiveTab(loginInitialTab);
    }
  }, [loginInitialTab]);

  // Handle Admin Password Login
  const handleAdminPasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminIdentifier.trim() || !adminPassword) {
      setErrorMsg("Please enter both Mobile Number / User ID and Password.");
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(adminIdentifier.trim(), adminPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || "Invalid credentials.");
    }
  };

  // Handle Teacher Initial Verification
  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teacherEmployeeId.trim() || !teacherMobile.trim()) {
      setErrorMsg("Please enter both Employee ID and Registered Mobile Number.");
      return;
    }

    setLoading(true);
    const res = await loginTeacher(teacherEmployeeId.trim(), teacherMobile.trim());
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || "Teacher verification failed.");
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4'
  }, [
    React.createElement('div', {
      key: 'login-card',
      className: 'bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up'
    }, [
      // Header
      React.createElement('div', {
        key: 'modal-head',
        className: 'bg-[#0c4a7e] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400'
      }, [
        React.createElement('div', { key: 'h-info', className: 'flex items-center space-x-3' }, [
          React.createElement(TelanganaEmblem, { key: 'seal', className: 'w-10 h-10' }),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 't', className: 'text-base font-bold text-white' }, 'Official Portal Login'),
            React.createElement('p', { key: 's', className: 'text-[11px] text-amber-300' }, 'District Educational Office, Jangaon')
          ])
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: closeModal,
          className: 'text-blue-100 hover:text-white text-lg font-bold p-1 rounded hover:bg-white/10'
        }, '✕')
      ]),

      // Tabs: Administrative Login vs Teacher Login
      React.createElement('div', {
        key: 'login-tabs',
        className: 'flex border-b border-slate-200 bg-slate-50 text-xs font-bold'
      }, [
        React.createElement('button', {
          key: 'tab-admin',
          type: 'button',
          onClick: () => { setActiveTab('ADMIN'); setErrorMsg(''); },
          className: `flex-1 py-3 px-4 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'ADMIN'
              ? 'border-[#0c4a7e] text-[#0c4a7e] bg-white font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`
        }, '🏛️ Administrative (APO / DEO / MEO)'),
        React.createElement('button', {
          key: 'tab-teacher',
          type: 'button',
          onClick: () => { setActiveTab('TEACHER'); setErrorMsg(''); },
          className: `flex-1 py-3 px-4 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'TEACHER'
              ? 'border-[#007a33] text-[#007a33] bg-white font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`
        }, '👨‍🏫 Teacher Login')
      ]),

      // Body
      React.createElement('div', { key: 'body', className: 'p-6 max-h-[80vh] overflow-y-auto' }, [
        errorMsg && React.createElement('div', {
          key: 'err-alert',
          className: 'mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'i' }, '❌'),
          React.createElement('span', { key: 'm' }, errorMsg)
        ]),

        // TAB 1: ADMINISTRATIVE LOGIN
        activeTab === 'ADMIN' && React.createElement('div', {
          key: 'admin-section',
          className: 'space-y-4'
        }, [
          React.createElement('form', {
            key: 'admin-pwd-form',
            onSubmit: handleAdminPasswordLogin,
            className: 'space-y-3'
          }, [
            React.createElement('div', { key: 'f-id' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Mobile Number / Official User ID *'),
              React.createElement('input', {
                key: 'i',
                type: 'text',
                value: adminIdentifier,
                onChange: (e) => setAdminIdentifier(e.target.value),
                placeholder: 'Enter 10-digit mobile or User ID',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
              })
            ]),

            React.createElement('div', { key: 'f-pwd' }, [
              React.createElement('div', { key: 'pwd-label-row', className: 'flex items-center justify-between mb-1' }, [
                React.createElement('label', { key: 'l', className: 'text-xs font-bold text-slate-700' }, 'Password *'),
                React.createElement('button', {
                  key: 'btn-forgot',
                  type: 'button',
                  onClick: () => openModal('FORGOT'),
                  className: 'text-xs text-[#0c4a7e] hover:underline font-semibold'
                }, 'Forgot Password?')
              ]),
              React.createElement('input', {
                key: 'i',
                type: showAdminPassword ? 'text' : 'password',
                value: adminPassword,
                onChange: (e) => setAdminPassword(e.target.value),
                placeholder: 'Enter your password',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
              })
            ]),

            React.createElement('div', { key: 'f-toggle', className: 'flex items-center space-x-2 text-xs text-slate-600' }, [
              React.createElement('input', {
                key: 'cb',
                type: 'checkbox',
                id: 'show-admin-pwd',
                checked: showAdminPassword,
                onChange: (e) => setShowAdminPassword(e.target.checked),
                className: 'rounded text-[#0c4a7e]'
              }),
              React.createElement('label', { key: 'lbl', htmlFor: 'show-admin-pwd' }, 'Show password')
            ]),

            React.createElement('button', {
              key: 'btn-pwd-login',
              type: 'submit',
              disabled: loading,
              className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-60 cursor-pointer'
            }, [
              loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
              React.createElement('span', { key: 't' }, loading ? 'Logging In...' : 'Login to Administrative Portal')
            ])
          ]),

          React.createElement('div', { key: 'switch', className: 'text-center text-xs text-slate-600 pt-3 border-t border-slate-100' }, [
            React.createElement('span', { key: 't' }, 'New administrative officer? '),
            React.createElement('button', {
              key: 'btn-to-reg',
              type: 'button',
              onClick: () => openModal('REGISTER'),
              className: 'text-[#0c4a7e] hover:underline font-bold cursor-pointer'
            }, 'Register now')
          ])
        ]),

        // TAB 2: TEACHER LOGIN (EMPLOYEE ID + REGISTERED MOBILE)
        activeTab === 'TEACHER' && React.createElement('div', {
          key: 'teacher-section',
          className: 'space-y-4'
        }, [
          React.createElement('div', {
            key: 'tch-notice',
            className: 'bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed'
          }, [
            React.createElement('span', { key: 'i', className: 'font-bold mr-1.5' }, 'ℹ️'),
            React.createElement('span', { key: 't' }, 'Government Teachers: Enter your official Employee ID and registered phone number to authenticate directly against department records.')
          ]),

          React.createElement('form', {
            key: 'tch-form',
            onSubmit: handleTeacherLogin,
            className: 'space-y-4'
          }, [
            React.createElement('div', { key: 'f-empid' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Employee ID *'),
              React.createElement('input', {
                key: 'i',
                type: 'text',
                value: teacherEmployeeId,
                onChange: (e) => setTeacherEmployeeId(e.target.value),
                placeholder: 'e.g. TS-TCH-100234',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono tracking-wide focus:outline-none focus:border-[#007a33]'
              })
            ]),

            React.createElement('div', { key: 'f-mob' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Registered Mobile Number *'),
              React.createElement('div', { key: 'wrap', className: 'flex rounded-lg border border-slate-300 overflow-hidden' }, [
                React.createElement('span', { key: 'cc', className: 'bg-slate-100 text-slate-600 px-3 py-2 text-sm font-semibold border-r border-slate-300' }, '+91'),
                React.createElement('input', {
                  key: 'i',
                  type: 'tel',
                  maxLength: 10,
                  value: teacherMobile,
                  onChange: (e) => setTeacherMobile(e.target.value.replace(/\D/g, '')),
                  placeholder: '10-digit mobile number',
                  required: true,
                  className: 'flex-1 px-3 py-2 text-sm focus:outline-none'
                })
              ])
            ]),

            React.createElement('button', {
              key: 'btn-continue',
              type: 'submit',
              disabled: loading,
              className: 'w-full bg-[#007a33] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-60 cursor-pointer'
            }, [
              loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
              React.createElement('span', { key: 't' }, loading ? 'Verifying Department Record...' : 'Continue to Teacher Portal →')
            ])
          ]),

          React.createElement('div', { key: 'switch', className: 'text-center text-xs text-slate-600 pt-3 border-t border-slate-100' }, [
            React.createElement('span', { key: 't' }, 'Are you an administrative officer? '),
            React.createElement('button', {
              key: 'btn-to-admin',
              type: 'button',
              onClick: () => setActiveTab('ADMIN'),
              className: 'text-[#0c4a7e] hover:underline font-bold cursor-pointer'
            }, 'Administrative Login')
          ])
        ])
      ])
    ])
  ]);
}

// ==========================================
// 12. AUTH MODALS: OFFICIAL ACCOUNT RECOVERY (SUPPORT DESK)
// ==========================================
function ForgotPasswordModal() {
  const { closeModal, openModal } = useContext(AuthContext);

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4'
  }, [
    React.createElement('div', {
      key: 'fp-card',
      className: 'bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up'
    }, [
      React.createElement('div', {
        key: 'fp-head',
        className: 'bg-[#0c4a7e] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400'
      }, [
        React.createElement('h3', { key: 't', className: 'text-base font-bold' }, 'Official Account Recovery'),
        React.createElement('button', { key: 'c', onClick: closeModal, className: 'text-blue-100 hover:text-white' }, '✕')
      ]),

      React.createElement('div', { key: 'fp-body', className: 'p-6 space-y-4' }, [
        React.createElement('div', {
          key: 'info',
          className: 'bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed space-y-2'
        }, [
          React.createElement('div', { key: 'h', className: 'font-bold flex items-center space-x-1.5 text-[#0c4a7e]' }, [
            React.createElement('span', { key: 'i' }, '🛡️'),
            React.createElement('span', { key: 't' }, 'Official Password Assistance')
          ]),
          React.createElement('p', { key: 'p' },
            'For security compliance, passwords for official administrative accounts are managed through the District Educational Office IT Cell. Please contact the district helpdesk with your official designation and registered phone number.'
          )
        ]),

        React.createElement('div', {
          key: 'dept-contact',
          className: 'bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2'
        }, [
          React.createElement('div', { key: 't', className: 'font-bold text-slate-800' }, 'District Office Support Desk:'),
          React.createElement('div', { key: 'm' }, '✉️ deo.jangaon@telangana.gov.in'),
          React.createElement('div', { key: 'p' }, '📞 +91 8678 222 333 (10:00 AM – 5:00 PM)'),
          React.createElement('div', { key: 'l', className: 'text-[11px] text-slate-500' }, 'Office of the District Educational Officer, Jangaon District')
        ]),

        React.createElement('button', {
          key: 'btn-back-login',
          type: 'button',
          onClick: () => openModal('LOGIN', 'ADMIN'),
          className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer'
        }, '← Return to Login')
      ])
    ])
  ]);
}
// ==========================================
// 13. ROLE-BASED DASHBOARDS (LIGHT & DARK THEMES FULLY SUPPORTED)
// ==========================================
function RoleDashboard() {
  const { user, setCurrentView, theme, changeTheme, openModal, officerTab, setOfficerTab } = useContext(AuthContext);
  const [previewRole, setPreviewRole] = useState('APO');
  const [previewMandal, setPreviewMandal] = useState('JANGAON');
  const [teacherView, setTeacherView] = useState('OVERVIEW');

  const isDark = (theme === 'dark');

  // If user is authenticated, use their account; otherwise allow guest preview
  const activeUser = user || {
    id: 'DEMO-PREVIEW',
    fullName: `Preview ${previewRole} Officer`,
    role: previewRole,
    mandal: previewRole === 'MEO' ? previewMandal : null,
    mobileNumber: '9876543210',
    accountStatus: 'PREVIEW_MODE',
    lastLogin: new Date().toISOString()
  };

  const isDeoOrApo = activeUser && (activeUser.role === 'DEO' || activeUser.role === 'APO' || activeUser.role === 'Officer');
  const isMeo = activeUser && (activeUser.role === 'MEO');
  const isAuthorizedOfficer = isDeoOrApo || isMeo;

  return React.createElement('div', {
    className: `min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isDark ? 'bg-[#0b1329] text-slate-100' : 'bg-[#f0f4f8] text-slate-800'
    }`
  }, [
    React.createElement('div', {
      key: 'dash-wrap',
      className: 'max-w-7xl mx-auto space-y-6'
    }, [
      // Top Navigation bar with Theme Toggle
      React.createElement('div', {
        key: 'top-bar',
        className: `flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors gap-3 ${
          isDark
            ? 'bg-[#131f37] border-slate-700/80 shadow-md'
            : 'bg-white border-slate-200 shadow-xs'
        }`
      }, [
        React.createElement('div', { key: 'l', className: 'flex items-center space-x-3 flex-wrap gap-y-2' }, [
          React.createElement('button', {
            key: 'btn-back',
            onClick: () => setCurrentView('PORTAL'),
            className: `text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isDark
                ? 'text-blue-300 bg-slate-800 hover:bg-slate-700 border-slate-600'
                : 'text-[#0c4a7e] bg-blue-50 hover:bg-blue-100 border-blue-200'
            }`
          }, '← Back to Public Portal'),
          React.createElement('span', { key: 'sep', className: isDark ? 'text-slate-600' : 'text-slate-300' }, '|'),
          React.createElement('span', {
            key: 'title',
            className: `text-sm font-bold ${isDark ? 'text-white' : 'text-[#0c4a7e]'}`
          }, `${activeUser.role} Dashboard`),
          activeUser.role === 'Teacher' && React.createElement('div', {
            key: 'teacher-tabs',
            className: `ml-2 inline-flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`
          }, [
            React.createElement('button', {
              key: 'btn-tab-ov',
              onClick: () => setTeacherView('OVERVIEW'),
              className: `px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                teacherView === 'OVERVIEW'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, 'Overview'),
            React.createElement('button', {
              key: 'btn-tab-sr',
              onClick: () => setTeacherView('SERVICE_RECORD'),
              className: `flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                teacherView === 'SERVICE_RECORD'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, [
              React.createElement('span', { key: 'i' }, '📜'),
              React.createElement('span', { key: 't' }, 'My Service Record')
            ])
          ]),
          isAuthorizedOfficer && React.createElement('div', {
            key: 'officer-tabs',
            className: `ml-2 inline-flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`
          }, [
            React.createElement('button', {
              key: 'btn-tab-off-ov',
              onClick: () => setOfficerTab('OVERVIEW'),
              className: `px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                officerTab === 'OVERVIEW'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, 'Overview'),
            React.createElement('button', {
              key: 'btn-tab-off-info',
              onClick: () => setOfficerTab('SCHOOLS_INFO'),
              className: `flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                officerTab === 'SCHOOLS_INFO' || officerTab === 'STRENGTH_ANALYTICS'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, [
              React.createElement('span', { key: 'i' }, '🏫'),
              React.createElement('span', { key: 't' }, isMeo ? `School Strength (${activeUser.mandal || 'Assigned Mandal'})` : 'Schools Information')
            ]),
            React.createElement('button', {
              key: 'btn-tab-off-tch',
              onClick: () => setOfficerTab('TEACHERS_INFO'),
              className: `flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                officerTab === 'TEACHERS_INFO'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, [
              React.createElement('span', { key: 'i' }, '👨‍🏫'),
              React.createElement('span', { key: 't' }, isMeo ? `Teachers Info (${activeUser.mandal || 'Assigned Mandal'})` : 'Teachers Information')
            ]),
            React.createElement('button', {
              key: 'btn-tab-off-ret',
              onClick: () => setOfficerTab('RETIREMENT'),
              className: `flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                officerTab === 'RETIREMENT'
                  ? 'bg-[#0c4a7e] text-white shadow-xs font-bold'
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`
            }, [
              React.createElement('span', { key: 'i' }, '⏳'),
              React.createElement('span', { key: 't' }, 'Retirement')
            ])
          ])
        ]),

        React.createElement('div', { key: 'r', className: 'flex items-center space-x-3 flex-wrap gap-y-2' }, [
          // Interactive Theme Switcher in Dashboard
          React.createElement('div', {
            key: 'theme-toggle-box',
            className: `flex items-center p-1 rounded-lg border text-xs ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100 border-slate-300'
            }`
          }, [
            React.createElement('button', {
              key: 'btn-light',
              onClick: () => changeTheme('light'),
              className: `flex items-center space-x-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-[#0c4a7e] shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }, [
              React.createElement('span', { key: 'i' }, '☀️'),
              React.createElement('span', { key: 't' }, 'Light')
            ]),
            React.createElement('button', {
              key: 'btn-dark',
              onClick: () => changeTheme('dark'),
              className: `flex items-center space-x-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }, [
              React.createElement('span', { key: 'i' }, '🌙'),
              React.createElement('span', { key: 't' }, 'Dark')
            ])
          ]),

          React.createElement('span', {
            key: 'l-pend',
            className: `inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${
              isDark
                ? 'text-amber-300 bg-amber-950/70 border-amber-800/60'
                : 'text-amber-800 bg-amber-100 border-amber-200'
            }`
          }, '⚠ Department Database Integration Pending')
        ])
      ]),

      // Guest preview mode banner if not logged in
      !user && React.createElement('div', {
        key: 'guest-banner',
        className: `p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-blue-950/60 border-blue-800 text-blue-200'
            : 'bg-blue-50 border-blue-200 text-[#0c4a7e]'
        }`
      }, [
        React.createElement('div', { key: 'txt', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'badge', className: 'bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px]' }, 'PREVIEW MODE'),
          React.createElement('span', { key: 'msg' }, 'Previewing dashboard views and themes. Switch roles below or log in:')
        ]),
        React.createElement('div', { key: 'roles', className: 'flex items-center flex-wrap gap-1.5' }, [
          ['APO', 'DEO', 'MEO', 'Teacher'].map(r => (
            React.createElement('button', {
              key: r,
              onClick: () => {
                setPreviewRole(r);
                if (r !== 'Teacher') setTeacherView('OVERVIEW');
                setOfficerTab('OVERVIEW');
              },
              className: `px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                previewRole === r
                  ? (isDark ? 'bg-blue-600 text-white shadow-xs' : 'bg-[#0c4a7e] text-white shadow-xs')
                  : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100')
              }`
            }, r)
          )),
          previewRole === 'MEO' && React.createElement('select', {
            key: 'prev-mandal-sel',
            value: previewMandal,
            onChange: (e) => setPreviewMandal(e.target.value),
            className: `px-2 py-0.5 rounded text-xs font-bold border ${
              isDark ? 'bg-slate-800 text-amber-300 border-slate-600' : 'bg-white text-[#0c4a7e] border-slate-300'
            }`
          }, [
            "JANGAON", "BACHANNAPETA", "CHILPUR", "DEVARUPPALA", "GANPUR (STN)",
            "KODAKANDLA", "LINGALAGHANPUR", "NARMETTA", "PALAKURTHI",
            "RAGHUNATHPALLE", "THARIGOPPULA", "ZAFFERGADH"
          ].map(m => React.createElement('option', { key: m, value: m }, `Mandal: ${m}`))),
          React.createElement('button', {
            key: 'btn-login',
            onClick: () => openModal('LOGIN'),
            className: 'ml-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer shadow-xs'
          }, 'Login')
        ])
      ]),

      // Profile Header Card (Light & Dark)
      React.createElement('div', {
        key: 'profile-card',
        className: `p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-amber-400 transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-[#0d2847] via-[#103157] to-[#0a1e36] text-white border-t border-x border-slate-700/60'
            : 'bg-[#0c4a7e] text-white'
        }`
      }, [
        React.createElement('div', { key: 'left', className: 'flex items-center space-x-4' }, [
          React.createElement('div', {
            key: 'avatar',
            className: `w-16 h-16 rounded-full font-black text-2xl flex items-center justify-center border-2 border-amber-300 shadow-sm ${
              isDark ? 'bg-slate-800 text-amber-300' : 'bg-white text-[#0c4a7e]'
            }`
          }, activeUser.fullName ? activeUser.fullName.charAt(0).toUpperCase() : 'U'),
          React.createElement('div', { key: 'text' }, [
            React.createElement('h2', { key: 'name', className: 'text-xl font-extrabold text-white' }, activeUser.fullName),
            React.createElement('p', { key: 'role', className: 'text-xs text-amber-300 font-semibold' },
              `${activeUser.role}${activeUser.mandal ? ` (${activeUser.mandal} Mandal)` : ''} • Registered Mobile: +91 ${activeUser.mobileNumber}`
            ),
            React.createElement('p', {
              key: 'inst',
              className: `text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-blue-100'}`
            }, 'Official Account Status: ACTIVE • Verified by Official Records')
          ])
        ]),

        React.createElement('div', { key: 'right', className: `text-right space-y-1 text-xs ${isDark ? 'text-slate-300' : 'text-blue-100'}` }, [
          React.createElement('div', { key: 'id' }, `User ID: ${activeUser.id}`),
          React.createElement('div', { key: 'll' }, `Last Login: ${new Date(activeUser.lastLogin).toLocaleString()}`)
        ])
      ]),

      // Body View: Teacher Service Record OR School Strength Analytics OR Standard Role Modules
      (activeUser.role === 'Teacher' && teacherView === 'SERVICE_RECORD')
        ? (typeof window !== 'undefined' && window.TeacherServiceRecordView
            ? React.createElement(window.TeacherServiceRecordView, {
                key: 'ts-rec-view',
                onBack: () => setTeacherView('OVERVIEW'),
                user: activeUser,
                isDark: isDark
              })
            : React.createElement('div', { key: 'ts-load-err', className: 'p-8 text-center text-sm font-semibold text-slate-600' }, 'Loading Teacher Service Record...')
          )
        : (officerTab === 'TEACHERS_INFO')
        ? (
            isAuthorizedOfficer
              ? (typeof window !== 'undefined' && window.TeachersInformationDashboardView
                  ? React.createElement(window.TeachersInformationDashboardView, {
                      key: 'teachers-info-dash',
                      onBack: () => setOfficerTab('OVERVIEW'),
                      user: activeUser,
                      isDark: isDark
                    })
                  : React.createElement('div', { key: 'tch-load-err', className: 'p-8 text-center text-sm font-semibold text-slate-600' }, 'Loading Teachers Information...')
                )
              : React.createElement('div', {
                  key: 'unauthorized-box-tch',
                  className: `p-8 max-w-xl mx-auto my-8 rounded-2xl border text-center space-y-4 shadow-lg ${
                    isDark ? 'bg-slate-900 border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-800'
                  }`
                }, [
                  React.createElement('div', { key: 'icon', className: 'w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold' }, '🔒'),
                  React.createElement('h2', { key: 't', className: 'text-xl font-bold text-red-600 dark:text-red-400' }, '403 — Access Denied'),
                  React.createElement('p', { key: 'st', className: 'text-sm font-semibold' }, 'Protected Officer Feature'),
                  React.createElement('p', { key: 'desc', className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed' },
                    'Teachers Information and employee service records are protected features strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official logins.'
                  ),
                  React.createElement('button', {
                    key: 'btn-back',
                    onClick: () => setOfficerTab('OVERVIEW'),
                    className: 'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-md'
                  }, '← Return to Dashboard Overview')
                ])
          )
        : (officerTab === 'SCHOOLS_INFO' || officerTab === 'STRENGTH_ANALYTICS')
        ? (
            isAuthorizedOfficer
              ? (typeof window !== 'undefined' && (window.SchoolsInformationDashboardView || window.SchoolStrengthDashboardView)
                  ? React.createElement(window.SchoolsInformationDashboardView || window.SchoolStrengthDashboardView, {
                      key: 'schools-info-dash',
                      onBack: () => setOfficerTab('OVERVIEW'),
                      user: activeUser,
                      isDark: isDark
                    })
                  : React.createElement('div', { key: 'str-load-err', className: 'p-8 text-center text-sm font-semibold text-slate-600' }, 'Loading Schools Information...')
                )
              : React.createElement('div', {
                  key: 'unauthorized-box',
                  className: `p-8 max-w-xl mx-auto my-8 rounded-2xl border text-center space-y-4 shadow-lg ${
                    isDark ? 'bg-slate-900 border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-800'
                  }`
                }, [
                  React.createElement('div', { key: 'icon', className: 'w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold' }, '🔒'),
                  React.createElement('h2', { key: 't', className: 'text-xl font-bold text-red-600 dark:text-red-400' }, '403 — Access Denied'),
                  React.createElement('p', { key: 'st', className: 'text-sm font-semibold' }, 'Protected Officer Feature'),
                  React.createElement('p', { key: 'desc', className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed' },
                    'School strength particulars and schools information are protected dashboard features strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official logins.'
                  ),
                  React.createElement('button', {
                    key: 'btn-back',
                    onClick: () => setOfficerTab('OVERVIEW'),
                    className: 'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-md'
                  }, '← Return to Dashboard Overview')
                ])
          )
        : (officerTab === 'RETIREMENT')
        ? (
            isAuthorizedOfficer
              ? (typeof window !== 'undefined' && window.RetirementDashboardView
                  ? React.createElement(window.RetirementDashboardView, {
                      key: 'retirement-dash-view',
                      onBack: () => setOfficerTab('OVERVIEW'),
                      user: activeUser,
                      isDark: isDark
                    })
                  : React.createElement('div', { key: 'ret-load-err', className: 'p-8 text-center text-sm font-semibold text-slate-600' }, 'Loading Retirement Dashboard...')
                )
              : React.createElement('div', {
                  key: 'unauthorized-box-ret',
                  className: `p-8 max-w-xl mx-auto my-8 rounded-2xl border text-center space-y-4 shadow-lg ${
                    isDark ? 'bg-slate-900 border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-800'
                  }`
                }, [
                  React.createElement('div', { key: 'icon', className: 'w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold' }, '🔒'),
                  React.createElement('h2', { key: 't', className: 'text-xl font-bold text-red-600 dark:text-red-400' }, '403 — Access Denied'),
                  React.createElement('p', { key: 'st', className: 'text-sm font-semibold' }, 'Protected Officer Feature'),
                  React.createElement('p', { key: 'desc', className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed' },
                    'Employee retirement schedules and records are protected dashboard features strictly restricted to authenticated DEO, APO, and authorized MEO officers.'
                  ),
                  React.createElement('button', {
                    key: 'btn-back',
                    onClick: () => setOfficerTab('OVERVIEW'),
                    className: 'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-md'
                  }, '← Return to Dashboard Overview')
                ])
          )
        : React.createElement(React.Fragment, { key: 'dashboard-standard-modules' }, [
            // Notice Box (Light & Dark)
            React.createElement('div', {
              key: 'db-notice',
              className: `rounded-xl p-4 text-xs flex items-start space-x-3 border transition-colors ${
                isDark
                  ? 'bg-[#0f243d] border-[#1d4472] text-blue-200'
                  : 'bg-[#e3f2fd] border-[#bbdefb] text-[#0c4a7e]'
              }`
            }, [
              React.createElement('span', { key: 'icon', className: 'text-lg mt-0.5' }, 'ℹ️'),
              React.createElement('div', { key: 'txt' }, [
                React.createElement('div', {
                  key: 'h',
                  className: `font-bold text-sm mb-1 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}`
                }, 'Official Department Data Integration'),
                React.createElement('p', {
                  key: 'p',
                  className: `leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`
                }, 'The application authentication is active and persistent. Once the official Telangana Department of School Education database / API source is connected by the administrator, your official service records, designation, and institutional assignments will automatically synchronize here.')
              ])
            ]),

            // Role modules
            activeUser.role === 'Teacher' && React.createElement(TeacherModules, {
              key: 'teacher-mod',
              user: activeUser,
              isDark,
              onOpenServiceRecord: () => setTeacherView('SERVICE_RECORD')
            }),
            (activeUser.role === 'APO' || activeUser.role === 'DEO' || activeUser.role === 'MEO' || activeUser.role === 'Officer') && React.createElement(OfficerModules, {
              key: 'officer-mod',
              user: activeUser,
              isDark,
              onOpenSchoolsInfo: () => setOfficerTab('SCHOOLS_INFO'),
              onOpenTeachersInfo: () => setOfficerTab('TEACHERS_INFO'),
              onOpenRetirement: () => setOfficerTab('RETIREMENT')
            }),
            activeUser.role === 'School Staff' && React.createElement(SchoolStaffModules, { key: 'staff-mod', user: activeUser, isDark }),
            activeUser.role === 'Student' && React.createElement(StudentModules, { key: 'student-mod', user: activeUser, isDark }),
            (activeUser.role === 'Parent' || activeUser.role === 'Other authorized role') && React.createElement(ParentModules, { key: 'parent-mod', user: activeUser, isDark })
          ])
    ])
  ]);
}

function TeacherModules({ user, isDark, onOpenServiceRecord }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, [
    // PRIMARY CARD: Official Teacher Service Record
    React.createElement('div', {
      key: 'c-sr',
      className: `p-5 rounded-2xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
        isDark
          ? 'bg-gradient-to-br from-[#102340] to-[#0c182b] border-amber-400/60 shadow-md text-slate-100'
          : 'bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 border-amber-400 shadow-sm text-slate-800'
      }`
    }, [
      React.createElement('div', { key: 'top-info', className: 'space-y-3' }, [
        React.createElement('div', { key: 'badge-row', className: 'flex items-center justify-between' }, [
          React.createElement('span', {
            key: 'b-doc',
            className: 'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950'
          }, 'OFFICIAL SERVICE REGISTER'),
          React.createElement('span', {
            key: 'b-a4',
            className: `text-[10px] font-bold ${isDark ? 'text-amber-300' : 'text-slate-600'}`
          }, 'A4 2-Page Verified')
        ]),
        React.createElement('h3', {
          key: 't',
          className: `font-bold text-base flex items-center space-x-2 ${isDark ? 'text-amber-300' : 'text-[#0c4a7e]'}`
        }, [
          React.createElement('span', { key: 'i', className: 'text-xl' }, '📜'),
          React.createElement('span', { key: 'txt' }, 'My Service Record')
        ]),
        React.createElement('p', {
          key: 'desc',
          className: `text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`
        }, 'View your official 2-page Teacher Service Record including Personal Details, Qualifications, Departmental Tests, Service History, Promotion Eligibility, and Signatures.')
      ]),
      React.createElement('button', {
        key: 'btn-open',
        onClick: onOpenServiceRecord,
        className: 'w-full font-black py-2.5 px-3 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 mt-2'
      }, [
        React.createElement('span', { key: 'i' }, '👁️'),
        React.createElement('span', { key: 't' }, 'View My Service Record'),
        React.createElement('span', { key: 'arr' }, '→')
      ])
    ]),

    // Card 1: Teacher Transfers & Cadre
    React.createElement('div', {
      key: 'c1',
      className: `p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('div', { key: 'c1-content', className: 'space-y-3' }, [
        React.createElement('h3', { key: 't', className: `font-bold text-sm flex items-center space-x-2 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, [
          React.createElement('span', { key: 'i' }, '📋'),
          React.createElement('span', { key: 'txt' }, 'Teacher Transfers & Cadre')
        ]),
        React.createElement('p', { key: 'desc', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
          'Access guidelines and prepare application for upcoming teacher transfers in Jangaon District.'
        )
      ]),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'View Transfer Guidelines')
    ]),

    // Card 2: Attendance & Classroom
    React.createElement('div', {
      key: 'c2',
      className: `p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('div', { key: 'c2-content', className: 'space-y-3' }, [
        React.createElement('h3', { key: 't', className: `font-bold text-sm flex items-center space-x-2 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, [
          React.createElement('span', { key: 'i' }, '👨‍🎓'),
          React.createElement('span', { key: 'txt' }, 'Attendance & Classroom')
        ]),
        React.createElement('p', { key: 'desc', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
          'Daily student attendance logging and continuous comprehensive evaluation (CCE) records.'
        )
      ]),
      React.createElement('button', {
        key: 'btn-att',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Open Attendance Portal')
    ]),

    // Card 3: Teaching Resources
    React.createElement('div', {
      key: 'c3',
      className: `p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('div', { key: 'c3-content', className: 'space-y-3' }, [
        React.createElement('h3', { key: 't', className: `font-bold text-sm flex items-center space-x-2 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, [
          React.createElement('span', { key: 'i' }, '📚'),
          React.createElement('span', { key: 'txt' }, 'Teaching Resources')
        ]),
        React.createElement('div', { key: 'list', className: 'space-y-2 text-xs' }, [
          React.createElement('div', {
            key: 'd1',
            className: `p-2 rounded transition-colors ${
              isDark ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`
          }, '› Revised Academic Calendar for 2025-26'),
          React.createElement('div', {
            key: 'd2',
            className: `p-2 rounded transition-colors ${
              isDark ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`
          }, '› Teacher Training Modules & Material')
        ])
      ]),
      React.createElement('button', {
        key: 'btn-dl',
        className: `w-full font-bold py-2 rounded-lg text-xs border transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`
      }, 'Download Academic Circulars')
    ])
  ]);
}

function SchoolStaffModules({ user, isDark }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
    React.createElement('div', {
      key: 's1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🏫 School U-DISE+ Data Center'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Manage school infrastructure, student strength, and facility audits.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Access U-DISE+ Portal')
    ]),
    React.createElement('div', {
      key: 's2',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🍲 Mid-Day Meal (MDM) Ledger'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Daily nutrition metrics, egg distribution, and grain stock register.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Update MDM Records')
    ]),
    React.createElement('div', {
      key: 's3',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '💰 Grants & Utilization'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Submit Utilization Certificates for composite school maintenance grants.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs border transition-all cursor-pointer ${
          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`
      }, 'Upload UC Document')
    ])
  ]);
}

function StudentModules({ user, isDark }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
    React.createElement('div', {
      key: 'st1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🎫 SSC Public Examinations'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'View official timetable, examination guidelines, and syllabus updates.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Download Hall Ticket Guidelines')
    ]),
    React.createElement('div', {
      key: 'st2',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '📊 Academic Schedule & Exams'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Quarterly formative assessments and model question papers.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'View Model Papers')
    ]),
    React.createElement('div', {
      key: 'st3',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '📖 Digital Learning Resources'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Access textbook PDFs and online e-learning content.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs border transition-all cursor-pointer ${
          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`
      }, 'Open Digital Library')
    ])
  ]);
}

function OfficerModules({ user, isDark, onOpenSchoolsInfo, onOpenTeachersInfo, onOpenRetirement }) {
  const isDeoOrApo = (user.role === 'DEO' || user.role === 'APO' || user.role === 'Officer');
  const isMeo = (user.role === 'MEO');

  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, [
    // PRIMARY MODULE: Schools Information / School Strength
    isDeoOrApo ? (
      React.createElement('div', {
        key: 'o-schools-info',
        className: `p-5 rounded-2xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
          isDark ? 'bg-[#131f37] border-sky-500/80 shadow-lg text-slate-100 ring-1 ring-sky-500/30' : 'bg-gradient-to-br from-white to-sky-50/70 border-sky-400 shadow-md text-slate-800 ring-1 ring-sky-300/40'
        }`
      }, [
        React.createElement('div', { key: 'badge', className: 'flex items-center justify-between' }, [
          React.createElement('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 uppercase tracking-wider' }, 'Protected DEO/APO Module'),
          React.createElement('span', { className: 'text-xl' }, '🏫')
        ]),
        React.createElement('div', { key: 'body' }, [
          React.createElement('h3', { className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🏫 Schools Information'),
          React.createElement('p', { className: `text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
            'Access district-wide school particulars, 12 mandals matrix, 16 managements, class/stage breakdowns (PS, UPS, HS, Inter), and official strength statistics.'
          )
        ]),
        React.createElement('button', {
          key: 'btn',
          onClick: onOpenSchoolsInfo,
          className: 'w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer bg-[#0c4a7e] hover:bg-[#08355b] text-white flex items-center justify-center space-x-1.5'
        }, [
          React.createElement('span', { key: 'i' }, '📈'),
          React.createElement('span', { key: 't' }, 'Open Schools Information')
        ])
      ])
    ) : isMeo ? (
      React.createElement('div', {
        key: 'o-meo-strength',
        className: `p-5 rounded-2xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
          isDark ? 'bg-[#131f37] border-emerald-500/80 shadow-lg text-slate-100 ring-1 ring-emerald-500/30' : 'bg-gradient-to-br from-white to-emerald-50/70 border-emerald-400 shadow-md text-slate-800 ring-1 ring-emerald-300/40'
        }`
      }, [
        React.createElement('div', { key: 'badge', className: 'flex items-center justify-between' }, [
          React.createElement('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider' }, `Authorized MEO: ${user.mandal || 'Assigned Mandal'}`),
          React.createElement('span', { className: 'text-xl' }, '🏫')
        ]),
        React.createElement('div', { key: 'body' }, [
          React.createElement('h3', { className: `font-bold text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-800'}` }, `🏫 School Strength (${user.mandal || 'Assigned Mandal'})`),
          React.createElement('p', { className: `text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
            `View and update school strength particulars for ${user.mandal || 'your assigned mandal'} across all 16 management categories through your official login.`
          )
        ]),
        React.createElement('button', {
          key: 'btn',
          onClick: onOpenSchoolsInfo,
          className: 'w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center space-x-1.5'
        }, [
          React.createElement('span', { key: 'i' }, '📈'),
          React.createElement('span', { key: 't' }, `Open Mandal School Strength (${user.mandal || 'Assigned'})`)
        ])
      ])
    ) : (
      React.createElement('div', {
        key: 'o-meo-admin',
        className: `p-5 rounded-2xl border transition-all space-y-3 ${
          isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
        }`
      }, [
        React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '📋 Mandal Administration'),
        React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, `Manage administrative monitoring for ${user.mandal || 'your assigned mandal'}.`),
        React.createElement('div', {
          key: 'tag',
          className: 'text-[11px] font-semibold text-slate-500'
        }, 'Official MEO Dashboard Module')
      ])
    ),

    // MODULE 2: Teachers Information Directory & Profiles
    React.createElement('div', {
      key: 'o-teachers-info',
      className: `p-5 rounded-2xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
        isDark ? 'bg-[#131f37] border-emerald-500/80 shadow-lg text-slate-100 ring-1 ring-emerald-500/30' : 'bg-gradient-to-br from-white to-emerald-50/70 border-emerald-400 shadow-md text-slate-800 ring-1 ring-emerald-300/40'
      }`
    }, [
      React.createElement('div', { key: 'badge', className: 'flex items-center justify-between' }, [
        React.createElement('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider' }, isMeo ? `Authorized MEO: ${user.mandal || 'Assigned Mandal'}` : 'Protected Officer Directory'),
        React.createElement('span', { className: 'text-xl' }, '👨‍🏫')
      ]),
      React.createElement('div', { key: 'body' }, [
        React.createElement('h3', { className: `font-bold text-sm ${isDark ? 'text-emerald-300' : 'text-[#0c4a7e]'}` }, '👨‍🏫 Teachers Information'),
        React.createElement('p', { className: `text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
          isMeo
            ? `Access individual service profiles, designations, and qualifications for teachers in ${user.mandal || 'your mandal'}.`
            : 'Access complete district-wide teacher records (2,118 teachers), individual digital profiles, service data, and print/PDF capabilities.'
        )
      ]),
      React.createElement('button', {
        key: 'btn',
        onClick: onOpenTeachersInfo,
        className: 'w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center space-x-1.5'
      }, [
        React.createElement('span', { key: 'i' }, '📋'),
        React.createElement('span', { key: 't' }, isMeo ? `Open Teachers Directory (${user.mandal || 'Assigned'})` : 'Open Teachers Directory')
      ])
    ]),

    // MODULE 3: Employee Retirements & Schedules
    React.createElement('div', {
      key: 'o-retirement',
      className: `p-5 rounded-2xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
        isDark ? 'bg-[#131f37] border-amber-500/80 shadow-lg text-slate-100 ring-1 ring-amber-500/30' : 'bg-gradient-to-br from-white to-amber-50/70 border-amber-400 shadow-md text-slate-800 ring-1 ring-amber-300/40'
      }`
    }, [
      React.createElement('div', { key: 'badge', className: 'flex items-center justify-between' }, [
        React.createElement('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase tracking-wider' }, isMeo ? `Retirements: ${user.mandal || 'Assigned'}` : 'Dynamic Schedules & Countdown'),
        React.createElement('span', { className: 'text-xl' }, '⏳')
      ]),
      React.createElement('div', { key: 'body' }, [
        React.createElement('h3', { className: `font-bold text-sm ${isDark ? 'text-amber-300' : 'text-amber-900'}` }, '⏳ Employee Retirements'),
        React.createElement('p', { className: `text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
          'Track upcoming retirements, days remaining (updating daily), current month/year schedules, and archived retired personnel.'
        )
      ]),
      React.createElement('button', {
        key: 'btn',
        onClick: onOpenRetirement,
        className: 'w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center space-x-1.5'
      }, [
        React.createElement('span', { key: 'i' }, '📅'),
        React.createElement('span', { key: 't' }, isMeo ? 'Open Mandal Retirements' : 'Open Retirement Schedule')
      ])
    ]),

    // MODULE 4: Mandal Inspection Monitoring
    React.createElement('div', {
      key: 'o1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🏛️ Mandal Inspection Monitoring'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Oversee school inspections across the 12 mandals of Jangaon District.'),
      React.createElement('button', {
        key: 'btn',
        onClick: isDeoOrApo ? onOpenSchoolsInfo : undefined,
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, isDeoOrApo ? 'Open Mandal Audit Matrix' : 'Audit Assigned Mandal')
    ]),

    // MODULE 4: Grievance Redressal (PGRS)
    React.createElement('div', {
      key: 'o2',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '⚖️ Grievance Redressal (PGRS)'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Review public education petitions and teacher queries.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Resolve Petitions')
    ])
  ]);
}

function ParentModules({ user, isDark }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
    React.createElement('div', {
      key: 'p1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🎒 Ward Academic Progress'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Track school attendance, term evaluations, and teacher feedback.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Check Progress Card')
    ]),
    React.createElement('div', {
      key: 'p2',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🍲 Nutrition & Schemes'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Information regarding Mid-Day Meals, uniforms, and government textbooks.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'View Scheme Guidelines')
    ]),
    React.createElement('div', {
      key: 'p3',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🤝 SMC Committee Notices'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Parent-Teacher Meeting agendas and school development resolutions.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs border transition-all cursor-pointer ${
          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`
      }, 'View Meeting Agendas')
    ])
  ]);
}

// ==========================================
// 14. ROOT APP COMPONENT (IMAGE 2: CLEAN LIGHT BACKGROUND #f0f4f8)
// ==========================================
// 14. ROOT APP COMPONENT (IMAGE 2: DYNAMIC THEME SUPPORT)
// ==========================================
function App() {
  const { user, currentView, setCurrentView, activeModal, theme } = useContext(AuthContext);
  const [fontScale, setFontScale] = useState('md');
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const isDark = (theme === 'dark');

  return React.createElement('div', {
    className: `min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      isDark ? 'bg-[#0b1329] text-slate-100' : 'bg-[#f0f4f8] text-slate-800'
    }`
  }, [
    React.createElement('div', { key: 'top-nav' }, [
      React.createElement(TopGovtBar, { fontScale, setFontScale }),
      React.createElement(MainHeader)
    ]),

    React.createElement('main', { key: 'main-content', className: 'flex-1' }, [
      currentView === 'PORTAL' ? (
        React.createElement('div', { key: 'portal-view' }, [
          React.createElement(HeroBanner, { onSelectOfficial: setSelectedOfficial }),
          React.createElement(StandaloneStatsCards),
          React.createElement(QuickServices),
          React.createElement(PortalCardsGrid)
        ])
      ) : (
        React.createElement(RoleDashboard, { key: 'dash-view' })
      )
    ]),

    React.createElement(OfficialFooter, { key: 'footer' }),

    selectedOfficial && React.createElement(OfficialProfileModal, {
      key: 'official-modal',
      official: selectedOfficial,
      onClose: () => setSelectedOfficial(null)
    }),

    activeModal === 'REGISTER' && React.createElement(RegisterModal, { key: 'reg-modal' }),
    activeModal === 'LOGIN' && React.createElement(LoginModal, { key: 'login-modal' }),
    activeModal === 'FORGOT' && React.createElement(ForgotPasswordModal, { key: 'forgot-modal' }),
  ]);
}


// ==========================================
function initApp() {
  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement._reactRootMounted) {
    rootElement._reactRootMounted = true;
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(App)
      )
    );
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
