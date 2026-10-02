// District Educational Office, Jangaon - Teacher Service Record Component
// Clean, Professional Digital Dashboard Layout with Distinct Section Cards
// Dual-Mode Architecture: Modern Digital Screen Experience + Authentic A4 Print/PDF Register

(function () {
  const { useState, useEffect } = React;

  function safeVal(val) {
    if (val === undefined || val === null || String(val).trim() === '' || String(val).trim() === '-') {
      return '—';
    }
    return String(val).trim();
  }

  // ==========================================
  // DIGITAL SCREEN LAYOUT COMPONENTS
  // ==========================================

  // Modern Digital Data Field Box
  function DigitalField({ label, value, colSpan, highlight, badge, isDark }) {
    const isSpecialBadge = badge || (value === 'YES' || value === 'Married' || value === 'PLAIN');
    const isNegativeBadge = (value === 'NO');

    return React.createElement('div', {
      className: `p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
        highlight
          ? (isDark ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-amber-50/70 border-amber-300/80 text-amber-950')
          : (isDark ? 'bg-slate-800/60 border-slate-700/70 text-slate-100 hover:border-slate-600' : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-slate-300')
      } ${colSpan ? `sm:col-span-${colSpan}` : ''}`
    }, [
      React.createElement('div', {
        key: 'lbl',
        className: `text-[11px] font-bold uppercase tracking-wider mb-1.5 leading-tight ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`
      }, label),
      React.createElement('div', {
        key: 'val',
        className: 'flex items-center space-x-2'
      }, [
        isSpecialBadge
          ? React.createElement('span', {
              key: 'sp-badge',
              className: `px-2.5 py-0.5 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                value === 'YES'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700'
                  : 'bg-blue-100 text-[#0c4a7e] border border-blue-200 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700'
              }`
            }, [
              value === 'YES' ? '✓ ' : '',
              safeVal(value)
            ])
          : isNegativeBadge
          ? React.createElement('span', {
              key: 'neg-badge',
              className: 'px-2.5 py-0.5 rounded-full text-xs font-black inline-flex items-center bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
            }, safeVal(value))
          : React.createElement('span', {
              key: 'plain-val',
              className: `text-sm sm:text-base font-bold tracking-tight leading-snug break-words ${
                isDark ? 'text-white' : 'text-slate-900'
              }`
            }, safeVal(value))
      ])
    ]);
  }

  // Modern Section Card Container with Clean Heading and Spacing
  function DigitalCard({ id, title, icon, subtitle, badge, action, children, isDark }) {
    return React.createElement('div', {
      id: id,
      className: `p-5 sm:p-6 rounded-2xl border transition-all shadow-xs ${
        isDark
          ? 'bg-[#131f37] border-slate-700/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`
    }, [
      // Card Header
      React.createElement('div', {
        key: 'card-head',
        className: `flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b gap-2 ${
          isDark ? 'border-slate-700/80' : 'border-slate-200/80'
        }`
      }, [
        React.createElement('div', { key: 'head-left', className: 'flex items-center space-x-3' }, [
          React.createElement('div', {
            key: 'icon-wrap',
            className: `w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
              isDark ? 'bg-slate-800 text-sky-400' : 'bg-blue-50 text-[#0c4a7e]'
            }`
          }, icon || '📋'),
          React.createElement('div', { key: 'title-wrap' }, [
            React.createElement('h3', {
              key: 'title',
              className: `text-base font-extrabold tracking-wide ${
                isDark ? 'text-white' : 'text-[#0c4a7e]'
              }`
            }, title),
            subtitle && React.createElement('p', {
              key: 'sub',
              className: `text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`
            }, subtitle)
          ])
        ]),
        (badge || action) && React.createElement('div', { key: 'head-right', className: 'flex items-center space-x-2' }, [
          badge && React.createElement('span', {
            key: 'bdg',
            className: `text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`
          }, badge),
          action
        ])
      ]),
      // Card Body
      React.createElement('div', { key: 'card-body' }, children)
    ]);
  }

  // ==========================================
  // PRINT LAYOUT HELPERS (FOR OFFICIAL A4 DOCUMENT)
  // ==========================================
  function PrintCell({ label, value, colSpan, className = '', highlight = false }) {
    return React.createElement('td', {
      colSpan: colSpan || 1,
      className: `border border-slate-700 p-1.5 text-left align-top ${highlight ? 'bg-slate-50' : 'bg-white'} ${className}`
    }, [
      React.createElement('div', {
        key: 'lbl',
        className: 'text-[9px] uppercase font-bold text-slate-600 tracking-wider leading-none mb-0.5'
      }, label),
      React.createElement('div', {
        key: 'val',
        className: 'text-[11px] font-semibold text-slate-900 leading-tight break-words'
      }, safeVal(value))
    ]);
  }

  function PrintSectionHeading({ title }) {
    return React.createElement('div', {
      className: 'bg-slate-100 border border-slate-700 px-2 py-1 text-[10px] font-black text-slate-900 uppercase tracking-wider mb-[-1px]'
    }, title);
  }

  // ==========================================
  // MAIN VIEW COMPONENT
  // ==========================================
  function TeacherServiceRecordView({ onBack, user, isDark }) {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
      let isMounted = true;
      async function fetchRecord() {
        setLoading(true);
        setErrorMsg('');
        try {
          const apiBase = (typeof window !== 'undefined' && window.PORTAL_API_BASE)
            ? String(window.PORTAL_API_BASE).replace(/\/$/, '')
            : '';

          const isGuestPreview = (!user || user.accountStatus === 'PREVIEW_MODE');
          const endpoint = isGuestPreview
            ? `${apiBase}/api/teacher/preview-record`
            : `${apiBase}/api/teacher/service-record`;

          const res = await fetch(endpoint, { credentials: 'include' });
          const data = await res.json();

          if (isMounted) {
            if (data.success && data.serviceRecord) {
              setRecord(data.serviceRecord);
            } else {
              const fallback = await fetch(`${apiBase}/api/teacher/preview-record`);
              const fbData = await fallback.json();
              if (fbData.success && fbData.serviceRecord) {
                setRecord(fbData.serviceRecord);
              } else {
                setErrorMsg(data.message || "Failed to load Teacher Service Record.");
              }
            }
          }
        } catch (err) {
          if (isMounted) {
            setErrorMsg("Network error connecting to official teacher database.");
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      fetchRecord();
      return () => { isMounted = false; };
    }, [user]);

    const handlePrint = () => {
      window.print();
    };

    if (loading) {
      return React.createElement('div', {
        className: 'min-h-[500px] flex flex-col items-center justify-center space-y-3 p-8'
      }, [
        React.createElement('div', { key: 'spin', className: 'w-12 h-12 border-4 border-[#0c4a7e] border-t-transparent rounded-full animate-spin' }),
        React.createElement('p', { key: 'txt', className: `text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}` },
          'Retrieving official Teacher Service Record from Department database...'
        )
      ]);
    }

    if (errorMsg || !record) {
      return React.createElement('div', {
        className: 'max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-4 my-8'
      }, [
        React.createElement('div', { key: 'icn', className: 'text-3xl' }, '⚠️'),
        React.createElement('h3', { key: 'h', className: 'text-base font-bold text-red-900' }, 'Service Record Unavailable'),
        React.createElement('p', { key: 'msg', className: 'text-xs text-red-700' }, errorMsg || 'Unable to retrieve teacher record.'),
        React.createElement('button', {
          key: 'btn',
          onClick: onBack,
          className: 'px-4 py-2 bg-[#0c4a7e] text-white font-bold rounded-lg text-xs cursor-pointer'
        }, '← Back to Dashboard Overview')
      ]);
    }

    const personal = record.personalDetails || {};
    const spouse = record.spouseDetails || {};
    const residential = record.residentialDetails || {};
    const working = record.workingDetails || {};
    const academic = Array.isArray(record.academicQualifications) ? record.academicQualifications : [];
    const professional = Array.isArray(record.professionalQualifications) ? record.professionalQualifications : [];
    const deptTests = record.departmentalTests || {};
    const service = record.serviceDetails || {};
    const promotions = Array.isArray(record.promotions) ? record.promotions : [];
    const bank = record.bankDetails || {};
    const decl = record.declarations || {};

    const TelanganaEmblem = (window.PORTAL_LOGOS && window.PORTAL_LOGOS.TelanganaEmblem)
      ? window.PORTAL_LOGOS.TelanganaEmblem
      : null;

    return React.createElement('div', {
      className: 'w-full py-4 px-2 sm:px-4'
    }, [

      // ==============================================================
      // 1. TOP ACTION BAR (VISIBLE ON SCREEN, PRESERVED PRINT CONTROLS)
      // ==============================================================
      React.createElement('div', {
        key: 'screen-action-bar',
        className: `no-print max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border transition-colors shadow-xs ${
          isDark ? 'bg-[#131f37] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`
      }, [
        React.createElement('div', { key: 'left', className: 'flex items-center space-x-3 flex-wrap gap-y-2' }, [
          React.createElement('button', {
            key: 'btn-back',
            onClick: onBack,
            className: `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`
          }, [
            React.createElement('span', { key: 'a' }, '←'),
            React.createElement('span', { key: 't' }, 'Back to Dashboard Overview')
          ]),
          React.createElement('span', {
            key: 'badge-ro',
            className: 'bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center space-x-1'
          }, [
            React.createElement('span', { key: 'dot' }, '🔒'),
            React.createElement('span', { key: 't' }, 'Official Record • Verified & View Only')
          ])
        ]),

        React.createElement('div', { key: 'right', className: 'flex items-center space-x-3' }, [
          React.createElement('span', {
            key: 'print-tip',
            className: `text-[11px] hidden md:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`
          }, 'Official 2-Page A4 Ready'),
          React.createElement('button', {
            key: 'btn-print',
            onClick: handlePrint,
            className: 'flex items-center space-x-2 bg-[#0c4a7e] hover:bg-[#08355b] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer'
          }, [
            React.createElement('span', { key: 'icn' }, '🖨'),
            React.createElement('span', { key: 't' }, 'Print / Save as PDF')
          ])
        ])
      ]),

      // ==============================================================
      // 2. CLEAN MODERN DIGITAL LAYOUT (SEPARATE CARDS WITH COMFORTABLE GAPS)
      // ==============================================================
      React.createElement('div', {
        key: 'digital-view-wrapper',
        id: 'teacher-service-record-digital',
        className: 'no-print max-w-6xl mx-auto space-y-6'
      }, [

        // ------------------------------------------------------------
        // PROFILE HERO BANNER CARD
        // ------------------------------------------------------------
        React.createElement('div', {
          key: 'hero-banner',
          className: 'p-6 sm:p-8 rounded-3xl shadow-md border-b-4 border-amber-400 bg-gradient-to-r from-[#0c4a7e] via-[#103b66] to-[#08355b] text-white relative overflow-hidden'
        }, [
          React.createElement('div', {
            key: 'hero-content',
            className: 'flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'
          }, [
            // Left Profile Info
            React.createElement('div', { key: 'hero-left', className: 'flex items-start sm:items-center space-x-4 sm:space-x-5' }, [
              React.createElement('div', {
                key: 'avatar',
                className: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-300 font-black text-2xl sm:text-3xl flex-shrink-0 shadow-inner'
              }, [
                TelanganaEmblem
                  ? React.createElement(TelanganaEmblem, { key: 'emblem', className: 'w-12 h-12 drop-shadow-sm' })
                  : 'TS'
              ]),
              React.createElement('div', { key: 'hero-titles', className: 'space-y-1' }, [
                React.createElement('div', { key: 'top-dept', className: 'text-[11px] font-bold text-amber-300 uppercase tracking-widest' },
                  `${record.department || 'School Education Department'} • ${record.district || 'Warangal District'}`
                ),
                React.createElement('h1', { key: 't-name', className: 'text-2xl sm:text-3xl font-extrabold tracking-tight text-white' },
                  record.teacherName || personal.teacherName || 'P. SURESH BABU'
                ),
                React.createElement('div', { key: 'pills', className: 'flex flex-wrap items-center gap-2 pt-1' }, [
                  React.createElement('span', {
                    key: 'p-desig',
                    className: 'bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-md uppercase'
                  }, personal.designation || 'SA PHY SCI'),
                  React.createElement('span', {
                    key: 'p-code',
                    className: 'bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md'
                  }, `Treasury ID: ${record.treasuryCode || personal.treasuryCode || '2126324'}`),
                  React.createElement('span', {
                    key: 'p-school',
                    className: 'text-xs text-blue-200 font-medium'
                  }, `🏫 ${working.schoolName || 'MPUPS ROLLIAKAI'} (${working.mandal || 'Parvathagiri'})`)
                ])
              ])
            ]),

            // Right Quick Actions & Badges
            React.createElement('div', { key: 'hero-right', className: 'flex flex-col sm:items-end justify-center space-y-2' }, [
              React.createElement('button', {
                key: 'banner-print',
                onClick: handlePrint,
                className: 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all'
              }, [
                React.createElement('span', { key: 'i' }, '🖨'),
                React.createElement('span', { key: 't' }, 'Print Official Register / Save PDF')
              ]),
              React.createElement('div', { key: 'sub-note', className: 'text-[11px] text-blue-200' },
                'Telangana School Education Service Register'
              )
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD A: PERSONAL DETAILS OF THE EMPLOYEE
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-a',
          id: 'card-personal',
          icon: '👤',
          title: 'A. PERSONAL DETAILS OF THE EMPLOYEE',
          subtitle: 'Official identity, demographic credentials and service category',
          badge: '13 Verified Fields',
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'grid-a',
            className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
          }, [
            React.createElement(DigitalField, { key: 'f1', label: 'Treasury Code', value: personal.treasuryCode || record.treasuryCode, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 'f2', label: 'Aadhar No', value: personal.aadharNo, isDark }),
            React.createElement(DigitalField, { key: 'f3', label: 'Teacher Name', value: personal.teacherName || record.teacherName, isDark }),
            React.createElement(DigitalField, { key: 'f4', label: 'Father Name', value: personal.fatherName, isDark }),
            React.createElement(DigitalField, { key: 'f5', label: 'Designation', value: personal.designation, isDark }),
            React.createElement(DigitalField, { key: 'f6', label: 'Medium', value: personal.medium, isDark }),
            React.createElement(DigitalField, { key: 'f7', label: 'Gender', value: personal.gender, isDark }),
            React.createElement(DigitalField, { key: 'f8', label: 'Date of Birth', value: personal.dateOfBirth, isDark }),
            React.createElement(DigitalField, { key: 'f9', label: 'Caste Category', value: personal.caste, isDark }),
            React.createElement(DigitalField, { key: 'f10', label: 'Registered Mobile No', value: personal.mobileNumber, isDark }),
            React.createElement(DigitalField, { key: 'f11', label: 'Marital Status', value: personal.maritalStatus, isDark }),
            React.createElement(DigitalField, { key: 'f12', label: 'Type of PHC (OH/HH/VH/NO)', value: personal.typeOfPhc, isDark }),
            React.createElement(DigitalField, { key: 'f13', label: 'PHC Percentage', value: personal.phcPercentage, isDark })
          ])
        ]),

        // ------------------------------------------------------------
        // TWO-COLUMN ROW: CARD B (SPOUSE DETAILS) & CARD C (RESIDENTIAL DETAILS)
        // ------------------------------------------------------------
        React.createElement('div', {
          key: 'row-bc',
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }, [
          // Card B: Spouse Details
          React.createElement(DigitalCard, {
            key: 'card-sec-b',
            id: 'card-spouse',
            icon: '👥',
            title: 'B. SPOUSE DETAILS',
            subtitle: 'Government / Local Body employment parameters',
            badge: spouse.isSpouseGovtEmployee === 'YES' ? 'Govt Employee' : 'Not Applicable',
            isDark: isDark
          }, [
            React.createElement('div', { key: 'grid-b', className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
              React.createElement(DigitalField, { key: 'b1', label: 'Whether Spouse is Govt. Employee', value: spouse.isSpouseGovtEmployee, isDark }),
              React.createElement(DigitalField, { key: 'b2', label: 'Spouse Treasury ID', value: spouse.spouseTreasuryId, highlight: Boolean(spouse.spouseTreasuryId && spouse.spouseTreasuryId !== '—'), isDark }),
              React.createElement(DigitalField, { key: 'b3', label: 'Spouse Name', value: spouse.spouseName, isDark }),
              React.createElement(DigitalField, { key: 'b4', label: 'Spouse Dept Name', value: spouse.spouseDeptName, isDark }),
              React.createElement('div', { key: 'b5-wrap', className: 'sm:col-span-2' }, [
                React.createElement(DigitalField, { key: 'b5', label: 'Spouse Working Place', value: spouse.spouseWorkingPlace, isDark })
              ])
            ])
          ]),

          // Card C: Residential Details
          React.createElement(DigitalCard, {
            key: 'card-sec-c',
            id: 'card-residential',
            icon: '🏠',
            title: 'C. RESIDENTIAL DETAILS',
            subtitle: 'Current residence, local constituency and nativity jurisdiction',
            isDark: isDark
          }, [
            React.createElement('div', { key: 'grid-c', className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
              React.createElement(DigitalField, { key: 'c1', label: 'Residential Address', value: residential.residentialAddress, isDark }),
              React.createElement(DigitalField, { key: 'c2', label: 'Residential Constituency', value: residential.residentialConstituency, isDark }),
              React.createElement(DigitalField, { key: 'c3', label: 'Native Address', value: residential.nativeAddress, isDark }),
              React.createElement(DigitalField, { key: 'c4', label: 'Native Constituency', value: residential.nativeConstituency, isDark }),
              React.createElement('div', { key: 'c5-wrap', className: 'sm:col-span-2' }, [
                React.createElement(DigitalField, { key: 'c5', label: 'Local District (As per Study Certificates)', value: residential.localDistrict, highlight: true, isDark })
              ])
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD D: WORKING PLACE DETAILS
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-d',
          id: 'card-working',
          icon: '🏫',
          title: 'D. WORKING PLACE DETAILS',
          subtitle: 'Institutional assignment, management cadre and establishment parameters',
          badge: `${working.schoolDiseCode || '3611400702'}`,
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'grid-d',
            className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
          }, [
            React.createElement(DigitalField, { key: 'd1', label: 'New District', value: working.newDistrict, isDark }),
            React.createElement(DigitalField, { key: 'd2', label: 'Mandal', value: working.mandal, isDark }),
            React.createElement(DigitalField, { key: 'd3', label: 'School DISE Code', value: working.schoolDiseCode, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 'd4', label: 'School Name', value: working.schoolName, isDark }),
            React.createElement(DigitalField, { key: 'd5', label: 'Category of the School', value: working.categoryOfSchool, isDark }),
            React.createElement(DigitalField, { key: 'd6', label: 'Management', value: working.management, isDark }),
            React.createElement(DigitalField, { key: 'd7', label: 'Medium of the School', value: working.mediumOfSchool, isDark }),
            React.createElement(DigitalField, { key: 'd8', label: 'HRA Percentage', value: `${working.hraPercentage}%`, isDark }),
            React.createElement(DigitalField, { key: 'd9', label: 'Working Area', value: working.workingArea, colSpan: 4, isDark })
          ])
        ]),

        // ------------------------------------------------------------
        // CARD E: ACADEMIC QUALIFICATIONS (MODERN DIGITAL TABLE)
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-e',
          id: 'card-academic',
          icon: '🎓',
          title: 'E. ACADEMIC QUALIFICATIONS',
          subtitle: 'Verified board certifications, graduation, post-graduation and marks percentages',
          badge: `${academic.length} Degrees Recorded`,
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'tbl-e-wrap',
            className: `overflow-x-auto rounded-xl border ${
              isDark ? 'border-slate-700/80 bg-slate-900/40' : 'border-slate-200 bg-white'
            }`
          }, [
            React.createElement('table', {
              key: 'tbl-e',
              className: 'w-full text-left border-collapse text-xs sm:text-sm'
            }, [
              React.createElement('thead', {
                key: 'th-e',
                className: `${isDark ? 'bg-slate-800/90 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'} border-b text-[11px] font-black uppercase tracking-wider`
              }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'p-3.5' }, 'Qualification'),
                  React.createElement('th', { key: 'b', className: 'p-3.5' }, 'Branch'),
                  React.createElement('th', { key: 'm', className: 'p-3.5' }, 'Degree / Medium'),
                  React.createElement('th', { key: 'o1', className: 'p-3.5' }, 'Optional-1'),
                  React.createElement('th', { key: 'o2', className: 'p-3.5' }, 'Optional-2'),
                  React.createElement('th', { key: 'o3', className: 'p-3.5' }, 'Optional-3'),
                  React.createElement('th', { key: 'u', className: 'p-3.5' }, 'University / Board'),
                  React.createElement('th', { key: 'y', className: 'p-3.5 text-center' }, 'Year Passed'),
                  React.createElement('th', { key: 'p', className: 'p-3.5 text-center' }, 'Percentage')
                ])
              ]),
              React.createElement('tbody', {
                key: 'tb-e',
                className: `divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`
              }, academic.map((row, idx) => (
                React.createElement('tr', {
                  key: `row-${idx}`,
                  className: `transition-colors ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-blue-50/40'
                  } ${idx % 2 === 1 ? (isDark ? 'bg-slate-900/30' : 'bg-slate-50/50') : ''}`
                }, [
                  React.createElement('td', { key: 'q', className: 'p-3.5 font-bold text-slate-900 dark:text-white' }, row.qualification),
                  React.createElement('td', { key: 'b', className: 'p-3.5' }, safeVal(row.branch)),
                  React.createElement('td', { key: 'm', className: 'p-3.5' }, safeVal(row.degreeOrMedium)),
                  React.createElement('td', { key: 'o1', className: 'p-3.5 font-medium' }, safeVal(row.optional1)),
                  React.createElement('td', { key: 'o2', className: 'p-3.5 font-medium' }, safeVal(row.optional2)),
                  React.createElement('td', { key: 'o3', className: 'p-3.5 font-medium' }, safeVal(row.optional3)),
                  React.createElement('td', { key: 'u', className: 'p-3.5 font-semibold text-[#0c4a7e] dark:text-sky-300' }, safeVal(row.universityOrBoard)),
                  React.createElement('td', { key: 'y', className: 'p-3.5 text-center font-bold' }, safeVal(row.yearPassed)),
                  React.createElement('td', { key: 'p', className: 'p-3.5 text-center font-extrabold' },
                    row.percentage && row.percentage !== '—' ? `${row.percentage}%` : '—'
                  )
                ])
              )))
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD F: PROFESSIONAL QUALIFICATIONS (MODERN DIGITAL TABLE)
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-f',
          id: 'card-prof',
          icon: '📜',
          title: 'F. PROFESSIONAL QUALIFICATIONS',
          subtitle: 'Teacher training, pedagogy, B.Ed and M.Ed certifications',
          badge: `${professional.length} Credentials`,
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'tbl-f-wrap',
            className: `overflow-x-auto rounded-xl border ${
              isDark ? 'border-slate-700/80 bg-slate-900/40' : 'border-slate-200 bg-white'
            }`
          }, [
            React.createElement('table', {
              key: 'tbl-f',
              className: 'w-full text-left border-collapse text-xs sm:text-sm'
            }, [
              React.createElement('thead', {
                key: 'th-f',
                className: `${isDark ? 'bg-slate-800/90 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'} border-b text-[11px] font-black uppercase tracking-wider`
              }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'p-3.5' }, 'Qualification'),
                  React.createElement('th', { key: 'd', className: 'p-3.5' }, 'Degree'),
                  React.createElement('th', { key: 'm', className: 'p-3.5' }, 'Medium'),
                  React.createElement('th', { key: 'm1', className: 'p-3.5' }, 'Method-1'),
                  React.createElement('th', { key: 'm2', className: 'p-3.5' }, 'Method-2'),
                  React.createElement('th', { key: 'u', className: 'p-3.5' }, 'University'),
                  React.createElement('th', { key: 'y', className: 'p-3.5 text-center' }, 'Year Passed'),
                  React.createElement('th', { key: 'p', className: 'p-3.5 text-center' }, 'Percentage')
                ])
              ]),
              React.createElement('tbody', {
                key: 'tb-f',
                className: `divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`
              }, professional.map((row, idx) => (
                React.createElement('tr', {
                  key: `row-${idx}`,
                  className: `transition-colors ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-blue-50/40'
                  } ${idx % 2 === 1 ? (isDark ? 'bg-slate-900/30' : 'bg-slate-50/50') : ''}`
                }, [
                  React.createElement('td', { key: 'q', className: 'p-3.5 font-bold text-slate-900 dark:text-white' }, row.qualification),
                  React.createElement('td', { key: 'd', className: 'p-3.5 font-semibold' }, safeVal(row.degree)),
                  React.createElement('td', { key: 'm', className: 'p-3.5' }, safeVal(row.medium)),
                  React.createElement('td', { key: 'm1', className: 'p-3.5 font-medium' }, safeVal(row.method1)),
                  React.createElement('td', { key: 'm2', className: 'p-3.5 font-medium' }, safeVal(row.method2)),
                  React.createElement('td', { key: 'u', className: 'p-3.5 font-semibold text-[#0c4a7e] dark:text-sky-300' }, safeVal(row.university)),
                  React.createElement('td', { key: 'y', className: 'p-3.5 text-center font-bold' }, safeVal(row.yearPassed)),
                  React.createElement('td', { key: 'p', className: 'p-3.5 text-center font-extrabold' },
                    row.percentage && row.percentage !== '—' ? `${row.percentage}%` : '—'
                  )
                ])
              )))
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD G: DEPARTMENTAL TESTS
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-g',
          id: 'card-tests',
          icon: '📝',
          title: 'G. DEPARTMENTAL TESTS',
          subtitle: 'Official Gazetted & Executive departmental tests passed',
          badge: 'Government Examinations',
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'grid-g',
            className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'
          }, [
            // GOT
            React.createElement('div', {
              key: 't-got',
              className: `p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/40 border-emerald-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1' }, 'GOT (Gazetted Officers Test)'),
              React.createElement('div', { key: 'st', className: 'my-1' }, [
                React.createElement('span', { key: 'b', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 text-xs font-black px-2 py-0.5 rounded-full' }, '✓ PASSED')
              ]),
              React.createElement('div', { key: 'y', className: 'text-xs font-bold text-slate-700 dark:text-slate-300' }, 'Year: Dec-10')
            ]),

            // EOT
            React.createElement('div', {
              key: 't-eot',
              className: `p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/40 border-emerald-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1' }, 'EOT (Executive Officers Test)'),
              React.createElement('div', { key: 'st', className: 'my-1' }, [
                React.createElement('span', { key: 'b', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 text-xs font-black px-2 py-0.5 rounded-full' }, '✓ PASSED')
              ]),
              React.createElement('div', { key: 'y', className: 'text-xs font-bold text-slate-700 dark:text-slate-300' }, 'Year: Dec-11')
            ]),

            // Lang Test Tel
            React.createElement('div', {
              key: 't-tel',
              className: `p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1' }, 'Lang Test (Telugu)'),
              React.createElement('div', { key: 'st', className: 'my-1' }, [
                React.createElement('span', { key: 'b', className: 'bg-blue-100 text-[#0c4a7e] dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-full' }, 'Exemption / Passed')
              ]),
              React.createElement('div', { key: 'y', className: 'text-xs font-bold text-slate-700 dark:text-slate-300' }, 'Year: Feb-14')
            ]),

            // Lang Test Hin
            React.createElement('div', {
              key: 't-hin',
              className: `p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1' }, 'Lang Test (Hindi)'),
              React.createElement('div', { key: 'st', className: 'my-1' }, [
                React.createElement('span', { key: 'b', className: 'text-slate-500 text-xs font-semibold' }, '—')
              ]),
              React.createElement('div', { key: 'y', className: 'text-xs text-slate-400' }, 'Year: —')
            ]),

            // Other Tests
            React.createElement('div', {
              key: 't-oth',
              className: `p-4 rounded-xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1' }, 'Other Tests'),
              React.createElement('div', { key: 'st', className: 'my-1' }, [
                React.createElement('span', { key: 'b', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full' }, 'NO')
              ]),
              React.createElement('div', { key: 'y', className: 'text-xs text-slate-400' }, 'Year: —')
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD H: SERVICE DETAILS (16 STRUCTURED FIELDS)
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-h',
          id: 'card-service',
          icon: '💼',
          title: 'H. SERVICE DETAILS',
          subtitle: 'First appointment, feeder cadre, present cadre, DSC merit and administrative history',
          badge: `Rank #${service.rank || '887'}`,
          isDark: isDark
        }, [
          React.createElement('div', {
            key: 'grid-h',
            className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
          }, [
            React.createElement(DigitalField, { key: 's1', label: 'Date of First Appointment', value: service.dateOfFirstAppointment, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 's2', label: 'Date of Joining in Feeder Cadre', value: service.dateOfJoiningFeederCadre, isDark }),
            React.createElement(DigitalField, { key: 's3', label: 'Date of Joining in Present Cadre', value: service.dateOfJoiningPresentCadre, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 's4', label: 'Date of Joining in Present School', value: service.dateOfJoiningPresentSchool, isDark }),
            React.createElement(DigitalField, { key: 's5', label: 'Appointment Management', value: service.appointmentManagement, isDark }),
            React.createElement(DigitalField, { key: 's6', label: 'Appointed Area', value: service.appointedArea, isDark }),
            React.createElement(DigitalField, { key: 's7', label: 'Year of DSC', value: service.yearOfDsc, isDark }),
            React.createElement(DigitalField, { key: 's8', label: 'DSC List No', value: service.dscListNo, isDark }),
            React.createElement(DigitalField, { key: 's9', label: 'DSC Rank', value: service.rank, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 's10', label: 'Date of Appt as Special Teacher', value: service.dateOfAppointmentSpecialTeacher, isDark }),
            React.createElement(DigitalField, { key: 's11', label: 'Inter District / Mutual Transfer From', value: service.interDistrictMutualTransferFrom, isDark }),
            React.createElement(DigitalField, { key: 's12', label: 'DOJ in WNGL', value: service.dojInWngl, isDark }),
            React.createElement(DigitalField, { key: 's13', label: 'If GO 610 Transferred Teacher', value: service.go610TransferredDistrict, isDark }),
            React.createElement(DigitalField, { key: 's14', label: 'SSC Handling Subject', value: service.sscHandlingSubject, highlight: true, isDark }),
            React.createElement(DigitalField, { key: 's15', label: 'Since (Year)', value: service.sinceYear, isDark }),
            React.createElement(DigitalField, { key: 's16', label: 'Pending Cases if Any', value: service.pendingCases, isDark })
          ])
        ]),

        // ------------------------------------------------------------
        // TWO-COLUMN ROW: CARD I (PROMOTION) & CARD J (BANK DETAILS)
        // ------------------------------------------------------------
        React.createElement('div', {
          key: 'row-ij',
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }, [
          // Card I: Eligible Promotion Cadres
          React.createElement(DigitalCard, {
            key: 'card-sec-i',
            id: 'card-promotion',
            icon: '⭐',
            title: 'I. ELIGIBLE PROMOTION',
            subtitle: 'Empaneled eligible designations for higher administrative cadres',
            badge: `${promotions.filter(p => p.designation && p.designation !== '—').length} Cadres`,
            isDark: isDark
          }, [
            React.createElement('div', { key: 'grid-i', className: 'grid grid-cols-2 gap-4' },
              promotions.map((p, idx) => (
                React.createElement('div', {
                  key: `prom-${idx}`,
                  className: `p-4 rounded-xl border flex flex-col justify-between ${
                    p.designation && p.designation !== '—'
                      ? (isDark ? 'bg-amber-950/20 border-amber-600/40 text-amber-200' : 'bg-amber-50/70 border-amber-300 text-amber-900')
                      : (isDark ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400')
                  }`
                }, [
                  React.createElement('div', { key: 'lbl', className: 'text-[11px] font-black uppercase tracking-wider mb-1.5' }, p.label || `Promotion-${idx + 1}`),
                  React.createElement('div', { key: 'val', className: 'text-sm sm:text-base font-extrabold tracking-tight' }, safeVal(p.designation))
                ])
              ))
            )
          ]),

          // Card J: Bank Account Details (Confidential)
          React.createElement(DigitalCard, {
            key: 'card-sec-j',
            id: 'card-bank',
            icon: '🏦',
            title: 'J. BANK ACCOUNT DETAILS',
            subtitle: 'Salary disbursement account with official masked display',
            badge: 'Confidential',
            isDark: isDark
          }, [
            React.createElement('div', { key: 'grid-j', className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
              React.createElement(DigitalField, { key: 'j1', label: 'Bank Name', value: bank.bankName, isDark }),
              React.createElement(DigitalField, { key: 'j2', label: 'Branch', value: bank.branch, isDark }),
              React.createElement(DigitalField, { key: 'j3', label: 'IFSC Code', value: bank.ifscCode, highlight: true, isDark }),
              React.createElement('div', { key: 'j4-wrap', className: 'sm:col-span-2' }, [
                React.createElement('div', {
                  key: 'j4',
                  className: `p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`
                }, [
                  React.createElement('div', { key: 'l-col' }, [
                    React.createElement('div', { key: 'lbl', className: 'text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5' }, 'Account Number'),
                    React.createElement('div', { key: 'val', className: 'text-base font-mono font-bold tracking-wider text-slate-900 dark:text-white' },
                      bank.accountNumberMasked || bank.accountNumber || '—'
                    )
                  ]),
                  React.createElement('span', {
                    key: 'lock-bdg',
                    className: 'px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1'
                  }, [
                    React.createElement('span', { key: 'i' }, '🔒'),
                    React.createElement('span', { key: 't' }, 'Masked for Privacy')
                  ])
                ])
              ])
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // CARD K: DECLARATIONS & OFFICIAL ADMINISTRATIVE VERIFICATION
        // ------------------------------------------------------------
        React.createElement(DigitalCard, {
          key: 'card-sec-decl',
          id: 'card-declarations',
          icon: '✍️',
          title: 'DECLARATIONS & OFFICIAL VERIFICATION',
          subtitle: 'Statutory compliance certifications as per CCA Rules & Official Verification',
          badge: 'Legally Binding',
          isDark: isDark
        }, [
          React.createElement('div', { key: 'decl-stack', className: 'space-y-5' }, [

            // Declaration 1: Teacher
            React.createElement('div', {
              key: 'd1-box',
              className: `p-4 sm:p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-xs font-black uppercase text-[#0c4a7e] dark:text-sky-300 mb-1 flex items-center space-x-1.5' }, [
                React.createElement('span', { key: 'i' }, '📌'),
                React.createElement('span', { key: 't' }, 'Declaration by Candidate')
              ]),
              React.createElement('p', { key: 'p', className: `text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}` },
                decl.teacherDeclaration || "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules."
              ),
              React.createElement('div', { key: 'sig-row', className: 'flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700' }, [
                React.createElement('span', { key: 'st', className: 'text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1' }, [
                  React.createElement('span', { key: 'i' }, '✓'),
                  React.createElement('span', { key: 't' }, 'Endorsed by Employee')
                ]),
                React.createElement('div', { key: 's', className: 'text-right' }, [
                  React.createElement('div', { key: 'sn', className: 'font-extrabold text-xs text-slate-900 dark:text-white' }, personal.teacherName || 'P. SURESH BABU'),
                  React.createElement('div', { key: 'sl', className: 'text-[10px] text-slate-500' }, decl.teacherSignLabel || 'Signature of the Teacher')
                ])
              ])
            ]),

            // Declaration 2: DDO / Headmaster & MEO
            React.createElement('div', {
              key: 'd2-box',
              className: `p-4 sm:p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-xs font-black uppercase text-[#0c4a7e] dark:text-sky-300 mb-1 flex items-center space-x-1.5' }, [
                React.createElement('span', { key: 'i' }, '🏛️'),
                React.createElement('span', { key: 't' }, 'Certificate of DDO / Headmaster & Mandal Educational Officer')
              ]),
              React.createElement('p', { key: 'p', className: `text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}` },
                decl.certDdoHmDeclaration || "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules."
              ),
              React.createElement('div', { key: 'sigs', className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700' }, [
                React.createElement('div', { key: 'sig-ddo', className: `p-3 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}` }, [
                  React.createElement('div', { key: 'sig-lbl', className: 'text-xs font-extrabold text-slate-900 dark:text-white' }, decl.ddoHmSignLabel || 'Signature of the DDO/HM'),
                  React.createElement('div', { key: 'sig-inst', className: 'text-[10px] text-slate-500' }, working.schoolName || 'MPUPS ROLLIAKAI')
                ]),
                React.createElement('div', { key: 'sig-meo', className: `p-3 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}` }, [
                  React.createElement('div', { key: 'sig-lbl', className: 'text-xs font-extrabold text-slate-900 dark:text-white' }, decl.meoSignLabel || 'Signature of the MEO'),
                  React.createElement('div', { key: 'sig-inst', className: 'text-[10px] text-slate-500' }, `MEO ${working.mandal || 'Parvathagiri'}`)
                ])
              ])
            ]),

            // Declaration 3: CRP / CO / MIS Coordinator
            React.createElement('div', {
              key: 'd3-box',
              className: `p-4 sm:p-5 rounded-xl border ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`
            }, [
              React.createElement('div', { key: 'h', className: 'text-xs font-black uppercase text-[#0c4a7e] dark:text-sky-300 mb-1 flex items-center space-x-1.5' }, [
                React.createElement('span', { key: 'i' }, '📑'),
                React.createElement('span', { key: 't' }, 'Verification by Cluster Resource Person / Computer Operator / MIS Coordinator')
              ]),
              React.createElement('p', { key: 'p', className: `text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}` },
                decl.crpCoMiscoDeclaration || "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct."
              ),
              React.createElement('div', { key: 'sigs', className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700' }, [
                React.createElement('div', { key: 's-crp', className: `p-3 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}` }, [
                  React.createElement('div', { key: 'lbl', className: 'text-xs font-extrabold text-slate-900 dark:text-white' }, decl.crpSignLabel || 'Signature of the CRP'),
                  React.createElement('div', { key: 't', className: 'text-[10px] text-slate-500' }, 'Cluster Resource Person')
                ]),
                React.createElement('div', { key: 's-co', className: `p-3 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}` }, [
                  React.createElement('div', { key: 'lbl', className: 'text-xs font-extrabold text-slate-900 dark:text-white' }, decl.coSignLabel || 'Signature of the CO'),
                  React.createElement('div', { key: 't', className: 'text-[10px] text-slate-500' }, 'Computer Operator')
                ]),
                React.createElement('div', { key: 's-misco', className: `p-3 rounded-lg border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}` }, [
                  React.createElement('div', { key: 'lbl', className: 'text-xs font-extrabold text-slate-900 dark:text-white' }, decl.miscoSignLabel || 'Signature of the MISCO'),
                  React.createElement('div', { key: 't', className: 'text-[10px] text-slate-500' }, 'MIS Coordinator')
                ])
              ])
            ])
          ])
        ]),

        // ------------------------------------------------------------
        // BOTTOM ACTION BAR & COPYRIGHT
        // ------------------------------------------------------------
        React.createElement('div', {
          key: 'bottom-control-card',
          className: `p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-[#131f37] border-slate-700/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`
        }, [
          React.createElement('button', {
            key: 'btn-b2',
            onClick: onBack,
            className: `px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`
          }, '← Back to Dashboard Overview'),

          React.createElement('div', { key: 'copy-box', className: 'text-center text-xs space-y-0.5' }, [
            React.createElement('div', { key: 'c', className: 'font-semibold' }, '© 2026 Pragnya (IN). All Rights Reserved.'),
            React.createElement('div', { key: 'd', className: 'text-[11px] text-slate-500' }, 'Design & Code by P V Rajeshwar • School Education Department')
          ]),

          React.createElement('button', {
            key: 'btn-p2',
            onClick: handlePrint,
            className: 'bg-[#0c4a7e] hover:bg-[#08355b] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 cursor-pointer transition-all'
          }, [
            React.createElement('span', { key: 'i' }, '🖨'),
            React.createElement('span', { key: 't' }, 'Print / Save as PDF')
          ])
        ])
      ]),

      // ==============================================================
      // 3. OFFICIAL 2-PAGE A4 DOCUMENT (STRICTLY FOR PRINT / SAVE AS PDF)
      // ==============================================================
      React.createElement('div', {
        key: 'document-wrapper',
        id: 'teacher-service-record-document',
        className: 'print-only-doc max-w-5xl mx-auto service-record-paper text-slate-900'
      }, [

        // ---------------- PAGE 1 ----------------
        React.createElement('div', {
          key: 'print-page-1',
          className: 'service-record-page bg-white p-6 sm:p-8 border border-slate-700 mb-8'
        }, [
          // Page 1 Header
          React.createElement('div', { key: 'p1-head', className: 'text-center border-b-2 border-slate-800 pb-3 mb-4' }, [
            React.createElement('div', { key: 'seal-box', className: 'flex justify-center mb-1' }, [
              TelanganaEmblem
                ? React.createElement(TelanganaEmblem, { key: 'seal', className: 'w-12 h-12' })
                : React.createElement('div', { key: 'fallback-seal', className: 'w-12 h-12 rounded-full border-2 border-[#007a33] flex items-center justify-center text-xs font-bold text-[#007a33]' }, 'TS')
            ]),
            React.createElement('h1', { key: 'govt', className: 'text-sm sm:text-base font-black tracking-wider uppercase text-slate-900' },
              'GOVERNMENT OF TELANGANA'
            ),
            React.createElement('h2', { key: 'dept', className: 'text-xs sm:text-sm font-bold uppercase text-slate-800' },
              record.department || 'SCHOOL EDUCATION DEPARTMENT'
            ),
            React.createElement('h3', { key: 'dist', className: 'text-xs font-extrabold uppercase text-[#0c4a7e]' },
              record.district || 'WARANGAL DISTRICT'
            ),
            React.createElement('div', { key: 'details-bar', className: 'mt-2 pt-1 border-t border-slate-300 flex justify-between items-center text-[11px]' }, [
              React.createElement('span', { key: 'info', className: 'font-bold text-slate-800' },
                `Showing Details of: ${record.treasuryCode || '—'} - ${record.teacherName || personal.teacherName || '—'}`
              )
            ])
          ]),

          // SECTION A
          React.createElement('div', { key: 'sec-a', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-a', title: 'A. PERSONAL DETAILS OF THE EMPLOYEE' }),
            React.createElement('table', { key: 'tbl-a', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(PrintCell, { key: 'c1', label: 'TREASURY CODE', value: personal.treasuryCode }),
                  React.createElement(PrintCell, { key: 'c2', label: 'FATHER NAME', value: personal.fatherName }),
                  React.createElement(PrintCell, { key: 'c3', label: 'GENDER', value: personal.gender }),
                  React.createElement(PrintCell, { key: 'c4', label: 'MOBILE NO', value: personal.mobileNumber }),
                  React.createElement(PrintCell, { key: 'c5', label: 'PHC PERCENTAGE', value: personal.phcPercentage })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(PrintCell, { key: 'c6', label: 'AADHAR NO', value: personal.aadharNo }),
                  React.createElement(PrintCell, { key: 'c7', label: 'DESIGNATION', value: personal.designation }),
                  React.createElement(PrintCell, { key: 'c8', label: 'DATE OF BIRTH', value: personal.dateOfBirth }),
                  React.createElement(PrintCell, { key: 'c9', label: 'MARITAL STATUS', value: personal.maritalStatus, colSpan: 2 })
                ]),
                React.createElement('tr', { key: 'r3' }, [
                  React.createElement(PrintCell, { key: 'c10', label: 'TEACHER NAME', value: personal.teacherName }),
                  React.createElement(PrintCell, { key: 'c11', label: 'MEDIUM', value: personal.medium }),
                  React.createElement(PrintCell, { key: 'c12', label: 'CASTE', value: personal.caste }),
                  React.createElement(PrintCell, { key: 'c13', label: 'TYPE OF PHC (OH/HH/VH/NO)', value: personal.typeOfPhc, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION B
          React.createElement('div', { key: 'sec-b', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-b', title: 'B. SPOUSE DETAILS (IF SPOUSE IS GOVT./MUNICIPAL/LOCAL BODY EMPLOYEE)' }),
            React.createElement('table', { key: 'tbl-b', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(PrintCell, { key: 'c1', label: 'WHETHER SPOUSE IS GOVT. EMPLOYEE', value: spouse.isSpouseGovtEmployee }),
                  React.createElement(PrintCell, { key: 'c2', label: 'SPOUSE DEPT NAME', value: spouse.spouseDeptName }),
                  React.createElement(PrintCell, { key: 'c3', label: 'SPOUSE TREASURY ID', value: spouse.spouseTreasuryId }),
                  React.createElement(PrintCell, { key: 'c4', label: 'SPOUSE NAME', value: spouse.spouseName })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(PrintCell, { key: 'c5', label: 'SPOUSE WORKING PLACE', value: spouse.spouseWorkingPlace, colSpan: 4 })
                ])
              ])
            ])
          ]),

          // SECTION C
          React.createElement('div', { key: 'sec-c', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-c', title: 'C. RESIDENTIAL DETAILS' }),
            React.createElement('table', { key: 'tbl-c', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(PrintCell, { key: 'c1', label: 'RESIDENTIAL ADDRESS', value: residential.residentialAddress }),
                  React.createElement(PrintCell, { key: 'c2', label: 'RESIDENTIAL CONSTITUENCY', value: residential.residentialConstituency }),
                  React.createElement(PrintCell, { key: 'c3', label: 'NATIVE ADDRESS', value: residential.nativeAddress })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(PrintCell, { key: 'c4', label: 'NATIVE CONSTITUENCY', value: residential.nativeConstituency }),
                  React.createElement(PrintCell, { key: 'c5', label: 'LOCAL DISTRICT (AS PER STUDY CERTIFICATES)', value: residential.localDistrict, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION D
          React.createElement('div', { key: 'sec-d', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-d', title: 'D. WORKING PLACE DETAILS' }),
            React.createElement('table', { key: 'tbl-d', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(PrintCell, { key: 'c1', label: 'NEW DISTRICT', value: working.newDistrict }),
                  React.createElement(PrintCell, { key: 'c2', label: 'MANDAL', value: working.mandal }),
                  React.createElement(PrintCell, { key: 'c3', label: 'SCHOOL DISE CODE', value: working.schoolDiseCode }),
                  React.createElement(PrintCell, { key: 'c4', label: 'SCHOOL NAME', value: working.schoolName })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(PrintCell, { key: 'c5', label: 'CATEGORY OF THE SCHOOL', value: working.categoryOfSchool }),
                  React.createElement(PrintCell, { key: 'c6', label: 'MANAGEMENT', value: working.management }),
                  React.createElement(PrintCell, { key: 'c7', label: 'MEDIUM OF THE SCHOOL', value: working.mediumOfSchool }),
                  React.createElement(PrintCell, { key: 'c8', label: 'HRA PERCENTAGE', value: working.hraPercentage })
                ]),
                React.createElement('tr', { key: 'r3' }, [
                  React.createElement(PrintCell, { key: 'c9', label: 'WORKING AREA', value: working.workingArea, colSpan: 4 })
                ])
              ])
            ])
          ]),

          // SECTION E
          React.createElement('div', { key: 'sec-e', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-e', title: 'E. ACADEMIC QUALIFICATIONS' }),
            React.createElement('table', { key: 'tbl-e', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'border border-slate-700 p-1' }, 'Qualification'),
                  React.createElement('th', { key: 'b', className: 'border border-slate-700 p-1' }, 'Branch'),
                  React.createElement('th', { key: 'm', className: 'border border-slate-700 p-1' }, 'Degree/Medium'),
                  React.createElement('th', { key: 'o1', className: 'border border-slate-700 p-1' }, 'Optional-1'),
                  React.createElement('th', { key: 'o2', className: 'border border-slate-700 p-1' }, 'Optional-2'),
                  React.createElement('th', { key: 'o3', className: 'border border-slate-700 p-1' }, 'Optional-3'),
                  React.createElement('th', { key: 'u', className: 'border border-slate-700 p-1' }, 'University'),
                  React.createElement('th', { key: 'y', className: 'border border-slate-700 p-1' }, 'Year Passed'),
                  React.createElement('th', { key: 'p', className: 'border border-slate-700 p-1' }, '%')
                ])
              ]),
              React.createElement('tbody', { key: 'tb' }, academic.map((row, idx) => (
                React.createElement('tr', { key: `aq-${idx}`, className: 'text-[11px] bg-white' }, [
                  React.createElement('td', { key: 'q', className: 'border border-slate-700 p-1 font-semibold text-left' }, row.qualification),
                  React.createElement('td', { key: 'b', className: 'border border-slate-700 p-1' }, safeVal(row.branch)),
                  React.createElement('td', { key: 'm', className: 'border border-slate-700 p-1' }, safeVal(row.degreeOrMedium)),
                  React.createElement('td', { key: 'o1', className: 'border border-slate-700 p-1' }, safeVal(row.optional1)),
                  React.createElement('td', { key: 'o2', className: 'border border-slate-700 p-1' }, safeVal(row.optional2)),
                  React.createElement('td', { key: 'o3', className: 'border border-slate-700 p-1' }, safeVal(row.optional3)),
                  React.createElement('td', { key: 'u', className: 'border border-slate-700 p-1' }, safeVal(row.universityOrBoard)),
                  React.createElement('td', { key: 'y', className: 'border border-slate-700 p-1 font-bold' }, safeVal(row.yearPassed)),
                  React.createElement('td', { key: 'p', className: 'border border-slate-700 p-1 font-bold' }, safeVal(row.percentage))
                ])
              )))
            ])
          ]),

          // SECTION F
          React.createElement('div', { key: 'sec-f', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-f', title: 'F. PROFESSIONAL QUALIFICATIONS' }),
            React.createElement('table', { key: 'tbl-f', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'border border-slate-700 p-1' }, 'Qualification'),
                  React.createElement('th', { key: 'd', className: 'border border-slate-700 p-1' }, 'Degree'),
                  React.createElement('th', { key: 'm', className: 'border border-slate-700 p-1' }, 'Medium'),
                  React.createElement('th', { key: 'm1', className: 'border border-slate-700 p-1' }, 'Method-1'),
                  React.createElement('th', { key: 'm2', className: 'border border-slate-700 p-1' }, 'Method-2'),
                  React.createElement('th', { key: 'u', className: 'border border-slate-700 p-1' }, 'University'),
                  React.createElement('th', { key: 'y', className: 'border border-slate-700 p-1' }, 'Year Passed'),
                  React.createElement('th', { key: 'p', className: 'border border-slate-700 p-1' }, '%')
                ])
              ]),
              React.createElement('tbody', { key: 'tb' }, professional.map((row, idx) => (
                React.createElement('tr', { key: `pq-${idx}`, className: 'text-[11px] bg-white' }, [
                  React.createElement('td', { key: 'q', className: 'border border-slate-700 p-1 font-semibold text-left' }, row.qualification),
                  React.createElement('td', { key: 'd', className: 'border border-slate-700 p-1' }, safeVal(row.degree)),
                  React.createElement('td', { key: 'm', className: 'border border-slate-700 p-1' }, safeVal(row.medium)),
                  React.createElement('td', { key: 'm1', className: 'border border-slate-700 p-1' }, safeVal(row.method1)),
                  React.createElement('td', { key: 'm2', className: 'border border-slate-700 p-1' }, safeVal(row.method2)),
                  React.createElement('td', { key: 'u', className: 'border border-slate-700 p-1' }, safeVal(row.university)),
                  React.createElement('td', { key: 'y', className: 'border border-slate-700 p-1 font-bold' }, safeVal(row.yearPassed)),
                  React.createElement('td', { key: 'p', className: 'border border-slate-700 p-1 font-bold' }, safeVal(row.percentage))
                ])
              )))
            ])
          ]),

          // SECTION G
          React.createElement('div', { key: 'sec-g', className: 'mb-3' }, [
            React.createElement(PrintSectionHeading, { key: 'h-g', title: 'G. DEPARTMENTAL TESTS' }),
            React.createElement('table', { key: 'tbl-g', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('tbody', { key: 'tb' }, [
                React.createElement('tr', { key: 'r1', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                  React.createElement('th', { key: 'th-lbl', className: 'border border-slate-700 p-1 text-left' }, 'Departmental Test'),
                  React.createElement('th', { key: 'th-got', className: 'border border-slate-700 p-1' }, 'GOT'),
                  React.createElement('th', { key: 'th-eot', className: 'border border-slate-700 p-1' }, 'EOT'),
                  React.createElement('th', { key: 'th-tel', className: 'border border-slate-700 p-1' }, 'Lang Test (Tel)'),
                  React.createElement('th', { key: 'th-hin', className: 'border border-slate-700 p-1' }, 'Lang Test (Hin)'),
                  React.createElement('th', { key: 'th-oth', className: 'border border-slate-700 p-1' }, 'Other Tests')
                ]),
                React.createElement('tr', { key: 'r2', className: 'text-[11px] bg-white' }, [
                  React.createElement('td', { key: 'lbl', className: 'border border-slate-700 p-1 font-semibold text-left' }, 'Test passed (Yes / No)'),
                  React.createElement('td', { key: 'got', className: 'border border-slate-700 p-1 font-bold' }, 'YES'),
                  React.createElement('td', { key: 'eot', className: 'border border-slate-700 p-1 font-bold' }, 'YES'),
                  React.createElement('td', { key: 'tel', className: 'border border-slate-700 p-1' }, '—'),
                  React.createElement('td', { key: 'hin', className: 'border border-slate-700 p-1' }, '—'),
                  React.createElement('td', { key: 'oth', className: 'border border-slate-700 p-1' }, 'NO')
                ]),
                React.createElement('tr', { key: 'r3', className: 'text-[11px] bg-white' }, [
                  React.createElement('td', { key: 'lbl', className: 'border border-slate-700 p-1 font-semibold text-left' }, 'Year of Passing'),
                  React.createElement('td', { key: 'got', className: 'border border-slate-700 p-1 font-bold' }, 'Dec-10'),
                  React.createElement('td', { key: 'eot', className: 'border border-slate-700 p-1 font-bold' }, 'Dec-11'),
                  React.createElement('td', { key: 'tel', className: 'border border-slate-700 p-1 font-bold' }, 'Feb-14'),
                  React.createElement('td', { key: 'hin', className: 'border border-slate-700 p-1' }, '—'),
                  React.createElement('td', { key: 'oth', className: 'border border-slate-700 p-1' }, '—')
                ])
              ])
            ])
          ]),

          React.createElement('div', { key: 'p1-foot', className: 'text-right text-[9px] text-slate-500 font-semibold' }, 'Page 1 of 2')
        ]),

        // Force page break between Page 1 and Page 2 in A4 print
        React.createElement('div', { key: 'page-break', className: 'official-page-break' }),

        // ---------------- PAGE 2 ----------------
        React.createElement('div', {
          key: 'print-page-2',
          className: 'service-record-page bg-white p-6 sm:p-8 border border-slate-700 mb-8'
        }, [
          // SECTION H
          React.createElement('div', { key: 'sec-h', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-h', title: 'H. SERVICE DETAILS' }),
            React.createElement('table', { key: 'tbl-h', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(PrintCell, { key: 'c1', label: 'DATE OF APPOINTMENT AS SPECIAL TEACHER (398/UNTRAINED/SPL VV)', value: service.dateOfAppointmentSpecialTeacher }),
                  React.createElement(PrintCell, { key: 'c2', label: 'DATE OF FIRST APPOINTMENT (DATE OF ABSORPTION IN CASE OF SPL TEACHERS)', value: service.dateOfFirstAppointment, colSpan: 2 }),
                  React.createElement(PrintCell, { key: 'c3', label: 'DATE OF JOINING IN THE FEEDER CADRE', value: service.dateOfJoiningFeederCadre })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(PrintCell, { key: 'c4', label: 'DATE OF JOINING IN THE PRESENT CADRE', value: service.dateOfJoiningPresentCadre }),
                  React.createElement(PrintCell, { key: 'c5', label: 'DATE OF JOINING IN THE PRESENT SCHOOL', value: service.dateOfJoiningPresentSchool, colSpan: 2 }),
                  React.createElement(PrintCell, { key: 'c6', label: 'APPOINTMENT MANAGEMENT', value: service.appointmentManagement })
                ]),
                React.createElement('tr', { key: 'r3' }, [
                  React.createElement(PrintCell, { key: 'c7', label: 'APPOINTED AREA', value: service.appointedArea }),
                  React.createElement(PrintCell, { key: 'c8', label: 'YEAR OF DSC', value: service.yearOfDsc }),
                  React.createElement(PrintCell, { key: 'c9', label: 'DSC LIST NO', value: service.dscListNo }),
                  React.createElement(PrintCell, { key: 'c10', label: 'RANK', value: service.rank })
                ]),
                React.createElement('tr', { key: 'r4' }, [
                  React.createElement(PrintCell, { key: 'c11', label: 'INTER DISTRICT / MUTUAL TRANSFER FROM', value: service.interDistrictMutualTransferFrom }),
                  React.createElement(PrintCell, { key: 'c12', label: 'DOJ IN WNGL', value: service.dojInWngl }),
                  React.createElement(PrintCell, { key: 'c13', label: 'IF GO 610 TRANSFERRED TEACHER, MENTION THE DISTRICT FROM WHICH TRANSFERRED', value: service.go610TransferredDistrict, colSpan: 2 })
                ]),
                React.createElement('tr', { key: 'r5' }, [
                  React.createElement(PrintCell, { key: 'c14', label: 'SSC HANDLING SUBJECT', value: service.sscHandlingSubject }),
                  React.createElement(PrintCell, { key: 'c15', label: 'SINCE (YEAR)', value: service.sinceYear }),
                  React.createElement(PrintCell, { key: 'c16', label: 'PENDING CASES IF ANY', value: service.pendingCases, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION I
          React.createElement('div', { key: 'sec-i', className: 'mb-4' }, [
            React.createElement(PrintSectionHeading, { key: 'h-i', title: 'I. ELIGIBLE PROMOTION' }),
            React.createElement('table', { key: 'tbl-i', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' },
                  promotions.map((p, i) => (
                    React.createElement('th', { key: `ph-${i}`, className: 'border border-slate-700 p-1.5' }, p.label || `Promotion-${i + 1}`)
                  ))
                )
              ]),
              React.createElement('tbody', { key: 'tb' }, [
                React.createElement('tr', { key: 'r1' },
                  promotions.map((p, i) => (
                    React.createElement('td', { key: `pd-${i}`, className: 'border border-slate-700 p-2 font-bold text-xs text-slate-900 bg-white' }, safeVal(p.designation))
                  ))
                )
              ])
            ])
          ]),

          // SECTION J
          React.createElement('div', { key: 'sec-j', className: 'mb-5' }, [
            React.createElement(PrintSectionHeading, { key: 'h-j', title: 'J. BANK ACCOUNT DETAILS (CONFIDENTIAL)' }),
            React.createElement('table', { key: 'tbl-j', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'acc', className: 'border border-slate-700 p-1.5' }, 'ACCOUNT No.'),
                  React.createElement('th', { key: 'br', className: 'border border-slate-700 p-1.5' }, 'BRANCH'),
                  React.createElement('th', { key: 'bn', className: 'border border-slate-700 p-1.5' }, 'BANK NAME'),
                  React.createElement('th', { key: 'if', className: 'border border-slate-700 p-1.5' }, 'IFSC CODE')
                ])
              ]),
              React.createElement('tbody', { key: 'tb' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement('td', { key: 'acc-val', className: 'border border-slate-700 p-2 font-mono font-bold text-xs tracking-wider bg-white' },
                    bank.accountNumberMasked || bank.accountNumber || '—'
                  ),
                  React.createElement('td', { key: 'br-val', className: 'border border-slate-700 p-2 font-bold text-xs bg-white' }, safeVal(bank.branch)),
                  React.createElement('td', { key: 'bn-val', className: 'border border-slate-700 p-2 font-bold text-xs bg-white' }, safeVal(bank.bankName)),
                  React.createElement('td', { key: 'if-val', className: 'border border-slate-700 p-2 font-mono font-bold text-xs bg-white' }, safeVal(bank.ifscCode))
                ])
              ])
            ])
          ]),

          // DECLARATION
          React.createElement('div', { key: 'box-decl', className: 'border border-slate-700 p-3 mb-3 bg-white' }, [
            React.createElement('div', { key: 'dt', className: 'text-[10px] font-black uppercase text-slate-900 mb-1' }, 'DECLARATION'),
            React.createElement('p', { key: 'dp', className: 'text-[10px] text-slate-700 leading-relaxed mb-8' },
              decl.teacherDeclaration || "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules."
            ),
            React.createElement('div', { key: 'ds', className: 'text-right' }, [
              React.createElement('div', { key: 'line', className: 'inline-block border-t border-slate-800 pt-1 text-[11px] font-extrabold text-slate-900 px-6' },
                decl.teacherSignLabel || 'Signature of the Teacher'
              )
            ])
          ]),

          // CERTIFICATE
          React.createElement('div', { key: 'box-cert', className: 'border border-slate-700 p-3 mb-3 bg-white' }, [
            React.createElement('div', { key: 'ct', className: 'text-[10px] font-black uppercase text-slate-900 mb-1' }, 'CERTIFICATE'),
            React.createElement('p', { key: 'cp', className: 'text-[10px] text-slate-700 leading-relaxed mb-8' },
              decl.certDdoHmDeclaration || "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules."
            ),
            React.createElement('div', { key: 'cs', className: 'flex justify-between items-end text-[11px] font-extrabold text-slate-900' }, [
              React.createElement('div', { key: 'ddo', className: 'border-t border-slate-800 pt-1 px-4 text-center' },
                decl.ddoHmSignLabel || 'Signature of the DDO/HM'
              ),
              React.createElement('div', { key: 'meo', className: 'border-t border-slate-800 pt-1 px-4 text-center' },
                decl.meoSignLabel || 'Signature of the MEO'
              )
            ])
          ]),

          // DECLARATION BY CLUSTER RESOURCE PERSON / COMPUTER OPERATOR / MIS COORDINATOR
          React.createElement('div', { key: 'box-cluster', className: 'border border-slate-700 p-3 mb-4 bg-white' }, [
            React.createElement('div', { key: 'clt', className: 'text-[10px] font-black uppercase text-slate-900 mb-1' },
              'DECLARATION BY CLUSTER RESOURCE PERSON / COMPUTER OPERATOR / MIS COORDINATOR'
            ),
            React.createElement('p', { key: 'clp', className: 'text-[10px] text-slate-700 leading-relaxed mb-8' },
              decl.crpCoMiscoDeclaration || "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct."
            ),
            React.createElement('div', { key: 'cls', className: 'flex justify-between items-end text-[11px] font-extrabold text-slate-900 text-center' }, [
              React.createElement('div', { key: 'crp', className: 'border-t border-slate-800 pt-1 px-3' },
                decl.crpSignLabel || 'Signature of the CRP'
              ),
              React.createElement('div', { key: 'co', className: 'border-t border-slate-800 pt-1 px-3' },
                decl.coSignLabel || 'Signature of the CO'
              ),
              React.createElement('div', { key: 'misco', className: 'border-t border-slate-800 pt-1 px-3' },
                decl.miscoSignLabel || 'Signature of the MISCO'
              )
            ])
          ]),

          // Bottom Copyright & Attribution Footer
          React.createElement('div', { key: 'p2-foot', className: 'text-center text-[9px] text-slate-600 border-t border-slate-300 pt-2 space-y-0.5' }, [
            React.createElement('div', { key: 'c' }, '© 2026 Pragnya (IN). All Rights Reserved.'),
            React.createElement('div', { key: 'd' }, 'Design & Code by P V Rajeshwar.'),
            React.createElement('div', { key: 'end', className: 'font-bold text-slate-700' }, 'Page 2 of 2 • End of Official Teacher Service Record')
          ])
        ])
      ])
    ]);
  }

  window.TeacherServiceRecordView = TeacherServiceRecordView;
})();
