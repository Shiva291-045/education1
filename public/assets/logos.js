// Official SVG Logos and Graphics for Telangana DEO Jangaon Portal
// Strictly matching original government visual identity and colors

window.PORTAL_LOGOS = {
  // Telangana State Emblem SVG Crest
  TelanganaEmblem: function({ className = "w-16 h-16" }) {
    return React.createElement('svg', {
      className,
      viewBox: "0 0 200 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, [
      // Outer green ring
      React.createElement('circle', { key: 'c1', cx: 100, cy: 100, r: 94, stroke: "#007a33", strokeWidth: 8, fill: "#ffffff" }),
      React.createElement('circle', { key: 'c2', cx: 100, cy: 100, r: 84, stroke: "#007a33", strokeWidth: 2, strokeDasharray: "4 3" }),
      // Inner decorative ring
      React.createElement('circle', { key: 'c3', cx: 100, cy: 100, r: 66, stroke: "#d4af37", strokeWidth: 3, fill: "#fbfcf7" }),
      // Kakatiya Kala Thoranam arch
      React.createElement('path', {
        key: 'arch',
        d: "M55 125 C 55 70, 145 70, 145 125 M 65 125 C 65 82, 135 82, 135 125",
        stroke: "#007a33",
        strokeWidth: 4,
        fill: "none"
      }),
      // Arch decorative brackets
      React.createElement('path', {
        key: 'brackets',
        d: "M60 98 Q 72 88 85 92 Q 100 80 115 92 Q 128 88 140 98",
        stroke: "#007a33",
        strokeWidth: 3,
        fill: "none"
      }),
      // Charminar center silhouette
      React.createElement('rect', { key: 'minar-l', x: 80, y: 92, width: 6, height: 32, fill: "#007a33" }),
      React.createElement('rect', { key: 'minar-r', x: 114, y: 92, width: 6, height: 32, fill: "#007a33" }),
      React.createElement('rect', { key: 'dome', x: 84, y: 98, width: 32, height: 6, fill: "#007a33" }),
      React.createElement('path', { key: 'dome-arc', d: "M88 124 C 88 108 112 108 112 124 Z", fill: "#007a33" }),
      // Pedestal at bottom
      React.createElement('rect', { key: 'pedestal', x: 74, y: 132, width: 52, height: 8, rx: 2, fill: "#007a33" }),
      React.createElement('circle', { key: 'chakra', cx: 100, cy: 136, r: 3, fill: "#d4af37" }),
      // Text
      React.createElement('text', {
        key: 'txt1',
        x: 100,
        y: 28,
        textAnchor: "middle",
        fill: "#007a33",
        fontSize: "12",
        fontWeight: "bold",
        fontFamily: "Inter, sans-serif"
      }, "GOVERNMENT OF TELANGANA"),
      React.createElement('text', {
        key: 'txt2',
        x: 100,
        y: 180,
        textAnchor: "middle",
        fill: "#007a33",
        fontSize: "11",
        fontWeight: "bold",
        fontFamily: "sans-serif"
      }, "తెలంగాణ ప్రభుత్వం • حکومت تلنگانہ")
    ]);
  },

  // Official "1 Telangana Rising" Emblem
  TelanganaRisingLogo: function({ className = "w-24 h-24" }) {
    return React.createElement('svg', {
      className,
      viewBox: "0 0 160 160",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, [
      React.createElement('path', {
        key: 'num1',
        d: "M60 42 L88 24 L102 24 L102 124 L118 124 L118 136 L48 136 L48 124 L68 124 L68 46 L54 54 Z",
        fill: "url(#blueGrad)",
        stroke: "#0c4a7e",
        strokeWidth: 2
      }),
      React.createElement('circle', { key: 'medallion', cx: 85, cy: 75, r: 16, fill: "#ffffff", stroke: "#0c4a7e", strokeWidth: 2 }),
      React.createElement('path', { key: 'arch-mini', d: "M76 82 C 76 70 94 70 94 82 Z", fill: "#0c4a7e" }),
      React.createElement('defs', { key: 'defs' }, [
        React.createElement('linearGradient', {
          key: 'grad1',
          id: 'blueGrad',
          x1: '0%', y1: '0%', x2: '100%', y2: '100%'
        }, [
          React.createElement('stop', { key: 's1', offset: '0%', stopColor: '#0c4a7e' }),
          React.createElement('stop', { key: 's2', offset: '100%', stopColor: '#1976d2' })
        ])
      ]),
      React.createElement('text', {
        key: 'txt-tel',
        x: 80,
        y: 148,
        textAnchor: "middle",
        fill: "#0c4a7e",
        fontSize: "12",
        fontWeight: "900",
        letterSpacing: "1px",
        fontFamily: "Inter, sans-serif"
      }, "TELANGANA"),
      React.createElement('text', {
        key: 'txt-ris',
        x: 80,
        y: 159,
        textAnchor: "middle",
        fill: "#d32f2f",
        fontSize: "10",
        fontWeight: "900",
        letterSpacing: "2px",
        fontFamily: "Inter, sans-serif"
      }, "RISING")
    ]);
  },

  // Giant Illustrated Pencil Banner matching the original screenshot
  PencilBanner: function({ className = "w-full max-w-4xl" }) {
    return React.createElement('div', { className: `relative flex flex-col items-center select-none ${className}` }, [
      // Top Government Label in Forest Green
      React.createElement('div', {
        key: 'govt-title',
        className: 'text-center font-extrabold tracking-widest text-[#007a33] text-sm md:text-lg mb-1'
      }, 'GOVERNMENT OF TELANGANA'),

      // Pencil Graphic
      React.createElement('div', {
        key: 'pencil-body',
        className: 'relative w-full h-14 md:h-16 flex items-center shadow-md my-1 rounded-sm overflow-hidden'
      }, [
        // Wood tip
        React.createElement('div', {
          key: 'tip-wood',
          className: 'w-10 md:w-14 h-full bg-[#f6d7b0] flex items-center justify-start relative clip-pencil-tip'
        }, [
          React.createElement('div', {
            key: 'lead',
            className: 'w-4 md:w-5 h-full bg-[#1e293b] clip-lead'
          })
        ]),

        // Red Pencil Body with bold white text
        React.createElement('div', {
          key: 'shaft',
          className: 'flex-1 h-full bg-[#d32f2f] flex items-center justify-center px-4 border-y border-red-700'
        }, [
          React.createElement('span', {
            key: 'pencil-text',
            className: 'text-white font-extrabold text-sm sm:text-lg md:text-2xl tracking-wider uppercase text-center drop-shadow'
          }, 'DEPARTMENT OF SCHOOL EDUCATION')
        ]),

        // Gold metal ferrule band
        React.createElement('div', {
          key: 'ferrule',
          className: 'w-4 md:w-6 h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border-y border-amber-500 flex flex-col justify-around py-1'
        }, [
          React.createElement('div', { key: 'l1', className: 'h-0.5 bg-amber-600 opacity-60' }),
          React.createElement('div', { key: 'l2', className: 'h-0.5 bg-amber-600 opacity-60' })
        ]),

        // Dark eraser on right
        React.createElement('div', {
          key: 'eraser',
          className: 'w-8 md:w-10 h-full bg-[#334155] rounded-r-sm'
        })
      ]),

      // District Title in Original Maroon/Red
      React.createElement('div', {
        key: 'district-title',
        className: 'text-center font-black tracking-wider text-[#990000] text-xl sm:text-2xl md:text-4xl mt-1'
      }, 'JANGAON DISTRICT')
    ]);
  }
};
