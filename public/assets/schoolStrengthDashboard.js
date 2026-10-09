/**
 * DISTRICT EDUCATIONAL OFFICE, JANGAON
 * Schools & Strength Analytics Dashboard Component
 * 
 * Exclusively integrates:
 * 1. Sheet 1: "District Schools Strength" (Management x Stage/Class breakdown, No. of Schools)
 * 2. Sheet 2: "Mandal wise Schools Strength" (12 Mandals x 16 Managements)
 * 
 * Implements strict RBAC:
 * - DEO & APO: Complete district-wide view and edit permissions across all mandals
 * - MEO: Strictly restricted to their assigned mandal only (both frontend & backend enforced)
 */

(function(window) {
  'use strict';

  const { useState, useEffect, useMemo, createElement: h } = window.React || React;

  // Management display labels & colors
  const MGMT_COLUMNS = [
    { key: "GOVT HS & JR", code: 10, label: "GOVT HS & JR", group: "Govt" },
    { key: "GOVT PS DNTPS", code: 11, label: "GOVT PS DNTPS", group: "Govt" },
    { key: "TGREIE", code: 12, label: "TGREIE", group: "Welfare" },
    { key: "KGBV", code: 14, label: "KGBV", group: "Welfare" },
    { key: "TGWREIS", code: 24, label: "TGWREIS", group: "Welfare" },
    { key: "TGREIS (G)", code: 27, label: "TGREIS (G)", group: "Welfare" },
    { key: "TW ASHRAM HS", code: 29, label: "TW ASHRAM HS", group: "Welfare" },
    { key: "TWPS", code: 31, label: "TWPS", group: "Welfare" },
    { key: "MPP/ZPP", code: 33, label: "MPP/ZPP", group: "Govt" },
    { key: "AIDED", code: 35, label: "AIDED", group: "Govt" },
    { key: "PVT", code: 38, label: "PVT", group: "Pvt" },
    { key: "PVT CBSE", code: 39, label: "PVT CBSE", group: "Pvt" },
    { key: "TGMS", code: 62, label: "TGMS", group: "Welfare" },
    { key: "URS JN", code: 63, label: "URS JN", group: "Welfare" },
    { key: "MJPTBC WREIS", code: 64, label: "MJPTBC WREIS", group: "Welfare" },
    { key: "TGMRS", code: 65, label: "TGMRS", group: "Welfare" }
  ];

  const STAGE_KEYS = [
    { key: "1-PS (1st-5th)", label: "1-PS (1st-5th)", desc: "Primary (Classes 1–5)" },
    { key: "2-UPS (6th-8th)", label: "2-UPS (6th-8th)", desc: "Upper Primary (Classes 6–8)" },
    { key: "3- 5th to Inter", label: "3- 5th to Inter", desc: "5th to Intermediate" },
    { key: "5- 6th to Inter", label: "5- 6th to Inter", desc: "6th to Intermediate" },
    { key: "6- PP3 to 10th", label: "6- PP3 to 10th", desc: "Pre-Primary to 10th" },
    { key: "7- HS (8th-10th)", label: "7- HS (8th-10th)", desc: "High School (Classes 8–10)" },
    { key: "11- INTER", label: "11- INTER", desc: "Intermediate (Junior College)" }
  ];

  function formatNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-IN');
  }

  const t = (k) => (window.i18n ? window.i18n.t(k) : k);

  function getManagementBadgeStyle(code) {
    switch (Number(code)) {
      case 10: // GOVT HS & JR
        return { circleBg: 'bg-blue-100 dark:bg-blue-950', textColor: 'text-blue-600 dark:text-blue-300', icon: '🏫' };
      case 11: // GOVT PS DNTPS
        return { circleBg: 'bg-rose-100 dark:bg-rose-950', textColor: 'text-rose-600 dark:text-rose-300', icon: '🏫' };
      case 12: // TGREIE
        return { circleBg: 'bg-emerald-100 dark:bg-emerald-950', textColor: 'text-emerald-600 dark:text-emerald-300', icon: '🏢' };
      case 14: // KGBV
        return { circleBg: 'bg-purple-100 dark:bg-purple-950', textColor: 'text-purple-600 dark:text-purple-300', icon: '👥' };
      case 24: // TGWREIS
        return { circleBg: 'bg-amber-100 dark:bg-amber-950', textColor: 'text-amber-600 dark:text-amber-300', icon: '🏢' };
      case 27: // TGREIS (G)
        return { circleBg: 'bg-teal-100 dark:bg-teal-950', textColor: 'text-teal-600 dark:text-teal-300', icon: '🎓' };
      case 29: // TW ASHRAM HS
        return { circleBg: 'bg-yellow-100 dark:bg-yellow-950', textColor: 'text-yellow-700 dark:text-yellow-300', icon: '🏠' };
      case 31: // TWPS
        return { circleBg: 'bg-pink-100 dark:bg-pink-950', textColor: 'text-pink-600 dark:text-pink-300', icon: '🏢' };
      case 33: // MPP/ZPP
        return { circleBg: 'bg-sky-100 dark:bg-sky-950', textColor: 'text-sky-600 dark:text-sky-300', icon: '🏫' };
      case 35: // AIDED
        return { circleBg: 'bg-emerald-100 dark:bg-emerald-950', textColor: 'text-emerald-600 dark:text-emerald-300', icon: '🤝' };
      case 38: // PVT
        return { circleBg: 'bg-rose-100 dark:bg-rose-950', textColor: 'text-rose-600 dark:text-rose-300', icon: '🎓' };
      case 39: // PVT CBSE
        return { circleBg: 'bg-purple-100 dark:bg-purple-950', textColor: 'text-purple-600 dark:text-purple-300', icon: '📖' };
      case 62: // TGMS
        return { circleBg: 'bg-indigo-100 dark:bg-indigo-950', textColor: 'text-indigo-600 dark:text-indigo-300', icon: '🏫' };
      case 63: // URS JN
        return { circleBg: 'bg-amber-100 dark:bg-amber-950', textColor: 'text-amber-600 dark:text-amber-300', icon: '🏢' };
      case 64: // MJPTBC WREIS
        return { circleBg: 'bg-violet-100 dark:bg-violet-950', textColor: 'text-violet-600 dark:text-violet-300', icon: '👥' };
      case 65: // TGMRS
        return { circleBg: 'bg-teal-100 dark:bg-teal-950', textColor: 'text-teal-600 dark:text-teal-300', icon: '🎓' };
      default:
        return { circleBg: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-600 dark:text-slate-300', icon: '🏫' };
    }
  }

  function SchoolStrengthDashboardView({ user, isDark, onBack, previewMandal, onMandalChange }) {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [apiError, setApiError] = useState(null);

    // Filters
    const [selectedMandal, setSelectedMandal] = useState('ALL');
    const [selectedSchool, setSelectedSchool] = useState('ALL');
    const [selectedManagement, setSelectedManagement] = useState('ALL');
    const [selectedStage, setSelectedStage] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Tab state
    const [activeTab, setActiveTab] = useState('MANDAL_WISE'); // 'MANDAL_WISE' | 'DISTRICT_WISE' | 'CHARTS'

    // Editing modal state
    const [editModal, setEditModal] = useState({
      open: false,
      type: null, // 'mandal' or 'district'
      record: null,
      values: {}
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveAlert, setSaveAlert] = useState(null);

    const userRole = (user?.role || '').toUpperCase();
    const isDeoOrApo = (userRole === 'DEO' || userRole === 'APO' || userRole === 'OFFICER');
    const isMeo = (userRole === 'MEO');
    const isAuthorized = isDeoOrApo || isMeo;
    const assignedMandal = user?.mandal ? user.mandal.toUpperCase() : (previewMandal ? previewMandal.toUpperCase() : (isMeo ? 'JANGAON' : null));

    // Strict Frontend Access Control: Only authenticated DEO, APO, and authorized MEO officers
    if (!isAuthorized) {
      return h('div', {
        className: 'min-h-[450px] flex items-center justify-center p-6'
      }, [
        h('div', {
          className: `max-w-md w-full p-8 rounded-2xl border text-center space-y-4 shadow-xl ${
            isDark ? 'bg-slate-900 border-red-900/60 text-slate-100' : 'bg-white border-red-200 text-slate-800'
          }`
        }, [
          h('div', { className: 'w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-bold' }, '🔒'),
          h('h2', { className: 'text-xl font-black text-red-600 dark:text-red-400' }, '403 — Access Denied'),
          h('p', { className: 'text-sm font-bold text-slate-800 dark:text-slate-100' }, 'Protected Officer Feature'),
          h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed' }, 
            'School strength records are strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official login.'
          ),
          onBack && h('button', {
            onClick: onBack,
            className: 'px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0c4a7e] hover:bg-[#08355b] transition-all cursor-pointer shadow-md'
          }, '← Return to Dashboard Overview')
        ])
      ]);
    }

    // Fetch dashboard data from backend API
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const queryParams = new URLSearchParams();
        if (selectedMandal && selectedMandal !== 'ALL') {
          queryParams.append('mandal', selectedMandal);
        }
        if (selectedSchool && selectedSchool !== 'ALL') {
          queryParams.append('school', selectedSchool);
        }
        if (selectedManagement && selectedManagement !== 'ALL') {
          queryParams.append('management', selectedManagement);
        }
        if (selectedStage && selectedStage !== 'ALL') {
          queryParams.append('stage', selectedStage);
        }

        const headers = {
          'Content-Type': 'application/json'
        };
        if (user?.sessionId) {
          headers['Authorization'] = `Bearer ${user.sessionId}`;
        }
        if (userRole) {
          headers['x-preview-role'] = userRole;
        }
        if (assignedMandal) {
          headers['x-preview-mandal'] = assignedMandal;
        }

        const res = await fetch(`/api/schools/information?${queryParams.toString()}`, {
          method: 'GET',
          headers
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Failed to fetch data (${res.status})`);
        }

        setDashboardData(json);

        // If MEO, lock selected mandal to assigned mandal
        if (json.isRestrictedToMandal && json.userMandal) {
          setSelectedMandal(json.userMandal);
        } else if (isMeo && assignedMandal) {
          setSelectedMandal(assignedMandal);
        }
      } catch (err) {
        console.error('Error loading schools information data:', err);
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [selectedMandal, selectedSchool, selectedManagement, selectedStage, assignedMandal, userRole]);

    // Handle mandal change with automatic reset of incompatible school selection
    const handleMandalChange = (newMandal) => {
      setSelectedMandal(newMandal);
      if (selectedSchool !== 'ALL') {
        setSelectedSchool('ALL');
      }
      if (onMandalChange && typeof onMandalChange === 'function') {
        onMandalChange(newMandal);
      }
    };

    // Reset all interactive filters to district-wide
    const handleResetFilters = () => {
      setSelectedMandal(isMeo ? assignedMandal : 'ALL');
      setSelectedSchool('ALL');
      setSelectedManagement('ALL');
      setSelectedStage('ALL');
      setSearchTerm('');
    };

    // Schools list filtered by selected mandal
    const availableSchoolsForSelect = useMemo(() => {
      const list = dashboardData?.filterOptions?.schools || [];
      if (!selectedMandal || selectedMandal === 'ALL') {
        return list;
      }
      return list.filter(s => s.mandal && s.mandal.toUpperCase() === selectedMandal.toUpperCase());
    }, [dashboardData, selectedMandal]);

    // Handle Mandal edit save
    const handleSaveMandal = async () => {
      if (!editModal.record || !editModal.record.mandal) return;
      setIsSaving(true);
      setSaveAlert(null);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user?.sessionId) headers['Authorization'] = `Bearer ${user.sessionId}`;
        if (userRole) headers['x-preview-role'] = userRole;
        if (assignedMandal) headers['x-preview-mandal'] = assignedMandal;

        const mandalName = encodeURIComponent(editModal.record.mandal);
        const res = await fetch(`/api/schools/information/mandal/${mandalName}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(editModal.values)
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Save failed (${res.status})`);
        }

        setSaveAlert({ type: 'success', text: json.message || "✓ Mandal data successfully saved." });
        setTimeout(() => {
          setEditModal({ open: false, type: null, record: null, values: {} });
          setSaveAlert(null);
          fetchData();
        }, 1200);
      } catch (err) {
        setSaveAlert({ type: 'error', text: `❌ ${err.message}` });
      } finally {
        setIsSaving(false);
      }
    };

    // Handle District Management edit save
    const handleSaveDistrict = async () => {
      if (!editModal.record || editModal.record.code === undefined) return;
      setIsSaving(true);
      setSaveAlert(null);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (user?.sessionId) headers['Authorization'] = `Bearer ${user.sessionId}`;
        if (userRole) headers['x-preview-role'] = userRole;

        const res = await fetch(`/api/schools/information/district/${editModal.record.code}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            schoolsCount: editModal.values.schoolsCount,
            stages: editModal.values.stages
          })
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `Save failed (${res.status})`);
        }

        setSaveAlert({ type: 'success', text: json.message || "✓ District particulars successfully saved." });
        setTimeout(() => {
          setEditModal({ open: false, type: null, record: null, values: {} });
          setSaveAlert(null);
          fetchData();
        }, 1200);
      } catch (err) {
        setSaveAlert({ type: 'error', text: `❌ ${err.message}` });
      } finally {
        setIsSaving(false);
      }
    };

    // Filtered Mandal table data for client-side search query
    const filteredMandalRows = useMemo(() => {
      if (!dashboardData || !dashboardData.tables || !dashboardData.tables.mandalStrength) return [];
      let rows = dashboardData.tables.mandalStrength;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        rows = rows.filter(r => r.mandal.toLowerCase().includes(term));
      }
      return rows;
    }, [dashboardData, searchTerm]);

    // Filtered District table data
    const filteredDistrictRows = useMemo(() => {
      if (!dashboardData || !dashboardData.tables || !dashboardData.tables.districtStrength) return [];
      let rows = dashboardData.tables.districtStrength;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        rows = rows.filter(r => r.managementName.toLowerCase().includes(term) || String(r.code).includes(term));
      }
      return rows;
    }, [dashboardData, searchTerm]);

    // Summary numbers
    const summary = dashboardData?.summary || {};
    const catSummary = summary.categorySummary || {};
    const stageSummary = summary.stageSummary || {};

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
              }, isMeo ? 'Mandal Educational Office' : 'Official Government Statistics'),
              h('span', {
                key: 'dist',
                className: 'text-xs font-bold text-sky-600 dark:text-sky-400'
              }, isMeo ? `Mandal : ${assignedMandal} • Assigned Login` : 'District : Jangaon • Protected Dashboard')
            ]),
            h('h1', {
              key: 'title',
              className: `text-lg sm:text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-[#0c4a7e]'}`
            }, isMeo ? `School Strength Particulars — ${assignedMandal} Mandal` : 'Schools Information — Jangaon District')
          ])
        ]),

        h('div', { key: 'h-right', className: 'flex items-center flex-wrap gap-2' }, [
          // Print / Save Button
          h('button', {
            key: 'btn-print',
            onClick: () => window.print(),
            className: `px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`
          }, [
            h('span', { key: 'icon' }, '🖨️'),
            h('span', { key: 'text' }, 'Print Information View')
          ]),
          // Refresh Button
          h('button', {
            key: 'btn-refresh',
            onClick: fetchData,
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
                ? `Mandal Educational Officer (${assignedMandal}): Authorized Login (${user?.name || user?.mobile || 'MEO'})`
                : `District Educational Office Administration: ${userRole || 'DEO / APO'}`
            ),
            h('div', { key: 't2', className: 'opacity-90 mt-0.5' },
              isMeo
                ? `You are authorized to view and modify strength particulars exclusively for ${assignedMandal} Mandal through your official login. Access to other mandals is strictly prohibited.`
                : 'Protected Dashboard Feature: Complete district authority to view, filter, and edit school particulars across all 12 mandals and 16 management categories.'
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
          }, isMeo ? `${assignedMandal} MANDAL ONLY • 🔐 PROTECTED` : 'DISTRICT ALL MANDALS • AUTHORIZED')
        ])
      ]),

      // 3. STATISTIC CARDS (ATTRACTIVE BOXES)
      h('div', {
        key: 'stat-cards-grid',
        className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
      }, [
        // Card 1: Total Schools
        h('div', {
          key: 'c-schools',
          className: `p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { key: 'top', className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Total Schools'),
            h('span', { className: 'p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-sm' }, '🏫')
          ]),
          h('div', { key: 'mid', className: 'my-2' }, [
            h('div', { className: `text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-[#0c4a7e]'}` },
              formatNum(summary.districtTotalSchools || 593)
            ),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              'Across 16 Management Codes'
            )
          ]),
          h('div', { key: 'btm', className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, `Govt/Local: ${catSummary.governmentSchools || 450}`),
            h('span', { className: 'text-slate-500' }, `Pvt: ${catSummary.privateSchools || 105}`),
            h('span', { className: 'text-slate-500' }, `Welfare: ${catSummary.residentialWelfareSchools || 38}`)
          ])
        ]),

        // Card 2: Total Students
        h('div', {
          key: 'c-students',
          className: `p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { key: 'top', className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Total Students'),
            h('span', { className: 'p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm' }, '🎓')
          ]),
          h('div', { key: 'mid', className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400' },
              formatNum(summary.districtTotalStudents || 74657)
            ),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              'Total District Enrollment'
            )
          ]),
          h('div', { key: 'btm', className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, 'District Total: 74,657'),
            h('span', { className: 'font-semibold text-emerald-600 dark:text-emerald-400' }, '100% Balanced')
          ])
        ]),

        // Card 3: Government & Local Body Strength
        h('div', {
          key: 'c-govt',
          className: `p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { key: 'top', className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Govt & Local Body'),
            h('span', { className: 'p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-sm' }, '🏛️')
          ]),
          h('div', { key: 'mid', className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400' },
              formatNum(catSummary.governmentStudents || 24075)
            ),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              'MPP/ZPP (21,852), Govt HS (2,051)'
            )
          ]),
          h('div', { key: 'btm', className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, '450 Schools'),
            h('span', { className: 'text-slate-500' }, 'Share: 32.2%')
          ])
        ]),

        // Card 4: Private & Residential Societies
        h('div', {
          key: 'c-pvt-res',
          className: `p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isDark ? 'bg-[#131f37] border-slate-700 shadow-md' : 'bg-white border-slate-200 shadow-xs'
          }`
        }, [
          h('div', { key: 'top', className: 'flex items-center justify-between' }, [
            h('span', { className: 'text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400' }, 'Private & Welfare'),
            h('span', { className: 'p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-sm' }, '🏢')
          ]),
          h('div', { key: 'mid', className: 'my-2' }, [
            h('div', { className: 'text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400' },
              formatNum((catSummary.privateStudents || 35000) + (catSummary.residentialWelfareStudents || 15582))
            ),
            h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
              `Pvt: ${formatNum(catSummary.privateStudents || 35000)} | Welfare: ${formatNum(catSummary.residentialWelfareStudents || 15582)}`
            )
          ]),
          h('div', { key: 'btm', className: 'pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between' }, [
            h('span', { className: 'text-slate-500' }, `${(catSummary.privateSchools || 105) + (catSummary.residentialWelfareSchools || 38)} Schools`),
            h('span', { className: 'text-slate-500' }, 'KGBV, TGMS, PVT')
          ])
        ])
      ]),

      // 4. STUDENT ENROLLMENT SECTION (IMAGE 2)
      h('div', {
        key: 'student-enrollment-section',
        className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3 ${
          isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
        }`
      }, [
        h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-1.5' }, [
          h('div', { className: 'flex items-center space-x-2' }, [
            h('span', { className: 'text-base' }, '📊'),
            h('h3', { className: `text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              t('DISTRICT CLASS / STAGE-WISE STUDENT ENROLLMENT')
            ),
            (selectedMandal !== 'ALL' || selectedSchool !== 'ALL') && h('span', {
              className: 'ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
            }, selectedSchool !== 'ALL' ? selectedSchool : selectedMandal)
          ]),
          h('span', { className: 'text-[11px] text-slate-400 font-medium' },
            t('Source: District Schools Strength Sheet 1')
          )
        ]),

        h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5' },
          STAGE_KEYS.map(s => {
            const count = stageSummary[s.key] || 0;
            const denom = (summary.activeDenominator !== undefined && summary.activeDenominator > 0)
              ? summary.activeDenominator
              : (summary.districtTotalStudents || 74657);
            const pct = denom > 0 ? ((count / denom) * 100).toFixed(1) : '0.0';
            const scopeLabel = summary.scope || (selectedSchool !== 'ALL' ? t('School') : (selectedMandal !== 'ALL' ? t('Mandal') : t('District')));
            const isSelected = selectedStage === s.key;

            return h('div', {
              key: s.key,
              onClick: () => setSelectedStage(isSelected ? 'ALL' : s.key),
              className: `p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-400 shadow-xs'
                  : (isDark ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-slate-50/80 border-slate-200 hover:border-slate-300')
              }`
            }, [
              h('div', { className: 'text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate', title: s.desc }, s.label),
              h('div', { className: 'text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 my-1' }, formatNum(count)),
              h('div', { className: 'text-[10px] text-slate-500 dark:text-slate-400 font-medium' }, `${pct}% of ${scopeLabel}`)
            ]);
          })
        )
      ]),

      // 5. INTERACTIVE FILTERS & SCHOOL CATEGORY SECTION (IMAGE 1)
      h('div', {
        key: 'filters-and-category-section',
        className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${
          isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
        }`
      }, [
        // Top filter bar matching Image 1
        h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end' }, [
          // Filter 1: Mandal
          h('div', { key: 'f-mandal', className: 'lg:col-span-3 space-y-1' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300' }, [
              t('Mandal'),
              isMeo && h('span', { className: 'ml-1 text-amber-500 text-[10px] font-normal' }, `(${t('Locked to Assigned')})`)
            ]),
            h('div', { className: 'relative' }, [
              h('span', { className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400' }, '📍'),
              h('select', {
                value: selectedMandal,
                disabled: isMeo,
                onChange: (e) => handleMandalChange(e.target.value),
                className: `w-full pl-8 pr-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0c4a7e] ${
                  isMeo
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                    : (isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300')
                }`
              }, [
                !isMeo && h('option', { key: 'all', value: 'ALL' }, t('All Mandals')),
                (dashboardData?.filterOptions?.mandals || [
                  "BACHANNAPETA", "CHILPUR", "DEVARUPPALA", "GANPUR (STN)",
                  "JANGAON", "KODAKANDLA", "LINGALAGHANPUR", "NARMETTA",
                  "PALAKURTHI", "RAGHUNATHPALLE", "THARIGOPPULA", "ZAFFERGADH"
                ]).map(m => h('option', { key: m, value: m }, m))
              ])
            ])
          ]),

          // Filter 2: School
          h('div', { key: 'f-school', className: 'lg:col-span-4 space-y-1' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300' }, t('School')),
            h('div', { className: 'relative' }, [
              h('span', { className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400' }, '🏫'),
              h('select', {
                value: selectedSchool,
                onChange: (e) => setSelectedSchool(e.target.value),
                className: `w-full pl-8 pr-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0c4a7e] ${
                  isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                }`
              }, [
                h('option', { key: 'all', value: 'ALL' }, t('All Schools')),
                availableSchoolsForSelect.map(s => h('option', { key: s.name, value: s.name }, `${s.name}${s.mandal && selectedMandal === 'ALL' ? ` (${s.mandal})` : ''}`))
              ])
            ])
          ]),

          // Filter 3: School Type (Optional)
          h('div', { key: 'f-type', className: 'lg:col-span-3 space-y-1' }, [
            h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300' }, t('School Type (Optional)')),
            h('div', { className: 'relative' }, [
              h('span', { className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400' }, '⊞'),
              h('select', {
                value: selectedManagement,
                onChange: (e) => setSelectedManagement(e.target.value),
                className: `w-full pl-8 pr-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0c4a7e] ${
                  isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                }`
              }, [
                h('option', { key: 'all', value: 'ALL' }, t('All Types')),
                MGMT_COLUMNS.map(m => h('option', { key: m.key, value: m.key }, `${m.code} - ${m.label}`))
              ])
            ])
          ]),

          // Filter 4: Reset Button
          h('div', { key: 'f-reset', className: 'lg:col-span-2' }, [
            h('button', {
              onClick: handleResetFilters,
              className: `w-full py-2 px-3 border border-sky-300 dark:border-sky-700 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs`
            }, [
              h('span', { key: 'icon', className: 'text-sm' }, '↺'),
              h('span', { key: 'text' }, t('Reset'))
            ])
          ])
        ]),

        // Divider
        h('div', { className: 'border-t border-slate-100 dark:border-slate-800 pt-3' }),

        // School Category Section Header (Image 1)
        h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1' }, [
          h('div', { className: 'flex items-center space-x-2' }, [
            h('span', { className: 'p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-sm' }, '🏫'),
            h('h3', { className: `text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              t('SCHOOL CATEGORY - WISE TOTAL (NUMBER OF SCHOOLS)')
            ),
            (selectedMandal !== 'ALL' || selectedSchool !== 'ALL') && h('span', {
              className: 'ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
            }, selectedSchool !== 'ALL' ? selectedSchool : selectedMandal)
          ]),
          h('span', { className: 'text-[11px] text-slate-400 font-medium' },
            t('Source: District Schools Strength Sheet 1')
          )
        ]),

        // 16 Category Cards Container (Image 1)
        h('div', {
          key: 'category-cards-container',
          className: 'overflow-x-auto pb-2 pt-1'
        }, [
          h('div', {
            className: 'flex gap-3 min-w-max'
          },
            MGMT_COLUMNS.map(mgmt => {
              const cardData = (summary.categoryCards || []).find(c => c.code === mgmt.code || c.name === mgmt.key) || {};
              const count = cardData.count !== undefined ? cardData.count : 0;
              const schoolsCount = cardData.schools !== undefined ? cardData.schools : (mgmt.defaultSchools || 0);
              const pct = cardData.percentage !== undefined ? cardData.percentage : '0.0';
              const scopeLabel = summary.scope || (selectedSchool !== 'ALL' ? t('School') : (selectedMandal !== 'ALL' ? t('Mandal') : t('District')));
              const isSelected = selectedManagement === mgmt.key;
              const badgeStyle = getManagementBadgeStyle(mgmt.code);

              return h('div', {
                key: mgmt.code,
                onClick: () => setSelectedManagement(isSelected ? 'ALL' : mgmt.key),
                className: `p-3 rounded-2xl border text-center transition-all cursor-pointer w-[120px] sm:w-[130px] flex-shrink-0 flex flex-col items-center justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-400 shadow-xs'
                    : (isDark ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300')
                }`
              }, [
                // Circular icon badge
                h('div', {
                  className: `w-9 h-9 rounded-full flex items-center justify-center text-base mb-1.5 shadow-2xs ${badgeStyle.circleBg} ${badgeStyle.textColor}`
                }, badgeStyle.icon),

                // Management Title
                h('div', {
                  className: 'text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate w-full',
                  title: mgmt.label
                }, mgmt.label),

                // Management Code
                h('div', {
                  className: 'text-[10px] text-slate-400 font-semibold'
                }, `Code ${mgmt.code}`),

                // Dynamic Student Count
                h('div', {
                  className: 'text-lg sm:text-xl font-black text-sky-600 dark:text-sky-400 my-1'
                }, formatNum(count)),

                // Accurate Percentage
                h('div', {
                  className: 'text-[10px] text-slate-500 dark:text-slate-400 font-medium'
                }, `${pct}% of ${scopeLabel}`),

                // Distinguishing School Count
                h('div', {
                  className: 'mt-1 text-[9px] font-bold text-slate-400 dark:text-slate-500'
                }, `${formatNum(schoolsCount)} ${schoolsCount === 1 ? t('School') : t('Schools')}`)
              ]);
            })
          )
        ])
      ]),

      // 6. MAIN DATA VIEW TABS
      h('div', { key: 'tabs-container', className: 'space-y-4' }, [
        h('div', { className: 'flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2' }, [
          h('div', { className: 'flex items-center space-x-2' }, [
            h('button', {
              key: 'tab-mandal',
              onClick: () => setActiveTab('MANDAL_WISE'),
              className: `px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MANDAL_WISE'
                  ? 'bg-[#0c4a7e] text-white shadow-xs'
                  : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
              }`
            }, 'Sheet 2: Mandal-Wise Particulars Matrix'),

            h('button', {
              key: 'tab-dist',
              onClick: () => setActiveTab('DISTRICT_WISE'),
              className: `px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DISTRICT_WISE'
                  ? 'bg-[#0c4a7e] text-white shadow-xs'
                  : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
              }`
            }, 'Sheet 1: District Schools & Stage Breakdown'),

            h('button', {
              key: 'tab-charts',
              onClick: () => setActiveTab('CHARTS'),
              className: `px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CHARTS'
                  ? 'bg-[#0c4a7e] text-white shadow-xs'
                  : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
              }`
            }, '📈 Visual Analytics & Distribution')
          ]),

          h('div', { className: 'flex items-center space-x-2' }, [
            h('div', { className: 'flex rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden' }, [
              h('input', {
                type: 'text',
                placeholder: t('Filter table records...'),
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: `px-3 py-1.5 text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'
                }`
              }),
              searchTerm && h('button', {
                onClick: () => setSearchTerm(''),
                className: 'px-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer'
              }, '✕')
            ]),
            h('div', { className: 'text-xs text-slate-500 dark:text-slate-400 font-semibold' },
              activeTab === 'MANDAL_WISE'
                ? `${filteredMandalRows.length} Mandal(s)`
                : `${filteredDistrictRows.length} Categories`
            )
          ])
        ]),

        // TAB 1: MANDAL-WISE PARTICULARS MATRIX (SHEET 2)
        activeTab === 'MANDAL_WISE' && h('div', {
          key: 'mandal-table-wrap',
          className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3 overflow-x-auto ${
            isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
          }`
        }, [
          h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800' }, [
            h('div', {}, [
              h('h3', { className: `text-sm font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
                'Mandal wise Schools Strength Particulars - Dist : jangaon'
              ),
              h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
                'Student enrollment per management category for Jangaon district mandals.'
              )
            ]),
            isMeo && h('div', {
              className: 'px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
            }, `🔒 Viewing Restricted to Mandal: ${assignedMandal}`)
          ]),

          // The Table
          h('div', { className: 'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700' }, [
            h('table', { className: 'w-full text-xs text-left border-collapse' }, [
              h('thead', { className: isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700' }, [
                h('tr', {}, [
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 w-10 text-center sticky left-0 z-10 bg-inherit' }, 'S.No'),
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 min-w-[140px] sticky left-10 z-10 bg-inherit' }, 'Mandal Name'),
                  MGMT_COLUMNS.map(m => h('th', {
                    key: m.key,
                    className: `p-2 font-bold border-b border-r dark:border-slate-700 text-center min-w-[85px] ${
                      selectedManagement === m.key ? 'bg-sky-200 dark:bg-sky-900 text-sky-950 dark:text-sky-100' : ''
                    }`
                  }, [
                    h('div', { className: 'text-[11px] truncate', title: m.label }, m.label),
                    h('div', { className: 'text-[9px] font-normal opacity-70' }, `Code ${m.code}`)
                  ])),
                  h('th', { className: 'p-2.5 font-black border-b border-r dark:border-slate-700 text-right min-w-[90px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' }, 'Total'),
                  h('th', { className: 'p-2.5 font-bold border-b dark:border-slate-700 text-center min-w-[80px]' }, 'Actions')
                ])
              ]),

              h('tbody', { className: 'divide-y divide-slate-200 dark:divide-slate-800' }, [
                filteredMandalRows.map((row, idx) => {
                  const canEdit = !isMeo || (assignedMandal && row.mandal.toUpperCase() === assignedMandal);
                  return h('tr', {
                    key: row.mandal,
                    className: `transition-colors ${
                      row.mandal === assignedMandal
                        ? (isDark ? 'bg-blue-950/20' : 'bg-blue-50/50')
                        : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50')
                    }`
                  }, [
                    h('td', { className: 'p-2.5 text-center font-semibold border-r dark:border-slate-700 sticky left-0 z-1 bg-inherit' }, idx + 1),
                    h('td', { className: 'p-2.5 font-bold text-slate-900 dark:text-slate-100 border-r dark:border-slate-700 sticky left-10 z-1 bg-inherit' }, [
                      row.mandal,
                      row.mandal === assignedMandal && h('span', { className: 'ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold' }, 'Your Mandal')
                    ]),
                    MGMT_COLUMNS.map(m => {
                      const val = row.managements ? (row.managements[m.key] || 0) : 0;
                      return h('td', {
                        key: m.key,
                        className: `p-2 text-center border-r dark:border-slate-700 ${
                          val > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'
                        } ${selectedManagement === m.key ? 'bg-sky-50 dark:bg-sky-950/30 font-bold text-sky-700 dark:text-sky-300' : ''}`
                      }, val > 0 ? formatNum(val) : '-');
                    }),
                    h('td', { className: 'p-2.5 text-right font-black border-r dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' },
                      formatNum(row.totalStudents)
                    ),
                    h('td', { className: 'p-2 text-center' }, [
                      canEdit
                        ? h('button', {
                            onClick: () => setEditModal({
                              open: true,
                              type: 'mandal',
                              record: row,
                              values: { ...(row.managements || {}) }
                            }),
                            className: 'px-2.5 py-1 rounded text-[11px] font-bold bg-[#0c4a7e] hover:bg-[#08355b] text-white transition-all shadow-xs cursor-pointer'
                          }, '✏️ Edit')
                        : h('span', { className: 'text-[10px] text-slate-400 italic' }, '🔒 Locked')
                    ])
                  ]);
                }),

                // Table Footer (Total Row)
                h('tr', { className: isDark ? 'bg-slate-900 font-black text-slate-100' : 'bg-slate-100 font-black text-slate-900' }, [
                  h('td', { className: 'p-2.5 text-center border-r dark:border-slate-700 sticky left-0 z-1 bg-inherit', colSpan: 2 }, 'Grand Total'),
                  MGMT_COLUMNS.map(m => {
                    const colTotal = filteredMandalRows.reduce((sum, r) => sum + (r.managements ? (Number(r.managements[m.key]) || 0) : 0), 0);
                    return h('td', {
                      key: m.key,
                      className: 'p-2 text-center border-r dark:border-slate-700 text-sky-600 dark:text-sky-400'
                    }, colTotal > 0 ? formatNum(colTotal) : '-');
                  }),
                  h('td', { className: 'p-2.5 text-right text-emerald-600 dark:text-emerald-400 border-r dark:border-slate-700' },
                    formatNum(filteredMandalRows.reduce((sum, r) => sum + (Number(r.totalStudents) || 0), 0))
                  ),
                  h('td', { className: 'p-2' }, '')
                ])
              ])
            ])
          ])
        ]),

        // TAB 2: DISTRICT SCHOOLS STRENGTH & STAGE BREAKDOWN (SHEET 1)
        activeTab === 'DISTRICT_WISE' && h('div', {
          key: 'district-table-wrap',
          className: `p-4 sm:p-5 rounded-2xl border shadow-sm space-y-3 overflow-x-auto ${
            isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
          }`
        }, [
          h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800' }, [
            h('div', {}, [
              h('h3', { className: `text-sm font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
                'Schools Strength Particulars - Dist : Jangaon'
              ),
              h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
                'Management Code, School Counts, and Class/Stage distribution across Jangaon District.'
              )
            ]),
            h('div', { className: 'text-xs font-semibold text-slate-500' },
              isMeo ? 'ℹ️ Read-Only District Benchmark View for MEO' : '✏️ DEO & APO District Edit Access Enabled'
            )
          ]),

          h('div', { className: 'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700' }, [
            h('table', { className: 'w-full text-xs text-left border-collapse' }, [
              h('thead', { className: isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700' }, [
                h('tr', {}, [
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 w-12 text-center' }, 'S.No'),
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 w-16 text-center' }, 'Code'),
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 min-w-[150px]' }, 'Management Name'),
                  h('th', { className: 'p-2.5 font-bold border-b border-r dark:border-slate-700 text-center w-24 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200' }, 'No of Schools'),
                  STAGE_KEYS.map(s => h('th', {
                    key: s.key,
                    className: `p-2 font-bold border-b border-r dark:border-slate-700 text-center min-w-[95px] ${
                      selectedStage === s.key ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100' : ''
                    }`
                  }, [
                    h('div', { className: 'truncate text-[11px]', title: s.desc }, s.label),
                    h('div', { className: 'text-[9px] font-normal opacity-70' }, s.desc)
                  ])),
                  h('th', { className: 'p-2.5 font-black border-b border-r dark:border-slate-700 text-right min-w-[90px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' }, 'Total Students'),
                  !isMeo && h('th', { className: 'p-2.5 font-bold border-b dark:border-slate-700 text-center min-w-[80px]' }, 'Actions')
                ])
              ]),

              h('tbody', { className: 'divide-y divide-slate-200 dark:divide-slate-800' }, [
                filteredDistrictRows.map((row, idx) => h('tr', {
                  key: row.code,
                  className: isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                }, [
                  h('td', { className: 'p-2.5 text-center font-semibold border-r dark:border-slate-700' }, idx + 1),
                  h('td', { className: 'p-2.5 text-center font-bold text-sky-600 dark:text-sky-400 border-r dark:border-slate-700' }, row.code),
                  h('td', { className: 'p-2.5 font-bold text-slate-800 dark:text-slate-200 border-r dark:border-slate-700' }, [
                    row.managementName,
                    h('span', {
                      className: 'ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }, row.category || 'Govt')
                  ]),
                  h('td', { className: 'p-2.5 text-center font-black border-r dark:border-slate-700 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300' },
                    formatNum(row.schoolsCount)
                  ),
                  STAGE_KEYS.map(s => {
                    const stVal = row.stages ? (row.stages[s.key] || 0) : 0;
                    return h('td', {
                      key: s.key,
                      className: `p-2 text-center border-r dark:border-slate-700 ${
                        stVal > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'
                      } ${selectedStage === s.key ? 'bg-amber-50 dark:bg-amber-950/30 font-bold' : ''}`
                    }, stVal > 0 ? formatNum(stVal) : '-');
                  }),
                  h('td', { className: 'p-2.5 text-right font-black border-r dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' },
                    formatNum(row.totalStudents)
                  ),
                  !isMeo && h('td', { className: 'p-2 text-center' }, [
                    h('button', {
                      onClick: () => setEditModal({
                        open: true,
                        type: 'district',
                        record: row,
                        values: {
                          schoolsCount: row.schoolsCount,
                          stages: { ...(row.stages || {}) }
                        }
                      }),
                      className: 'px-2.5 py-1 rounded text-[11px] font-bold bg-[#0c4a7e] hover:bg-[#08355b] text-white transition-all shadow-xs cursor-pointer'
                    }, '✏️ Edit')
                  ])
                ])),

                // Footer Row
                h('tr', { className: isDark ? 'bg-slate-900 font-black text-slate-100' : 'bg-slate-100 font-black text-slate-900' }, [
                  h('td', { className: 'p-2.5 text-center border-r dark:border-slate-700', colSpan: 3 }, 'District Grand Total'),
                  h('td', { className: 'p-2.5 text-center border-r dark:border-slate-700 text-sky-600 dark:text-sky-400' },
                    formatNum(filteredDistrictRows.reduce((sum, r) => sum + (Number(r.schoolsCount) || 0), 0))
                  ),
                  STAGE_KEYS.map(s => {
                    const stSum = filteredDistrictRows.reduce((sum, r) => sum + (r.stages ? (Number(r.stages[s.key]) || 0) : 0), 0);
                    return h('td', {
                      key: s.key,
                      className: 'p-2 text-center border-r dark:border-slate-700 text-sky-600 dark:text-sky-400'
                    }, stSum > 0 ? formatNum(stSum) : '-');
                  }),
                  h('td', { className: 'p-2.5 text-right text-emerald-600 dark:text-emerald-400 border-r dark:border-slate-700' },
                    formatNum(filteredDistrictRows.reduce((sum, r) => sum + (Number(r.totalStudents) || 0), 0))
                  ),
                  !isMeo && h('td', { className: 'p-2' }, '')
                ])
              ])
            ])
          ])
        ]),

        // TAB 3: VISUAL ANALYTICS & DISTRIBUTION BARS
        activeTab === 'CHARTS' && h('div', {
          key: 'charts-wrap',
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6'
        }, [
          // Management Share Chart
          h('div', {
            key: 'c-mgmt-share',
            className: `p-5 rounded-2xl border shadow-sm space-y-4 ${
              isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
            }`
          }, [
            h('h3', { className: `text-sm font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              '🏫 Management Category Distribution'
            ),
            h('div', { className: 'space-y-3' }, [
              { label: 'Private Schools (PVT + CBSE)', count: catSummary.privateStudents || 35000, total: 74657, color: 'bg-purple-500' },
              { label: 'MPP / Zilla Parishad (MPP/ZPP)', count: 21852, total: 74657, color: 'bg-blue-600' },
              { label: 'Residential Welfare (KGBV, TGMS, MJPTBC, etc.)', count: catSummary.residentialWelfareStudents || 15582, total: 74657, color: 'bg-emerald-500' },
              { label: 'Government High School & Junior Colleges', count: 2051, total: 74657, color: 'bg-amber-500' },
              { label: 'Aided & Special Schools', count: 172, total: 74657, color: 'bg-rose-500' }
            ].map(item => {
              const pct = ((item.count / item.total) * 100).toFixed(1);
              return h('div', { key: item.label, className: 'space-y-1' }, [
                h('div', { className: 'flex justify-between text-xs font-semibold' }, [
                  h('span', { className: isDark ? 'text-slate-300' : 'text-slate-700' }, item.label),
                  h('span', { className: 'text-slate-500' }, `${formatNum(item.count)} (${pct}%)`)
                ]),
                h('div', { className: 'w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden' }, [
                  h('div', {
                    className: `h-full rounded-full ${item.color} transition-all duration-500`,
                    style: { width: `${pct}%` }
                  })
                ])
              ]);
            }))
          ]),

          // Stage Distribution Chart
          h('div', {
            key: 'c-stage-share',
            className: `p-5 rounded-2xl border shadow-sm space-y-4 ${
              isDark ? 'bg-[#131f37] border-slate-700' : 'bg-white border-slate-200'
            }`
          }, [
            h('h3', { className: `text-sm font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
              '🎓 Class & Stage Enrollment Breakdown'
            ),
            h('div', { className: 'space-y-3' },
              STAGE_KEYS.map(s => {
                const count = stageSummary[s.key] || 0;
                const pct = summary.districtTotalStudents ? ((count / summary.districtTotalStudents) * 100).toFixed(1) : 0;
                return h('div', { key: s.key, className: 'space-y-1' }, [
                  h('div', { className: 'flex justify-between text-xs font-semibold' }, [
                    h('span', { className: isDark ? 'text-slate-300' : 'text-slate-700' }, `${s.label} - ${s.desc}`),
                    h('span', { className: 'text-slate-500' }, `${formatNum(count)} (${pct}%)`)
                  ]),
                  h('div', { className: 'w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden' }, [
                    h('div', {
                      className: 'h-full rounded-full bg-sky-500 transition-all duration-500',
                      style: { width: `${pct}%` }
                    })
                  ])
                ]);
              })
            )
          ])
        ])
      ]),

      // 7. EDIT MODAL DIALOG
      editModal.open && h('div', {
        key: 'edit-modal',
        className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs'
      }, [
        h('div', {
          className: `w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-5 ${
            isDark ? 'bg-[#131f37] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`
        }, [
          // Modal Header
          h('div', { className: 'flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800' }, [
            h('div', {}, [
              h('h3', { className: `text-base font-bold ${isDark ? 'text-sky-300' : 'text-[#0c4a7e]'}` },
                editModal.type === 'mandal'
                  ? `✏️ Edit Mandal Particulars: ${editModal.record?.mandal}`
                  : `✏️ Edit District Particulars: ${editModal.record?.managementName} (Code ${editModal.record?.code})`
              ),
              h('p', { className: 'text-xs text-slate-500 dark:text-slate-400 mt-0.5' },
                editModal.type === 'mandal'
                  ? 'Update student strength counts across management categories for this mandal.'
                  : 'Update schools count and class/stage student breakdown.'
              )
            ]),
            h('button', {
              onClick: () => setEditModal({ open: false, type: null, record: null, values: {} }),
              className: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold'
            }, '✕')
          ]),

          // Alert inside modal
          saveAlert && h('div', {
            className: `p-3 rounded-xl text-xs font-semibold border ${
              saveAlert.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
            }`
          }, saveAlert.text),

          // Modal Form - Mandal Type
          editModal.type === 'mandal' && h('div', { className: 'space-y-4' }, [
            h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1' },
              MGMT_COLUMNS.map(m => {
                const currentVal = editModal.values[m.key] !== undefined ? editModal.values[m.key] : 0;
                return h('div', { key: m.key, className: 'space-y-1' }, [
                  h('label', { className: 'block text-xs font-semibold text-slate-700 dark:text-slate-300' },
                    `${m.label} (Code ${m.code})`
                  ),
                  h('input', {
                    type: 'number',
                    min: 0,
                    value: currentVal,
                    onChange: (e) => {
                      const val = parseInt(e.target.value, 10);
                      setEditModal(prev => ({
                        ...prev,
                        values: { ...prev.values, [m.key]: isNaN(val) ? 0 : val }
                      }));
                    },
                    className: `w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#0c4a7e] ${
                      isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                    }`
                  })
                ]);
              })
            ),

            // Live updated total
            h('div', { className: 'p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border dark:border-slate-700 flex justify-between items-center text-xs font-bold' }, [
              h('span', { className: 'text-slate-600 dark:text-slate-300' }, 'Recalculated Mandal Total:'),
              h('span', { className: 'text-base font-black text-emerald-600 dark:text-emerald-400' },
                formatNum(Object.values(editModal.values).reduce((s, v) => s + (Number(v) || 0), 0))
              )
            ])
          ]),

          // Modal Form - District Type
          editModal.type === 'district' && h('div', { className: 'space-y-4' }, [
            h('div', { className: 'space-y-1' }, [
              h('label', { className: 'block text-xs font-bold text-slate-700 dark:text-slate-300' }, 'Number of Schools'),
              h('input', {
                type: 'number',
                min: 0,
                value: editModal.values.schoolsCount !== undefined ? editModal.values.schoolsCount : (editModal.record?.schoolsCount || 0),
                onChange: (e) => {
                  const val = parseInt(e.target.value, 10);
                  setEditModal(prev => ({
                    ...prev,
                    values: { ...prev.values, schoolsCount: isNaN(val) ? 0 : val }
                  }));
                },
                className: `w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#0c4a7e] ${
                  isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                }`
              })
            ]),

            h('div', { className: 'pt-2 border-t border-slate-100 dark:border-slate-800' }, [
              h('h4', { className: 'text-xs font-bold text-slate-700 dark:text-slate-300 mb-2' }, 'Stage-wise Student Counts'),
              h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1' },
                STAGE_KEYS.map(s => {
                  const stageVals = editModal.values.stages || {};
                  const currentVal = stageVals[s.key] !== undefined ? stageVals[s.key] : (editModal.record?.stages?.[s.key] || 0);
                  return h('div', { key: s.key, className: 'space-y-1' }, [
                    h('label', { className: 'block text-xs font-semibold text-slate-700 dark:text-slate-300' }, s.label),
                    h('input', {
                      type: 'number',
                      min: 0,
                      value: currentVal,
                      onChange: (e) => {
                        const val = parseInt(e.target.value, 10);
                        setEditModal(prev => ({
                          ...prev,
                          values: {
                            ...prev.values,
                            stages: {
                              ...(prev.values.stages || {}),
                              [s.key]: isNaN(val) ? 0 : val
                            }
                          }
                        }));
                      },
                      className: `w-full px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#0c4a7e] ${
                        isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                      }`
                    })
                  ]);
                })
              )
            ])
          ]),

          // Modal Actions
          h('div', { className: 'flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800' }, [
            h('button', {
              onClick: () => setEditModal({ open: false, type: null, record: null, values: {} }),
              disabled: isSaving,
              className: `px-4 py-2 rounded-xl text-xs font-semibold border ${
                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`
            }, 'Cancel'),
            h('button', {
              onClick: editModal.type === 'mandal' ? handleSaveMandal : handleSaveDistrict,
              disabled: isSaving,
              className: `px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                isSaving ? 'bg-sky-400 cursor-not-allowed' : 'bg-[#0c4a7e] hover:bg-[#08355b]'
              }`
            }, isSaving ? 'Saving Changes...' : '💾 Save Particulars')
          ])
        ])
      ])
    ]);
  }

  window.SchoolsInformationDashboardView = SchoolStrengthDashboardView;
  window.SchoolStrengthDashboardView = SchoolStrengthDashboardView;

})(typeof window !== 'undefined' ? window : this);
