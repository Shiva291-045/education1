// District Educational Office, Jangaon - Reusable Print Directory View Module
// Standardized Government-Style Multi-Page Print Layout for Teachers & Students Directories
// Features: Print Current Filtered Results vs Print All Records, Repeated Headers, No Blank Pages

(function () {
  'use strict';

  function formatNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-IN');
  }

  function getFormattedDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '-';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generates the printable HTML and triggers browser print
   */
  async function executePrint({
    directoryType, // 'TEACHERS' | 'STUDENTS'
    mode,          // 'FILTERED' | 'ALL'
    title,
    subtitle,
    scopeText,
    user,
    activeFiltersSummary,
    orientation = 'landscape',
    fetchData,
    columns = [],
    summaryStats = {}
  }) {
    // 1. Fetch the records
    const records = await fetchData();
    if (!records || records.length === 0) {
      alert('No records available to print for the selected option.');
      return false;
    }

    // 2. Prepare or reset print container
    let container = document.getElementById('directory-print-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'directory-print-container';
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    const isTeachers = (directoryType === 'TEACHERS');
    const isFiltered = (mode === 'FILTERED');
    const formattedDate = getFormattedDateTime();
    const userRole = (user?.role || 'OFFICER').toUpperCase();
    const userMandal = (user?.mandal || '').toUpperCase();
    const isMeo = (userRole === 'MEO');

    const mainTitle = title || (isTeachers
      ? (isMeo ? `TEACHERS INFORMATION DIRECTORY — ${userMandal} MANDAL` : 'OFFICIAL TEACHERS INFORMATION DIRECTORY — JANGAON DISTRICT')
      : (isMeo ? `STUDENTS INFORMATION & ENROLLMENT DIRECTORY — ${userMandal} MANDAL` : 'OFFICIAL STUDENTS INFORMATION & ENROLLMENT DIRECTORY — JANGAON DISTRICT')
    );

    const docSubtitle = subtitle || 'DEPARTMENT OF SCHOOL EDUCATION • GOVERNMENT OF TELANGANA';
    const jurisdiction = scopeText || (isMeo ? `Mandal Educational Office: ${userMandal} Mandal` : 'District Educational Office: Jangaon District (All 12 Mandals)');
    const modeLabel = isFiltered ? 'Current Filtered Results' : 'Complete Authorized Dataset';

    // 3. Build Header HTML
    let html = `
      <div class="dir-print-header">
        <div class="dir-print-header-top">
          <img src="/assets/telangana_govt_emblem.png" class="dir-emblem" alt="Government of Telangana Emblem" />
          <div class="dir-header-titles">
            <div class="dir-gov-title">GOVERNMENT OF TELANGANA</div>
            <div class="dir-dept-title">DEPARTMENT OF SCHOOL EDUCATION</div>
            <div class="dir-office-title">DISTRICT EDUCATIONAL OFFICE, JANGAON</div>
            <div class="dir-doc-title">${escapeHtml(mainTitle)}</div>
            <div class="dir-sub-title">${escapeHtml(jurisdiction)}</div>
          </div>
          <img src="/assets/telangana_rising_logo.png" class="dir-rising-logo" alt="Telangana Rising" />
        </div>
        <div class="dir-meta-bar">
          <div class="dir-meta-item"><strong>Mode:</strong> <span class="dir-meta-tag">${escapeHtml(modeLabel)}</span></div>
          <div class="dir-meta-item"><strong>Total Records:</strong> ${formatNum(records.length)}</div>
          ${!isTeachers && summaryStats.totalStudents ? `<div class="dir-meta-item"><strong>Total Students:</strong> ${formatNum(summaryStats.totalStudents)}</div>` : ''}
          <div class="dir-meta-item"><strong>Generated:</strong> ${escapeHtml(formattedDate)}</div>
          <div class="dir-meta-item"><strong>Authorized Officer:</strong> ${escapeHtml(userRole)} ${userMandal ? `(${escapeHtml(userMandal)})` : ''}</div>
        </div>
        <div class="dir-filter-summary">
          <strong>Applied Filter Criteria:</strong> ${escapeHtml(isFiltered ? (activeFiltersSummary || 'Custom Filter Active') : 'All Authorized Directory Records (No active filter restriction)')}
        </div>
      </div>
    `;

    // 4. Build Table HTML
    html += `<table class="dir-print-table">
      <thead>
        <tr>`;
    columns.forEach(col => {
      const align = col.align || (col.key === '_sno' ? 'center' : 'left');
      const w = col.width ? `style="width: ${col.width}; text-align: ${align};"` : `style="text-align: ${align};"`;
      html += `<th ${w}>${escapeHtml(col.header)}</th>`;
    });
    html += `</tr>
      </thead>
      <tbody>`;

    records.forEach((row, idx) => {
      html += `<tr>`;
      columns.forEach(col => {
        let val = '';
        if (col.key === '_sno') {
          val = idx + 1;
        } else if (typeof col.render === 'function') {
          val = col.render(row, idx);
        } else {
          val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-';
        }

        const align = col.align || (col.key === '_sno' ? 'center' : 'left');
        const style = col.style ? `style="text-align: ${align}; ${col.style}"` : `style="text-align: ${align};"`;
        html += `<td ${style}>${typeof val === 'number' ? formatNum(val) : escapeHtml(val)}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody>`;

    // Table Footer (Total row)
    if (isTeachers) {
      html += `<tfoot>
        <tr class="dir-print-total-row">
          <td colspan="3" style="text-align: center; font-weight: 800;">Grand Total Records</td>
          <td colspan="${Math.max(1, columns.length - 3)}" style="font-weight: 800;">
            ${formatNum(records.length)} Teachers
          </td>
        </tr>
      </tfoot>`;
    } else {
      // Students Total
      const totalStudents = summaryStats.totalStudents !== undefined
        ? summaryStats.totalStudents
        : records.reduce((sum, r) => sum + (Number(r.studentsCount || r.totalStudents) || 0), 0);

      html += `<tfoot>
        <tr class="dir-print-total-row">
          <td colspan="4" style="text-align: center; font-weight: 800;">District / Mandal Grand Total (${records.length} Institutions)</td>
          <td colspan="${Math.max(1, columns.length - 5)}" style="text-align: center; font-weight: 700;">Enrolled Student Strength</td>
          <td colspan="1" style="text-align: right; font-weight: 900; font-size: 9px;">${formatNum(totalStudents)}</td>
        </tr>
      </tfoot>`;
    }

    html += `</table>`;

    // 5. Official Verification & Signatory Block
    html += `
      <div class="dir-print-footer-block">
        <div class="dir-sign-grid">
          <div class="dir-sign-cell">
            <div class="dir-sign-line"></div>
            <div class="dir-sign-role">Prepared & Verified by</div>
            <div class="dir-sign-desig">MIS Coordinator / Computer Operator</div>
            <div class="dir-sign-loc">O/o Mandal Educational Officer</div>
          </div>
          <div class="dir-sign-cell">
            <div class="dir-sign-line"></div>
            <div class="dir-sign-role">Verified & Recommended by</div>
            <div class="dir-sign-desig">Mandal Educational Officer (MEO)</div>
            <div class="dir-sign-loc">${userMandal ? escapeHtml(userMandal) + ' Mandal' : 'Concerned Mandal'}</div>
          </div>
          <div class="dir-sign-cell">
            <div class="dir-sign-line"></div>
            <div class="dir-sign-role">Approved & Countersigned by</div>
            <div class="dir-sign-desig">District Educational Officer (DEO)</div>
            <div class="dir-sign-loc">Jangaon District, Telangana</div>
          </div>
        </div>
        <div class="dir-disclaimer">
          Official Government Educational Directory • Department of School Education, Government of Telangana • Generated: ${escapeHtml(formattedDate)} • Valid without physical seal if digitally authenticated
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 6. Set print classes on body and inject orientation @page rule
    const body = document.body;
    body.classList.remove('print-portrait', 'print-landscape');
    body.classList.add('is-printing-directory');
    if (orientation === 'portrait') {
      body.classList.add('print-portrait');
    } else {
      body.classList.add('print-landscape');
    }

    let dynamicPageStyle = document.getElementById('dir-print-dynamic-page-style');
    if (!dynamicPageStyle) {
      dynamicPageStyle = document.createElement('style');
      dynamicPageStyle.id = 'dir-print-dynamic-page-style';
      document.head.appendChild(dynamicPageStyle);
    }
    dynamicPageStyle.innerHTML = `@media print { @page { size: A4 ${orientation}; margin: 5mm 6mm; } }`;

    // Set document title temporarily so saved PDF has an authentic filename
    const origTitle = document.title;
    const cleanDate = formattedDate.replace(/[^0-9]/g, '').slice(0, 8);
    const pdfName = isTeachers
      ? `Jangaon_DEO_Teachers_Directory_${isFiltered ? 'Filtered' : 'Complete'}_${cleanDate}`
      : `Jangaon_DEO_Students_Directory_${isFiltered ? 'Filtered' : 'Complete'}_${cleanDate}`;
    document.title = pdfName;

    // 7. Trigger print
    setTimeout(() => {
      try {
        window.print();
      } finally {
        // Cleanup on print finish / cancel
        const cleanup = () => {
          body.classList.remove('is-printing-directory', 'print-portrait', 'print-landscape');
          document.title = origTitle;
          if (dynamicPageStyle && dynamicPageStyle.parentNode) {
            dynamicPageStyle.parentNode.removeChild(dynamicPageStyle);
          }
        };
        if ('onafterprint' in window) {
          window.onafterprint = () => {
            cleanup();
            window.onafterprint = null;
          };
        }
        setTimeout(cleanup, 2500);
      }
    }, 150);

    return true;
  }

  /**
   * React UI Modal for Print Directory View
   */
  function PrintDirectoryModal({ isOpen, onClose, config }) {
    if (!isOpen || !config) return null;

    const h = React.createElement;
    const { useState } = React;

    const [loadingMode, setLoadingMode] = useState(null); // 'FILTERED' | 'ALL' | null
    const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
    const [errorMsg, setErrorMsg] = useState(null);

    const isTeachers = (config.directoryType === 'TEACHERS');
    const userRole = (config.user?.role || 'OFFICER').toUpperCase();
    const userMandal = (config.user?.mandal || '').toUpperCase();
    const isMeo = (userRole === 'MEO');

    const filteredCount = config.filteredCount || 0;
    const totalCount = config.totalCount || 0;

    const handlePrintClick = async (mode) => {
      setLoadingMode(mode);
      setErrorMsg(null);
      try {
        const fetchFn = (mode === 'FILTERED') ? config.fetchFiltered : config.fetchAll;
        const success = await executePrint({
          directoryType: config.directoryType,
          mode: mode,
          title: config.title,
          subtitle: config.subtitle,
          scopeText: config.scopeText,
          user: config.user,
          activeFiltersSummary: config.activeFiltersSummary,
          orientation: orientation,
          fetchData: fetchFn,
          columns: config.columns,
          summaryStats: config.summaryStats || {}
        });
        if (success) {
          onClose();
        }
      } catch (err) {
        console.error('[PRINT DIRECTORY] Error generating print layout:', err);
        setErrorMsg(err.message || 'Error preparing directory for printing. Please try again.');
      } finally {
        setLoadingMode(null);
      }
    };

    return h('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn',
      onClick: (e) => {
        if (e.target === e.currentTarget && !loadingMode) onClose();
      }
    }, [
      h('div', {
        className: 'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden animate-scaleUp',
        onClick: (e) => e.stopPropagation()
      }, [
        // Modal Header
        h('div', {
          className: 'px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-blue-50/40 dark:from-slate-800 dark:to-slate-900'
        }, [
          h('div', { className: 'flex items-center space-x-2.5' }, [
            h('span', { className: 'text-2xl' }, '🖨️'),
            h('div', {}, [
              h('div', { className: 'flex items-center space-x-2' }, [
                h('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0c4a7e] text-white' }, 'Official DEO Portal'),
                h('span', { className: 'text-xs font-bold text-sky-600 dark:text-sky-400' }, isMeo ? `Mandal: ${userMandal}` : 'District: Jangaon')
              ]),
              h('h3', { className: 'text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5' },
                isTeachers ? 'Print Teachers Information Directory' : 'Print Students Information & Enrollment Directory'
              )
            ])
          ]),
          h('button', {
            onClick: onClose,
            disabled: !!loadingMode,
            className: 'w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer'
          }, '✕')
        ]),

        // Modal Body
        h('div', { className: 'p-5 space-y-4' }, [
          // Informational Alert
          h('div', {
            className: 'p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-2.5'
          }, [
            h('span', { className: 'text-base mt-0.5' }, '🏛️'),
            h('div', {}, [
              h('div', { className: 'font-bold' }, 'Government-Standard Multi-Page Print Layout'),
              h('div', { className: 'opacity-90 mt-0.5 leading-relaxed' },
                'Generates an official document with repeated headers, clean borders, authentic data, and official signatures. Printing includes all matching records across all pages (not just the 20 visible rows on screen).'
              )
            ])
          ]),

          // Active Filter Badge Summary
          h('div', {
            className: 'p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5'
          }, [
            h('div', { className: 'text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider' }, 'Current Screen Search & Filter Criteria:'),
            h('div', { className: 'font-semibold text-slate-800 dark:text-slate-200 text-xs' },
              config.activeFiltersSummary || 'None (Showing All Records)'
            )
          ]),

          // Error Notification
          errorMsg && h('div', {
            className: 'p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold'
          }, `⚠️ ${errorMsg}`),

          // Two Primary Print Action Cards
          h('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1' }, [
            // Option 1: Print Current Filtered Results
            h('div', {
              onClick: () => !loadingMode && handlePrintClick('FILTERED'),
              className: `p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                loadingMode === 'FILTERED'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-300'
                  : 'border-sky-300 hover:border-[#0c4a7e] hover:bg-sky-50/60 dark:border-slate-700 dark:hover:border-sky-500 bg-white dark:bg-slate-800/80 shadow-xs hover:shadow-md'
              }`
            }, [
              h('div', { className: 'space-y-1.5' }, [
                h('div', { className: 'flex items-center justify-between' }, [
                  h('span', { className: 'text-2xl' }, '📑'),
                  h('span', {
                    className: 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                  }, `${formatNum(filteredCount)} Records`)
                ]),
                h('h4', { className: 'text-sm font-black text-[#0c4a7e] dark:text-sky-300 group-hover:text-sky-700' },
                  'Print Filtered Results'
                ),
                h('p', { className: 'text-[11px] text-slate-500 dark:text-slate-400 leading-snug' },
                  `Prints every matching record (${formatNum(filteredCount)} total) across all pages respecting active filters.`
                )
              ]),
              h('button', {
                type: 'button',
                disabled: !!loadingMode,
                className: 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#0c4a7e] hover:bg-[#08355b] text-white transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer'
              }, [
                loadingMode === 'FILTERED'
                  ? [h('div', { key: 'spin', className: 'w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' }), h('span', { key: 't' }, 'Generating...')]
                  : [h('span', { key: 'i' }, '🖨️'), h('span', { key: 't' }, `Print ${formatNum(filteredCount)} Records`)]
              ])
            ]),

            // Option 2: Print All Records
            h('div', {
              onClick: () => !loadingMode && handlePrintClick('ALL'),
              className: `p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                loadingMode === 'ALL'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-300'
                  : 'border-emerald-300 hover:border-emerald-700 hover:bg-emerald-50/60 dark:border-slate-700 dark:hover:border-emerald-500 bg-white dark:bg-slate-800/80 shadow-xs hover:shadow-md'
              }`
            }, [
              h('div', { className: 'space-y-1.5' }, [
                h('div', { className: 'flex items-center justify-between' }, [
                  h('span', { className: 'text-2xl' }, '📚'),
                  h('span', {
                    className: 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  }, `${formatNum(totalCount)} Records`)
                ]),
                h('h4', { className: 'text-sm font-black text-emerald-800 dark:text-emerald-300 group-hover:text-emerald-900' },
                  'Print All Records'
                ),
                h('p', { className: 'text-[11px] text-slate-500 dark:text-slate-400 leading-snug' },
                  `Prints complete authorized dataset (${formatNum(totalCount)} total) without changing current screen filters.`
                )
              ]),
              h('button', {
                type: 'button',
                disabled: !!loadingMode,
                className: 'w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer'
              }, [
                loadingMode === 'ALL'
                  ? [h('div', { key: 'spin', className: 'w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' }), h('span', { key: 't' }, 'Generating...')]
                  : [h('span', { key: 'i' }, '🖨️'), h('span', { key: 't' }, `Print All (${formatNum(totalCount)})`)]
              ])
            ])
          ]),

          // Page Orientation Selection
          h('div', { className: 'flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs' }, [
            h('span', { className: 'font-semibold text-slate-600 dark:text-slate-400' }, 'Page Orientation:'),
            h('div', { className: 'inline-flex rounded-lg border border-slate-300 dark:border-slate-600 p-0.5 bg-slate-100 dark:bg-slate-800' }, [
              h('button', {
                type: 'button',
                onClick: () => setOrientation('landscape'),
                className: `px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-[#0c4a7e] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`
              }, '🔄 Landscape (Recommended)'),
              h('button', {
                type: 'button',
                onClick: () => setOrientation('portrait'),
                className: `px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-[#0c4a7e] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`
              }, '📄 Portrait')
            ])
          ])
        ]),

        // Modal Footer
        h('div', {
          className: 'px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end'
        }, [
          h('button', {
            type: 'button',
            onClick: onClose,
            disabled: !!loadingMode,
            className: 'px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer'
          }, 'Cancel')
        ])
      ])
    ]);
  }

  // Standalone modal state container when not rendered directly in React
  let globalModalRoot = null;
  function openPrintDirectoryModal(config) {
    let mountNode = document.getElementById('print-directory-modal-root');
    if (!mountNode) {
      mountNode = document.createElement('div');
      mountNode.id = 'print-directory-modal-root';
      document.body.appendChild(mountNode);
    }

    if (!globalModalRoot && window.ReactDOM && window.ReactDOM.createRoot) {
      globalModalRoot = window.ReactDOM.createRoot(mountNode);
    }

    const closeHandler = () => {
      if (globalModalRoot) {
        globalModalRoot.render(null);
      } else if (window.ReactDOM && window.ReactDOM.render) {
        window.ReactDOM.unmountComponentAtNode(mountNode);
      }
    };

    const modalElement = React.createElement(PrintDirectoryModal, {
      isOpen: true,
      onClose: closeHandler,
      config: config
    });

    if (globalModalRoot) {
      globalModalRoot.render(modalElement);
    } else if (window.ReactDOM && window.ReactDOM.render) {
      window.ReactDOM.render(modalElement, mountNode);
    }
  }

  // Expose on window
  window.PrintDirectoryModal = PrintDirectoryModal;
  window.openPrintDirectoryModal = openPrintDirectoryModal;
  window.executePrintDirectory = executePrint;

})();
