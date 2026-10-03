const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mongo = require('../mongo');

const OVERRIDES_FILE = path.join(__dirname, '..', 'data', 'teacher_profile_overrides.json');

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

function normalizeMandal(m) {
  if (!m) return 'JANGAON';
  const clean = String(m).trim().toUpperCase();
  return MANDAL_MAPPINGS[clean] || clean;
}

function fmtDate(val) {
  if (!val || val === '0000-00-00' || String(val).trim() === '' || String(val).trim() === '-') return '-';
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400000);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}-${m}-${d.getUTCFullYear()}`;
  }
  return String(val).trim();
}

function maskAccountNumber(acc) {
  if (!acc || acc === '-') return '-';
  const str = String(acc).replace(/\s+/g, '');
  if (str.length <= 4) return str;
  return `XXXX XXXX ${str.slice(-4)}`;
}

function maskMobileNumber(phone) {
  if (!phone || phone === '-' || phone === '—') return '-';
  const str = String(phone).trim();
  if (str.includes('*') || str.includes('X') || str.includes('x')) {
    return str;
  }
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `******${digits.slice(-4)}`;
  }
  return str;
}

class TeacherDirectoryService {
  constructor() {
    this.teachers = [];
    this.teachersMap = new Map(); // treasuryCode -> teacher
    this.overrides = {};
    this.fallbackMobileMap = new Map();
    this.isLoaded = false;
    this.init();
  }

  init() {
    this.loadOverrides();
    this.loadFallbackMobileMap();
    this.loadExcelData();
  }

  loadFallbackMobileMap() {
    this.fallbackMobileMap = new Map();
    try {
      const candidatePaths = [
        path.join(__dirname, '..', '..', 'TEST MANDAL WISE T DATA (1).xlsx'),
        path.join(__dirname, '..', '..', 'TEST MANDAL WISE T DATA.xlsx')
      ];
      const found = candidatePaths.find(p => fs.existsSync(p));
      if (found) {
        const wb = xlsx.readFile(found);
        for (const name of wb.SheetNames) {
          const rows = xlsx.utils.sheet_to_json(wb.Sheets[name]);
          rows.forEach(r => {
            const code = String(r[' TREASURY CODE'] || r.TREASURY_CODE || r.treasuryCode || '').trim();
            const mobile = String(r[' MOBILE NO.'] || r.MOBILE_NO || r.mobileNumber || '').trim();
            if (code && mobile && !mobile.includes('*') && !mobile.includes('X') && mobile !== '-') {
              this.fallbackMobileMap.set(code, mobile);
            }
          });
        }
        console.log(`[TEACHER DIRECTORY] Indexed ${this.fallbackMobileMap.size} authentic fallback mobile numbers.`);
      }
    } catch (e) {
      console.warn('[TEACHER DIRECTORY] Fallback mobile map note:', e.message);
    }
  }

  loadOverrides() {
    try {
      if (fs.existsSync(OVERRIDES_FILE)) {
        const raw = fs.readFileSync(OVERRIDES_FILE, 'utf8');
        this.overrides = JSON.parse(raw);
      } else {
        const dir = path.dirname(OVERRIDES_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.overrides = {};
        fs.writeFileSync(OVERRIDES_FILE, JSON.stringify({}, null, 2));
      }
    } catch (e) {
      console.error('[TEACHER DIRECTORY] Error loading overrides:', e.message);
      this.overrides = {};
    }
  }

  saveOverrides() {
    try {
      const dir = path.dirname(OVERRIDES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(this.overrides, null, 2));
    } catch (e) {
      console.error('[TEACHER DIRECTORY] Error saving overrides:', e.message);
    }
  }

  loadExcelData() {
    try {
      const candidatePaths = [
        path.join(__dirname, '..', '..', 'Teacher_Data_Masked.xlsx'),
        path.join(__dirname, '..', '..', 'TEST MANDAL WISE T DATA (1).xlsx'),
        path.join(__dirname, '..', '..', 'TEST MANDAL WISE T DATA.xlsx')
      ];

      let filePath = candidatePaths.find(p => fs.existsSync(p));
      if (!filePath) {
        console.warn('[TEACHER DIRECTORY] Teacher Excel file not found on disk. Initializing empty dataset.');
        this.teachers = [];
        this.teachersMap = new Map();
        return;
      }

      console.log(`[TEACHER DIRECTORY] Loading teachers dataset from: ${path.basename(filePath)}`);
      const wb = xlsx.readFile(filePath);
      const sheetName = wb.SheetNames.includes('empList') ? 'empList' : wb.SheetNames[0];
      const rawRows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

      const list = [];
      const map = new Map();

      rawRows.forEach((r, idx) => {
        const treasuryCode = String(r[' TREASURY CODE'] || r.TREASURY_CODE || r.treasuryCode || '').trim();
        const teacherName = String(r[" TEACHER'S NAME"] || r.TEACHERS_NAME || r.teacherName || '').trim();
        if (!treasuryCode && !teacherName) return; // skip empty rows

        const mandal = normalizeMandal(r[' MANDAL'] || r.MANDAL || r.mandal);
        const designation = String(r[' DESIGNATION'] || r.DESIGNATION || r.designation || '').trim();
        const schoolName = String(r[' SCHOOL NAME'] || r.SCHOOL_NAME || r.schoolName || '').trim();
        const schoolDiseCode = String(r[' DISE CODE'] || r.DISE_CODE || r.diseCode || '').trim();
        const medium = String(r[' MEDIUM'] || r.MEDIUM || r.medium || '').trim();
        const gender = String(r[' GENDER'] || r.GENDER || r.gender || '').trim().toUpperCase();
        const dateOfBirth = fmtDate(r[' DATE OF BIRTH'] || r.DATE_OF_BIRTH);
        const age = String(r['AGE'] || r.age || '').trim() || '-';
        const dateOfRetirement = fmtDate(r['DATE OF RETIREMENT'] || r.DATE_OF_RETIREMENT);
        const remainingDaysToRetire = String(r['REMAINING DAYS TO RETIRE'] || r.REMAINING_DAYS_TO_RETIRE || '').trim() || '-';
        const caste = String(r[' CASTE'] || r.CASTE || r.caste || '').trim() || '-';
        const rawMobile = String(r[' MOBILE NO.'] || r.MOBILE_NO || r.mobileNumber || '').trim();
        let mobileNumber = rawMobile || '-';
        if (!mobileNumber || mobileNumber === '-' || mobileNumber.includes('*') || mobileNumber.includes('X') || mobileNumber.includes('x')) {
          if (this.fallbackMobileMap && this.fallbackMobileMap.has(treasuryCode)) {
            mobileNumber = this.fallbackMobileMap.get(treasuryCode);
          }
        }
        const phc = String(r[' PHC'] || r.PHC || '').trim().toUpperCase() || 'NO';
        const phcPercentage = String(r[' PHC%'] || r.PHC_PERCENTAGE || '').trim() || '-';
        const categoryOfSchool = String(r[' CATEGEORY OF THE SCHOOL'] || r.CATEGORY_OF_SCHOOL || '').trim() || '-';
        const management = String(r[' MANAGEMENT'] || r.MANAGEMENT || '').trim() || 'LB';
        const mediumOfSchool = String(r[' Medium of the School'] || r.MEDIUM_OF_SCHOOL || '').trim() || '-';
        const hraPercentage = String(r[' HRA Categeory'] || r.HRA_CATEGORY || '').trim() || '-';

        const dateOfAppointmentSpecialTeacher = fmtDate(r[' DATE OF JOINING IN 398/-'] || r.DOJ_398);
        const dateOfFirstAppointment = fmtDate(r[' DATE OF FIRST APPOINTMENT'] || r.DOA);
        const dateOfJoiningFeederCadre = fmtDate(r[' DATE OF JOINING IN THE FEEDER CADRE'] || r.DOJ_FEEDER);
        const dateOfJoiningPresentCadre = fmtDate(r[' DATE OF JOINING IN THE PRESENT CADRE'] || r.DOJ_PRESENT_CADRE);
        const dateOfJoiningPresentSchool = fmtDate(r[' DATE OF JOINING IN THE PRESENT SCHOOL'] || r.DOJ_PRESENT_SCHOOL);
        const appointmentManagement = String(r[' APPOINTMENT MANAGEMENT'] || r.APPOINTMENT_MANAGEMENT || '').trim() || management;
        const appointedArea = String(r[' APPOINTED AREA'] || r.APPOINTED_AREA || '').trim() || 'PLAIN';
        const yearOfDsc = String(r[' YEAR OF DSC'] || r.YEAR_OF_DSC || '').trim() || '-';
        const dscListNo = String(r[' DSC LIST NO.'] || r.DSC_LIST_NO || '').trim() || '-';

        const item = {
          sNo: idx + 1,
          treasuryCode,
          employeeId: treasuryCode,
          teacherName,
          designation,
          mandal,
          schoolName,
          schoolDiseCode,
          medium,
          gender,
          dateOfBirth,
          age,
          dateOfRetirement,
          remainingDaysToRetire,
          caste,
          mobileNumber,
          rawMobileNumber: rawMobile,
          phc,
          phcPercentage,
          categoryOfSchool,
          management,
          mediumOfSchool,
          hraPercentage,
          dateOfAppointmentSpecialTeacher,
          dateOfFirstAppointment,
          dateOfJoiningFeederCadre,
          dateOfJoiningPresentCadre,
          dateOfJoiningPresentSchool,
          appointmentManagement,
          appointedArea,
          yearOfDsc,
          dscListNo
        };

        list.push(item);
        if (treasuryCode) {
          map.set(treasuryCode, item);
        }
      });

      // Include reference sample profiles if not already present
      // 1. P. Suresh Babu (Treasury Code: 2126324) from reference form
      if (!map.has('2126324')) {
        const sampleSuresh = {
          sNo: list.length + 1,
          treasuryCode: '2126324',
          employeeId: '2126324',
          teacherName: 'P. SURESH BABU',
          designation: 'SA PHY SCI',
          mandal: 'PARVATHAGIRI',
          schoolName: 'MPUPS ROLLIAKAI',
          schoolDiseCode: '3611400702',
          medium: 'TM',
          gender: 'MALE',
          dateOfBirth: '18-12-1978',
          age: '47 Y 10 M',
          dateOfRetirement: '31-12-2038',
          remainingDaysToRetire: '12 Y 2 M',
          caste: 'BC B',
          mobileNumber: maskMobileNumber('9700391515'),
          rawMobileNumber: '9700391515',
          phc: 'NO',
          phcPercentage: '-',
          categoryOfSchool: 'UPS',
          management: 'LB',
          mediumOfSchool: 'TM',
          hraPercentage: '13',
          dateOfAppointmentSpecialTeacher: '-',
          dateOfFirstAppointment: '20-11-2000',
          dateOfJoiningFeederCadre: '20-11-2000',
          dateOfJoiningPresentCadre: '31-01-2009',
          dateOfJoiningPresentSchool: '28-01-2023',
          appointmentManagement: 'LB',
          appointedArea: 'PLAIN',
          yearOfDsc: '1998',
          dscListNo: '2'
        };
        list.push(sampleSuresh);
        map.set('2126324', sampleSuresh);
      }

      this.teachers = list;
      this.teachersMap = map;
      this.isLoaded = true;
      console.log(`[TEACHER DIRECTORY] Successfully indexed ${list.length} teacher records across ${OFFICIAL_12_MANDALS.length} mandals.`);
    } catch (err) {
      console.error('[TEACHER DIRECTORY] Error parsing teacher Excel data:', err);
    }
  }

  /**
   * Builds the complete, structured Individual Teacher Profile matching the reference form images.
   * Every section is explicitly defined:
   * - Personal Details
   * - Spouse & Family Details
   * - Residential Details
   * - School/Working Details
   * - Academic Qualifications (Table)
   * - Professional Qualifications (Table)
   * - Departmental Tests (Table)
   * - Service Details
   * - Eligible Promotions
   * - Bank Account Details
   * - Declarations & Certificates
   */
  buildCompleteProfile(teacher, options = {}) {
    if (!teacher) return null;

    const code = teacher.treasuryCode;
    const ov = this.overrides[code] || {};
    const ovPersonal = ov.personalDetails || {};
    const ovSpouse = ov.spouseDetails || {};
    const ovResidential = ov.residentialDetails || {};
    const ovWorking = ov.workingDetails || {};
    const ovService = ov.serviceDetails || {};
    const ovBank = ov.bankDetails || {};

    // Specific pre-filled reference sample data for 2126324 (P. Suresh Babu)
    const isReferenceSuresh = (code === '2126324');

    // Section A: Personal Details
    const personalDetails = {
      treasuryCode: teacher.treasuryCode || '-',
      teacherName: teacher.teacherName || '-',
      fatherName: ovPersonal.fatherName || ov.fatherName || (isReferenceSuresh ? 'SOMALAH' : '-'),
      gender: teacher.gender || '-',
      dateOfBirth: teacher.dateOfBirth || '-',
      age: teacher.age || '-',
      dateOfRetirement: teacher.dateOfRetirement || '-',
      remainingDaysToRetire: teacher.remainingDaysToRetire || '-',
      designation: teacher.designation || '-',
      caste: teacher.caste || '-',
      maritalStatus: ovPersonal.maritalStatus || ov.maritalStatus || (isReferenceSuresh ? 'Married' : '-'),
      mobileNumber: teacher.rawMobileNumber || teacher.mobileNumber || ovPersonal.mobileNumber || ov.mobileNumber || '-',
      aadharNo: ovPersonal.aadharNo || ov.aadharNo || (isReferenceSuresh ? '635732401209' : '-'),
      medium: teacher.medium || '-',
      typeOfPhc: teacher.phc === 'YES' ? (ovPersonal.typeOfPhc || ov.typeOfPhc || 'OH') : 'NO PHC',
      phcPercentage: teacher.phcPercentage || '-'
    };

    // Section B: Spouse & Family Details
    const spouseDetails = {
      isSpouseGovtEmployee: ovSpouse.isSpouseGovtEmployee || ov.isSpouseGovtEmployee || (isReferenceSuresh ? 'YES' : '-'),
      spouseDeptName: ovSpouse.spouseDeptName || ov.spouseDeptName || (isReferenceSuresh ? 'EDUCATION' : '-'),
      spouseTreasuryId: ovSpouse.spouseTreasuryId || ov.spouseTreasuryId || (isReferenceSuresh ? '2126366' : '-'),
      spouseWorkingPlace: ovSpouse.spouseWorkingPlace || ov.spouseWorkingPlace || (isReferenceSuresh ? 'MPPS KALCHEDU(ZSA, MARCHANNAPET, WARANGAL)' : '-'),
      spouseName: ovSpouse.spouseName || ov.spouseName || (isReferenceSuresh ? 'A. SURYASHINI' : '-')
    };

    // Section C: Residential Details
    const residentialDetails = {
      residentialAddress: ovResidential.residentialAddress || ov.residentialAddress || (isReferenceSuresh ? 'HANAMKONDA' : '-'),
      residentialConstituency: ovResidential.residentialConstituency || ov.residentialConstituency || (isReferenceSuresh ? 'WARANGAL WEST' : '-'),
      nativeAddress: ovResidential.nativeAddress || ov.nativeAddress || (isReferenceSuresh ? 'JANGAON' : '-'),
      nativeConstituency: ovResidential.nativeConstituency || ov.nativeConstituency || (isReferenceSuresh ? 'JANGAON' : '-'),
      localDistrict: ovResidential.localDistrict || ov.localDistrict || (isReferenceSuresh ? 'JANGAON' : (teacher.mandal ? 'JANGAON' : '-'))
    };

    // Section D: School / Working Details
    const workingDetails = {
      newDistrict: ov.newDistrict || (isReferenceSuresh ? 'WARANGAL' : 'JANGAON'),
      mandal: teacher.mandal || '-',
      schoolName: teacher.schoolName || '-',
      schoolDiseCode: teacher.schoolDiseCode || '-',
      categoryOfSchool: teacher.categoryOfSchool || '-',
      management: teacher.management || '-',
      mediumOfSchool: teacher.mediumOfSchool || '-',
      hraPercentage: teacher.hraPercentage ? (String(teacher.hraPercentage).includes('%') ? teacher.hraPercentage : `${teacher.hraPercentage}%`) : '-',
      workingArea: teacher.appointedArea || 'PLAIN'
    };

    // Section E: Academic Qualifications Table
    const academicQualifications = ov.academicQualifications || (isReferenceSuresh ? [
      { qualification: "SSC", branch: "-", degreeOrMedium: "TELUGU", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "GOVT EXAMINATIONS/BD", yearPassed: "1993", percentage: "67" },
      { qualification: "Intermediate", branch: "-", degreeOrMedium: "TELUGU", optional1: "MATHS", optional2: "PHYSICS", optional3: "CHEMISTRY", universityOrBoard: "BIE", yearPassed: "1995", percentage: "60" },
      { qualification: "Degree B.A./B.Sc/B.Com", branch: "B.Sc", degreeOrMedium: "TELUGU", optional1: "MATHS", optional2: "PHYSICS", optional3: "CHEMISTRY", universityOrBoard: "KU", yearPassed: "1998", percentage: "63" },
      { qualification: "Additional Degree", branch: "-", degreeOrMedium: "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "-", yearPassed: "-", percentage: "-" },
      { qualification: "Post Graduation", branch: "M.Sc", degreeOrMedium: "-", optional1: "-", optional2: "MATHEMATICS", optional3: "-", universityOrBoard: "SVU", yearPassed: "2016", percentage: "60" },
      { qualification: "Additional PG", branch: "M.Sc", degreeOrMedium: "-", optional1: "-", optional2: "PSYCHOLOGY", optional3: "-", universityOrBoard: "KU", yearPassed: "2017", percentage: "68" }
    ] : [
      { qualification: "SSC", branch: "-", degreeOrMedium: teacher.medium || "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "GOVT EXAMINATIONS", yearPassed: "-", percentage: "-" },
      { qualification: "Intermediate", branch: "-", degreeOrMedium: teacher.medium || "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "BIE", yearPassed: "-", percentage: "-" },
      { qualification: "Degree B.A./B.Sc/B.Com", branch: "-", degreeOrMedium: teacher.medium || "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "KU", yearPassed: "-", percentage: "-" },
      { qualification: "Additional Degree", branch: "-", degreeOrMedium: "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "-", yearPassed: "-", percentage: "-" },
      { qualification: "Post Graduation", branch: "-", degreeOrMedium: "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "-", yearPassed: "-", percentage: "-" },
      { qualification: "Additional PG", branch: "-", degreeOrMedium: "-", optional1: "-", optional2: "-", optional3: "-", universityOrBoard: "-", yearPassed: "-", percentage: "-" }
    ]);

    // Section F: Professional Qualifications Table
    const professionalQualifications = ov.professionalQualifications || (isReferenceSuresh ? [
      { qualification: "D.ED / TTC / Spl DPED", degree: "-", medium: "-", method1: "-", method2: "-", university: "-", yearPassed: "-", percentage: "-" },
      { qualification: "B.Ed / B.P.Ed", degree: "B.Ed", medium: "TELUGU", method1: "MATHS", method2: "PHY.SCI", university: "KU", yearPassed: "2000", percentage: "71" },
      { qualification: "Additional (B.Ed / Spl B.Ed)", degree: "-", medium: "-", method1: "-", method2: "-", university: "-", yearPassed: "-", percentage: "-" },
      { qualification: "M.Ed / M.P.Ed", degree: "M.Ed", medium: "-", method1: "-", method2: "-", university: "KU", yearPassed: "2021", percentage: "71" }
    ] : [
      { qualification: "D.ED / TTC / Spl DPED", degree: "-", medium: "-", method1: "-", method2: "-", university: "-", yearPassed: "-", percentage: "-" },
      { qualification: "B.Ed / B.P.Ed", degree: "B.Ed", medium: teacher.medium || "-", method1: "-", method2: "-", university: "KU", yearPassed: "-", percentage: "-" },
      { qualification: "Additional (B.Ed / Spl B.Ed)", degree: "-", medium: "-", method1: "-", method2: "-", university: "-", yearPassed: "-", percentage: "-" },
      { qualification: "M.Ed / M.P.Ed", degree: "-", medium: "-", method1: "-", method2: "-", university: "-", yearPassed: "-", percentage: "-" }
    ]);

    // Section G: Departmental Tests Table
    const departmentalTests = ov.departmentalTests || (isReferenceSuresh ? {
      headers: ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"],
      testPassed: ["Test passed (Yes/No)", "YES", "YES", "-", "-", "NO"],
      yearOfPassing: ["Year of Passing", "Dec-10", "Dec-11", "Feb-14", "-", "-"],
      gotPassed: "YES",
      gotYear: "Dec-10",
      eotPassed: "YES",
      eotYear: "Dec-11",
      langTestTeluguPassed: "-",
      langTestTeluguYear: "Feb-14",
      langTestHindiPassed: "-",
      langTestHindiYear: "-",
      otherTestsPassed: "NO",
      otherTestsYear: "-"
    } : {
      headers: ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"],
      testPassed: ["Test passed (Yes/No)", "YES", "YES", "-", "-", "NO"],
      yearOfPassing: ["Year of Passing", "-", "-", "-", "-", "-"],
      gotPassed: "YES",
      gotYear: "-",
      eotPassed: "YES",
      eotYear: "-",
      langTestTeluguPassed: "-",
      langTestTeluguYear: "-",
      langTestHindiPassed: "-",
      langTestHindiYear: "-",
      otherTestsPassed: "NO",
      otherTestsYear: "-"
    });

    // Section H: Service Details
    const serviceDetails = {
      dateOfAppointmentSpecialTeacher: teacher.dateOfAppointmentSpecialTeacher || '-',
      dateOfFirstAppointment: teacher.dateOfFirstAppointment || '-',
      dateOfJoiningFeederCadre: teacher.dateOfJoiningFeederCadre || '-',
      dateOfJoiningPresentCadre: teacher.dateOfJoiningPresentCadre || '-',
      dateOfJoiningPresentSchool: teacher.dateOfJoiningPresentSchool || '-',
      appointmentManagement: teacher.appointmentManagement || '-',
      appointedArea: teacher.appointedArea || 'PLAIN',
      yearOfDsc: teacher.yearOfDsc || '-',
      dscListNo: teacher.dscListNo || '-',
      rank: ov.rank || (isReferenceSuresh ? '887' : '-'),
      interDistrictMutualTransferFrom: ov.interDistrictMutualTransferFrom || '-',
      dojInWngl: ov.dojInWngl || '-',
      go610TransferredDistrict: ov.go610TransferredDistrict || '-',
      sscHandlingSubject: ov.sscHandlingSubject || (isReferenceSuresh ? 'PHY.SCI' : (teacher.designation || '-')),
      sinceYear: ov.sinceYear || (isReferenceSuresh ? '6 YEARS' : '-'),
      pendingCases: ov.pendingCases || 'NO'
    };

    // Section I: Eligible Promotions
    const promotions = ov.promotions || (isReferenceSuresh ? [
      { label: "Promotion-1", designation: "PDHM" },
      { label: "Promotion-2", designation: "DIET LECTURER" },
      { label: "Promotion-3", designation: "JL MATHS" },
      { label: "Promotion-4", designation: "-" }
    ] : [
      { label: "Promotion-1", designation: "-" },
      { label: "Promotion-2", designation: "-" },
      { label: "Promotion-3", designation: "-" },
      { label: "Promotion-4", designation: "-" }
    ]);

    // Section J: Bank Account Details
    const rawAccount = ov.accountNumber || (isReferenceSuresh ? '62001140583' : '-');
    const bankDetails = {
      accountNumber: (options.maskSensitive !== false && rawAccount !== '-') ? maskAccountNumber(rawAccount) : rawAccount,
      accountNumberMasked: maskAccountNumber(rawAccount),
      branch: ov.branch || (isReferenceSuresh ? 'JANGAON' : '-'),
      bankName: ov.bankName || (isReferenceSuresh ? 'SBI' : '-'),
      ifscCode: ov.ifscCode || (isReferenceSuresh ? 'SBIN0020161' : '-')
    };

    // Section K: Declarations & Certificates
    const declarations = {
      teacherDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
      teacherSignLabel: "Signature of the Teacher",
      certDdoHmDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
      ddoHmSignLabel: "Signature of the DDO/HM",
      meoSignLabel: "Signature of the MEO",
      crpCoMiscoDeclaration: "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct.",
      crpSignLabel: "Signature of the CRP",
      coSignLabel: "Signature of the CO",
      miscoSignLabel: "Signature of the MISCO"
    };

    return {
      treasuryCode: teacher.treasuryCode,
      employeeId: teacher.employeeId || teacher.treasuryCode,
      teacherName: teacher.teacherName,
      designation: teacher.designation,
      mandal: teacher.mandal,
      schoolName: teacher.schoolName,
      district: workingDetails.newDistrict,
      personalDetails,
      spouseDetails,
      residentialDetails,
      workingDetails,
      academicQualifications,
      professionalQualifications,
      departmentalTests,
      serviceDetails,
      promotions,
      bankDetails,
      declarations,
      hasFutureExtensibility: true
    };
  }

  /**
   * Search / Filter teachers list with RBAC boundaries.
   * Public: Rejected (401)
   * Teacher: Rejected (403)
   * DEO: Entire district
   * APO: Entire district / assigned jurisdiction
   * MEO: Strictly their assigned mandal only!
   */
  getTeachersList(query = {}, user) {
    if (!user) {
      return { success: false, status: 401, message: "Authentication required to access Teachers Information." };
    }

    const role = (user.role || '').toUpperCase();
    const isTeacher = (role === 'TEACHER');
    const isDeo = (role === 'DEO' || role === 'OFFICER');
    const isApo = (role === 'APO');
    const isMeo = (role === 'MEO');

    if (isTeacher) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: Teacher accounts do not have permission to access the Teachers Information directory. Teachers can view only their personal service record from their dashboard."
      };
    }

    if (!isDeo && !isApo && !isMeo) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: Teachers Information is strictly restricted to authenticated DEO, APO, and MEO officers."
      };
    }

    const userMandal = user.mandal ? normalizeMandal(user.mandal) : null;

    // Strict MEO boundary: If MEO requests another mandal explicitly, reject with 403
    if (isMeo) {
      if (!userMandal) {
        return { success: false, status: 403, message: "Access Denied: No assigned mandal configured for this MEO account." };
      }
      if (query.mandal && query.mandal.trim().toUpperCase() !== 'ALL') {
        const reqMandal = normalizeMandal(query.mandal);
        if (reqMandal !== userMandal) {
          return {
            success: false,
            status: 403,
            message: `Access Denied: As MEO of ${userMandal}, you are strictly prohibited from viewing teacher records for ${reqMandal}.`
          };
        }
      }
    }

    let records = this.teachers;

    // Enforce MEO filtering
    if (isMeo) {
      records = records.filter(t => normalizeMandal(t.mandal) === userMandal);
    } else if (query.mandal && query.mandal.trim().toUpperCase() !== 'ALL') {
      const targetMandal = normalizeMandal(query.mandal);
      records = records.filter(t => normalizeMandal(t.mandal) === targetMandal);
    }

    // Filter by designation if specified
    if (query.designation && query.designation.trim().toUpperCase() !== 'ALL') {
      const targetDesig = query.designation.trim().toUpperCase();
      records = records.filter(t => t.designation.toUpperCase().includes(targetDesig));
    }

    // Filter by search term (treasuryCode, name, school, phone)
    if (query.search && query.search.trim()) {
      const term = query.search.trim().toLowerCase();
      records = records.filter(t =>
        t.treasuryCode.toLowerCase().includes(term) ||
        t.teacherName.toLowerCase().includes(term) ||
        t.schoolName.toLowerCase().includes(term) ||
        t.designation.toLowerCase().includes(term) ||
        t.mobileNumber.toLowerCase().includes(term) ||
        (t.rawMobileNumber && t.rawMobileNumber.toLowerCase().includes(term))
      );
    }

    const totalCount = records.length;

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 25));
    const startIndex = (page - 1) * limit;
    const paginatedTeachers = records.slice(startIndex, startIndex + limit);

    // Filter dropdown options
    const availableMandals = isMeo ? [userMandal] : OFFICIAL_12_MANDALS;
    const availableDesignations = [...new Set(this.teachers.map(t => t.designation).filter(Boolean))].sort();

    return {
      success: true,
      userRole: role,
      userMandal,
      isRestrictedToMandal: isMeo,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      teachers: paginatedTeachers,
      filterOptions: {
        mandals: availableMandals,
        designations: availableDesignations
      }
    };
  }

  /**
   * Retrieves an Individual Teacher Profile with strict RBAC boundary checks.
   */
  async getTeacherProfile(treasuryCode, user, options = {}) {
    if (!user) {
      return { success: false, status: 401, message: "Authentication required to view Teacher Profile." };
    }

    const role = (user.role || '').toUpperCase();
    const isTeacher = (role === 'TEACHER');
    const isDeo = (role === 'DEO' || role === 'OFFICER');
    const isApo = (role === 'APO');
    const isMeo = (role === 'MEO');

    if (isTeacher) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: Teacher accounts do not have permission to view other teacher profiles."
      };
    }

    if (!isDeo && !isApo && !isMeo) {
      return {
        success: false,
        status: 403,
        message: "Access Denied: Teachers Information is strictly restricted to authenticated DEO, APO, and MEO officers."
      };
    }

    const code = String(treasuryCode || '').trim();
    const teacher = this.teachersMap.get(code);

    if (!teacher) {
      return {
        success: false,
        status: 404,
        message: `Teacher with Treasury Code / Employee ID ${code} was not found.`
      };
    }

    const userMandal = user.mandal ? normalizeMandal(user.mandal) : null;
    const teacherMandal = normalizeMandal(teacher.mandal);

    // MEO boundary enforcement: MEO cannot view a teacher belonging to another mandal
    if (isMeo) {
      if (teacherMandal !== userMandal) {
        return {
          success: false,
          status: 403,
          message: `Access Denied: As MEO of ${userMandal}, you are strictly prohibited from viewing teacher records for ${teacherMandal}.`
        };
      }
    }

    const profile = this.buildCompleteProfile(teacher, options);

    // Identify if the teacher's mobile number is currently masked
    const currentMobile = profile.personalDetails.mobileNumber;
    const isMasked = !currentMobile || currentMobile === '-' || currentMobile === '—' || currentMobile.includes('*') || currentMobile.includes('X') || currentMobile.includes('x');

    if (isMasked) {
      let importedMobile = null;
      try {
        // Query MongoDB education.mobile_import collection using existing Atlas backend connection
        importedMobile = await mongo.getMobileFromImport(code);
      } catch (err) {
        console.warn(`[TEACHER DIRECTORY] Mongo mobile lookup note for ${code}:`, err.message);
      }

      // Resilient fallback if MongoDB Atlas is offline or collection is pending
      if (!importedMobile && this.fallbackMobileMap && this.fallbackMobileMap.has(code)) {
        importedMobile = this.fallbackMobileMap.get(code);
      }

      // Replace ONLY the currently masked mobile number in the Individual Teacher Profile
      if (importedMobile) {
        profile.personalDetails.mobileNumber = importedMobile;
      }
    }

    return {
      success: true,
      userRole: role,
      userMandal,
      profile
    };
  }

  /**
   * Update / populate teacher fields (Future extensibility mechanism).
   */
  updateTeacherProfile(treasuryCode, updateData, user) {
    if (!user) {
      return { success: false, status: 401, message: "Authentication required." };
    }

    const role = (user.role || '').toUpperCase();
    const isDeo = (role === 'DEO' || role === 'OFFICER');
    const isApo = (role === 'APO');
    const isMeo = (role === 'MEO');

    if (!isDeo && !isApo && !isMeo) {
      return { success: false, status: 403, message: "Access Denied: Unauthorized to update teacher profiles." };
    }

    const code = String(treasuryCode || '').trim();
    const teacher = this.teachersMap.get(code);
    if (!teacher) {
      return { success: false, status: 404, message: "Teacher not found." };
    }

    const userMandal = user.mandal ? normalizeMandal(user.mandal) : null;
    const teacherMandal = normalizeMandal(teacher.mandal);

    if (isMeo && teacherMandal !== userMandal) {
      return {
        success: false,
        status: 403,
        message: `Access Denied: As MEO of ${userMandal}, you cannot edit records for ${teacherMandal}.`
      };
    }

    // Merge into overrides
    const existing = this.overrides[code] || {};
    const merged = { ...existing };
    for (const [k, v] of Object.entries(updateData || {})) {
      if (v && typeof v === 'object' && !Array.isArray(v) && merged[k] && typeof merged[k] === 'object' && !Array.isArray(merged[k])) {
        merged[k] = { ...merged[k], ...v };
      } else {
        merged[k] = v;
      }
    }
    merged.updatedAt = new Date().toISOString();
    merged.updatedBy = `${role} (${user.mobileNumber || user.name || user.id})`;

    this.overrides[code] = merged;

    this.saveOverrides();

    const updatedProfile = this.buildCompleteProfile(teacher);
    return {
      success: true,
      message: `✓ Teacher profile for ${code} successfully updated.`,
      profile: updatedProfile
    };
  }
}

module.exports = new TeacherDirectoryService();
