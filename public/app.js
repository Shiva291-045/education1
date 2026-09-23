// District Educational Office, Jangaon - Complete Portal & Authentication Application
// React 18 Application - 100% Faithful to IMAGE 2 (Original Correct Light Government Version)

const { useState, useEffect, useContext, createContext, useRef } = React;
const { TelanganaEmblem, TelanganaRisingLogo, PencilBanner, SchoolBuildingGraphic, SkylineGraphic } = window.PORTAL_LOGOS;

// ==========================================
// 1. AUTH CONTEXT & BACKEND API CLIENT
// ==========================================
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('deo_auth_token'));
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'LOGIN' | 'REGISTER' | 'FORGOT' | null
  const [devOtpNotification, setDevOtpNotification] = useState(null);
  const [currentView, setCurrentView] = useState('PORTAL'); // 'PORTAL' | 'DASHBOARD'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jangaon_portal_theme') || 'light';
  });

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

  const toggleTheme = () => {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('deo_auth_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('deo_auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Auth check error:", err);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const sendOtp = async (mobileNumber, purpose = 'REGISTRATION') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, purpose })
      });
      const data = await res.json();
      if (data.success && data.debugOtp) {
        setDevOtpNotification({
          mobile: data.mobileNumber,
          otp: data.debugOtp,
          purpose
        });
      }
      return data;
    } catch (err) {
      return { success: false, message: "Network connection error. Please try again." };
    }
  };

  const verifyOtp = async (mobileNumber, otpCode, purpose = 'REGISTRATION') => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otpCode, purpose })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Network error during OTP verification." };
    }
  };

  const registerUser = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('deo_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setDevOtpNotification(null);
      }
      return data;
    } catch (err) {
      return { success: false, message: "Server error during registration." };
    }
  };

  const loginUser = async (mobileNumber, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('deo_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setActiveModal(null);
        setCurrentView('DASHBOARD');
      }
      return data;
    } catch (err) {
      return { success: false, message: "Server error during login." };
    }
  };

  const resetPassword = async (payload) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: "Server error resetting password." };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('deo_auth_token');
    setToken(null);
    setUser(null);
    setCurrentView('PORTAL');
  };

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return React.createElement(AuthContext.Provider, {
    value: {
      user,
      token,
      loading,
      activeModal,
      openModal,
      closeModal,
      sendOtp,
      verifyOtp,
      registerUser,
      loginUser,
      resetPassword,
      logout,
      currentView,
      setCurrentView,
      devOtpNotification,
      setDevOtpNotification,
      theme,
      changeTheme,
      toggleTheme
    }
  }, children);
}

// ==========================================
// 2. TOP GOVERNMENT ACCESSIBILITY BAR (IMAGE 2: DEEP BLUE #0c4a7e)
// ==========================================
function TopGovtBar({ fontScale, setFontScale }) {
  const { theme, changeTheme } = useContext(AuthContext);
  const [lang, setLang] = useState('English');

  const handleFontChange = (scale) => {
    setFontScale(scale);
    document.body.className = `bg-[#f0f4f8] text-slate-800 antialiased font-scale-${scale}`;
  };

  return React.createElement('div', {
    className: 'bg-[#0c4a7e] text-white text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-[#08355b]'
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
          className: `px-1 hover:text-amber-300 font-bold ${fontScale === 'sm' ? 'text-amber-300' : 'text-white'}`
        }, 'A-'),
        React.createElement('button', {
          key: 'f-md',
          onClick: () => handleFontChange('md'),
          className: `px-1 hover:text-amber-300 font-bold ${fontScale === 'md' ? 'text-amber-300' : 'text-white'}`
        }, 'A'),
        React.createElement('button', {
          key: 'f-lg',
          onClick: () => handleFontChange('lg'),
          className: `px-1 hover:text-amber-300 font-bold ${fontScale === 'lg' ? 'text-amber-300' : 'text-white'}`
        }, 'A+')
      ]),

      React.createElement('span', { key: 'sep2', className: 'text-blue-300' }, '|'),

      // Language Select
      React.createElement('div', { key: 'lang', className: 'relative' }, [
        React.createElement('select', {
          value: lang,
          onChange: (e) => setLang(e.target.value),
          className: 'bg-transparent text-white rounded text-xs focus:outline-none cursor-pointer'
        }, [
          React.createElement('option', { key: 'en', value: 'English', className: 'text-slate-800' }, 'English ▾'),
          React.createElement('option', { key: 'te', value: 'తెలుగు', className: 'text-slate-800' }, 'తెలుగు')
        ])
      ]),

      React.createElement('span', { key: 'sep3', className: 'text-blue-300' }, '|'),

      // Icons: Search, Light, Dark toggle
      React.createElement('button', { key: 's-icn', className: 'hover:text-amber-300 text-white transition-colors cursor-pointer', title: "Search" }, '🔍'),
      React.createElement('button', {
        key: 'sun-icn',
        onClick: () => changeTheme('light'),
        className: `flex items-center space-x-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          theme === 'light' ? 'bg-amber-400 text-slate-900 font-bold shadow-xs' : 'text-white hover:text-amber-300 hover:bg-white/10'
        }`,
        title: "Day Mode (Light Theme)"
      }, [
        React.createElement('span', { key: 'i' }, '☀️'),
        React.createElement('span', { key: 't', className: 'hidden sm:inline' }, 'Day')
      ]),
      React.createElement('button', {
        key: 'moon-icn',
        onClick: () => changeTheme('dark'),
        className: `flex items-center space-x-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          theme === 'dark' ? 'bg-amber-400 text-slate-900 font-bold shadow-xs' : 'text-white hover:text-amber-300 hover:bg-white/10'
        }`,
        title: "Night Mode (Dark Theme)"
      }, [
        React.createElement('span', { key: 'i' }, '🌙'),
        React.createElement('span', { key: 't', className: 'hidden sm:inline' }, 'Night')
      ])
    ])
  ]);
}

