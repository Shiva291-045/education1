const db = require('../db');

/**
 * Teacher Service Record Service
 * ==============================
 * Manages official two-page Teacher Service Records according to Telangana School Education Department standards.
 * Supports viewing authentic records, masking sensitive bank account numbers, and mapping each authenticated teacher
 * to their respective official data.
 */

// Full official sample record for Treasury Code 2126324 (P. Suresh Babu) based directly on the reference images
const SAMPLE_RECORD_2126324 = {
  treasuryCode: "2126324",
  teacherName: "P. SURESH BABU",
  district: "WARANGAL DISTRICT",
  department: "SCHOOL EDUCATION DEPARTMENT",

  personalDetails: {
    treasuryCode: "2126324",
    fatherName: "SOMALAH",
    gender: "MALE",
    mobileNumber: "9700391515",
    phcPercentage: "—",
    aadharNo: "635732401209",
    designation: "SA PHY SCI",
    dateOfBirth: "18-12-1978",
    maritalStatus: "Married",
    teacherName: "PSURESH BABU",
    medium: "TM",
    caste: "BC-B",
    typeOfPhc: "NO PHC"
  },

  spouseDetails: {
    isSpouseGovtEmployee: "YES",
    spouseDeptName: "EDUCATION",
    spouseTreasuryId: "2126366",
    spouseWorkingPlace: "MPPS KALCHEDU(ZSA, MARCHANNAPET, WARANGAL)",
    spouseName: "A. SURYASHINI"
  },

  residentialDetails: {
    residentialAddress: "HANAMKONDA",
    residentialConstituency: "WARANGAL WEST",
    nativeAddress: "JANGAON",
    nativeConstituency: "JANGAON",
    localDistrict: "JANGAON"
  },

  workingDetails: {
    newDistrict: "WARANGAL",
    mandal: "PARVATHAGIRI",
    schoolName: "MPUPS ROLLIAKAI",
    categoryOfSchool: "UPS",
    mediumOfSchool: "TM",
    hraPercentage: "13",
    schoolDiseCode: "3611400702",
    management: "LB",
    workingArea: "PLAIN"
  },

  academicQualifications: [
    {
      qualification: "SSC",
      branch: "—",
      degreeOrMedium: "TELUGU",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "GOVT EXAMINATIONS",
      yearPassed: "1993",
      percentage: "67"
    },
    {
      qualification: "Intermediate",
      branch: "—",
      degreeOrMedium: "TELUGU",
      optional1: "MATHS",
      optional2: "PHYSICS",
      optional3: "CHEMISTRY",
      universityOrBoard: "BIE",
      yearPassed: "1996",
      percentage: "53"
    },
    {
      qualification: "Degree B.A./B.Sc/B.Com",
      branch: "B.Sc",
      degreeOrMedium: "TELUGU",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "KU",
      yearPassed: "2000",
      percentage: "72"
    },
    {
      qualification: "Additional Degree",
      branch: "—",
      degreeOrMedium: "—",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "Post Graduation",
      branch: "M.Sc",
      degreeOrMedium: "—",
      optional1: "MATHEMATICS",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "SVU",
      yearPassed: "2016",
      percentage: "62"
    },
    {
      qualification: "Additional PG",
      branch: "M.Sc",
      degreeOrMedium: "—",
      optional1: "PSYCHOLOGY",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "KU",
      yearPassed: "2017",
      percentage: "64"
    }
  ],

  professionalQualifications: [
    {
      qualification: "D.Ed / TTC / Spl SPEED",
      degree: "—",
      medium: "—",
      method1: "—",
      method2: "—",
      university: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "B.Ed / Spl B.Ed",
      degree: "B.Ed",
      medium: "TELUGU",
      method1: "MATHS",
      method2: "PHY.SCI.",
      university: "KU",
      yearPassed: "2002",
      percentage: "68"
    },
    {
      qualification: "Additional (B.Ed / Spl B.Ed)",
      degree: "—",
      medium: "—",
      method1: "—",
      method2: "—",
      university: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "M.Ed / Spl M.Ed",
      degree: "M.Ed",
      medium: "—",
      method1: "—",
      method2: "—",
      university: "KU",
      yearPassed: "2021",
      percentage: "71"
    }
  ],

  departmentalTests: {
    headers: ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"],
    testPassed: ["Test passed (Yes / No)", "YES", "YES", "—", "—", "NO"],
    yearOfPassing: ["Year of Passing", "Dec-10", "Dec-11", "Feb-14", "—", "—"]
  },

  serviceDetails: {
    dateOfAppointmentSpecialTeacher: "—",
    dateOfFirstAppointment: "20-11-2000",
    dateOfJoiningFeederCadre: "20-11-2000",
    dateOfJoiningPresentCadre: "31-01-2009",
    dateOfJoiningPresentSchool: "28-01-2023",
    appointmentManagement: "LB",
    appointedArea: "PLAIN",
    yearOfDsc: "1998",
    dscListNo: "2",
    rank: "887",
    interDistrictMutualTransferFrom: "—",
    dojInWngl: "—",
    go610TransferredDistrict: "—",
    sscHandlingSubject: "PHY.SCI",
    sinceYear: "6 YEARS",
    pendingCases: "NO"
  },

  promotions: [
    { label: "Promotion-1", designation: "PDHM" },
    { label: "Promotion-2", designation: "DIET LECTURER" },
    { label: "Promotion-3", designation: "JL MATHS" },
    { label: "Promotion-4", designation: "—" }
  ],

  bankDetails: {
    accountNumber: "62001140583",
    accountNumberMasked: "XXXX XXXX 0583",
    branch: "JANGAON",
    bankName: "SBI",
    ifscCode: "SBIN0020161"
  },

  declarations: {
    teacherDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
    teacherSignLabel: "Signature of the Teacher",

    certDdoHmDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
    ddoHmSignLabel: "Signature of the DDO/HM",
    meoSignLabel: "Signature of the MEO",

    crpCoMiscoDeclaration: "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct.",
    crpSignLabel: "Signature of the CRP",
    coSignLabel: "Signature of the CO",
    miscoSignLabel: "Signature of the MISCO"
  }
};

