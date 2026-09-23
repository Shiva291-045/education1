// Official SVG Logos and Graphics for Telangana DEO Jangaon Portal
// Strictly matching IMAGE 2 (Original Correct Light Government Version)

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
      React.createElement('circle', { key: 'c3', cx: 100, cy: 100, r: 66, stroke: "#d4af37", strokeWidth: 3, fill: "#ffffff" }),
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

  // Official "1 Telangana Rising" Emblem (Matching IMAGE 2)
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

  // Giant Illustrated Pencil Banner matching IMAGE 2 exactly:
  // - "GOVERNMENT OF TELANGANA" -> DARK GREEN
  // - RED PENCIL GRAPHIC
  // - "DEPARTMENT OF SCHOOL EDUCATION" -> BLUE
  // - "JANGAON DISTRICT" -> RED / DARK RED
  PencilBanner: function({ className = "w-full max-w-3xl" }) {
    return React.createElement('div', { className: `relative flex flex-col items-center select-none ${className}` }, [
      // 1. "GOVERNMENT OF TELANGANA" -> DARK GREEN (#007a33)
      React.createElement('div', {
        key: 'govt-title',
        className: 'text-center font-extrabold tracking-widest text-[#007a33] text-base sm:text-xl md:text-2xl mb-2'
      }, 'GOVERNMENT OF TELANGANA'),

      // 2. Center Pencil Graphic (Classic Red body with wood tip, gold ferrule and eraser)
      React.createElement('div', {
        key: 'pencil-body',
        className: 'relative w-full h-8 sm:h-10 md:h-11 flex items-center shadow-md my-1.5 rounded-sm overflow-hidden'
      }, [
        // Wood sharpened tip
        React.createElement('div', {
          key: 'tip-wood',
          className: 'w-10 sm:w-14 md:w-16 h-full bg-[#f6d7b0] flex items-center justify-start relative clip-pencil-tip'
        }, [
          React.createElement('div', {
            key: 'lead',
            className: 'w-4 sm:w-5 md:w-6 h-full bg-[#1e293b] clip-lead'
          })
        ]),

        // Red pencil body shaft
        React.createElement('div', {
          key: 'shaft',
          className: 'flex-1 h-full bg-gradient-to-b from-[#e53935] via-[#d32f2f] to-[#c62828] border-y border-red-700'
        }),

        // Gold metal ferrule band
        React.createElement('div', {
          key: 'ferrule',
          className: 'w-5 sm:w-7 md:w-8 h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border-y border-amber-500 flex flex-col justify-around py-1'
        }, [
          React.createElement('div', { key: 'l1', className: 'h-0.5 bg-amber-600 opacity-60' }),
          React.createElement('div', { key: 'l2', className: 'h-0.5 bg-amber-600 opacity-60' })
        ]),

        // Dark eraser on right
        React.createElement('div', {
          key: 'eraser',
          className: 'w-7 sm:w-9 md:w-10 h-full bg-[#334155] rounded-r-sm'
        })
      ]),

      // 3. "DEPARTMENT OF SCHOOL EDUCATION" -> BLUE (#0c4a7e)
      React.createElement('div', {
        key: 'dept-title',
        className: 'text-center font-extrabold tracking-wide text-[#0c4a7e] text-base sm:text-xl md:text-2xl mt-1 uppercase'
      }, 'DEPARTMENT OF SCHOOL EDUCATION'),

      // 4. "JANGAON DISTRICT" -> RED / DARK RED (#c51c24)
      React.createElement('div', {
        key: 'district-title',
        className: 'text-center font-black tracking-wider text-[#c51c24] text-3xl sm:text-4xl md:text-5xl mt-0.5'
      }, 'JANGAON DISTRICT')
    ]);
  },

  // School Illustration Vector Graphic (Matching Column 2 in Reference Image)
  SchoolBuildingGraphic: function({ className = "w-32 h-24" }) {
    return React.createElement('svg', {
      className,
      viewBox: "0 0 200 140",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, [
      // Base grass hill
      React.createElement('ellipse', { key: 'g1', cx: 100, cy: 135, rx: 95, ry: 15, fill: "#e8f5e9" }),
      React.createElement('path', { key: 'g2', d: "M10 135 Q 100 120 190 135 Z", fill: "#c8e6c9" }),
      // Left tree
      React.createElement('rect', { key: 't1-trunk', x: 28, y: 100, width: 4, height: 25, fill: "#8d6e63" }),
      React.createElement('circle', { key: 't1-leaf1', cx: 30, cy: 90, r: 18, fill: "#81c784" }),
      React.createElement('circle', { key: 't1-leaf2', cx: 30, cy: 82, r: 14, fill: "#4caf50" }),
      // Right tree
      React.createElement('rect', { key: 't2-trunk', x: 168, y: 100, width: 4, height: 25, fill: "#8d6e63" }),
      React.createElement('circle', { key: 't2-leaf1', cx: 170, cy: 90, r: 18, fill: "#81c784" }),
      React.createElement('circle', { key: 't2-leaf2', cx: 170, cy: 82, r: 14, fill: "#4caf50" }),
      // School main block
      React.createElement('rect', { key: 'b-main', x: 50, y: 65, width: 100, height: 60, rx: 2, fill: "#ffffff", stroke: "#90caf9", strokeWidth: 1.5 }),
      // Center tower
      React.createElement('rect', { key: 'b-tower', x: 82, y: 35, width: 36, height: 90, fill: "#f0f7ff", stroke: "#64b5f6", strokeWidth: 1.5 }),
      // Roof left & right
      React.createElement('polygon', { key: 'r-l', points: "45,65 100,35 100,65", fill: "#1976d2" }),
      React.createElement('polygon', { key: 'r-r', points: "155,65 100,35 100,65", fill: "#1565c0" }),
      // Tower triangular pediment
      React.createElement('polygon', { key: 'r-tower', points: "78,35 100,10 122,35", fill: "#0d47a1" }),
      // Flag pole & flag
      React.createElement('line', { key: 'f-pole', x1: 100, y1: 10, x2: 100, y2: 0, stroke: "#37474f", strokeWidth: 1.5 }),
      React.createElement('polygon', { key: 'f-flag', points: "100,1 112,4 100,7", fill: "#ff9800" }),
      // Clock on tower
      React.createElement('circle', { key: 'clock', cx: 100, cy: 26, r: 6, fill: "#ffffff", stroke: "#0d47a1", strokeWidth: 1 }),
      React.createElement('line', { key: 'c-h', x1: 100, y1: 26, x2: 100, y2: 23, stroke: "#0d47a1", strokeWidth: 1 }),
      React.createElement('line', { key: 'c-m', x1: 100, y1: 26, x2: 103, y2: 26, stroke: "#0d47a1", strokeWidth: 1 }),
      // Windows
      React.createElement('rect', { key: 'w1', x: 58, y: 75, width: 14, height: 16, rx: 2, fill: "#e3f2fd", stroke: "#1976d2", strokeWidth: 1 }),
      React.createElement('rect', { key: 'w2', x: 58, y: 100, width: 14, height: 16, rx: 2, fill: "#e3f2fd", stroke: "#1976d2", strokeWidth: 1 }),
      React.createElement('rect', { key: 'w3', x: 128, y: 75, width: 14, height: 16, rx: 2, fill: "#e3f2fd", stroke: "#1976d2", strokeWidth: 1 }),
      React.createElement('rect', { key: 'w4', x: 128, y: 100, width: 14, height: 16, rx: 2, fill: "#e3f2fd", stroke: "#1976d2", strokeWidth: 1 }),
      // Arched main entrance door
      React.createElement('path', { key: 'door', d: "M92 125 L92 100 Q 100 92 108 100 L108 125 Z", fill: "#0c4a7e" }),
      // Entrance steps
      React.createElement('rect', { key: 'steps1', x: 88, y: 125, width: 24, height: 3, fill: "#cfd8dc" }),
      React.createElement('rect', { key: 'steps2', x: 84, y: 128, width: 32, height: 3, fill: "#b0bec5" })
    ]);
  },

  // Telangana Heritage Skyline Silhouette for Footer
  SkylineGraphic: function({ className = "w-48 h-16 opacity-30" }) {
    return React.createElement('svg', {
      className,
      viewBox: "0 0 300 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, [
      // Base line
      React.createElement('line', { key: 'b', x1: 0, y1: 78, x2: 300, y2: 78, stroke: "#ffffff", strokeWidth: 1.5 }),
      // Charminar silhouette center
      React.createElement('rect', { key: 'cm-l', x: 130, y: 20, width: 6, height: 58, fill: "#ffffff" }),
      React.createElement('rect', { key: 'cm-r', x: 164, y: 20, width: 6, height: 58, fill: "#ffffff" }),
      React.createElement('rect', { key: 'cm-b', x: 136, y: 40, width: 28, height: 38, fill: "#ffffff" }),
      React.createElement('path', { key: 'cm-a', d: "M142 78 L142 55 Q 150 48 158 55 L158 78 Z", fill: "#0c4a7e" }),
      React.createElement('circle', { key: 'cm-d1', cx: 133, cy: 18, r: 4, fill: "#ffffff" }),
      React.createElement('circle', { key: 'cm-d2', cx: 167, cy: 18, r: 4, fill: "#ffffff" }),
      // Kakatiya Kala Thoranam Arch left
      React.createElement('path', {
        key: 'kt',
        d: "M40 78 L40 40 Q 65 25 90 40 L90 78 M 48 78 L48 45 Q 65 33 82 45 L82 78",
        stroke: "#ffffff",
        strokeWidth: 2,
        fill: "none"
      }),
      // Temple tower right
      React.createElement('polygon', { key: 'tmp', points: "220,78 235,30 250,78", fill: "#ffffff" }),
      React.createElement('polygon', { key: 'tmp2', points: "260,78 270,45 280,78", fill: "#ffffff" })
    ]);
  }
};
