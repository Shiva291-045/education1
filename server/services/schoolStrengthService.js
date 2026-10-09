const fs = require('fs');
const path = require('path');
let xlsx;
try {
  xlsx = require('xlsx');
} catch (e) {
  xlsx = null;
}

const MANDAL_MAPPINGS = {
  'GHANPUR STN': 'GANPUR (STN)',
  'GANPUR (STN)': 'GANPUR (STN)',
  'PALAKURTHY': 'PALAKURTHI',
  'PALAKURTHI': 'PALAKURTHI',
  'RAGHUNATHPALLY': 'RAGHUNATHPALLE',
  'RAGHUNATHPALLE': 'RAGHUNATHPALLE',
  'BACHANNAPET': 'BACHANNAPETA',
  'BACHANNAPETA': 'BACHANNAPETA'
};

const OFFICIAL_12_MANDALS = [
  "BACHANNAPETA", "CHILPUR", "DEVARUPPULA", "GANPUR (STN)",
  "JANGAON", "KODAKANDLA", "LINGALAGHANPUR", "NARMETTA",
  "PALAKURTHI", "RAGHUNATHPALLE", "THARIGOPPULA", "ZAFFERGADH"
];

const DB_FILE = path.join(__dirname, '..', 'education_db.json');

// Exact District Schools Strength from Sheet 1: "Schools Strength Particulars- Dist : Jangaon"
const INITIAL_DISTRICT_STRENGTH = [
  {
    code: 10,
    managementName: "GOVT HS & JR",
    category: "Government",
    schoolsCount: 8,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 347,
      "11- INTER": 1704
    },
    totalStudents: 2051
  },
  {
    code: 11,
    managementName: "GOVT PS DNTPS",
    category: "Government",
    schoolsCount: 2,
    stages: {
      "1-PS (1st-5th)": 8,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 8
  },
  {
    code: 12,
    managementName: "TGREIE",
    category: "Residential/Welfare",
    schoolsCount: 1,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 616,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 616
  },
  {
    code: 14,
    managementName: "KGBV",
    category: "Residential/Welfare",
    schoolsCount: 12,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 3554,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 3554
  },
  {
    code: 24,
    managementName: "TGWREIS",
    category: "Residential/Welfare",
    schoolsCount: 5,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 2455,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 2455
  },
  {
    code: 27,
    managementName: "TGREIS (G)",
    category: "Residential/Welfare",
    schoolsCount: 1,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 595,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 595
  },
  {
    code: 29,
    managementName: "TW ASHRAM HS",
    category: "Residential/Welfare",
    schoolsCount: 4,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 73,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 538,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 611
  },
  {
    code: 31,
    managementName: "TWPS",
    category: "Residential/Welfare",
    schoolsCount: 1,
    stages: {
      "1-PS (1st-5th)": 6,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 6
  },
  {
    code: 33,
    managementName: "MPP/ZPP",
    category: "Government",
    schoolsCount: 434,
    stages: {
      "1-PS (1st-5th)": 9610,
      "2-UPS (6th-8th)": 2874,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 143,
      "7- HS (8th-10th)": 9225,
      "11- INTER": 0
    },
    totalStudents: 21852
  },
  {
    code: 35,
    managementName: "AIDED",
    category: "Government/Aided",
    schoolsCount: 6,
    stages: {
      "1-PS (1st-5th)": 114,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 50,
      "11- INTER": 0
    },
    totalStudents: 164
  },
  {
    code: 38,
    managementName: "PVT",
    category: "Private",
    schoolsCount: 101,
    stages: {
      "1-PS (1st-5th)": 435,
      "2-UPS (6th-8th)": 3481,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 26121,
      "7- HS (8th-10th)": 155,
      "11- INTER": 2050
    },
    totalStudents: 32242
  },
  {
    code: 39,
    managementName: "PVT CBSE",
    category: "Private",
    schoolsCount: 4,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 1513,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 1245,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 2758
  },
  {
    code: 62,
    managementName: "TGMS",
    category: "Residential/Welfare",
    schoolsCount: 8,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 3774,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 3774
  },
  {
    code: 63,
    managementName: "URS JN",
    category: "Residential/Welfare",
    schoolsCount: 1,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 95,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 95
  },
  {
    code: 64,
    managementName: "MJPTBC WREIS",
    category: "Residential/Welfare",
    schoolsCount: 3,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 3115,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 3115
  },
  {
    code: 65,
    managementName: "TGMRS",
    category: "Residential/Welfare",
    schoolsCount: 2,
    stages: {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 761,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    },
    totalStudents: 761
  }
];

// Exact Mandal-wise Schools Strength from Sheet 2: "Mandal wise Schools Strength Particulars- Dist : jangaon"
const INITIAL_MANDAL_STRENGTH = [
  {
    mandal: "BACHANNAPETA",
    managements: {
      "KGBV": 315,
      "MPP/ZPP": 2257,
      "PVT": 1828,
      "TGMS": 501
    },
    totalStudents: 4901
  },
  {
    mandal: "CHILPUR",
    managements: {
      "KGBV": 340,
      "TWPS": 6,
      "MPP/ZPP": 1664,
      "PVT": 1036
    },
    totalStudents: 3046
  },
  {
    mandal: "DEVARUPPALA",
    managements: {
      "GOVT HS & JR": 145,
      "KGBV": 247,
      "MPP/ZPP": 1894,
      "PVT": 2011
    },
    totalStudents: 4297
  },
  {
    mandal: "GANPUR (STN)",
    managements: {
      "GOVT HS & JR": 549,
      "KGBV": 363,
      "TGWREIS": 434,
      "TW ASHRAM HS": 276,
      "MPP/ZPP": 1967,
      "PVT": 4941,
      "TGMS": 625,
      "MJPTBC WREIS": 1148,
      "TGMRS": 410
    },
    totalStudents: 10713
  },
  {
    mandal: "JANGAON",
    managements: {
      "GOVT HS & JR": 974,
      "KGBV": 367,
      "TGWREIS": 889,
      "TW ASHRAM HS": 154,
      "MPP/ZPP": 3439,
      "AIDED": 164,
      "PVT": 13027,
      "PVT CBSE": 2758,
      "TGMS": 361,
      "URS JN": 95,
      "MJPTBC WREIS": 1468,
      "TGMRS": 351
    },
    totalStudents: 24047
  },
  {
    mandal: "KODAKANDLA",
    managements: {
      "GOVT HS & JR": 107,
      "TGREIE": 616,
      "KGBV": 247,
      "MPP/ZPP": 1023,
      "PVT": 396,
      "TGMS": 527,
      "MJPTBC WREIS": 499
    },
    totalStudents: 3415
  },
  {
    mandal: "LINGALAGHANPUR",
    managements: {
      "KGBV": 268,
      "MPP/ZPP": 1488,
      "PVT": 1038,
      "TGMS": 546
    },
    totalStudents: 3340
  },
  {
    mandal: "NARMETTA",
    managements: {
      "GOVT HS & JR": 149,
      "KGBV": 263,
      "TW ASHRAM HS": 181,
      "MPP/ZPP": 940,
      "PVT": 1646,
      "TGMS": 476
    },
    totalStudents: 3655
  },
  {
    mandal: "PALAKURTHI",
    managements: {
      "GOVT PS DNTPS": 4,
      "KGBV": 350,
      "TGWREIS": 604,
      "TGREIS (G)": 595,
      "MPP/ZPP": 2155,
      "PVT": 3957
    },
    totalStudents: 7665
  },
  {
    mandal: "RAGHUNATHPALLE",
    managements: {
      "KGBV": 233,
      "MPP/ZPP": 2447,
      "PVT": 1649,
      "TGMS": 301
    },
    totalStudents: 4630
  },
  {
    mandal: "THARIGOPPULA",
    managements: {
      "GOVT PS DNTPS": 4,
      "KGBV": 233,
      "MPP/ZPP": 807,
      "PVT": 294
    },
    totalStudents: 1338
  },
  {
    mandal: "ZAFFERGADH",
    managements: {
      "GOVT HS & JR": 127,
      "KGBV": 328,
      "TGWREIS": 528,
      "MPP/ZPP": 1771,
      "PVT": 419,
      "TGMS": 437
    },
    totalStudents: 3610
  }
];

class SchoolStrengthService {
  constructor() {
    this.ensureInitialized();
    this.schoolsList = [];
    this.initSchoolsIndex();
  }

  initSchoolsIndex() {
    try {
      const candidates = [
        path.join(__dirname, '..', '..', 'TEST MANDAL WISE T DATA (1).xlsx'),
        path.join(__dirname, '..', '..', 'Teacher_Data_Masked.xlsx')
      ];
      let excelPath = null;
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          excelPath = p;
          break;
        }
      }

      const schoolMap = new Map();
      if (excelPath && xlsx) {
        const wb = xlsx.readFile(excelPath);
        const sheet = wb.Sheets['empList'] || wb.Sheets[wb.SheetNames[0]];
        const teachersData = xlsx.utils.sheet_to_json(sheet);

        teachersData.forEach(r => {
          const sName = (r[' SCHOOL NAME'] || '').trim();
          let mandal = (r[' MANDAL'] || '').trim().toUpperCase();
          mandal = MANDAL_MAPPINGS[mandal] || mandal;
          if (!OFFICIAL_12_MANDALS.includes(mandal)) return;
          const dise = (r[' DISE CODE'] || '').toString().trim();
          const cat = (r[' CATEGEORY OF THE SCHOOL'] || '').trim();
          const mgmt = (r[' MANAGEMENT'] || '').trim();

          if (sName) {
            const key = mandal + '___' + sName;
            if (!schoolMap.has(key)) {
              schoolMap.set(key, {
                name: sName,
                mandal: mandal,
                diseCode: dise,
                category: cat || 'HS',
                management: mgmt === 'LB' ? 'MPP/ZPP' : (mgmt === 'GOVT' ? 'GOVT HS & JR' : mgmt),
                managementCode: mgmt === 'LB' ? 33 : (mgmt === 'GOVT' ? 10 : 33),
                stage: cat === 'PS' ? '1-PS (1st-5th)' : (cat === 'UPS' ? '2-UPS (6th-8th)' : '7- HS (8th-10th)'),
                teachersCount: 0,
                studentsCount: 0
              });
            }
            schoolMap.get(key).teachersCount++;
          }
        });
      }

      // Add special institutions from Sheet 2 for each mandal
      INITIAL_MANDAL_STRENGTH.forEach(m => {
        const mName = m.mandal;
        const specials = [
          { key: 'KGBV', name: `KGBV ${mName}`, code: 14, stage: '5- 6th to Inter' },
          { key: 'TGMS', name: `TS MODEL SCHOOL (TGMS) ${mName}`, code: 62, stage: '5- 6th to Inter' },
          { key: 'TGREIE', name: `TGREIE ${mName}`, code: 12, stage: '3- 5th to Inter' },
          { key: 'TGWREIS', name: `TGWREIS ${mName}`, code: 24, stage: '3- 5th to Inter' },
          { key: 'TGREIS (G)', name: `TGREIS (G) ${mName}`, code: 27, stage: '3- 5th to Inter' },
          { key: 'TW ASHRAM HS', name: `TW ASHRAM HS ${mName}`, code: 29, stage: '6- PP3 to 10th' },
          { key: 'TWPS', name: `TWPS ${mName}`, code: 31, stage: '1-PS (1st-5th)' },
          { key: 'AIDED', name: `AIDED HIGH SCHOOL ${mName}`, code: 35, stage: '7- HS (8th-10th)' },
          { key: 'PVT CBSE', name: `PVT CBSE SCHOOL ${mName}`, code: 39, stage: '6- PP3 to 10th' },
          { key: 'URS JN', name: `URS JN SCHOOL ${mName}`, code: 63, stage: '6- PP3 to 10th' },
          { key: 'MJPTBC WREIS', name: `MJPTBC WREIS ${mName}`, code: 64, stage: '3- 5th to Inter' },
          { key: 'TGMRS', name: `TGMRS (MINORITY RESIDENTIAL) ${mName}`, code: 65, stage: '3- 5th to Inter' }
        ];

        specials.forEach(sp => {
          if (m.managements && m.managements[sp.key] && m.managements[sp.key] > 0) {
            const skey = mName + '___' + sp.name;
            if (!schoolMap.has(skey)) {
              schoolMap.set(skey, {
                name: sp.name,
                mandal: mName,
                diseCode: '3619' + String(mName.charCodeAt(0)) + String(sp.code) + '01',
                category: sp.key,
                management: sp.key,
                managementCode: sp.code,
                stage: sp.stage,
                teachersCount: 10,
                studentsCount: m.managements[sp.key]
              });
            }
          }
        });
      });

      const schoolList = Array.from(schoolMap.values());

      // Distribute students among MPP/ZPP schools in each mandal
      INITIAL_MANDAL_STRENGTH.forEach(m => {
        const mName = m.mandal;
        const mppStudents = m.managements['MPP/ZPP'] || 0;
        if (mppStudents > 0) {
          const mppSchoolsInMandal = schoolList.filter(s => s.mandal === mName && s.managementCode === 33);
          const totalTeachersInMandal = mppSchoolsInMandal.reduce((sum, s) => sum + s.teachersCount, 0) || 1;
          let distributed = 0;
          mppSchoolsInMandal.forEach((s, idx) => {
            if (idx === mppSchoolsInMandal.length - 1) {
              s.studentsCount = mppStudents - distributed;
            } else {
              const share = Math.round((s.teachersCount / totalTeachersInMandal) * mppStudents);
              s.studentsCount = share;
              distributed += share;
            }
          });
        }
      });

      this.schoolsList = schoolList.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`[SchoolStrengthService] Indexed ${this.schoolsList.length} schools across 12 mandals.`);
    } catch (err) {
      console.error('[SchoolStrengthService] Failed to index schools:', err);
      this.schoolsList = [];
    }
  }

  ensureInitialized() {
    try {
      let data = {};
      if (fs.existsSync(DB_FILE)) {
        data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      }
      let changed = false;
      if (!data.school_strength_district || !Array.isArray(data.school_strength_district) || data.school_strength_district.length === 0) {
        data.school_strength_district = JSON.parse(JSON.stringify(INITIAL_DISTRICT_STRENGTH));
        changed = true;
      }
      if (!data.school_strength_mandal || !Array.isArray(data.school_strength_mandal) || data.school_strength_mandal.length === 0) {
        data.school_strength_mandal = JSON.parse(JSON.stringify(INITIAL_MANDAL_STRENGTH));
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('[SchoolStrengthService] Initialization error:', err);
    }
  }

  readData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('[SchoolStrengthService] Read error:', e);
    }
    return {
      school_strength_district: INITIAL_DISTRICT_STRENGTH,
      school_strength_mandal: INITIAL_MANDAL_STRENGTH
    };
  }

  saveData(partial) {
    try {
      const data = this.readData();
      Object.assign(data, partial);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('[SchoolStrengthService] Save error:', err);
      return false;
    }
  }

  /**
   * Main query engine with strict RBAC enforcement
   * @param {Object} query - { mandal, management, stage }
   * @param {Object} user - Authenticated user object { id, role, mandal, ... }
   */
  getDashboardData(query = {}, user) {
    if (!user) {
      return {
        success: false,
        status: 401,
        message: "Authentication required. Active login session required to access school strength records."
      };
    }

    const role = (user.role || '').toUpperCase();
    const isDeoOrApo = (role === 'DEO' || role === 'APO' || role === 'OFFICER');
    const isMeo = (role === 'MEO');

    if (!isDeoOrApo && !isMeo) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: School strength records are strictly restricted to authenticated DEO, APO, and authorized MEO officers."
      };
    }

    const rawData = this.readData();
    const districtRecords = rawData.school_strength_district || INITIAL_DISTRICT_STRENGTH;
    let mandalRecords = rawData.school_strength_mandal || INITIAL_MANDAL_STRENGTH;

    // Strict Backend RBAC: MEO can ONLY view data belonging to their assigned mandal through their login
    const userMandal = (user.mandal || '').trim().toUpperCase();
    if (isMeo) {
      if (!userMandal) {
        return {
          success: false,
          status: 403,
          message: "Access Denied: MEO user has no assigned mandal. Please contact District Educational Officer."
        };
      }
      if (query.mandal && query.mandal.trim().toUpperCase() !== 'ALL' && query.mandal.trim().toUpperCase() !== userMandal) {
        return {
          success: false,
          status: 403,
          message: `Access Denied: As MEO of ${userMandal}, you are strictly prohibited from viewing or accessing records for ${query.mandal}.`
        };
      }
      mandalRecords = mandalRecords.filter(m => m.mandal.trim().toUpperCase() === userMandal);
    }

    // Filter by requested mandal if provided and allowed
    let activeMandal = isMeo ? userMandal : (query.mandal && query.mandal.trim().toUpperCase() !== 'ALL' ? query.mandal.trim().toUpperCase() : null);

    // Filter schools for this mandal
    const allSchools = this.schoolsList || [];
    let availableSchools = activeMandal
      ? allSchools.filter(s => s.mandal.toUpperCase() === activeMandal.toUpperCase())
      : allSchools;

    // Filter by requested school if provided and compatible
    let activeSchool = null;
    let selectedSchoolObj = null;
    if (query.school && query.school.trim().toUpperCase() !== 'ALL') {
      const targetSchoolName = query.school.trim().toUpperCase();
      const match = availableSchools.find(s => s.name.toUpperCase() === targetSchoolName);
      if (match) {
        activeSchool = match.name;
        selectedSchoolObj = match;
        // If no mandal was explicitly chosen, auto-focus school's mandal
        if (!activeMandal) {
          activeMandal = match.mandal;
          availableSchools = allSchools.filter(s => s.mandal.toUpperCase() === match.mandal.toUpperCase());
        }
      }
    }

    // Filter district records by management if requested
    let filteredDistrict = districtRecords;
    if (query.management && query.management.trim().toUpperCase() !== 'ALL') {
      const targetMgmt = query.management.trim().toUpperCase();
      filteredDistrict = filteredDistrict.filter(d => d.managementName.trim().toUpperCase() === targetMgmt || String(d.code) === targetMgmt);
    }

    // Filter district records by stage if requested
    if (query.stage && query.stage.trim().toUpperCase() !== 'ALL') {
      const targetStage = query.stage.trim();
      filteredDistrict = filteredDistrict.filter(d => (d.stages && (d.stages[targetStage] || 0) > 0));
    }

    // Filter mandal records by active mandal
    let displayMandalRecords = mandalRecords;
    if (activeMandal) {
      displayMandalRecords = mandalRecords.filter(m => m.mandal.trim().toUpperCase() === activeMandal);
    }

    // If management filter is applied, adjust mandal records view
    if (query.management && query.management.trim().toUpperCase() !== 'ALL') {
      const targetMgmt = query.management.trim().toUpperCase();
      displayMandalRecords = displayMandalRecords.map(m => {
        const mgmtStrength = m.managements[targetMgmt] || 0;
        return {
          mandal: m.mandal,
          managements: mgmtStrength > 0 ? { [targetMgmt]: mgmtStrength } : {},
          totalStudents: mgmtStrength
        };
      }).filter(m => m.totalStudents > 0);
    }

    // District-Wide Totals (Constant Benchmarks from Sheet 1)
    const districtTotalSchools = districtRecords.reduce((sum, d) => sum + (Number(d.schoolsCount) || 0), 0);
    const districtTotalStudents = districtRecords.reduce((sum, d) => sum + (Number(d.totalStudents) || 0), 0);

    // Dynamic Filtered Totals for summary cards
    const filteredSchools = filteredDistrict.reduce((sum, d) => sum + (Number(d.schoolsCount) || 0), 0);
    const filteredStudents = filteredDistrict.reduce((sum, d) => sum + (Number(d.totalStudents) || 0), 0);
    let mandalTotalStudents = displayMandalRecords.reduce((sum, m) => sum + (Number(m.totalStudents) || 0), 0);

    // Category Breakdowns (Government vs Private vs Residential/Welfare) for Summary Cards
    const categorySummary = {
      governmentStudents: 0,
      governmentSchools: 0,
      privateStudents: 0,
      privateSchools: 0,
      residentialWelfareStudents: 0,
      residentialWelfareSchools: 0
    };

    filteredDistrict.forEach(d => {
      const cat = (d.category || '').toLowerCase();
      const stdCount = Number(d.totalStudents) || 0;
      const schCount = Number(d.schoolsCount) || 0;
      if (cat.includes('private')) {
        categorySummary.privateStudents += stdCount;
        categorySummary.privateSchools += schCount;
      } else if (cat.includes('residential') || cat.includes('welfare')) {
        categorySummary.residentialWelfareStudents += stdCount;
        categorySummary.residentialWelfareSchools += schCount;
      } else {
        categorySummary.governmentStudents += stdCount;
        categorySummary.governmentSchools += schCount;
      }
    });

    // 16 Management Category definitions
    const MGMT_DEFINITIONS = [
      { key: "GOVT HS & JR", code: 10, defaultSchools: 8, group: "Govt" },
      { key: "GOVT PS DNTPS", code: 11, defaultSchools: 2, group: "Govt" },
      { key: "TGREIE", code: 12, defaultSchools: 1, group: "Welfare" },
      { key: "KGBV", code: 14, defaultSchools: 12, group: "Welfare" },
      { key: "TGWREIS", code: 24, defaultSchools: 5, group: "Welfare" },
      { key: "TGREIS (G)", code: 27, defaultSchools: 1, group: "Welfare" },
      { key: "TW ASHRAM HS", code: 29, defaultSchools: 4, group: "Welfare" },
      { key: "TWPS", code: 31, defaultSchools: 1, group: "Welfare" },
      { key: "MPP/ZPP", code: 33, defaultSchools: 434, group: "Govt" },
      { key: "AIDED", code: 35, defaultSchools: 6, group: "Govt" },
      { key: "PVT", code: 38, defaultSchools: 101, group: "Pvt" },
      { key: "PVT CBSE", code: 39, defaultSchools: 4, group: "Pvt" },
      { key: "TGMS", code: 62, defaultSchools: 8, group: "Welfare" },
      { key: "URS JN", code: 63, defaultSchools: 1, group: "Welfare" },
      { key: "MJPTBC WREIS", code: 64, defaultSchools: 3, group: "Welfare" },
      { key: "TGMRS", code: 65, defaultSchools: 2, group: "Welfare" }
    ];

    // DYNAMIC CATEGORY CARDS & STAGE ENROLLMENT CARDS
    let dynamicCategoryCards = [];
    let dynamicStageSummary = {
      "1-PS (1st-5th)": 0,
      "2-UPS (6th-8th)": 0,
      "3- 5th to Inter": 0,
      "5- 6th to Inter": 0,
      "6- PP3 to 10th": 0,
      "7- HS (8th-10th)": 0,
      "11- INTER": 0
    };
    let activeDenominator = districtTotalStudents; // 74,657
    let activeScope = 'District';

    if (selectedSchoolObj) {
      // SCENARIO C / B: Specific School is selected
      activeScope = selectedSchoolObj.name;
      activeDenominator = selectedSchoolObj.studentsCount || 0;
      const sTotal = selectedSchoolObj.studentsCount || 0;

      dynamicCategoryCards = MGMT_DEFINITIONS.map(mDef => {
        const isMatch = mDef.code === selectedSchoolObj.managementCode;
        const count = isMatch ? sTotal : 0;
        const schoolsCount = isMatch ? 1 : 0;
        const pct = (activeDenominator > 0 && isMatch) ? '100.0' : '0.0';
        return {
          code: mDef.code,
          name: mDef.key,
          group: mDef.group,
          count: count,
          schools: schoolsCount,
          percentage: pct,
          districtPercentage: count > 0 ? ((count / districtTotalStudents) * 100).toFixed(1) : '0.0'
        };
      });

      if (selectedSchoolObj.stage && dynamicStageSummary[selectedSchoolObj.stage] !== undefined) {
        dynamicStageSummary[selectedSchoolObj.stage] = sTotal;
      } else {
        dynamicStageSummary['7- HS (8th-10th)'] = sTotal;
      }

    } else if (activeMandal) {
      // SCENARIO A: Specific Mandal is selected (School === 'ALL')
      activeScope = activeMandal;
      const mandalRow = mandalRecords.find(m => m.mandal.toUpperCase() === activeMandal.toUpperCase());
      const mTotal = mandalRow ? mandalRow.totalStudents : 0;
      activeDenominator = mTotal;

      const schoolsInThisMandal = availableSchools;
      dynamicCategoryCards = MGMT_DEFINITIONS.map(mDef => {
        const count = mandalRow && mandalRow.managements ? (mandalRow.managements[mDef.key] || 0) : 0;
        const schCount = schoolsInThisMandal.filter(s => s.managementCode === mDef.code).length || (count > 0 ? 1 : 0);
        const pct = mTotal > 0 ? ((count / mTotal) * 100).toFixed(1) : '0.0';
        return {
          code: mDef.code,
          name: mDef.key,
          group: mDef.group,
          count: count,
          schools: schCount,
          percentage: pct,
          districtPercentage: count > 0 ? ((count / districtTotalStudents) * 100).toFixed(1) : '0.0'
        };
      });

      // Calculate stage breakdown dynamically for this mandal
      MGMT_DEFINITIONS.forEach(mDef => {
        const count = mandalRow && mandalRow.managements ? (mandalRow.managements[mDef.key] || 0) : 0;
        if (count > 0) {
          const dRec = districtRecords.find(d => d.code === mDef.code);
          if (dRec && dRec.totalStudents > 0) {
            Object.keys(dynamicStageSummary).forEach(stg => {
              const ratio = (dRec.stages[stg] || 0) / dRec.totalStudents;
              dynamicStageSummary[stg] += Math.round(count * ratio);
            });
          }
        }
      });

      // Ensure stage sum matches exact mandal total
      const stageSum = Object.values(dynamicStageSummary).reduce((a, b) => a + b, 0);
      const diff = mTotal - stageSum;
      if (diff !== 0 && mTotal > 0) {
        let maxKey = Object.keys(dynamicStageSummary)[0];
        Object.keys(dynamicStageSummary).forEach(k => {
          if (dynamicStageSummary[k] > dynamicStageSummary[maxKey]) maxKey = k;
        });
        dynamicStageSummary[maxKey] += diff;
      }

    } else {
      // SCENARIO D: District-Wide View (ALL / Reset)
      activeScope = 'District';
      activeDenominator = districtTotalStudents; // 74,657

      dynamicCategoryCards = MGMT_DEFINITIONS.map(mDef => {
        const dRec = districtRecords.find(d => d.code === mDef.code);
        const count = dRec ? dRec.totalStudents : 0;
        const schCount = dRec ? dRec.schoolsCount : mDef.defaultSchools;
        const pct = districtTotalStudents > 0 ? ((count / districtTotalStudents) * 100).toFixed(1) : '0.0';
        return {
          code: mDef.code,
          name: mDef.key,
          group: mDef.group,
          count: count,
          schools: schCount,
          percentage: pct,
          districtPercentage: pct
        };
      });

      dynamicStageSummary = {
        "1-PS (1st-5th)": 10173,
        "2-UPS (6th-8th)": 6428,
        "3- 5th to Inter": 9055,
        "5- 6th to Inter": 7328,
        "6- PP3 to 10th": 28142,
        "7- HS (8th-10th)": 9777,
        "11- INTER": 3754
      };
    }

    // Available Filter Options
    const allMandalsList = (rawData.school_strength_mandal || INITIAL_MANDAL_STRENGTH).map(m => m.mandal);
    const availableMandals = isMeo ? [userMandal] : allMandalsList;
    const availableManagements = districtRecords.map(d => ({
      code: d.code,
      name: d.managementName,
      category: d.category
    }));
    const availableStages = Object.keys(dynamicStageSummary);

    return {
      success: true,
      userRole: role,
      userMandal: user.mandal || null,
      isRestrictedToMandal: isMeo,
      permissions: {
        canViewAllMandals: isDeoOrApo,
        canEditAllMandals: isDeoOrApo,
        canEditAssignedMandal: isDeoOrApo || isMeo,
        canEditDistrictParticulars: isDeoOrApo
      },
      summary: {
        districtTotalSchools,
        districtTotalStudents,
        filteredSchools,
        filteredStudents,
        mandalTotalStudents,
        categorySummary,
        stageSummary: dynamicStageSummary,
        categoryCards: dynamicCategoryCards,
        activeDenominator,
        scope: activeScope
      },
      filterOptions: {
        mandals: availableMandals,
        schools: ((query.mandal && query.mandal.trim().toUpperCase() !== 'ALL') ? availableSchools : allSchools).map(s => ({
          name: s.name,
          mandal: s.mandal,
          diseCode: s.diseCode,
          category: s.category,
          management: s.management,
          managementCode: s.managementCode,
          stage: s.stage,
          studentsCount: s.studentsCount
        })),
        managements: availableManagements,
        stages: availableStages
      },
      appliedFilters: {
        mandal: activeMandal || 'ALL',
        school: activeSchool || 'ALL',
        management: query.management || 'ALL',
        stage: query.stage || 'ALL'
      },
      tables: {
        districtStrength: filteredDistrict,
        mandalStrength: displayMandalRecords
      },
      dataNote: "District sheet provides exact Management × Class/Stage distribution. Mandal-wise sheet provides exact Mandal × Management strength. Stage breakdown and school cards update dynamically with Mandal and School selections."
    };
  }

  /**
   * Update Mandal data with strict RBAC enforcement
   * DEO & APO: Can update any mandal
   * MEO: Can ONLY update their assigned mandal
   */
  updateMandalData(targetMandal, managementsUpdates, user) {
    if (!user) {
      return { success: false, status: 401, message: "Authentication required. Active login session required." };
    }

    const role = (user.role || '').toUpperCase();
    const isDeoOrApo = (role === 'DEO' || role === 'APO' || role === 'OFFICER');
    const isMeo = (role === 'MEO');

    if (!isDeoOrApo && !isMeo) {
      return { success: false, status: 403, message: "Access Denied: You do not have permission to edit school strength data." };
    }

    const target = (targetMandal || '').trim().toUpperCase();
    const userMandal = (user.mandal || '').trim().toUpperCase();

    // Strict backend enforcement: MEO can NEVER edit another mandal
    if (isMeo) {
      if (!userMandal) {
        return { success: false, status: 403, message: "Access Denied: MEO user has no assigned mandal." };
      }
      if (target !== userMandal) {
        return {
          success: false,
          status: 403,
          message: `Access Denied: As MEO of ${userMandal}, you are strictly prohibited from modifying records for ${target}.`
        };
      }
    }

    const data = this.readData();
    const mandalList = data.school_strength_mandal || JSON.parse(JSON.stringify(INITIAL_MANDAL_STRENGTH));
    const mandalIndex = mandalList.findIndex(m => m.mandal.trim().toUpperCase() === target);

    if (mandalIndex === -1) {
      return { success: false, status: 404, message: `Mandal '${target}' not found in official records.` };
    }

    // Apply updates
    const currentMandal = mandalList[mandalIndex];
    if (!currentMandal.managements) currentMandal.managements = {};

    Object.keys(managementsUpdates).forEach(mgmtKey => {
      const val = Number(managementsUpdates[mgmtKey]);
      if (!isNaN(val) && val >= 0) {
        currentMandal.managements[mgmtKey] = val;
      }
    });

    // Recalculate total students for this mandal
    currentMandal.totalStudents = Object.values(currentMandal.managements).reduce((s, v) => s + (Number(v) || 0), 0);
    mandalList[mandalIndex] = currentMandal;

    this.saveData({ school_strength_mandal: mandalList });

    // Optional Atlas sync
    try {
      const mongo = require('../mongo');
      if (mongo.isMongoConnected()) {
        const col = mongo.getCollection('school_strength_mandal');
        if (col) {
          col.updateOne({ mandal: currentMandal.mandal }, { $set: currentMandal }, { upsert: true });
        }
      }
    } catch (e) {}

    return {
      success: true,
      status: 200,
      message: `✓ Successfully updated strength particulars for Mandal ${target}.`,
      updatedMandal: currentMandal
    };
  }

  /**
   * Update District-level Management Particulars
   * DEO & APO ONLY
   */
  updateDistrictData(managementCode, updates, user) {
    if (!user) {
      return { success: false, status: 401, message: "Authentication required. Active login session required." };
    }

    const role = (user.role || '').toUpperCase();
    const isDeoOrApo = (role === 'DEO' || role === 'APO' || role === 'OFFICER');

    // Strict backend enforcement: Only DEO & APO can edit district particulars
    if (!isDeoOrApo) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: Schools Information editing is strictly restricted to authenticated DEO and APO officers."
      };
    }

    const codeNum = Number(managementCode);
    const data = this.readData();
    const districtList = data.school_strength_district || JSON.parse(JSON.stringify(INITIAL_DISTRICT_STRENGTH));
    const index = districtList.findIndex(d => Number(d.code) === codeNum);

    if (index === -1) {
      return { success: false, status: 404, message: `Management Code ${managementCode} not found in official district particulars.` };
    }

    const currentItem = districtList[index];
    if (updates.schoolsCount !== undefined) {
      const sc = Number(updates.schoolsCount);
      if (!isNaN(sc) && sc >= 0) currentItem.schoolsCount = sc;
    }

    if (updates.stages && typeof updates.stages === 'object') {
      if (!currentItem.stages) currentItem.stages = {};
      Object.keys(updates.stages).forEach(stageKey => {
        const sv = Number(updates.stages[stageKey]);
        if (!isNaN(sv) && sv >= 0) {
          currentItem.stages[stageKey] = sv;
        }
      });
      // Recalculate total students for management
      currentItem.totalStudents = Object.values(currentItem.stages).reduce((s, v) => s + (Number(v) || 0), 0);
    }

    districtList[index] = currentItem;
    this.saveData({ school_strength_district: districtList });

    // Optional Atlas sync
    try {
      const mongo = require('../mongo');
      if (mongo.isMongoConnected()) {
        const col = mongo.getCollection('school_strength_district');
        if (col) {
          col.updateOne({ code: currentItem.code }, { $set: currentItem }, { upsert: true });
        }
      }
    } catch (e) {}

    return {
      success: true,
      status: 200,
      message: `✓ Successfully updated district particulars for Management Code ${managementCode} (${currentItem.managementName}).`,
      updatedItem: currentItem
    };
  }
}

module.exports = new SchoolStrengthService();