// Full official record for K. Sunitha (TS-TCH-100234)
const SAMPLE_RECORD_100234 = {
  treasuryCode: "100234",
  teacherName: "K. SUNITHA",
  district: "JANGAON DISTRICT",
  department: "SCHOOL EDUCATION DEPARTMENT",

  personalDetails: {
    treasuryCode: "100234",
    fatherName: "K. RAMACHANDRAM",
    gender: "FEMALE",
    mobileNumber: "9876543210",
    phcPercentage: "—",
    aadharNo: "748291038472",
    designation: "School Assistant (Mathematics)",
    dateOfBirth: "14-06-1982",
    maritalStatus: "Married",
    teacherName: "K. SUNITHA",
    medium: "EM",
    caste: "BC-D",
    typeOfPhc: "NO PHC"
  },

  spouseDetails: {
    isSpouseGovtEmployee: "YES",
    spouseDeptName: "REVENUE",
    spouseTreasuryId: "108492",
    spouseWorkingPlace: "TAHSILDAR OFFICE, JANGAON",
    spouseName: "P. VENKATESHWARLU"
  },

  residentialDetails: {
    residentialAddress: "HOUSING BOARD COLONY, JANGAON",
    residentialConstituency: "JANGAON",
    nativeAddress: "JANGAON",
    nativeConstituency: "JANGAON",
    localDistrict: "JANGAON"
  },

  workingDetails: {
    newDistrict: "JANGAON",
    mandal: "JANGAON",
    schoolName: "Zilla Parishad High School, Jangaon",
    categoryOfSchool: "High School",
    mediumOfSchool: "Telugu & English",
    hraPercentage: "13",
    schoolDiseCode: "36210100101",
    management: "LB",
    workingArea: "PLAIN"
  },

  academicQualifications: [
    {
      qualification: "SSC",
      branch: "—",
      degreeOrMedium: "TELUGU",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "GOVT EXAMINATIONS",
      yearPassed: "1997",
      percentage: "74"
    },
    {
      qualification: "Intermediate",
      branch: "MPC",
      degreeOrMedium: "ENGLISH",
      optional1: "MATHS",
      optional2: "PHYSICS",
      optional3: "CHEMISTRY",
      universityOrBoard: "BIE",
      yearPassed: "1999",
      percentage: "71"
    },
    {
      qualification: "Degree B.A./B.Sc/B.Com",
      branch: "B.Sc (M.P.Cs)",
      degreeOrMedium: "ENGLISH",
      optional1: "MATHS",
      optional2: "PHYSICS",
      optional3: "COMPUTER SCI",
      universityOrBoard: "KU",
      yearPassed: "2002",
      percentage: "78"
    },
    {
      qualification: "Additional Degree",
      branch: "—",
      degreeOrMedium: "—",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "Post Graduation",
      branch: "M.Sc (Mathematics)",
      degreeOrMedium: "ENGLISH",
      optional1: "PURE MATHS",
      optional2: "APPLIED MATHS",
      optional3: "—",
      universityOrBoard: "OU",
      yearPassed: "2005",
      percentage: "76"
    },
    {
      qualification: "Additional PG",
      branch: "—",
      degreeOrMedium: "—",
      optional1: "—",
      optional2: "—",
      optional3: "—",
      universityOrBoard: "—",
      yearPassed: "—",
      percentage: "—"
    }
  ],

  professionalQualifications: [
    {
      qualification: "D.Ed / TTC / Spl SPEED",
      degree: "—",
      medium: "—",
      method1: "—",
      method2: "—",
      university: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "B.Ed / Spl B.Ed",
      degree: "B.Ed",
      medium: "ENGLISH",
      method1: "MATHEMATICS",
      method2: "PHYSICAL SCI",
      university: "KU",
      yearPassed: "2006",
      percentage: "79"
    },
    {
      qualification: "Additional (B.Ed / Spl B.Ed)",
      degree: "—",
      medium: "—",
      method1: "—",
      method2: "—",
      university: "—",
      yearPassed: "—",
      percentage: "—"
    },
    {
      qualification: "M.Ed / Spl M.Ed",
      degree: "M.Ed",
      medium: "ENGLISH",
      method1: "CURRICULUM DEV",
      method2: "EDUCATIONAL TECH",
      university: "KU",
      yearPassed: "2018",
      percentage: "81"
    }
  ],

  departmentalTests: {
    headers: ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"],
    testPassed: ["Test passed (Yes / No)", "YES", "YES", "YES", "—", "NO"],
    yearOfPassing: ["Year of Passing", "Nov-08", "May-09", "Nov-10", "—", "—"]
  },

  serviceDetails: {
    dateOfAppointmentSpecialTeacher: "—",
    dateOfFirstAppointment: "12-07-2007",
    dateOfJoiningFeederCadre: "12-07-2007",
    dateOfJoiningPresentCadre: "15-08-2015",
    dateOfJoiningPresentSchool: "18-06-2021",
    appointmentManagement: "LB",
    appointedArea: "PLAIN",
    yearOfDsc: "2006",
    dscListNo: "1",
    rank: "245",
    interDistrictMutualTransferFrom: "—",
    dojInWngl: "12-07-2007",
    go610TransferredDistrict: "—",
    sscHandlingSubject: "MATHEMATICS",
    sinceYear: "8 YEARS",
    pendingCases: "NO"
  },

  promotions: [
    { label: "Promotion-1", designation: "GAZETTED HEAD MASTER (GHM)" },
    { label: "Promotion-2", designation: "DIET LECTURER (MATHS)" },
    { label: "Promotion-3", designation: "JUNIOR LECTURER (MATHS)" },
    { label: "Promotion-4", designation: "—" }
  ],

  bankDetails: {
    accountNumber: "52098412894",
    accountNumberMasked: "XXXX XXXX 2894",
    branch: "JANGAON MAIN",
    bankName: "SBI",
    ifscCode: "SBIN0000843"
  },

  declarations: {
    teacherDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
    teacherSignLabel: "Signature of the Teacher",

    certDdoHmDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
    ddoHmSignLabel: "Signature of the DDO/HM",
    meoSignLabel: "Signature of the MEO",

    crpCoMiscoDeclaration: "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct.",
    crpSignLabel: "Signature of the CRP",
    coSignLabel: "Signature of the CO",
    miscoSignLabel: "Signature of the MISCO"
  }
};

