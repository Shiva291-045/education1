// District Educational Office, Jangaon - Teachers Information Dashboard
// Complete Directory with Strict RBAC (DEO All District, MEO Assigned Mandal Only)
// Seamless Transition to Individual Teacher Profile with 100% Reference Form Matching

(function () {
  const { useState, useEffect, useMemo } = React;
  const h = React.createElement;

  function formatNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-IN');
  }

  function TeachersInformationDashboardView({ user, isDark, onBack }) {
    const [loading, setLoading] = useState(true);
    const [teachersData, setTeachersData] = useState({ teachers: [], total: 0, filterOptions: {} });
    const [apiError, setApiError] = useState(null);

    // Filter and search state
    const [selectedMandal, setSelectedMandal] = useState('ALL');
    const [selectedDesignation, setSelectedDesignation] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Individual Teacher Profile view state
    const [selectedTeacherCode, setSelectedTeacherCode] = useState(null);

    const userRole = (user?.role || '').toUpperCase();
    const isTeacher = (userRole === 'TEACHER');
    const isDeoOrApo = (userRole === 'DEO' || userRole === 'APO' || userRole === 'OFFICER');
    const isMeo = (userRole === 'MEO');
    const isAuthorized = isDeoOrApo || isMeo;
    const userMandal = user?.mandal ? user.mandal.toUpperCase() : (isMeo ? 'JANGAON' : null);

    // Strict Frontend Access Control: Block unauthorized users and teachers
    if (!isAuthorized) {
      return h('div', {
        className: 'min-h-[450px] flex items-center justify-center p-6'
      }, [
        h('div', {
          key: 'denied-card',
          className: `max-w-md w-full p-8 rounded-2xl border text-center space-y-4 shadow-xl ${
            isDark ? 'bg-slate-900 border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-800'
          }`
        }, [
          h('div', { key: 'i', className: 'w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold' }, '🔒'),
          h('h2', { key: 't', className: 'text-xl font-black text-red-600 dark:text-red-400' }, '403 — Access Denied'),
          h('p', { key: 'st', className: 'text-sm font-bold text-slate-800 dark:text-slate-100' }, 'Protected Officer Feature: Teachers Information'),
          h('p', { key: 'desc', className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed' },
            isTeacher
              ? 'Teachers cannot access the administrative Teachers Information directory. You can view your personal service record from your Teacher Dashboard.'
              : 'Teachers Information records are strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official login.'
          ),
          onBack && h('button', {
            key: 'btn',
            onClick: onBack,
            className: 'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-md'
          }, '← Return to Dashboard Overview')
        ])
      ]);
    }

    // Fetch teachers list from backend API
    const fetchTeachers = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const apiBase = (typeof window !== 'undefined' && window.PORTAL_API_BASE)
          ? String(window.PORTAL_API_BASE).replace(/\/$/, '')
          : '';

        const params = new URLSearchParams();
        if (isMeo) {
          params.append('mandal', userMandal);
        } else if (selectedMandal !== 'ALL') {
          params.append('mandal', selectedMandal);
        }
        if (selectedDesignation !== 'ALL') {
          params.append('designation', selectedDesignation);
        }
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);

        const res = await fetch(`${apiBase}/api/teachers?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.accountStatus === 'PREVIEW_MODE' ? {
              'x-preview-role': user.role,
              'x-preview-mandal': user.mandal || ''
            } : {})
          }
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Error ${res.status}: Failed to fetch teachers`);
        }

        setTeachersData(json);
      } catch (err) {
        setApiError(err.message || 'Error connecting to teachers database.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (isMeo && selectedMandal !== userMandal) {
        setSelectedMandal(userMandal);
      }
      fetchTeachers();
    }, [selectedMandal, selectedDesignation, currentPage, isMeo, userMandal]);

    // Handle Search Submission / Trigger
    const handleSearchSubmit = (e) => {
      e.preventDefault();
      setCurrentPage(1);
      fetchTeachers();
    };

    // If an individual teacher is selected, render their complete profile!
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

    const teachersList = teachersData.teachers || [];
    const totalTeachers = teachersData.total || 0;
    const filterOptions = teachersData.filterOptions || {};
    const availableMandals = filterOptions.mandals || [];
    const availableDesignations = filterOptions.designations || [];

    // Calculate Cadre Breakdown for Stat Cards
    const stats = useMemo(() => {
      let saCount = 0;
      let sgtCount = 0;
      let othersCount = 0;
      teachersList.forEach(t => {
        const d = (t.designation || '').toUpperCase();
        if (d.includes('SA ') || d.includes('SCHOOL ASSISTANT')) saCount++;
        else if (d.includes('SGT')) sgtCount++;
        else othersCount++;
      });
      return { saCount, sgtCount, othersCount };
    }, [teachersList]);

    return h('div', {
      className: `min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 transition-colors ${
        isDark ? 'bg-[#0b1329] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`
    }, [
      // 1. TOP HEADER & NAVIGATION BAR
      h('div', {
        key: 'top-nav',
        className: `p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
        }`
      }, [
        h('div', { key: 'h-left', className: 'flex items-center space-x-3' }, [
          onBack && h('button', {
            key: 'btn-back',
            onClick: onBack,
            className: `p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`
          }, [
            h('span', { key: 'i' }, '←'),
            h('span', { key: 't' }, 'Back to Overview')
          ]),
          h('div', { key: 'titles' }, [
            h('div', { key: 'badge', className: 'flex items-center space-x-2' }, [
              h('span', {
                key: 'tag',
                className: 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }, isMeo ? 'Mandal Educational Office' : 'District Educational Office'),
              h('span', {
                key: 'dist',
                className: 'text-xs font-bold text-sky-600 dark:text-sky-400'
              }, isMeo ? `Mandal : ${userMandal} • Assigned Login` : 'District : Jangaon • Protected Directory')
            ]),
            h('h1', {
              key: 'title',
              className: `text-lg sm:text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-[#0c4a7e]'}`
            }, isMeo ? `Teachers Information — ${userMandal} Mandal` : 'Teachers Information — Jangaon District Directory')
          ])
        ]),

        h('div', { key: 'h-right', className: 'flex items-center flex-wrap gap-2' }, [
          // Print / Export Button
          h('button', {
            key: 'btn-print',
            onClick: () => window.print(),
            className: `px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`
          }, [
            h('span', { key: 'icon' }, '🖨️'),
            h('span', { key: 'text' }, 'Print Directory View')
          ]),
          // Refresh Button
          h('button', {
            key: 'btn-refresh',
            onClick: fetchTeachers,
            disabled: loading,
            className: `px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
              loading ? 'bg-sky-400 cursor-not-allowed' : 'bg-[#0c4a7e] hover:bg-[#08355b]'
            }`
          }, loading ? 'Refreshing...' : '🔄 Refresh Data')
        ])
      ]),

      // 2. STRICT ROLE ACCESS NOTICE BANNER
      h('div', {
        key: 'rbac-banner',
        className: `p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isMeo
            ? (isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
            : (isDark ? 'bg-blue-950/40 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900')
        }`
      }, [
        h('div', { key: 'b-left', className: 'flex items-center space-x-2.5' }, [
          h('span', { key: 'icon', className: 'text-base sm:text-lg' }, isMeo ? '🏫' : '🏛️'),
          h('div', { key: 'text' }, [
            h('div', { key: 't1', className: 'font-bold' },
              isMeo
                ? `Mandal Educational Officer (${userMandal}): Authorized Login (${user?.mobileNumber || user?.name || 'MEO'})`
                : `District Educational Office Administration: ${userRole || 'DEO / APO'}`
            ),
            h('div', { key: 't2', className: 'opacity-90 mt-0.5' },
              isMeo
                ? `You are authorized to view individual teacher profiles exclusively for ${userMandal} Mandal through your official login. Access to other mandals is strictly prohibited.`
                : 'Protected Dashboard Feature: Complete district authority to view, search, filter, and inspect individual teacher profiles across all 12 mandals.'
            )
          ])
        ]),

        h('div', { key: 'b-right', className: 'flex items-center space-x-2 self-end sm:self-center' }, [
          h('span', {
            key: 'tag',
            className: `px-2.5 py-1 rounded-full font-bold uppercase tracking-wide text-[10px] ${
              isMeo
                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                : 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
            }`
          }, isMeo ? `${userMandal} MANDAL ONLY • 🔐 PROTECTED` : 'DISTRICT ALL MANDALS • AUTHORIZED')
        ])
      ]),

      // 3. STATISTIC CARDS
      h('div', {
        key: 'stat-cards-grid',
        className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
      }, [
        // Card 1: Total Registered Teachers
        h('div', {
          key: 'c-total',
          className: `p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Total Teachers'),
            h('span', { className: 'p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-sm' }, '👨‍🏫')
          ]),
          h('div', { className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400' }, formatNum(totalTeachers)),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              isMeo ? `Teachers in Mandal ${userMandal}` : 'Total Active District Cadre'
            )
          ]),
          h('div', { className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500' }, [
            h('span', {}, 'Verified in Department DB'),
            h('span', { className: 'text-emerald-600 font-bold' }, '100% Synced')
          ])
        ]),

        // Card 2: School Assistants (SA)
        h('div', {
          key: 'c-sa',
          className: `p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'School Assistants (SA)'),
            h('span', { className: 'p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-sm' }, '📐')
          ]),
          h('div', { className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400' }, formatNum(stats.saCount)),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' }, 'Maths, Phys Sci, Bio Sci, Social, Langs')
          ]),
          h('div', { className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500' }, [
            h('span', {}, 'High School / UPS Posts'),
            h('span', { className: 'text-teal-600 font-semibold' }, 'Active Cadre')
          ])
        ]),

        // Card 3: Secondary Grade Teachers (SGT)
        h('div', {
          key: 'c-sgt',
          className: `p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Secondary Grade (SGT)'),
            h('span', { className: 'p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm' }, '📚')
          ]),
          h('div', { className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400' }, formatNum(stats.sgtCount)),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' }, 'Primary School Teaching Posts')
          ]),
          h('div', { className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500' }, [
            h('span', {}, 'Classes 1–5 Foundation'),
            h('span', { className: 'text-amber-600 font-semibold' }, 'Primary Cadre')
          ])
        ]),

        // Card 4: Other Specialized Cadres
        h('div', {
          key: 'c-oth',
          className: `p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Other Cadres'),
            h('span', { className: 'p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-sm' }, '⭐')
          ]),
          h('div', { className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400' }, formatNum(stats.othersCount)),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' }, 'Headmasters, PETs, Lang Pandits')
          ]),
          h('div', { className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500' }, [
            h('span', {}, 'Administrative & Special'),
            h('span', { className: 'text-purple-600 font-semibold' }, 'Special Cadres')
          ])
        ])
      ]),

      // 4. INTERACTIVE DYNAMIC FILTERS & SEARCH BAR
      h('div', {
        key: 'filters-bar',
        className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${
          isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
        }`
      }, [
        h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800' }, [
          h('div', { className: 'flex items-center space-x-2' }, [
            h('span', { className: 'text-base' }, '🔍'),
            h('h2', { className: `text-sm font-bold uppercase tracking-wider ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              'Search & Filter Teacher Profiles'
            )
          ]),
          h('div', { className: 'text-[11px] text-slate-500 dark:text-slate-400 italic' },
            'Search by Treasury Code, Name, School Name, or Registered Mobile Number.'
          )
        ]),

        h('form', {
          onSubmit: handleSearchSubmit,
          className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'
        }, [
          // Filter 1: Mandal
          h('div', { key: 'f-mandal' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1' }, [
              'Mandal ',
              isMeo && h('span', { className: 'text-amber-500 text-[10px] font-normal' }, '(Locked to Assigned)')
            ]),
            h('select', {
              value: selectedMandal,
              disabled: isMeo,
              onChange: (e) => {
                setSelectedMandal(e.target.value);
                setCurrentPage(1);
              },
              className: `w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0c4a7e] ${
                isMeo
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                  : (isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300')
              }`
            }, [
              !isMeo && h('option', { key: 'all', value: 'ALL' }, '— All 12 Mandals (District View) —'),
              availableMandals.map(m => h('option', { key: m, value: m }, m))
            ])
          ]),

          // Filter 2: Designation
          h('div', { key: 'f-desig' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1' }, 'Designation / Cadre'),
            h('select', {
              value: selectedDesignation,
              onChange: (e) => {
                setSelectedDesignation(e.target.value);
                setCurrentPage(1);
              },
              className: `w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0c4a7e] ${
                isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
              }`
            }, [
              h('option', { key: 'all', value: 'ALL' }, '— All Designations —'),
              availableDesignations.map(d => h('option', { key: d, value: d }, d))
            ])
          ]),

          // Filter 3: Search keyword
          h('div', { key: 'f-search', className: 'sm:col-span-2' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1' }, 'Search Keyword'),
            h('div', { className: 'flex rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden' }, [
              h('input', {
                type: 'text',
                placeholder: 'Enter Treasury Code, Teacher Name, or School...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: `flex-1 px-3 py-2 text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                }`
              }),
              searchTerm && h('button', {
                type: 'button',
                onClick: () => {
                  setSearchTerm('');
                  setCurrentPage(1);
                },
                className: 'px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }, '✕'),
              h('button', {
                type: 'submit',
                className: 'px-4 py-2 bg-[#0c4a7e] hover:bg-[#08355b] text-white text-xs font-bold transition-all cursor-pointer'
              }, 'Search')
            ])
          ])
        ]),

        // Active criteria and reset button
        h('div', { className: 'flex flex-wrap items-center justify-between gap-2 pt-2 text-xs' }, [
          h('div', { className: 'flex flex-wrap items-center gap-1.5' }, [
            h('span', { className: 'text-slate-500 font-semibold' }, 'Active Criteria:'),
            h('span', {
              className: 'px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
            }, `Mandal: ${selectedMandal}`),
            h('span', {
              className: 'px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
            }, `Designation: ${selectedDesignation}`),
            searchTerm && h('span', {
              className: 'px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-medium'
            }, `Search: "${searchTerm}"`)
          ]),

          (!isMeo && (selectedMandal !== 'ALL' || selectedDesignation !== 'ALL' || searchTerm)) && h('button', {
            onClick: () => {
              setSelectedMandal('ALL');
              setSelectedDesignation('ALL');
              setSearchTerm('');
              setCurrentPage(1);
            },
            className: 'text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer'
          }, '↺ Reset All Filters')
        ])
      ]),

      // 5. TEACHERS DIRECTORY TABLE
      h('div', {
        key: 'table-container',
        className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${
          isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
        }`
      }, [
        h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800' }, [
          h('div', {}, [
            h('h3', { className: `text-sm font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              'Official Teacher Records Directory'
            ),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              `Showing ${teachersList.length} of ${formatNum(totalTeachers)} teachers matching your criteria.`
            )
          ]),
          h('div', { className: 'text-xs font-bold text-slate-500 dark:text-slate-400' },
            `Page ${currentPage} of ${Math.max(1, Math.ceil(totalTeachers / itemsPerPage))}`
          )
        ]),

        // Error Notice
        apiError && h('div', {
          className: 'p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold'
        }, `⚠️ ${apiError}`),

        // The Table
        h('div', { className: 'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700' }, [
          h('table', { className: 'w-full text-xs text-left border-collapse' }, [
            h('thead', { className: isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700' }, [
              h('tr', {}, [
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center w-12' }, 'S.No'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[120px]' }, 'Treasury Code'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[180px]' }, "Teacher's Name"),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[140px]' }, 'Designation'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[130px]' }, 'Mandal'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[200px]' }, 'School Name'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center min-w-[80px]' }, 'Gender'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 text-center min-w-[80px]' }, 'Caste'),
                h('th', { className: 'p-3 font-bold border-b border-r dark:border-slate-700 min-w-[110px]' }, 'Mobile No.'),
                h('th', { className: 'p-3 font-bold border-b dark:border-slate-700 text-center min-w-[150px]' }, 'Actions')
              ])
            ]),

            h('tbody', { className: 'divide-y divide-slate-200 dark:divide-slate-800' }, [
              loading ? (
                h('tr', {}, [
                  h('td', { colSpan: 10, className: 'p-8 text-center text-slate-500 font-semibold' }, [
                    h('div', { className: 'w-8 h-8 border-3 border-[#0c4a7e] border-t-transparent rounded-full animate-spin mx-auto mb-2' }),
                    'Loading official teacher records...'
                  ])
                ])
              ) : teachersList.length === 0 ? (
                h('tr', {}, [
                  h('td', { colSpan: 10, className: 'p-8 text-center text-slate-500 font-semibold' },
                    'No teacher records found matching the selected criteria.'
                  )
                ])
              ) : (
                teachersList.map((t, idx) => {
                  const sNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  return h('tr', {
                    key: t.treasuryCode || idx,
                    className: `transition-colors ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`
                  }, [
                    h('td', { className: 'p-3 text-center font-semibold border-r dark:border-slate-700 text-slate-500' }, sNo),
                    h('td', { className: 'p-3 font-mono font-bold text-sky-600 dark:text-sky-400 border-r dark:border-slate-700' }, [
                      h('span', { className: 'bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800' }, t.treasuryCode)
                    ]),
                    h('td', { className: 'p-3 font-bold text-slate-900 dark:text-slate-100 border-r dark:border-slate-700' }, t.teacherName),
                    h('td', { className: 'p-3 font-semibold text-slate-700 dark:text-slate-300 border-r dark:border-slate-700' }, t.designation),
                    h('td', { className: 'p-3 font-semibold text-slate-800 dark:text-slate-200 border-r dark:border-slate-700' }, [
                      h('span', { className: 'px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800' }, t.mandal)
                    ]),
                    h('td', { className: 'p-3 text-slate-700 dark:text-slate-300 border-r dark:border-slate-700' }, t.schoolName),
                    h('td', { className: 'p-3 text-center border-r dark:border-slate-700' }, [
                      h('span', {
                        className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.gender === 'FEMALE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`
                      }, t.gender || '-')
                    ]),
                    h('td', { className: 'p-3 text-center font-medium text-slate-600 dark:text-slate-400 border-r dark:border-slate-700' }, t.caste || '-'),
                    h('td', { className: 'p-3 font-mono text-slate-600 dark:text-slate-400 border-r dark:border-slate-700' }, t.mobileNumber || '-'),
                    h('td', { className: 'p-3 text-center' }, [
                      h('button', {
                        onClick: () => setSelectedTeacherCode(t.treasuryCode),
                        className: 'px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1 mx-auto'
                      }, [
                        h('span', {}, '👁️'),
                        h('span', {}, 'View Individual Profile')
                      ])
                    ])
                  ]);
                })
              )
            ])
          ])
        ]),

        // Pagination Controls
        totalTeachers > itemsPerPage && h('div', {
          className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs'
        }, [
          h('div', { className: 'text-slate-500 font-semibold' },
            `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalTeachers)} of ${formatNum(totalTeachers)} Teachers`
          ),
          h('div', { className: 'flex items-center space-x-2' }, [
            h('button', {
              onClick: () => setCurrentPage(p => Math.max(1, p - 1)),
              disabled: currentPage === 1,
              className: `px-3 py-1.5 rounded-lg border font-bold transition-all ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs'
              }`
            }, '← Previous'),
            h('span', { className: 'px-2 font-bold text-slate-700 dark:text-slate-300' },
              `Page ${currentPage} of ${Math.ceil(totalTeachers / itemsPerPage)}`
            ),
            h('button', {
              onClick: () => setCurrentPage(p => Math.min(Math.ceil(totalTeachers / itemsPerPage), p + 1)),
              disabled: currentPage >= Math.ceil(totalTeachers / itemsPerPage),
              className: `px-3 py-1.5 rounded-lg border font-bold transition-all ${
                currentPage >= Math.ceil(totalTeachers / itemsPerPage)
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs'
              }`
            }, 'Next →')
          ])
        ])
      ])
    ]);
  }

  window.TeachersInformationDashboardView = TeachersInformationDashboardView;
})();
