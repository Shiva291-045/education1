// District Educational Office, Jangaon - Teacher Service Record Component
// Official Two-Page Document Faithful to Telangana Department of School Education Reference Images
// Read-Only, A4 Print / PDF Ready, Zero Editable Fields

(function () {
  const { useState, useEffect } = React;

  function safeVal(val) {
    if (val === undefined || val === null || String(val).trim() === '' || String(val).trim() === '-') {
      return '—';
    }
    return String(val).trim();
  }

  function Cell({ label, value, colSpan, className = '', highlight = false }) {
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

  function SectionHeading({ title }) {
    return React.createElement('div', {
      className: 'bg-slate-100 border border-slate-700 px-2 py-1 text-[10px] font-black text-slate-900 uppercase tracking-wider mb-[-1px]'
    }, title);
  }

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

          // If authenticated as a teacher or officer, request protected own record
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
              // If unauthorized or error, fallback to official preview record
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
        React.createElement('p', { key: 'txt', className: 'text-sm font-semibold text-slate-700' }, 'Retrieving official Teacher Service Record from Department database...')
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
        }, '← Back to Dashboard')
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
      // Screen Action Bar (hidden in print)
      React.createElement('div', {
        key: 'screen-action-bar',
        className: 'no-print max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs'
      }, [
        React.createElement('div', { key: 'left', className: 'flex items-center space-x-3' }, [
          React.createElement('button', {
            key: 'btn-back',
            onClick: onBack,
            className: 'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer'
          }, [
            React.createElement('span', { key: 'a' }, '←'),
            React.createElement('span', { key: 't' }, 'Back to Dashboard Overview')
          ]),
          React.createElement('span', {
            key: 'badge-ro',
            className: 'bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center space-x-1'
          }, [
            React.createElement('span', { key: 'dot' }, '🔒'),
            React.createElement('span', { key: 't' }, 'Official Record • View Only')
          ])
        ]),

        React.createElement('div', { key: 'right', className: 'flex items-center space-x-3' }, [
          React.createElement('span', {
            key: 'print-tip',
            className: 'text-[11px] text-slate-500 hidden sm:inline'
          }, 'A4 2-Page Official Format'),
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

      // Main Official Two-Page Document
      React.createElement('div', {
        key: 'document-wrapper',
        id: 'teacher-service-record-document',
        className: 'max-w-5xl mx-auto service-record-paper text-slate-900 overflow-x-auto'
      }, [

        // ==========================================
        // PAGE 1: PERSONAL & EDUCATIONAL RECORD
        // ==========================================
        React.createElement('div', {
          key: 'page-1',
          className: 'service-record-page bg-white p-6 sm:p-8 border border-slate-700 shadow-md mb-8'
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
              record.district || 'JANGAON DISTRICT'
            ),
            React.createElement('div', { key: 'details-bar', className: 'mt-2 pt-1 border-t border-slate-300 flex flex-wrap justify-between items-center text-[11px]' }, [
              React.createElement('span', { key: 'info', className: 'font-bold text-slate-800' },
                `Showing Details of: ${record.treasuryCode || '—'} - ${record.teacherName || personal.teacherName || '—'}`
              ),
              React.createElement('button', {
                key: 'print-link',
                onClick: handlePrint,
                className: 'no-print text-[#0c4a7e] hover:underline font-bold text-[10px] cursor-pointer'
              }, '[ 🖨 Print / Save as PDF ]')
            ])
          ]),

          // SECTION A — PERSONAL DETAILS OF THE EMPLOYEE
          React.createElement('div', { key: 'sec-a', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-a', title: 'A. PERSONAL DETAILS OF THE EMPLOYEE' }),
            React.createElement('table', { key: 'tbl-a', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                // Row 1
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(Cell, { key: 'c1', label: 'TREASURY CODE', value: personal.treasuryCode }),
                  React.createElement(Cell, { key: 'c2', label: 'FATHER NAME', value: personal.fatherName }),
                  React.createElement(Cell, { key: 'c3', label: 'GENDER', value: personal.gender }),
                  React.createElement(Cell, { key: 'c4', label: 'MOBILE NO', value: personal.mobileNumber }),
                  React.createElement(Cell, { key: 'c5', label: 'PHC PERCENTAGE', value: personal.phcPercentage })
                ]),
                // Row 2
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(Cell, { key: 'c6', label: 'AADHAR NO', value: personal.aadharNo }),
                  React.createElement(Cell, { key: 'c7', label: 'DESIGNATION', value: personal.designation }),
                  React.createElement(Cell, { key: 'c8', label: 'DATE OF BIRTH', value: personal.dateOfBirth }),
                  React.createElement(Cell, { key: 'c9', label: 'MARITAL STATUS', value: personal.maritalStatus, colSpan: 2 })
                ]),
                // Row 3
                React.createElement('tr', { key: 'r3' }, [
                  React.createElement(Cell, { key: 'c10', label: 'TEACHER NAME', value: personal.teacherName }),
                  React.createElement(Cell, { key: 'c11', label: 'MEDIUM', value: personal.medium }),
                  React.createElement(Cell, { key: 'c12', label: 'CASTE', value: personal.caste }),
                  React.createElement(Cell, { key: 'c13', label: 'TYPE OF PHC (OH/HH/VH/NO)', value: personal.typeOfPhc, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION B — SPOUSE DETAILS
          React.createElement('div', { key: 'sec-b', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-b', title: 'B. SPOUSE DETAILS (IF SPOUSE IS GOVT./MUNICIPAL/LOCAL BODY EMPLOYEE)' }),
            React.createElement('table', { key: 'tbl-b', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(Cell, { key: 'c1', label: 'WHETHER SPOUSE IS GOVT. EMPLOYEE', value: spouse.isSpouseGovtEmployee }),
                  React.createElement(Cell, { key: 'c2', label: 'SPOUSE DEPT NAME', value: spouse.spouseDeptName }),
                  React.createElement(Cell, { key: 'c3', label: 'SPOUSE TREASURY ID', value: spouse.spouseTreasuryId }),
                  React.createElement(Cell, { key: 'c4', label: 'SPOUSE NAME', value: spouse.spouseName })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(Cell, { key: 'c5', label: 'SPOUSE WORKING PLACE', value: spouse.spouseWorkingPlace, colSpan: 4 })
                ])
              ])
            ])
          ]),

          // SECTION C — RESIDENTIAL DETAILS
          React.createElement('div', { key: 'sec-c', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-c', title: 'C. RESIDENTIAL DETAILS' }),
            React.createElement('table', { key: 'tbl-c', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(Cell, { key: 'c1', label: 'RESIDENTIAL ADDRESS', value: residential.residentialAddress }),
                  React.createElement(Cell, { key: 'c2', label: 'RESIDENTIAL CONSTITUENCY', value: residential.residentialConstituency }),
                  React.createElement(Cell, { key: 'c3', label: 'NATIVE ADDRESS', value: residential.nativeAddress }),
                  React.createElement(Cell, { key: 'c4', label: 'NATIVE CONSTITUENCY', value: residential.nativeConstituency }),
                  React.createElement(Cell, { key: 'c5', label: 'LOCAL DISTRICT (AS PER STUDY CERTIFICATES)', value: residential.localDistrict })
                ])
              ])
            ])
          ]),

          // SECTION D — WORKING PLACE DETAILS
          React.createElement('div', { key: 'sec-d', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-d', title: 'D. WORKING PLACE DETAILS' }),
            React.createElement('table', { key: 'tbl-d', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(Cell, { key: 'c1', label: 'NEW DISTRICT', value: working.newDistrict }),
                  React.createElement(Cell, { key: 'c2', label: 'MANDAL', value: working.mandal }),
                  React.createElement(Cell, { key: 'c3', label: 'SCHOOL NAME', value: working.schoolName }),
                  React.createElement(Cell, { key: 'c4', label: 'CATEGORY OF THE SCHOOL', value: working.categoryOfSchool }),
                  React.createElement(Cell, { key: 'c5', label: 'MEDIUM OF THE SCHOOL', value: working.mediumOfSchool })
                ]),
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(Cell, { key: 'c6', label: 'HRA PERCENTAGE', value: working.hraPercentage ? `${working.hraPercentage}%` : '—' }),
                  React.createElement(Cell, { key: 'c7', label: 'SCHOOL DISE CODE', value: working.schoolDiseCode }),
                  React.createElement(Cell, { key: 'c8', label: 'MANAGEMENT', value: working.management }),
                  React.createElement(Cell, { key: 'c9', label: 'WORKING AREA', value: working.workingArea, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION E — ACADEMIC QUALIFICATIONS
          React.createElement('div', { key: 'sec-e', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-e', title: 'E. ACADEMIC QUALIFICATIONS' }),
            React.createElement('table', { key: 'tbl-e', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'border border-slate-700 p-1 text-left' }, 'Qualification'),
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
              React.createElement('tbody', { key: 'tb', className: 'text-[11px]' },
                academic.map((item, idx) => (
                  React.createElement('tr', { key: `acad-${idx}`, className: idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white' }, [
                    React.createElement('td', { key: 'q', className: 'border border-slate-700 p-1 font-semibold text-left' }, safeVal(item.qualification)),
                    React.createElement('td', { key: 'b', className: 'border border-slate-700 p-1' }, safeVal(item.branch)),
                    React.createElement('td', { key: 'm', className: 'border border-slate-700 p-1' }, safeVal(item.degreeOrMedium)),
                    React.createElement('td', { key: 'o1', className: 'border border-slate-700 p-1' }, safeVal(item.optional1)),
                    React.createElement('td', { key: 'o2', className: 'border border-slate-700 p-1' }, safeVal(item.optional2)),
                    React.createElement('td', { key: 'o3', className: 'border border-slate-700 p-1' }, safeVal(item.optional3)),
                    React.createElement('td', { key: 'u', className: 'border border-slate-700 p-1' }, safeVal(item.universityOrBoard)),
                    React.createElement('td', { key: 'y', className: 'border border-slate-700 p-1' }, safeVal(item.yearPassed)),
                    React.createElement('td', { key: 'p', className: 'border border-slate-700 p-1 font-bold' }, safeVal(item.percentage))
                  ])
                ))
              )
            ])
          ]),

          // SECTION F — PROFESSIONAL QUALIFICATIONS
          React.createElement('div', { key: 'sec-f', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-f', title: 'F. PROFESSIONAL QUALIFICATIONS' }),
            React.createElement('table', { key: 'tbl-f', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' }, [
                  React.createElement('th', { key: 'q', className: 'border border-slate-700 p-1 text-left' }, 'Qualification'),
                  React.createElement('th', { key: 'd', className: 'border border-slate-700 p-1' }, 'Degree'),
                  React.createElement('th', { key: 'm', className: 'border border-slate-700 p-1' }, 'Medium'),
                  React.createElement('th', { key: 'm1', className: 'border border-slate-700 p-1' }, 'Method-1'),
                  React.createElement('th', { key: 'm2', className: 'border border-slate-700 p-1' }, 'Method-2'),
                  React.createElement('th', { key: 'u', className: 'border border-slate-700 p-1' }, 'University'),
                  React.createElement('th', { key: 'y', className: 'border border-slate-700 p-1' }, 'Year Passed'),
                  React.createElement('th', { key: 'p', className: 'border border-slate-700 p-1' }, '%')
                ])
              ]),
              React.createElement('tbody', { key: 'tb', className: 'text-[11px]' },
                professional.map((item, idx) => (
                  React.createElement('tr', { key: `prof-${idx}`, className: idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white' }, [
                    React.createElement('td', { key: 'q', className: 'border border-slate-700 p-1 font-semibold text-left' }, safeVal(item.qualification)),
                    React.createElement('td', { key: 'd', className: 'border border-slate-700 p-1' }, safeVal(item.degree)),
                    React.createElement('td', { key: 'm', className: 'border border-slate-700 p-1' }, safeVal(item.medium)),
                    React.createElement('td', { key: 'm1', className: 'border border-slate-700 p-1' }, safeVal(item.method1)),
                    React.createElement('td', { key: 'm2', className: 'border border-slate-700 p-1' }, safeVal(item.method2)),
                    React.createElement('td', { key: 'u', className: 'border border-slate-700 p-1' }, safeVal(item.university)),
                    React.createElement('td', { key: 'y', className: 'border border-slate-700 p-1' }, safeVal(item.yearPassed)),
                    React.createElement('td', { key: 'p', className: 'border border-slate-700 p-1 font-bold' }, safeVal(item.percentage))
                  ])
                ))
              )
            ])
          ]),

          // SECTION G — DEPARTMENTAL TESTS
          React.createElement('div', { key: 'sec-g', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-g', title: 'G. DEPARTMENTAL TESTS' }),
            React.createElement('table', { key: 'tbl-g', className: 'w-full text-xs border border-slate-700 text-center' }, [
              React.createElement('thead', { key: 'th', className: 'bg-slate-100 text-[10px] uppercase font-bold text-slate-800' }, [
                React.createElement('tr', { key: 'hr' },
                  (deptTests.headers || ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"]).map((h, i) => (
                    React.createElement('th', { key: `th-${i}`, className: `border border-slate-700 p-1 ${i === 0 ? 'text-left' : ''}` }, h)
                  ))
                )
              ]),
              React.createElement('tbody', { key: 'tb', className: 'text-[11px]' }, [
                React.createElement('tr', { key: 'r-pass' },
                  (deptTests.testPassed || ["Test passed (Yes / No)", "YES", "YES", "—", "—", "NO"]).map((val, i) => (
                    React.createElement('td', {
                      key: `tp-${i}`,
                      className: `border border-slate-700 p-1 font-semibold ${i === 0 ? 'text-left bg-slate-50' : (val === 'YES' ? 'text-emerald-700 font-bold' : '')}`
                    }, safeVal(val))
                  ))
                ),
                React.createElement('tr', { key: 'r-year' },
                  (deptTests.yearOfPassing || ["Year of Passing", "Dec-10", "Dec-11", "Feb-14", "—", "—"]).map((val, i) => (
                    React.createElement('td', {
                      key: `yp-${i}`,
                      className: `border border-slate-700 p-1 ${i === 0 ? 'text-left bg-slate-50 font-semibold' : ''}`
                    }, safeVal(val))
                  ))
                )
              ])
            ])
          ]),

          // Page 1 Footer indicator
          React.createElement('div', { key: 'p1-ft', className: 'text-right text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-300' },
            'Page 1 of 2 • Personal / Educational Record'
          )
        ]),

        // Official Page Break for Print / Clean Separation
        React.createElement('div', { key: 'break', className: 'official-page-break my-6 text-center no-print' }, [
          React.createElement('span', { className: 'bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider' },
            '▼ Page 2 Follows Below (A4 Page Break) ▼'
          )
        ]),

        // ==========================================
        // PAGE 2: SERVICE DETAILS & DECLARATIONS
        // ==========================================
        React.createElement('div', {
          key: 'page-2',
          className: 'service-record-page bg-white p-6 sm:p-8 border border-slate-700 shadow-md mb-8'
        }, [
          // Page 2 Header
          React.createElement('div', { key: 'p2-head', className: 'border-b-2 border-slate-800 pb-2 mb-4 text-center' }, [
            React.createElement('div', { key: 'p2-title', className: 'text-xs font-black uppercase tracking-wider text-slate-800' },
              'GOVERNMENT OF TELANGANA • SCHOOL EDUCATION DEPARTMENT'
            ),
            React.createElement('div', { key: 'p2-sub', className: 'text-[11px] font-bold text-[#0c4a7e]' },
              `TEACHER SERVICE RECORD (PAGE 2) • Showing Details of: ${record.treasuryCode || '—'} - ${record.teacherName || personal.teacherName || '—'}`
            )
          ]),

          // SECTION H — SERVICE DETAILS
          React.createElement('div', { key: 'sec-h', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-h', title: 'H. SERVICE DETAILS' }),
            React.createElement('table', { key: 'tbl-h', className: 'w-full text-xs border border-slate-700' }, [
              React.createElement('tbody', { key: 'b' }, [
                // Row 1
                React.createElement('tr', { key: 'r1' }, [
                  React.createElement(Cell, { key: 'c1', label: 'DATE OF APPOINTMENT AS SPECIAL TEACHER (398/UNTRAINED/SPL VV)', value: service.dateOfAppointmentSpecialTeacher }),
                  React.createElement(Cell, { key: 'c2', label: 'DATE OF FIRST APPOINTMENT (DATE OF ABSORPTION IN CASE OF SPL TEACHERS)', value: service.dateOfFirstAppointment }),
                  React.createElement(Cell, { key: 'c3', label: 'DATE OF JOINING IN THE FEEDER CADRE', value: service.dateOfJoiningFeederCadre })
                ]),
                // Row 2
                React.createElement('tr', { key: 'r2' }, [
                  React.createElement(Cell, { key: 'c4', label: 'DATE OF JOINING IN THE PRESENT CADRE', value: service.dateOfJoiningPresentCadre }),
                  React.createElement(Cell, { key: 'c5', label: 'DATE OF JOINING IN THE PRESENT SCHOOL', value: service.dateOfJoiningPresentSchool }),
                  React.createElement(Cell, { key: 'c6', label: 'APPOINTMENT MANAGEMENT', value: service.appointmentManagement })
                ]),
                // Row 3
                React.createElement('tr', { key: 'r3' }, [
                  React.createElement(Cell, { key: 'c7', label: 'APPOINTED AREA', value: service.appointedArea }),
                  React.createElement(Cell, { key: 'c8', label: 'YEAR OF DSC', value: service.yearOfDsc }),
                  React.createElement(Cell, { key: 'c9', label: 'DSC LIST NO', value: service.dscListNo }),
                  React.createElement(Cell, { key: 'c10', label: 'RANK', value: service.rank })
                ]),
                // Row 4
                React.createElement('tr', { key: 'r4' }, [
                  React.createElement(Cell, { key: 'c11', label: 'INTER DISTRICT / MUTUAL TRANSFER FROM', value: service.interDistrictMutualTransferFrom }),
                  React.createElement(Cell, { key: 'c12', label: 'DOJ IN WNGL', value: service.dojInWngl }),
                  React.createElement(Cell, { key: 'c13', label: 'IF GO 610 TRANSFERRED TEACHER, MENTION THE DISTRICT FROM WHICH TRANSFERRED', value: service.go610TransferredDistrict, colSpan: 2 })
                ]),
                // Row 5
                React.createElement('tr', { key: 'r5' }, [
                  React.createElement(Cell, { key: 'c14', label: 'SSC HANDLING SUBJECT', value: service.sscHandlingSubject }),
                  React.createElement(Cell, { key: 'c15', label: 'SINCE (YEAR)', value: service.sinceYear }),
                  React.createElement(Cell, { key: 'c16', label: 'PENDING CASES IF ANY', value: service.pendingCases, colSpan: 2 })
                ])
              ])
            ])
          ]),

          // SECTION I — ELIGIBLE PROMOTION
          React.createElement('div', { key: 'sec-i', className: 'mb-4' }, [
            React.createElement(SectionHeading, { key: 'h-i', title: 'I. ELIGIBLE PROMOTION' }),
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

          // SECTION J — BANK ACCOUNT DETAILS
          React.createElement('div', { key: 'sec-j', className: 'mb-5' }, [
            React.createElement(SectionHeading, { key: 'h-j', title: 'J. BANK ACCOUNT DETAILS (CONFIDENTIAL)' }),
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

          // Bottom Copyright & Attribution Footer (as visible in reference image)
          React.createElement('div', { key: 'p2-foot', className: 'text-center text-[9px] text-slate-600 border-t border-slate-300 pt-2 space-y-0.5' }, [
            React.createElement('div', { key: 'c' }, '© 2026 Pragnya (IN). All Rights Reserved.'),
            React.createElement('div', { key: 'd' }, 'Design & Code by P V Rajeshwar.'),
            React.createElement('div', { key: 'end', className: 'font-bold text-slate-700' }, 'Page 2 of 2 • End of Official Teacher Service Record')
          ])
        ])
      ]),

      // Screen Bottom Control Bar (no-print)
      React.createElement('div', {
        key: 'bottom-action-bar',
        className: 'no-print max-w-5xl mx-auto mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3'
      }, [
        React.createElement('button', {
          key: 'btn-b2',
          onClick: onBack,
          className: 'px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors'
        }, '← Back to Dashboard Overview'),

        React.createElement('div', { key: 'pr-wrap', className: 'flex items-center space-x-2' }, [
          React.createElement('span', { key: 'lbl', className: 'text-xs text-slate-500 hidden sm:inline' },
            'Official Print / Save to PDF format is pre-configured for A4.'
          ),
          React.createElement('button', {
            key: 'btn-p2',
            onClick: handlePrint,
            className: 'bg-[#0c4a7e] hover:bg-[#08355b] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 cursor-pointer transition-all'
          }, [
            React.createElement('span', { key: 'i' }, '🖨'),
            React.createElement('span', { key: 't' }, 'Print / Save as PDF')
          ])
        ])
      ])
    ]);
  }

  window.TeacherServiceRecordView = TeacherServiceRecordView;
})();
