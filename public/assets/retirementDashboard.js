// District Educational Office, Jangaon - Employee Retirement Management Dashboard
// Automatically calculates employee retirements dynamically based on stored retirement date.
// Real-time calculation: This Month, Every Month, This Year, Every Year, Upcoming Retirements, and Retired Archive.

(function () {
  const { useState, useEffect, useMemo } = React;
  const h = React.createElement;

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  function formatNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-IN');
  }

  function RetirementDashboardView({ user, isDark, onBack }) {
    const [loading, setLoading] = useState(true);
    const [retData, setRetData] = useState({
      teachers: [],
      total: 0,
      summary: {},
      filterOptions: {}
    });
    const [apiError, setApiError] = useState(null);

    // Current date reference (dynamic)
    const today = useMemo(() => new Date(), []);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // View mode: 'THIS_MONTH' | 'EVERY_MONTH' | 'THIS_YEAR' | 'EVERY_YEAR' | 'UPCOMING' | 'RETIRED'
    const [activeMode, setActiveMode] = useState('THIS_MONTH');

    // Filter states
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedMandal, setSelectedMandal] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Selected teacher for viewing profile modal/view
    const [selectedTeacherCode, setSelectedTeacherCode] = useState(null);

    const userRole = (user?.role || '').toUpperCase();
    const isMeo = (userRole === 'MEO');
    const userMandal = user?.mandal ? user.mandal.toUpperCase() : null;

    // Fetch retirements from backend
    const fetchRetirements = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const apiBase = (typeof window !== 'undefined' && window.PORTAL_API_BASE)
          ? String(window.PORTAL_API_BASE).replace(/\/$/, '')
          : '';

        const params = new URLSearchParams();
        params.set('mode', activeMode);
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
        if (selectedMandal && selectedMandal !== 'ALL') {
          params.set('mandal', selectedMandal);
        }
        if (searchTerm && searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        }
        params.set('page', String(currentPage));
        params.set('limit', String(itemsPerPage));

        const res = await fetch(`${apiBase}/api/teachers/retirements?${params.toString()}`, {
          credentials: 'include',
          headers: {
            ...(user?.accountStatus === 'PREVIEW_MODE' ? {
              'x-preview-role': user.role,
              'x-preview-mandal': user.mandal || ''
            } : {})
          }
        });

        const data = await res.json();
        if (data.success) {
          setRetData(data);
        } else {
          setApiError(data.message || 'Failed to retrieve retirement data.');
        }
      } catch (err) {
        setApiError('Network error connecting to retirement service: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchRetirements();
    }, [activeMode, selectedYear, selectedMonth, selectedMandal, currentPage, itemsPerPage]);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      setCurrentPage(1);
      fetchRetirements();
    };

    // If viewing individual teacher profile
    if (selectedTeacherCode) {
      const ProfileComponent = window.IndividualTeacherProfileView || window.TeacherServiceRecordView;
      if (ProfileComponent) {
        return h(ProfileComponent, {
          user,
          isDark,
          treasuryCode: selectedTeacherCode,
          onBack: () => setSelectedTeacherCode(null)
        });
      }
    }

    const summary = retData.summary || {};
    const teachersList = retData.teachers || [];
    const totalCount = retData.total || 0;
    const totalPages = retData.totalPages || 1;
    const availableYears = summary.availableYears || [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
    const monthCountsForSelectedYear = summary.monthCountsForSelectedYear || {};
    const availableMandals = retData.filterOptions?.mandals || [];

    // Helper to badge days remaining
    function renderDaysRemainingBadge(t) {
      if (t.status === 'RETIRED') {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        }, [
          h('span', { className: 'mr-1' }, '⏹️'),
          `Retired (${t.daysAgo}d ago)`
        ]);
      }

      const days = t.daysRemaining;
      if (days === 0) {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 animate-pulse'
        }, [
          h('span', { className: 'mr-1' }, '🔔'),
          'Retiring Today'
        ]);
      } else if (days <= 30) {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 ring-1 ring-red-400'
        }, [
          h('span', { className: 'mr-1' }, '⚠️'),
          `${days} days (${t.detailedRemaining})`
        ]);
      } else if (days <= 90) {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        }, [
          h('span', { className: 'mr-1' }, '⏳'),
          `${days} days (${t.detailedRemaining})`
        ]);
      } else if (days <= 365) {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
        }, [
          h('span', { className: 'mr-1' }, '📅'),
          `${days} days (${t.detailedRemaining})`
        ]);
      } else {
        return h('span', {
          className: 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        }, [
          h('span', { className: 'mr-1' }, '🌱'),
          `${days} days (${t.detailedRemaining})`
        ]);
      }
    }

    return h('div', { className: 'space-y-6 max-w-7xl mx-auto pb-12' }, [

      // Top Breadcrumb & Controls Bar
      h('div', { className: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b dark:border-slate-700' }, [
        h('div', { className: 'flex items-center space-x-3' }, [
          h('button', {
            onClick: onBack,
            className: 'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100'
          }, [
            h('span', {}, '←'),
            h('span', {}, 'Dashboard Overview')
          ]),
          h('div', {}, [
            h('h1', { className: 'text-xl font-black text-[#0c4a7e] dark:text-sky-300 flex items-center space-x-2' }, [
              h('span', {}, '⏳'),
              h('span', {}, 'Employee Retirement Management')
            ]),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              isMeo
                ? `Authorized MEO: ${userMandal} Mandal — Dynamic Retirement Schedules & Daily Countdown`
                : 'District Educational Office, Jangaon — District-Wide Automated Retirement Tracking'
            )
          ])
        ]),

        // Current Date Indicator & Badge
        h('div', { className: 'flex items-center space-x-2 text-xs' }, [
          h('span', {
            className: 'px-3 py-1.5 rounded-lg font-bold bg-blue-50 text-[#0c4a7e] border border-blue-200 dark:bg-[#0f243d] dark:text-blue-300 dark:border-blue-900 flex items-center space-x-1.5'
          }, [
            h('span', {}, '📆'),
            h('span', {}, `Today: ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`)
          ]),
          h('span', {
            className: `px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] ${
              isMeo ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
            }`
          }, userRole)
        ])
      ]),

      // 4 Top Statistic Summary Cards (Interactive - clicking sets activeMode)
      h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }, [
        // Card 1: This Month
        h('div', {
          onClick: () => { setActiveMode('THIS_MONTH'); setCurrentPage(1); },
          className: `p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${
            activeMode === 'THIS_MONTH'
              ? 'border-red-500 bg-red-50/70 dark:bg-red-950/40 dark:border-red-500 ring-2 ring-red-400/40'
              : 'border-slate-200 bg-white dark:bg-[#131f37] dark:border-slate-700 hover:border-red-300'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider' }, `Retiring This Month`),
            h('span', { className: 'text-2xl' }, '🗓️')
          ]),
          h('div', { className: 'mt-2 text-2xl font-black text-red-600 dark:text-red-300' }, formatNum(summary.thisMonthCount)),
          h('div', { className: 'mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium' },
            `${MONTH_NAMES[currentMonth - 1]} ${currentYear} retirements`
          )
        ]),

        // Card 2: This Year
        h('div', {
          onClick: () => { setActiveMode('THIS_YEAR'); setSelectedYear(currentYear); setCurrentPage(1); },
          className: `p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${
            activeMode === 'THIS_YEAR'
              ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 dark:border-amber-500 ring-2 ring-amber-400/40'
              : 'border-slate-200 bg-white dark:bg-[#131f37] dark:border-slate-700 hover:border-amber-300'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider' }, `Retiring This Year (${currentYear})`),
            h('span', { className: 'text-2xl' }, '📆')
          ]),
          h('div', { className: 'mt-2 text-2xl font-black text-amber-600 dark:text-amber-300' }, formatNum(summary.thisYearCount)),
          h('div', { className: 'mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium' },
            'Complete current year schedule'
          )
        ]),

        // Card 3: Upcoming Retirements
        h('div', {
          onClick: () => { setActiveMode('UPCOMING'); setCurrentPage(1); },
          className: `p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${
            activeMode === 'UPCOMING'
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-400/40'
              : 'border-slate-200 bg-white dark:bg-[#131f37] dark:border-slate-700 hover:border-blue-300'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider' }, 'Upcoming Retirements'),
            h('span', { className: 'text-2xl' }, '⏳')
          ]),
          h('div', { className: 'mt-2 text-2xl font-black text-[#0c4a7e] dark:text-blue-300' }, formatNum(summary.upcomingCount)),
          h('div', { className: 'mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium' },
            'Daily auto-countdown to retirement'
          )
        ]),

        // Card 4: Retired Personnel
        h('div', {
          onClick: () => { setActiveMode('RETIRED'); setCurrentPage(1); },
          className: `p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${
            activeMode === 'RETIRED'
              ? 'border-slate-500 bg-slate-100 dark:bg-slate-800/80 dark:border-slate-400 ring-2 ring-slate-400/40'
              : 'border-slate-200 bg-white dark:bg-[#131f37] dark:border-slate-700 hover:border-slate-400'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider' }, 'Retired Personnel'),
            h('span', { className: 'text-2xl' }, '✅')
          ]),
          h('div', { className: 'mt-2 text-2xl font-black text-slate-700 dark:text-slate-200' }, formatNum(summary.retiredCount)),
          h('div', { className: 'mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium' },
            'Automatically moved to retired archive'
          )
        ])
      ]),

      // Interactive Mode Selection Tabs
      h('div', {
        className: 'flex items-center space-x-2 overflow-x-auto pb-2 border-b dark:border-slate-700'
      }, [
        [
          { id: 'THIS_MONTH', label: '🗓️ This Month', desc: 'Retiring in current month' },
          { id: 'EVERY_MONTH', label: '📅 Every Month', desc: 'Select any month & year' },
          { id: 'THIS_YEAR', label: '📆 This Year', desc: 'Full current year schedule' },
          { id: 'EVERY_YEAR', label: '📊 Every Year', desc: 'Select any year' },
          { id: 'UPCOMING', label: '⏳ Upcoming Retirements', desc: 'Closest countdowns' },
          { id: 'RETIRED', label: '✅ Retired Archive', desc: 'Past retirements' }
        ].map(tab => {
          const isActive = activeMode === tab.id;
          return h('button', {
            key: tab.id,
            onClick: () => {
              setActiveMode(tab.id);
              setCurrentPage(1);
            },
            className: `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              isActive
                ? 'bg-[#0c4a7e] text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`
          }, [
            h('span', {}, tab.label)
          ]);
        })
      ]),

      // Month-Wise Breakdown Bar (Visible when in THIS_YEAR or EVERY_YEAR mode)
      (activeMode === 'THIS_YEAR' || activeMode === 'EVERY_YEAR') && h('div', {
        className: 'p-4 rounded-2xl border bg-white dark:bg-[#131f37] border-slate-200 dark:border-slate-700 shadow-xs space-y-3'
      }, [
        h('div', { className: 'flex items-center justify-between flex-wrap gap-2' }, [
          h('div', { className: 'flex items-center space-x-2' }, [
            h('span', { className: 'text-sm font-bold text-[#0c4a7e] dark:text-sky-300' },
              `Month-Wise Breakdown for ${activeMode === 'THIS_YEAR' ? currentYear : selectedYear}`
            ),
            h('span', { className: 'text-xs text-slate-500 dark:text-slate-400' },
              `(Click any month to view only that month)`
            )
          ]),
          activeMode === 'EVERY_YEAR' && h('div', { className: 'flex items-center space-x-2 text-xs font-semibold' }, [
            h('span', {}, 'Select Year:'),
            h('select', {
              value: selectedYear,
              onChange: (e) => {
                setSelectedYear(parseInt(e.target.value, 10));
                setCurrentPage(1);
              },
              className: 'p-1.5 rounded-lg border text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }, availableYears.map(y => h('option', { key: y, value: y }, y)))
          ])
        ]),

        // 12 Months Chips
        h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2' },
          MONTH_SHORT.map((mName, idx) => {
            const mNum = idx + 1;
            const count = monthCountsForSelectedYear[mNum] || 0;
            const isSelected = (activeMode === 'EVERY_MONTH' && selectedMonth === mNum);
            const isCurrentMonth = (mNum === currentMonth && (activeMode === 'THIS_YEAR' ? currentYear : selectedYear) === currentYear);

            return h('button', {
              key: mName,
              onClick: () => {
                setSelectedMonth(mNum);
                setActiveMode('EVERY_MONTH');
                setCurrentPage(1);
              },
              className: `p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-[#0c4a7e] text-white border-[#0c4a7e] shadow-sm font-bold'
                  : count > 0
                  ? isCurrentMonth
                    ? 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800 hover:scale-105'
                    : 'bg-blue-50 text-[#0c4a7e] border-blue-200 dark:bg-[#162744] dark:text-blue-300 dark:border-blue-900 hover:scale-105'
                  : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-600 dark:border-slate-800'
              }`
            }, [
              h('span', { className: 'text-[11px] font-bold uppercase' }, mName),
              h('span', { className: `text-sm font-black mt-0.5 ${count > 0 ? '' : 'text-slate-300 dark:text-slate-700'}` }, count)
            ]);
          })
        )
      ]),

      // Interactive Filters & Search Box
      h('div', {
        className: 'p-4 rounded-2xl border bg-white dark:bg-[#131f37] border-slate-200 dark:border-slate-700 shadow-xs space-y-4'
      }, [
        h('form', {
          onSubmit: handleSearchSubmit,
          className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end'
        }, [

          // Mode-specific Month selector (when in EVERY_MONTH mode)
          activeMode === 'EVERY_MONTH' ? h('div', { className: 'space-y-1' }, [
            h('label', { className: 'text-xs font-bold text-slate-600 dark:text-slate-300' }, 'Select Month'),
            h('select', {
              value: selectedMonth,
              onChange: (e) => { setSelectedMonth(parseInt(e.target.value, 10)); setCurrentPage(1); },
              className: 'w-full p-2 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }, MONTH_NAMES.map((m, idx) => h('option', { key: m, value: idx + 1 }, `${m} (${monthCountsForSelectedYear[idx + 1] || 0})`)))
          ]) : null,

          // Mode-specific Year selector (when in EVERY_MONTH or EVERY_YEAR mode)
          (activeMode === 'EVERY_MONTH' || activeMode === 'EVERY_YEAR') ? h('div', { className: 'space-y-1' }, [
            h('label', { className: 'text-xs font-bold text-slate-600 dark:text-slate-300' }, 'Select Year'),
            h('select', {
              value: selectedYear,
              onChange: (e) => { setSelectedYear(parseInt(e.target.value, 10)); setCurrentPage(1); },
              className: 'w-full p-2 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }, availableYears.map(y => h('option', { key: y, value: y }, y)))
          ]) : null,

          // Mandal Filter (Locked for MEO)
          h('div', { className: 'space-y-1' }, [
            h('label', { className: 'text-xs font-bold text-slate-600 dark:text-slate-300' }, 'Filter by Mandal'),
            isMeo ? h('input', {
              type: 'text',
              value: userMandal,
              disabled: true,
              className: 'w-full p-2 rounded-xl border text-xs font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-300 dark:border-slate-600 cursor-not-allowed'
            }) : h('select', {
              value: selectedMandal,
              onChange: (e) => { setSelectedMandal(e.target.value); setCurrentPage(1); },
              className: 'w-full p-2 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
            }, [
              h('option', { value: 'ALL' }, 'All 12 Mandals'),
              availableMandals.map(m => h('option', { key: m, value: m }, m))
            ])
          ]),

          // Search term input
          h('div', { className: 'space-y-1 sm:col-span-2' }, [
            h('label', { className: 'text-xs font-bold text-slate-600 dark:text-slate-300' }, 'Search Teacher / Treasury / School'),
            h('div', { className: 'relative' }, [
              h('input', {
                type: 'text',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                placeholder: 'Search by Treasury Code, Name, School Name...',
                className: 'w-full p-2 pl-8 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
              }),
              h('span', { className: 'absolute left-2.5 top-2.5 text-xs text-slate-400' }, '🔍')
            ])
          ]),

          // Action buttons
          h('div', { className: 'flex items-center space-x-2' }, [
            h('button', {
              type: 'submit',
              className: 'px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-xs'
            }, 'Filter'),
            h('button', {
              type: 'button',
              onClick: () => {
                setSearchTerm('');
                setSelectedMandal('ALL');
                if (activeMode === 'EVERY_MONTH') {
                  setSelectedYear(currentYear);
                  setSelectedMonth(currentMonth);
                }
                setCurrentPage(1);
              },
              className: 'px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer'
            }, 'Reset')
          ])
        ])
      ]),

      // Active Filter Subtitle Bar
      h('div', { className: 'flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1' }, [
        h('div', { className: 'font-semibold flex items-center space-x-1.5' }, [
          h('span', {}, 'Showing:'),
          h('span', { className: 'font-bold text-[#0c4a7e] dark:text-sky-300' },
            activeMode === 'THIS_MONTH'
              ? `Retiring This Month (${MONTH_NAMES[currentMonth - 1]} ${currentYear})`
              : activeMode === 'EVERY_MONTH'
              ? `Retirements in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`
              : activeMode === 'THIS_YEAR'
              ? `All Retirements in Current Year (${currentYear})`
              : activeMode === 'EVERY_YEAR'
              ? `All Retirements in Year ${selectedYear}`
              : activeMode === 'UPCOMING'
              ? 'All Upcoming Retirements (Nearest First)'
              : 'Retired Personnel Archive'
          ),
          h('span', {}, `— (${formatNum(totalCount)} records)`)
        ]),
        h('div', { className: 'flex items-center space-x-2' }, [
          h('span', {}, 'Rows per page:'),
          h('select', {
            value: itemsPerPage,
            onChange: (e) => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); },
            className: 'p-1 rounded-md border text-xs bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
          }, [10, 25, 50, 100].map(n => h('option', { key: n, value: n }, n)))
        ])
      ]),

      // API Error alert
      apiError && h('div', {
        className: 'p-4 rounded-xl text-xs font-semibold bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900'
      }, `⚠️ ${apiError}`),

      // Loading state
      loading ? h('div', { className: 'p-12 text-center text-xs font-semibold text-slate-500' }, [
        h('div', { className: 'w-8 h-8 border-3 border-[#0c4a7e] border-t-transparent rounded-full animate-spin mx-auto mb-3' }),
        h('span', {}, 'Calculating dynamic retirement schedules...')
      ]) : (
        // Main Data Table
        h('div', {
          className: 'rounded-2xl border bg-white dark:bg-[#131f37] border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden'
        }, [
          h('div', { className: 'overflow-x-auto' }, [
            h('table', { className: 'w-full text-left text-xs border-collapse' }, [
              h('thead', { className: 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]' }, [
                h('tr', {}, [
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center w-12' }, '#'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[100px]' }, 'Treasury Code'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[180px]' }, "Teacher's Name"),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[110px]' }, 'Designation'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[130px]' }, 'Mandal'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[200px]' }, 'School Name'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center min-w-[100px]' }, 'Date of Birth'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center min-w-[110px]' }, 'Retirement Date'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[160px]' }, 'Countdown / Time Left'),
                  h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center min-w-[90px]' }, 'Status'),
                  h('th', { className: 'p-3 font-bold border-b dark:border-slate-700 text-center min-w-[110px]' }, 'Action')
                ])
              ]),
              h('tbody', { className: 'divide-y divide-slate-200 dark:divide-slate-800' },
                teachersList.length === 0 ? [
                  h('tr', { key: 'empty' }, [
                    h('td', {
                      colSpan: 11,
                      className: 'p-8 text-center text-slate-500 dark:text-slate-400 font-semibold'
                    }, 'No retirement records found matching the selected filter criteria.')
                  ])
                ] : teachersList.map((t, idx) => {
                  const sNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isRet = (t.status === 'RETIRED');

                  return h('tr', {
                    key: t.treasuryCode,
                    className: `hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isRet ? 'opacity-85' : ''
                    }`
                  }, [
                    h('td', { className: 'p-3 text-center text-slate-500 font-mono border-r dark:border-slate-700' }, sNo),
                    h('td', { className: 'p-3 font-mono font-bold text-[#0c4a7e] dark:text-sky-300 border-r dark:border-slate-700' }, t.treasuryCode),
                    h('td', { className: 'p-3 font-semibold text-slate-900 dark:text-slate-100 border-r dark:border-slate-700' }, [
                      h('div', {}, t.teacherName),
                      h('div', { className: 'text-[10px] text-slate-400' }, t.gender || '-')
                    ]),
                    h('td', { className: 'p-3 font-medium text-slate-700 dark:text-slate-300 border-r dark:border-slate-700' }, t.designation || '-'),
                    h('td', { className: 'p-3 text-slate-700 dark:text-slate-300 border-r dark:border-slate-700' }, t.mandal || '-'),
                    h('td', { className: 'p-3 text-slate-700 dark:text-slate-300 border-r dark:border-slate-700' }, t.schoolName || '-'),
                    h('td', { className: 'p-3 text-center font-mono text-slate-600 dark:text-slate-400 border-r dark:border-slate-700' }, t.dateOfBirth || '-'),
                    h('td', { className: 'p-3 text-center font-mono font-bold text-[#0c4a7e] dark:text-sky-300 border-r dark:border-slate-700' }, t.dateOfRetirement || '-'),
                    h('td', { className: 'p-3 border-r dark:border-slate-700' }, renderDaysRemainingBadge(t)),
                    h('td', { className: 'p-3 text-center border-r dark:border-slate-700' }, [
                      h('span', {
                        className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRet
                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`
                      }, t.status)
                    ]),
                    h('td', { className: 'p-3 text-center' }, [
                      h('button', {
                        onClick: () => setSelectedTeacherCode(t.treasuryCode),
                        className: 'px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all shadow-xs cursor-pointer inline-flex items-center space-x-1'
                      }, [
                        h('span', {}, '👁️'),
                        h('span', {}, 'Profile')
                      ])
                    ])
                  ]);
                })
              )
            ])
          ]),

          // Pagination Bar
          totalPages > 1 && h('div', {
            className: 'p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs'
          }, [
            h('div', { className: 'text-slate-500 dark:text-slate-400' },
              `Page ${currentPage} of ${totalPages} (Total ${formatNum(totalCount)} employees)`
            ),
            h('div', { className: 'flex items-center space-x-1.5' }, [
              h('button', {
                disabled: currentPage <= 1,
                onClick: () => setCurrentPage(1),
                className: 'px-2.5 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold'
              }, '« First'),
              h('button', {
                disabled: currentPage <= 1,
                onClick: () => setCurrentPage(p => Math.max(1, p - 1)),
                className: 'px-2.5 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold'
              }, '‹ Prev'),
              h('span', { className: 'px-3 font-bold text-[#0c4a7e] dark:text-sky-300' }, currentPage),
              h('button', {
                disabled: currentPage >= totalPages,
                onClick: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                className: 'px-2.5 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold'
              }, 'Next ›'),
              h('button', {
                disabled: currentPage >= totalPages,
                onClick: () => setCurrentPage(totalPages),
                className: 'px-2.5 py-1 rounded border bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold'
              }, 'Last »')
            ])
          ])
        ])
      )
    ]);
  }

  window.RetirementDashboardView = RetirementDashboardView;
})();