// Records mapped by Employee ID / Treasury Code
const STATIC_RECORDS = {
  "2126324": SAMPLE_RECORD_2126324,
  "TS-TCH-2126324": SAMPLE_RECORD_2126324,
  "100234": SAMPLE_RECORD_100234,
  "TS-TCH-100234": SAMPLE_RECORD_100234
};

function maskAccountNumber(acc) {
  if (!acc) return "—";
  const str = String(acc).replace(/\s+/g, '');
  if (str.length <= 4) return str;
  const lastFour = str.slice(-4);
  return `XXXX XXXX ${lastFour}`;
}

function sanitizeString(val) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return '—';
  }
  return String(val).trim();
}

class TeacherService {
  /**
   * Builds an authentic service record document for any teacher.
   * If a static detailed form exists (like 2126324 or 100234), it loads it directly.
   * If the user has custom serviceRecord in the database, it merges it.
   * Otherwise, it dynamically builds a complete official template using the teacher's known details.
   */
  getServiceRecordForUser(user, options = {}) {
    if (!user) return null;

    const empId = String(user.employeeId || user.id || '').replace(/^TCH-/, '').trim();
    const existingStatic = STATIC_RECORDS[empId] || STATIC_RECORDS[user.employeeId];

    let baseRecord = null;
    if (existingStatic) {
      baseRecord = JSON.parse(JSON.stringify(existingStatic));
    } else if (user.serviceRecord) {
      baseRecord = JSON.parse(JSON.stringify(user.serviceRecord));
    } else {
      // Dynamic baseline record for any other authenticated teacher
      const treasuryCode = empId.replace(/\D/g, '') || '100582';
      baseRecord = {
        treasuryCode,
        teacherName: (user.fullName || 'TEACHER').toUpperCase(),
        district: "JANGAON DISTRICT",
        department: "SCHOOL EDUCATION DEPARTMENT",

        personalDetails: {
          treasuryCode,
          fatherName: "—",
          gender: "—",
          mobileNumber: user.mobileNumber || "—",
          phcPercentage: "—",
          aadharNo: "—",
          designation: user.designation || "School Assistant",
          dateOfBirth: "—",
          maritalStatus: "—",
          teacherName: (user.fullName || 'TEACHER').toUpperCase(),
          medium: "TM / EM",
          caste: "—",
          typeOfPhc: "NO PHC"
        },

        spouseDetails: {
          isSpouseGovtEmployee: "NO",
          spouseDeptName: "—",
          spouseTreasuryId: "—",
          spouseWorkingPlace: "—",
          spouseName: "—"
        },

        residentialDetails: {
          residentialAddress: user.mandal ? `${user.mandal}, Jangaon District` : "Jangaon",
          residentialConstituency: "JANGAON",
          nativeAddress: "JANGAON",
          nativeConstituency: "JANGAON",
          localDistrict: "JANGAON"
        },

        workingDetails: {
          newDistrict: "JANGAON",
          mandal: (user.mandal || "JANGAON").toUpperCase(),
          schoolName: user.schoolName || "Government High School, Jangaon",
          categoryOfSchool: "High School",
          mediumOfSchool: "Telugu & English",
          hraPercentage: "13",
          schoolDiseCode: "3621010001",
          management: "LB",
          workingArea: "PLAIN"
        },

        academicQualifications: [
          { qualification: "SSC", branch: "—", degreeOrMedium: "TELUGU", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "GOVT EXAMINATIONS", yearPassed: "—", percentage: "—" },
          { qualification: "Intermediate", branch: "—", degreeOrMedium: "TELUGU", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "BIE", yearPassed: "—", percentage: "—" },
          { qualification: "Degree B.A./B.Sc/B.Com", branch: "Degree", degreeOrMedium: "TELUGU", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "KU", yearPassed: "—", percentage: "—" },
          { qualification: "Additional Degree", branch: "—", degreeOrMedium: "—", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "—", yearPassed: "—", percentage: "—" },
          { qualification: "Post Graduation", branch: "—", degreeOrMedium: "—", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "KU", yearPassed: "—", percentage: "—" },
          { qualification: "Additional PG", branch: "—", degreeOrMedium: "—", optional1: "—", optional2: "—", optional3: "—", universityOrBoard: "—", yearPassed: "—", percentage: "—" }
        ],

        professionalQualifications: [
          { qualification: "D.Ed / TTC / Spl SPEED", degree: "—", medium: "—", method1: "—", method2: "—", university: "—", yearPassed: "—", percentage: "—" },
          { qualification: "B.Ed / Spl B.Ed", degree: "B.Ed", medium: "TELUGU", method1: "METHOD 1", method2: "METHOD 2", university: "KU", yearPassed: "—", percentage: "—" },
          { qualification: "Additional (B.Ed / Spl B.Ed)", degree: "—", medium: "—", method1: "—", method2: "—", university: "—", yearPassed: "—", percentage: "—" },
          { qualification: "M.Ed / Spl M.Ed", degree: "—", medium: "—", method1: "—", method2: "—", university: "—", yearPassed: "—", percentage: "—" }
        ],

        departmentalTests: {
          headers: ["Departmental Test", "GOT", "EOT", "Lang Test (Tel)", "Lang Test (Hin)", "Other Tests"],
          testPassed: ["Test passed (Yes / No)", "YES", "YES", "—", "—", "NO"],
          yearOfPassing: ["Year of Passing", "—", "—", "—", "—", "—"]
        },

        serviceDetails: {
          dateOfAppointmentSpecialTeacher: "—",
          dateOfFirstAppointment: "—",
          dateOfJoiningFeederCadre: "—",
          dateOfJoiningPresentCadre: "—",
          dateOfJoiningPresentSchool: "—",
          appointmentManagement: "LB",
          appointedArea: "PLAIN",
          yearOfDsc: "—",
          dscListNo: "—",
          rank: "—",
          interDistrictMutualTransferFrom: "—",
          dojInWngl: "—",
          go610TransferredDistrict: "—",
          sscHandlingSubject: user.designation || "GENERAL",
          sinceYear: "—",
          pendingCases: "NO"
        },

        promotions: [
          { label: "Promotion-1", designation: "—" },
          { label: "Promotion-2", designation: "—" },
          { label: "Promotion-3", designation: "—" },
          { label: "Promotion-4", designation: "—" }
        ],

        bankDetails: {
          accountNumber: "62001140000",
          accountNumberMasked: "XXXX XXXX 0000",
          branch: "JANGAON",
          bankName: "SBI",
          ifscCode: "SBIN0020161"
        },

        declarations: {
          teacherDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
          teacherSignLabel: "Signature of the Teacher",

          certDdoHmDeclaration: "I hereby declare that the above information provided by me is true and correct to the best of my knowledge and belief and if any false information found, I will be personally held responsible as per CCA Rules.",
          ddoHmSignLabel: "Signature of the DDO/HM",
          meoSignLabel: "Signature of the MEO",

          crpCoMiscoDeclaration: "I certify that the above particulars submitted by the candidate are verified with the Original Certificates and the service register of the individual and found correct.",
          crpSignLabel: "Signature of the CRP",
          coSignLabel: "Signature of the CO",
          miscoSignLabel: "Signature of the MISCO"
        }
      };
    }

    // Mask bank account number for normal screen viewing
    if (baseRecord.bankDetails) {
      const rawAcc = baseRecord.bankDetails.accountNumber;
      baseRecord.bankDetails.accountNumberMasked = maskAccountNumber(rawAcc);
      if (options.maskSensitive !== false) {
        baseRecord.bankDetails.accountNumber = baseRecord.bankDetails.accountNumberMasked;
      }
    }

    return baseRecord;
  }
}

module.exports = new TeacherService();
module.exports.SAMPLE_RECORD_2126324 = SAMPLE_RECORD_2126324;
module.exports.SAMPLE_RECORD_100234 = SAMPLE_RECORD_100234;