// ==========================================
// 3. MAIN NAVIGATION HEADER (IMAGE 2: PURE WHITE BACKGROUND)
// ==========================================
function MainHeader() {
  const { user, openModal, logout, currentView, setCurrentView } = useContext(AuthContext);
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
    className: 'bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs'
  }, [
    React.createElement('div', {
      key: 'header-row',
      className: 'max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-between'
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
            className: 'font-extrabold text-[#0c4a7e] text-base lg:text-[18px] leading-tight tracking-tight whitespace-nowrap'
          }, 'District Educational Office, Jangaon'),
          React.createElement('span', {
            key: 'sub1',
            className: 'text-xs font-semibold text-slate-700 leading-tight whitespace-nowrap'
          }, 'School Education Department, Telangana'),
          React.createElement('span', {
            key: 'sub2',
            className: 'text-[11px] font-bold text-[#1565c0] italic leading-tight whitespace-nowrap'
          }, 'Education for a Brighter Tomorrow')
        ])
      ]),

      // Center Navigation Links (Matching Reference Image)
      React.createElement('nav', {
        key: 'nav',
        className: 'hidden md:flex items-center space-x-2 lg:space-x-3.5 text-xs lg:text-[13px] font-semibold text-slate-700 whitespace-nowrap mx-2'
      }, [
        React.createElement('button', {
          key: 'home',
          onClick: () => setCurrentView('PORTAL'),
          className: `flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            currentView === 'PORTAL' ? 'text-[#0c4a7e] bg-blue-50 font-bold' : 'hover:text-[#0c4a7e]'
          }`
        }, [
          React.createElement('span', { key: 'i' }, '🏠'),
          React.createElement('span', { key: 't' }, 'Home')
        ]),
        React.createElement('span', { key: 'abt', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'About ▾'),
        React.createElement('span', { key: 'tch', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Teachers ▾'),
        React.createElement('span', { key: 'sch', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Schools ▾'),
        React.createElement('span', { key: 'stu', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Students ▾'),
        React.createElement('span', { key: 'exam', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Examinations ▾'),
        React.createElement('span', { key: 'notif', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Notifications'),
        React.createElement('span', { key: 'contact', className: 'hover:text-[#0c4a7e] cursor-pointer' }, 'Contact')
      ]),

      // Right Action Buttons (Matching Reference Image)
      React.createElement('div', {
        key: 'actions',
        className: 'flex items-center space-x-2 lg:space-x-2.5 flex-shrink-0'
      }, [
        // 9-dot grid icon
        React.createElement('button', {
          key: 'grid-btn',
          className: 'text-slate-600 hover:text-[#0c4a7e] p-1 text-lg cursor-pointer'
        }, '⠿'),

        !user ? (
          // Logged Out State: [ Login ] [ + Register ]
          React.createElement('div', { key: 'guest-btns', className: 'flex items-center space-x-2' }, [
            // Login button: White background with blue border and blue text
            React.createElement('button', {
              key: 'btn-login',
              id: 'header-login-btn',
              onClick: () => openModal('LOGIN'),
              className: 'flex items-center space-x-1.5 border border-[#0c4a7e] text-[#0c4a7e] hover:bg-blue-50 px-3 py-1.5 rounded-md font-semibold text-xs lg:text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap'
            }, [
              React.createElement('span', { key: 'icon' }, '👤'),
              React.createElement('span', { key: 'text' }, 'Login')
            ]),

            // Register button: Solid government blue background with white text
            React.createElement('button', {
              key: 'btn-register',
              id: 'header-register-btn',
              onClick: () => openModal('REGISTER'),
              className: 'flex items-center space-x-1.5 bg-[#0c4a7e] hover:bg-[#08355b] text-white px-3 py-1.5 rounded-md font-semibold text-xs lg:text-sm transition-all shadow-xs cursor-pointer whitespace-nowrap'
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
              className: 'flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all'
            }, [
              React.createElement('div', {
                key: 'avatar',
                className: 'w-7 h-7 rounded-full bg-[#0c4a7e] text-white flex items-center justify-center text-xs font-bold'
              }, user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'),

              React.createElement('div', { key: 'user-details', className: 'text-left max-w-[140px] truncate' }, [
                React.createElement('div', { key: 'un', className: 'text-xs font-bold truncate text-[#0c4a7e]' }, user.fullName),
                React.createElement('div', { key: 'ur', className: 'text-[10px] text-slate-500' }, user.role)
              ]),

              React.createElement('span', { key: 'caret', className: 'text-xs text-slate-500' }, dropdownOpen ? '▲' : '▼')
            ]),

            dropdownOpen && React.createElement('div', {
              key: 'dropdown-menu',
              className: 'absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50'
            }, [
              React.createElement('div', {
                key: 'sum',
                className: 'px-4 py-3 bg-[#e3f2fd] border-b border-blue-100'
              }, [
                React.createElement('div', { key: 'n', className: 'font-bold text-slate-900 text-sm' }, user.fullName),
                React.createElement('div', { key: 'm', className: 'text-xs text-slate-600' }, `+91 ${user.mobileNumber}`),
                React.createElement('div', { key: 'role-tag', className: 'mt-1.5 flex items-center justify-between' }, [
                  React.createElement('span', {
                    key: 'r',
                    className: 'inline-block bg-white text-[#0c4a7e] border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full'
                  }, user.role),
                  React.createElement('span', {
                    key: 'l-pend',
                    className: 'inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full'
                  }, '⚠ Dept Link Pending')
                ])
              ]),

              React.createElement('div', { key: 'items', className: 'py-1 text-sm text-slate-700' }, [
                React.createElement('button', {
                  key: 'm-dash',
                  onClick: () => {
                    setCurrentView('DASHBOARD');
                    setDropdownOpen(false);
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center space-x-2.5 font-medium text-[#0c4a7e]'
                }, [
                  React.createElement('span', { key: 'i' }, '📊'),
                  React.createElement('span', { key: 't' }, 'Role Dashboard')
                ]),

                React.createElement('button', {
                  key: 'm-portal',
                  onClick: () => {
                    setCurrentView('PORTAL');
                    setDropdownOpen(false);
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '🏛️'),
                  React.createElement('span', { key: 't' }, 'Main Portal View')
                ]),

                React.createElement('button', {
                  key: 'm-settings',
                  onClick: () => {
                    openModal('FORGOT');
                    setDropdownOpen(false);
                  },
                  className: 'w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center space-x-2.5'
                }, [
                  React.createElement('span', { key: 'i' }, '⚙️'),
                  React.createElement('span', { key: 't' }, 'Change Password')
                ])
              ]),

              React.createElement('div', { key: 'logout-sec', className: 'pt-1 border-t border-slate-100' }, [
                React.createElement('button', {
                  key: 'm-logout',
                  onClick: () => {
                    setDropdownOpen(false);
                    logout();
                  },
                  className: 'w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2.5'
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
// 4. HERO SECTION (IMAGE 2: PURE WHITE BACKGROUND, GREEN CREST, PENCIL, RISING LOGO)
// ==========================================
function HeroBanner() {
  return React.createElement('div', {
    className: 'bg-white py-3 sm:py-4 px-4 border-b border-slate-200'
  }, [
    React.createElement('div', {
      key: 'hero-grid',
      className: 'max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6'
    }, [
      // Left: Original Green Telangana Government Emblem
      React.createElement('div', {
        key: 'left-crest',
        className: 'hidden md:flex flex-col items-center justify-center p-1'
      }, [
        React.createElement(TelanganaEmblem, { className: 'w-36 h-36 md:w-44 md:h-44 drop-shadow-xs' })
      ]),

      // Center: Giant Pencil Graphic matching IMAGE 2
      // Line 1: GOVERNMENT OF TELANGANA (Dark green)
      // Pencil Graphic (Red)
      // Line 2: DEPARTMENT OF SCHOOL EDUCATION (Blue)
      // Line 3: JANGAON DISTRICT (Red / Dark red)
      React.createElement('div', {
        key: 'center-pencil',
        className: 'flex-1 flex justify-center w-full px-2'
      }, [
        React.createElement(PencilBanner, { className: 'w-full max-w-2xl' })
      ]),

      // Right: Original 1 Telangana Rising Logo
      React.createElement('div', {
        key: 'right-rising',
        className: 'hidden md:flex flex-col items-center justify-center p-1'
      }, [
        React.createElement(TelanganaRisingLogo, { className: 'w-32 h-32 md:w-40 md:h-40 drop-shadow-xs' })
      ])
    ])
  ]);
}

// ==========================================
// 5. STATISTICS / CATEGORY BAR (MATCHING IMAGE 2 EXACTLY)
// Unified horizontal bar:
// Left side: Deep blue bar (#0c4a7e) with pills
// Right side: Integrated WHITE section with 4 stats
// ==========================================
function StatsRibbon() {
  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2.5 mb-1.5'
  }, [
    React.createElement('div', {
      key: 'ribbon-card',
      className: 'rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch'
    }, [
      // Left Side: Deep Government Blue Bar (#0c4a7e) with Category Pills
      React.createElement('div', {
        key: 'left-pills-bar',
        className: 'bg-[#0c4a7e] text-white py-2 px-3 sm:px-5 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-[13px] font-semibold flex-1'
      }, [
        React.createElement('div', {
          key: 'p1',
          className: 'flex items-center space-x-1.5 bg-[#08355b] border border-blue-400/30 px-3 py-1 rounded-full'
        }, [
          React.createElement('span', { key: 'i' }, '📍'),
          React.createElement('span', { key: 't' }, 'Jangaon')
        ]),
        React.createElement('div', {
          key: 'p2',
          className: 'flex items-center space-x-1.5 bg-[#08355b] border border-blue-400/30 px-3 py-1 rounded-full'
        }, [
          React.createElement('span', { key: 'i' }, '📖'),
          React.createElement('span', { key: 't' }, 'Quality Education')
        ]),
        React.createElement('div', {
          key: 'p3',
          className: 'flex items-center space-x-1.5 bg-[#08355b] border border-blue-400/30 px-3 py-1 rounded-full'
        }, [
          React.createElement('span', { key: 'i' }, '👥'),
          React.createElement('span', { key: 't' }, 'Empowered Teachers')
        ]),
        React.createElement('div', {
          key: 'p4',
          className: 'flex items-center space-x-1.5 bg-[#08355b] border border-blue-400/30 px-3 py-1 rounded-full'
        }, [
          React.createElement('span', { key: 'i' }, '🎓'),
          React.createElement('span', { key: 't' }, 'Brighter Future')
        ])
      ]),

      // Right Side: Integrated WHITE section with 4 Statistics (Matching IMAGE 2)
      React.createElement('div', {
        key: 'right-stats-bar',
        className: 'bg-white py-2 px-4 sm:px-6 flex items-center justify-around space-x-4 sm:space-x-8 text-center border-t lg:border-t-0 lg:border-l border-slate-200'
      }, [
        // 1,248 Schools
        React.createElement('div', { key: 'st-sch', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-xl sm:text-2xl text-[#0c4a7e]' }, '🏛️'),
          React.createElement('div', { key: 'v', className: 'text-left' }, [
            React.createElement('div', { key: 'num', className: 'font-extrabold text-sm sm:text-base leading-tight text-[#0c4a7e]' }, '1,248'),
            React.createElement('div', { key: 'lbl', className: 'text-[10px] sm:text-[11px] text-slate-600 font-semibold' }, 'Schools')
          ])
        ]),

        // 3,842 Teachers
        React.createElement('div', { key: 'st-tch', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-xl sm:text-2xl text-[#007a33]' }, '👨‍🏫'),
          React.createElement('div', { key: 'v', className: 'text-left' }, [
            React.createElement('div', { key: 'num', className: 'font-extrabold text-sm sm:text-base leading-tight text-[#0c4a7e]' }, '3,842'),
            React.createElement('div', { key: 'lbl', className: 'text-[10px] sm:text-[11px] text-slate-600 font-semibold' }, 'Teachers')
          ])
        ]),

        // 1,45,620 Students
        React.createElement('div', { key: 'st-stu', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-xl sm:text-2xl text-[#0c4a7e]' }, '🎒'),
          React.createElement('div', { key: 'v', className: 'text-left' }, [
            React.createElement('div', { key: 'num', className: 'font-extrabold text-sm sm:text-base leading-tight text-[#0c4a7e]' }, '1,45,620'),
            React.createElement('div', { key: 'lbl', className: 'text-[10px] sm:text-[11px] text-slate-600 font-semibold' }, 'Students')
          ])
        ]),

        // 29 Mandals
        React.createElement('div', { key: 'st-mnd', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-xl sm:text-2xl text-[#c51c24]' }, '📍'),
          React.createElement('div', { key: 'v', className: 'text-left' }, [
            React.createElement('div', { key: 'num', className: 'font-extrabold text-sm sm:text-base leading-tight text-[#0c4a7e]' }, '29'),
            React.createElement('div', { key: 'lbl', className: 'text-[10px] sm:text-[11px] text-slate-600 font-semibold' }, 'Mandals')
          ])
        ])
      ])
    ])
  ]);
}

// ==========================================
// 6. QUICK SERVICES (IMAGE 2: PURE WHITE SECTION WITH PASTEL CARDS)
// ==========================================
function QuickServices() {
  const { openModal } = useContext(AuthContext);

  return React.createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5'
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
          React.createElement('h2', { key: 'h2', className: 'text-base sm:text-lg font-bold text-slate-900 leading-tight' }, 'Quick Services'),
          React.createElement('p', { key: 'p', className: 'text-[11px] text-slate-500' }, 'Access essential information and services')
        ])
      ]),
      React.createElement('button', {
        key: 'view-all',
        className: 'text-xs font-semibold text-[#0c4a7e] hover:text-blue-900 flex items-center space-x-1'
      }, [
        React.createElement('span', { key: 't' }, 'View All Services'),
        React.createElement('span', { key: 'a' }, '→')
      ])
    ]),

    React.createElement('div', {
      key: 'cards-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
    }, [
      // Left Card: Very light green / pale green background (#e8f5e9) with green circle icon
      React.createElement('div', {
        key: 'c-tch',
        onClick: () => openModal('LOGIN'),
        className: 'bg-[#e8f5e9] border border-[#c8e6c9] hover:border-emerald-400 rounded-xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-xs group'
      }, [
        React.createElement('div', { key: 'info', className: 'flex items-center space-x-3.5' }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: 'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00897b] text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform'
          }, '👤'),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 'title', className: 'text-sm sm:text-base font-bold text-[#0c4a7e] group-hover:text-blue-900' }, 'Teachers Information'),
            React.createElement('p', { key: 'sub', className: 'text-xs text-slate-600' }, 'Transfers, Vacancies, Trainings and More')
          ])
        ]),
        React.createElement('div', {
          key: 'arrow',
          className: 'w-8 h-8 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-bold shadow-xs group-hover:bg-[#00897b] group-hover:text-white group-hover:border-[#00897b] transition-all'
        }, '→')
      ]),

      // Right Card: Very light blue background (#e3f2fd) with blue circle icon
      React.createElement('div', {
        key: 'c-sch',
        onClick: () => {
          const el = document.getElementById('find-school-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        },
        className: 'bg-[#e3f2fd] border border-[#bbdefb] hover:border-blue-400 rounded-xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-xs group'
      }, [
        React.createElement('div', { key: 'info', className: 'flex items-center space-x-3.5' }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: 'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1976d2] text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform'
          }, '🏛️'),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 'title', className: 'text-sm sm:text-base font-bold text-[#0c4a7e] group-hover:text-blue-900' }, 'Schools Information'),
            React.createElement('p', { key: 'sub', className: 'text-xs text-slate-600' }, 'Find Schools in Jangaon District')
          ])
        ]),
        React.createElement('div', {
          key: 'arrow',
          className: 'w-8 h-8 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-bold shadow-xs group-hover:bg-[#1976d2] group-hover:text-white group-hover:border-[#1976d2] transition-all'
        }, '→')
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

  const handleSearchSchool = async () => {
    try {
      const res = await fetch(`/api/schools/search?mandal=${mandal}&type=${schoolType}`);
      const data = await res.json();
      setSearchResults(data.schools || []);
    } catch (e) {
      setSearchResults([]);
    }
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
        className: 'bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between'
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
        className: 'bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between'
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
                  onChange: (e) => setMandal(e.target.value),
                  className: 'w-full text-[11px] border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#0c4a7e]'
                }, [
                  React.createElement('option', { key: 'all', value: 'all' }, 'Select Mandal ▾'),
                  React.createElement('option', { key: 'm1', value: 'Jangaon' }, 'Jangaon'),
                  React.createElement('option', { key: 'm2', value: 'Bachannapet' }, 'Bachannapet'),
                  React.createElement('option', { key: 'm3', value: 'Devaruppula' }, 'Devaruppula'),
                  React.createElement('option', { key: 'm4', value: 'Lingalaghanpur' }, 'Lingalaghanpur'),
                  React.createElement('option', { key: 'm5', value: 'Narmetta' }, 'Narmetta'),
                  React.createElement('option', { key: 'm6', value: 'Station Ghanpur' }, 'Station Ghanpur'),
                  React.createElement('option', { key: 'm7', value: 'Palakurthi' }, 'Palakurthi')
                ]),

                React.createElement('select', {
                  key: 'sel-type',
                  value: schoolType,
                  onChange: (e) => setSchoolType(e.target.value),
                  className: 'w-full text-[11px] border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700 focus:outline-none focus:border-[#0c4a7e]'
                }, [
                  React.createElement('option', { key: 'all', value: 'all' }, 'Select School Type ▾'),
                  React.createElement('option', { key: 't1', value: 'Government' }, 'Government High School'),
                  React.createElement('option', { key: 't2', value: 'ZPHS' }, 'Zilla Parishad (ZPHS)'),
                  React.createElement('option', { key: 't3', value: 'KGBV' }, 'KGBV Residential'),
                  React.createElement('option', { key: 't4', value: 'Model School' }, 'TS Model School')
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
              className: 'mt-2 max-h-28 overflow-y-auto space-y-1 p-1 bg-white rounded border border-slate-200'
            }, searchResults.length > 0 ? (
              searchResults.map((s, idx) => React.createElement('div', {
                key: `res-${idx}`,
                className: 'text-[10px] p-1 bg-slate-50 rounded border border-slate-100 flex items-center justify-between'
              }, [
                React.createElement('div', { key: 't', className: 'truncate' }, [
                  React.createElement('div', { key: 'n', className: 'font-bold text-slate-800 truncate' }, s.name),
                  React.createElement('div', { key: 'd', className: 'text-[9px] text-slate-500' }, `${s.mandal} • ${s.medium}`)
                ]),
                React.createElement('span', { key: 'tag', className: 'text-[8px] font-semibold bg-[#e3f2fd] text-[#0c4a7e] px-1 py-0.2 rounded flex-shrink-0 ml-1' }, s.type)
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
        className: 'bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between'
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
// 9. DEV OTP HELPER TOAST
// ==========================================
function DevOtpToast() {
  const { devOtpNotification, setDevOtpNotification } = useContext(AuthContext);
  if (!devOtpNotification) return null;

  return React.createElement('div', {
    className: 'fixed bottom-5 right-5 z-50 bg-[#0c4a7e] text-white p-4 rounded-xl shadow-2xl border-2 border-amber-300 max-w-sm animate-bounce'
  }, [
    React.createElement('div', { key: 'head', className: 'flex items-center justify-between mb-1' }, [
      React.createElement('div', { key: 't', className: 'flex items-center space-x-1.5' }, [
        React.createElement('span', { key: 'i', className: 'text-amber-300' }, '📱'),
        React.createElement('span', { key: 'txt', className: 'font-bold text-xs text-amber-300 uppercase tracking-wider' }, 'Govt SMS Gateway Dispatch')
      ]),
      React.createElement('button', {
        key: 'close',
        onClick: () => setDevOtpNotification(null),
        className: 'text-blue-200 hover:text-white text-xs font-bold'
      }, '✕')
    ]),
    React.createElement('p', { key: 'msg', className: 'text-xs text-blue-100' },
      `OTP for +91 ${devOtpNotification.mobile}:`
    ),
    React.createElement('div', {
      key: 'code',
      className: 'my-1.5 text-center bg-[#08355b] py-1.5 px-3 rounded-lg border border-blue-400/30'
    }, [
      React.createElement('span', { key: 'otp-display', className: 'text-2xl font-black tracking-widest text-amber-300 font-mono' },
        devOtpNotification.otp
      )
    ]),
    React.createElement('p', { key: 'note', className: 'text-[10px] text-blue-200' },
      'Auto-generated by Telangana SMS Gateway for your mobile number.'
    )
  ]);
}

// ==========================================
// 10. AUTH MODALS: REGISTRATION WORKFLOW (WHITE & GOVERNMENT BLUE)
// ==========================================
function RegisterModal() {
  const { closeModal, openModal, sendOtp, registerUser } = useContext(AuthContext);

  const [step, setStep] = useState('FORM');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('APO');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [resendActive, setResendActive] = useState(false);
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [officialResult, setOfficialResult] = useState(null);

  useEffect(() => {
    let timer;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setResendActive(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
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
    const res = await sendOtp(cleanedMobile, 'REGISTRATION');
    setLoading(false);

    if (res.success) {
      setStep('OTP');
      setCountdown(60);
      setResendActive(false);
      setSuccessMsg(`OTP sent to +91 ${cleanedMobile}`);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendOtp = async () => {
    if (!resendActive) return;
    setErrorMsg('');
    setLoading(true);
    const res = await sendOtp(mobileNumber, 'REGISTRATION');
    setLoading(false);
    if (res.success) {
      setCountdown(60);
      setResendActive(false);
      setSuccessMsg("✓ New OTP sent successfully.");
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5 && otpInputRefs[index + 1].current) {
      otpInputRefs[index + 1].current.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current.focus();
    }
  };

  const handleVerifyAndCreateAccount = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the OTP.");
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setStep('CHECKING_OFFICIAL');

    const regRes = await registerUser({
      fullName,
      role,
      mobileNumber,
      password,
      confirmPassword,
      otpCode: fullOtp
    });

    setLoading(false);

    if (regRes.success) {
      setOfficialResult(regRes.officialDataResult);
      setTimeout(() => {
        setStep('SUCCESS');
      }, 1500);
    } else {
      setStep('OTP');
      setErrorMsg(regRes.message);
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4'
  }, [
    React.createElement('div', {
      key: 'reg-card',
      className: 'bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up'
    }, [
      React.createElement('div', {
        key: 'modal-head',
        className: 'bg-[#0c4a7e] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400'
      }, [
        React.createElement('div', { key: 'h-info', className: 'flex items-center space-x-3' }, [
          React.createElement(TelanganaEmblem, { key: 'seal', className: 'w-10 h-10' }),
          React.createElement('div', { key: 'txt' }, [
            React.createElement('h3', { key: 't', className: 'text-base font-bold text-white leading-tight' }, 'Official User Registration'),
            React.createElement('p', { key: 's', className: 'text-[11px] text-amber-300' }, 'District Educational Office, Jangaon')
          ])
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: closeModal,
          className: 'text-blue-100 hover:text-white text-lg font-bold p-1 rounded hover:bg-white/10'
        }, '✕')
      ]),

      React.createElement('div', { key: 'modal-body', className: 'p-6 max-h-[85vh] overflow-y-auto' }, [
        errorMsg && React.createElement('div', {
          key: 'err-alert',
          className: 'mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'i' }, '❌'),
          React.createElement('span', { key: 'm' }, errorMsg)
        ]),

        successMsg && React.createElement('div', {
          key: 'succ-alert',
          className: 'mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'i' }, '✓'),
          React.createElement('span', { key: 'm' }, successMsg)
        ]),

        step === 'FORM' && React.createElement('form', {
          key: 'reg-form',
          onSubmit: handleSendOtp,
          className: 'space-y-4'
        }, [
          React.createElement('div', { key: 'f-name' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Full Name *'),
            React.createElement('input', {
              key: 'i',
              type: 'text',
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              placeholder: 'Enter your full name',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
            })
          ]),

          React.createElement('div', { key: 'f-role' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Select Authorized Role *'),
            React.createElement('select', {
              key: 'sel',
              value: role,
              onChange: (e) => setRole(e.target.value),
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#0c4a7e] font-medium'
            }, [
              React.createElement('option', { key: 'apo', value: 'APO' }, 'APO'),
              React.createElement('option', { key: 'deo', value: 'DEO' }, 'DEO'),
              React.createElement('option', { key: 'meo', value: 'MEO' }, 'MEO'),
              React.createElement('option', { key: 'tch', value: 'Teacher' }, 'Teacher')
            ])
          ]),

          React.createElement('div', { key: 'f-mobile' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Mobile Number (for OTP Verification) *'),
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

          React.createElement('div', { key: 'f-pwd-grid', className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
            React.createElement('div', { key: 'f-pwd' }, [
              React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Password *'),
              React.createElement('input', {
                key: 'i',
                type: showPassword ? 'text' : 'password',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: 'Min 6 characters',
                required: true,
                className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
              })
            ]),
            React.createElement('div', { key: 'f-cpwd' }, [
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
              id: 'show-pwd',
              checked: showPassword,
              onChange: (e) => setShowPassword(e.target.checked),
              className: 'rounded text-[#0c4a7e]'
            }),
            React.createElement('label', { key: 'lbl', htmlFor: 'show-pwd' }, 'Show passwords')
          ]),

          React.createElement('button', {
            key: 'btn-send-otp',
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-60'
          }, [
            loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
            React.createElement('span', { key: 't' }, loading ? 'Validating Mobile...' : 'Send OTP')
          ]),

          React.createElement('div', { key: 'switch', className: 'text-center text-xs text-slate-600 pt-2 border-t border-slate-100' }, [
            React.createElement('span', { key: 't' }, 'Already have an official account? '),
            React.createElement('button', {
              key: 'btn-to-login',
              type: 'button',
              onClick: () => openModal('LOGIN'),
              className: 'text-[#0c4a7e] hover:underline font-bold'
            }, 'Login here')
          ])
        ]),

        step === 'OTP' && React.createElement('div', {
          key: 'otp-screen',
          className: 'space-y-5 text-center'
        }, [
          React.createElement('div', { key: 'inst' }, [
            React.createElement('div', { key: 'icon', className: 'w-12 h-12 rounded-full bg-[#e3f2fd] text-[#0c4a7e] flex items-center justify-center text-xl mx-auto mb-2' }, '💬'),
            React.createElement('h4', { key: 'h4', className: 'text-base font-bold text-slate-900' }, 'Verify Mobile Number'),
            React.createElement('p', { key: 'p', className: 'text-xs text-slate-500 mt-1' },
              `Enter the 6-digit OTP sent to your mobile number +91 ${mobileNumber}`
            )
          ]),

          React.createElement('div', {
            key: 'digit-boxes',
            className: 'flex justify-center space-x-2 sm:space-x-3'
          }, otpDigits.map((digit, idx) => React.createElement('input', {
            key: `otp-${idx}`,
            ref: otpInputRefs[idx],
            type: 'text',
            inputMode: 'numeric',
            maxLength: 1,
            value: digit,
            onChange: (e) => handleDigitChange(idx, e.target.value),
            onKeyDown: (e) => handleDigitKeyDown(idx, e.target.value),
            className: 'otp-digit-box'
          }))),

          React.createElement('div', {
            key: 'timer-sec',
            className: 'text-xs text-slate-600 flex items-center justify-center space-x-4'
          }, [
            React.createElement('div', { key: 'count', className: 'flex items-center space-x-1 font-medium' }, [
              React.createElement('span', { key: 'i' }, '⏱️'),
              React.createElement('span', { key: 't' }, `Expires in: ${countdown}s`)
            ]),
            React.createElement('button', {
              key: 'btn-resend',
              type: 'button',
              disabled: !resendActive || loading,
              onClick: handleResendOtp,
              className: `font-bold ${resendActive ? 'text-[#0c4a7e] hover:underline' : 'text-slate-400 cursor-not-allowed'}`
            }, 'Resend OTP')
          ]),

          React.createElement('div', { key: 'otp-actions', className: 'space-y-2 pt-2' }, [
            React.createElement('button', {
              key: 'btn-verify',
              type: 'button',
              disabled: loading || otpDigits.join('').length !== 6,
              onClick: handleVerifyAndCreateAccount,
              className: 'w-full bg-[#007a33] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-50'
            }, [
              loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
              React.createElement('span', { key: 't' }, 'Verify OTP & Create Account')
            ]),

            React.createElement('button', {
              key: 'btn-back',
              type: 'button',
              onClick: () => setStep('FORM'),
              className: 'text-xs text-slate-500 hover:text-slate-800 font-semibold'
            }, '← Change Mobile Number')
          ])
        ]),

        step === 'CHECKING_OFFICIAL' && React.createElement('div', {
          key: 'checking-screen',
          className: 'text-center py-8 space-y-4'
        }, [
          React.createElement('div', { key: 'badge-ok', className: 'text-[#007a33] font-extrabold text-base flex items-center justify-center space-x-2' }, [
            React.createElement('span', { key: 'tick', className: 'text-2xl' }, '✓'),
            React.createElement('span', { key: 't' }, 'Account Created Successfully')
          ]),

          React.createElement('div', {
            key: 'radar',
            className: 'w-16 h-16 border-4 border-[#0c4a7e] border-t-amber-400 rounded-full animate-spin mx-auto my-4'
          }),

          React.createElement('h4', { key: 'link-txt', className: 'text-base font-bold text-slate-800' },
            'Checking Official Department Data…'
          ),
          React.createElement('p', { key: 'link-sub', className: 'text-xs text-slate-500 max-w-xs mx-auto' },
            'Querying Department of School Education service abstraction...'
          )
        ]),

        step === 'SUCCESS' && React.createElement('div', {
          key: 'success-screen',
          className: 'space-y-4'
        }, [
          React.createElement('div', {
            key: 'head-badge',
            className: 'p-3 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl text-center text-[#2e7d32]'
          }, [
            React.createElement('div', { key: 't', className: 'font-extrabold text-sm' }, '✓ Account Created Successfully')
          ]),

          React.createElement('div', {
            key: 'unlinked-notice',
            className: 'bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2'
          }, [
            React.createElement('div', { key: 'warn-head', className: 'font-bold text-sm text-amber-800 flex items-center space-x-1.5' }, [
              React.createElement('span', { key: 'i' }, 'ℹ️'),
              React.createElement('span', { key: 't' }, 'Official Data Integration Notice')
            ]),
            React.createElement('p', { key: 'msg', className: 'leading-relaxed font-medium' },
              officialResult && officialResult.message
                ? officialResult.message
                : 'Official department data integration is pending. Your account has been created successfully.'
            ),
            React.createElement('p', { key: 'guide', className: 'text-slate-600 text-[11px]' },
              'Official records could not be linked yet. You can continue and contact the department for verification.'
            )
          ]),

          React.createElement('button', {
            key: 'btn-go-dash',
            onClick: () => {
              closeModal();
            },
            className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-2'
          }, [
            React.createElement('span', { key: 't' }, 'Proceed to Dashboard'),
            React.createElement('span', { key: 'a' }, '→')
          ])
        ])
      ])
    ])
  ]);
}

// ==========================================
// 11. AUTH MODALS: LOGIN WORKFLOW
// ==========================================
function LoginModal() {
  const { closeModal, openModal, loginUser } = useContext(AuthContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!mobileNumber || !password) {
      setErrorMsg("Please enter both mobile number and password.");
      return;
    }

    setLoading(true);
    const res = await loginUser(mobileNumber, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4'
  }, [
    React.createElement('div', {
      key: 'login-card',
      className: 'bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up'
    }, [
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

      React.createElement('div', { key: 'body', className: 'p-6' }, [
        errorMsg && React.createElement('div', {
          key: 'err-alert',
          className: 'mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'i' }, '❌'),
          React.createElement('span', { key: 'm' }, errorMsg)
        ]),

        React.createElement('form', {
          key: 'login-form',
          onSubmit: handleLogin,
          className: 'space-y-4'
        }, [
          React.createElement('div', { key: 'f-mob' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Registered Mobile Number *'),
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
              type: showPassword ? 'text' : 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: 'Enter your password',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0c4a7e]'
            })
          ]),

          React.createElement('div', { key: 'f-toggle', className: 'flex items-center space-x-2 text-xs text-slate-600' }, [
            React.createElement('input', {
              key: 'cb',
              type: 'checkbox',
              id: 'show-login-pwd',
              checked: showPassword,
              onChange: (e) => setShowPassword(e.target.checked),
              className: 'rounded text-[#0c4a7e]'
            }),
            React.createElement('label', { key: 'lbl', htmlFor: 'show-login-pwd' }, 'Show password')
          ]),

          React.createElement('button', {
            key: 'btn-submit',
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-60'
          }, [
            loading && React.createElement('div', { key: 'spin', className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }),
            React.createElement('span', { key: 't' }, loading ? 'Authenticating...' : 'Login')
          ]),

          React.createElement('div', { key: 'switch', className: 'text-center text-xs text-slate-600 pt-3 border-t border-slate-100' }, [
            React.createElement('span', { key: 't' }, 'New user? Do not have an account? '),
            React.createElement('button', {
              key: 'btn-to-reg',
              type: 'button',
              onClick: () => openModal('REGISTER'),
              className: 'text-[#0c4a7e] hover:underline font-bold'
            }, 'Register now')
          ])
        ])
      ])
    ])
  ]);
}

// ==========================================
// 12. AUTH MODALS: FORGOT PASSWORD WORKFLOW
// ==========================================
function ForgotPasswordModal() {
  const { closeModal, openModal, sendOtp, resetPassword } = useContext(AuthContext);
  const [step, setStep] = useState('MOBILE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = mobileNumber.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setErrorMsg("Please enter a valid 10-digit registered mobile number.");
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean, 'FORGOT_PASSWORD');
    setLoading(false);

    if (res.success) {
      setStep('OTP');
      setSuccessMsg("✓ OTP sent for password reset.");
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await resetPassword({
      mobileNumber,
      otpCode,
      newPassword,
      confirmPassword
    });
    setLoading(false);

    if (res.success) {
      setStep('DONE');
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

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
        React.createElement('h3', { key: 't', className: 'text-base font-bold' }, 'Reset Account Password'),
        React.createElement('button', { key: 'c', onClick: closeModal, className: 'text-blue-100 hover:text-white' }, '✕')
      ]),

      React.createElement('div', { key: 'fp-body', className: 'p-6' }, [
        errorMsg && React.createElement('div', {
          key: 'err',
          className: 'mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold'
        }, errorMsg),

        successMsg && React.createElement('div', {
          key: 'succ',
          className: 'mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold'
        }, successMsg),

        step === 'MOBILE' && React.createElement('form', {
          key: 'f1',
          onSubmit: handleSendResetOtp,
          className: 'space-y-4'
        }, [
          React.createElement('p', { key: 'p', className: 'text-xs text-slate-600' },
            'Enter your registered mobile number to receive a secure OTP to reset your password.'
          ),
          React.createElement('div', { key: 'inp' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Mobile Number'),
            React.createElement('input', {
              key: 'i',
              type: 'tel',
              maxLength: 10,
              value: mobileNumber,
              onChange: (e) => setMobileNumber(e.target.value.replace(/\D/g, '')),
              placeholder: '10-digit mobile number',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm'
            })
          ]),
          React.createElement('button', {
            key: 'btn',
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-[#0c4a7e] text-white font-bold py-2 rounded-lg text-sm'
          }, loading ? 'Sending OTP...' : 'Send Reset OTP')
        ]),

        step === 'OTP' && React.createElement('form', {
          key: 'f2',
          onSubmit: handleResetPassword,
          className: 'space-y-3'
        }, [
          React.createElement('div', { key: 'inp-otp' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, '6-Digit OTP'),
            React.createElement('input', {
              key: 'i',
              type: 'text',
              maxLength: 6,
              value: otpCode,
              onChange: (e) => setOtpCode(e.target.value),
              placeholder: 'Enter 6-digit OTP',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-center tracking-widest'
            })
          ]),
          React.createElement('div', { key: 'inp-np' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'New Password'),
            React.createElement('input', {
              key: 'i',
              type: 'password',
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              placeholder: 'Min 6 characters',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm'
            })
          ]),
          React.createElement('div', { key: 'inp-cp' }, [
            React.createElement('label', { key: 'l', className: 'block text-xs font-bold text-slate-700 mb-1' }, 'Confirm New Password'),
            React.createElement('input', {
              key: 'i',
              type: 'password',
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              placeholder: 'Re-enter new password',
              required: true,
              className: 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm'
            })
          ]),
          React.createElement('button', {
            key: 'btn',
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-[#007a33] text-white font-bold py-2 rounded-lg text-sm'
          }, loading ? 'Updating...' : 'Update Password')
        ]),

        step === 'DONE' && React.createElement('div', {
          key: 'f3',
          className: 'text-center space-y-4 py-4'
        }, [
          React.createElement('div', { key: 'icon', className: 'text-3xl' }, '✅'),
          React.createElement('p', { key: 'p', className: 'text-sm font-bold text-slate-800' }, 'Password Updated Successfully!'),
          React.createElement('button', {
            key: 'btn-login',
            onClick: () => openModal('LOGIN'),
            className: 'w-full bg-[#0c4a7e] text-white font-bold py-2 rounded-lg text-sm'
          }, 'Return to Login')
        ])
      ])
    ])
  ]);
}

// ==========================================
// 13. ROLE-BASED DASHBOARDS (LIGHT & DARK THEMES FULLY SUPPORTED)
// ==========================================
function RoleDashboard() {
  const { user, setCurrentView, theme, changeTheme, openModal } = useContext(AuthContext);
  const [previewRole, setPreviewRole] = useState('APO');

  const isDark = (theme === 'dark');

  // If user is authenticated, use their account; otherwise allow guest preview
  const activeUser = user || {
    id: 'DEMO-PREVIEW',
    fullName: 'Preview Visitor',
    role: previewRole,
    mobileNumber: '9876543210',
    accountStatus: 'PREVIEW_MODE',
    lastLogin: new Date().toISOString()
  };

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
        React.createElement('div', { key: 'l', className: 'flex items-center space-x-3' }, [
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
          }, `${activeUser.role} Dashboard`)
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
              onClick: () => setPreviewRole(r),
              className: `px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                previewRole === r
                  ? (isDark ? 'bg-blue-600 text-white shadow-xs' : 'bg-[#0c4a7e] text-white shadow-xs')
                  : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100')
              }`
            }, r)
          )),
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
              `${activeUser.role} • Registered Mobile: +91 ${activeUser.mobileNumber}`
            ),
            React.createElement('p', {
              key: 'inst',
              className: `text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-blue-100'}`
            }, 'Official Account Status: ACTIVE • Verified by Mobile OTP')
          ])
        ]),

        React.createElement('div', { key: 'right', className: `text-right space-y-1 text-xs ${isDark ? 'text-slate-300' : 'text-blue-100'}` }, [
          React.createElement('div', { key: 'id' }, `User ID: ${activeUser.id}`),
          React.createElement('div', { key: 'll' }, `Last Login: ${new Date(activeUser.lastLogin).toLocaleString()}`)
        ])
      ]),

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
      activeUser.role === 'Teacher' && React.createElement(TeacherModules, { key: 'teacher-mod', user: activeUser, isDark }),
      (activeUser.role === 'APO' || activeUser.role === 'DEO' || activeUser.role === 'MEO' || activeUser.role === 'Officer') && React.createElement(OfficerModules, { key: 'officer-mod', user: activeUser, isDark }),
      activeUser.role === 'School Staff' && React.createElement(SchoolStaffModules, { key: 'staff-mod', user: activeUser, isDark }),
      activeUser.role === 'Student' && React.createElement(StudentModules, { key: 'student-mod', user: activeUser, isDark }),
      (activeUser.role === 'Parent' || activeUser.role === 'Other authorized role') && React.createElement(ParentModules, { key: 'parent-mod', user: activeUser, isDark })
    ])
  ]);
}

function TeacherModules({ user, isDark }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
    React.createElement('div', {
      key: 'c1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm flex items-center space-x-2 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, [
        React.createElement('span', { key: 'i' }, '📋'),
        React.createElement('span', { key: 'txt' }, 'Teacher Transfers & Cadre')
      ]),
      React.createElement('p', { key: 'desc', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
        'Access guidelines and prepare application for upcoming teacher transfers in Jangaon District.'
      ),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'View Transfer Guidelines')
    ]),

    React.createElement('div', {
      key: 'c2',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm flex items-center space-x-2 ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, [
        React.createElement('span', { key: 'i' }, '👨‍🎓'),
        React.createElement('span', { key: 'txt' }, 'Attendance & Classroom')
      ]),
      React.createElement('p', { key: 'desc', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` },
        'Daily student attendance logging and continuous comprehensive evaluation (CCE) records.'
      ),
      React.createElement('button', {
        key: 'btn-att',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Open Attendance Portal')
    ]),

    React.createElement('div', {
      key: 'c3',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
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

function OfficerModules({ user, isDark }) {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
    React.createElement('div', {
      key: 'o1',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '🏛️ Mandal Inspection Monitoring'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Oversee school inspections across the 29 mandals of Jangaon District.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer ${
          isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-[#0c4a7e] hover:bg-[#08355b] text-white'
        }`
      }, 'Open Mandal Audit Matrix')
    ]),
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
    ]),
    React.createElement('div', {
      key: 'o3',
      className: `p-5 rounded-2xl border transition-all space-y-3 ${
        isDark ? 'bg-[#131f37] border-slate-700/80 shadow-md text-slate-100' : 'bg-white border-slate-200 shadow-xs text-slate-800'
      }`
    }, [
      React.createElement('h3', { key: 't', className: `font-bold text-sm ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` }, '👥 Teacher Vacancy Matrix'),
      React.createElement('p', { key: 'p', className: `text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}` }, 'Monitor cadre strength and teacher pupil ratio across mandals.'),
      React.createElement('button', {
        key: 'btn',
        className: `w-full font-bold py-2 rounded-lg text-xs border transition-all cursor-pointer ${
          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
        }`
      }, 'View Cadre Analytics')
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
function App() {
  const { currentView, activeModal, theme } = useContext(AuthContext);
  const [fontScale, setFontScale] = useState('md');
  const isDark = (theme === 'dark' && currentView === 'DASHBOARD');

  return React.createElement('div', {
    className: `min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      isDark ? 'bg-[#0b1329]' : 'bg-[#f0f4f8]'
    }`
  }, [
    React.createElement('div', { key: 'top-nav' }, [
      React.createElement(TopGovtBar, { fontScale, setFontScale }),
      React.createElement(MainHeader)
    ]),

    React.createElement('main', { key: 'main-content', className: 'flex-1' }, [
      currentView === 'PORTAL' ? (
        React.createElement('div', { key: 'portal-view' }, [
          React.createElement(HeroBanner),
          React.createElement(StatsRibbon),
          React.createElement(QuickServices),
          React.createElement(PortalCardsGrid)
        ])
      ) : (
        React.createElement(RoleDashboard, { key: 'dash-view' })
      )
    ]),

    React.createElement(OfficialFooter, { key: 'footer' }),

    activeModal === 'REGISTER' && React.createElement(RegisterModal, { key: 'reg-modal' }),
    activeModal === 'LOGIN' && React.createElement(LoginModal, { key: 'login-modal' }),
    activeModal === 'FORGOT' && React.createElement(ForgotPasswordModal, { key: 'forgot-modal' }),

    React.createElement(DevOtpToast, { key: 'otp-toast' })
  ]);
}

// ==========================================
// 15. INITIALIZE REACT 18 ROOT
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(App)
      )
    );
  }
});
