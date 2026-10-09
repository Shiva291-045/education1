// District Educational Office, Jangaon - Comprehensive Centralized i18n System
// English ↔ Telugu Language Switcher with Dynamic DOM Translation, React Hooks & Persistence

(function () {
  'use strict';

  const STORAGE_KEY = 'portal_language';
  let currentLang = 'en';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'te' || saved === 'en') {
      currentLang = saved;
    }
  } catch (e) {
    currentLang = 'en';
  }

  // Master Telugu Translation Dictionary
  const translations = {
    // Top Bar & Accessibility
    "Government of Telangana": "తెలంగాణ ప్రభుత్వం",
    "Department of School Education": "పాఠశాల విద్యాశాఖ",
    "District Educational Office, Jangaon": "జిల్లా విద్యాశాఖ కార్యాలయం, జనగామ",
    "District Educational Office": "జిల్లా విద్యాశాఖ కార్యాలయం",
    "Jangaon District, Telangana": "జనగామ జిల్లా, తెలంగాణ",
    "Jangaon District": "జనగామ జిల్లా",
    "Jangaon": "జనగామ",
    "School Education Department, Telangana": "పాఠశాల విద్యాశాఖ, తెలంగాణ",
    "Education for a Brighter Tomorrow": "ఉజ్వల భవిష్యత్తుకై నాణ్యమైన విద్య",
    "Accessibility": "సౌలభ్యం",
    "Search": "శోధించండి",
    "Light Theme": "లైట్ థీమ్",
    "Dark Theme": "డార్క్ థీమ్",
    "English": "ఇంగ్లీష్",
    "Telugu": "తెలుగు",

    // Navigation Menu & Top Bar
    "Home": "హోమ్",
    "About": "మా గురించి",
    "About Us": "మా గురించి",
    "Administration": "పరిపాలన",
    "Schools": "పాఠశాలలు",
    "Teachers": "ఉపాధ్యాయులు",
    "Students": "విద్యార్థులు",
    "Examinations": "పరీక్షలు",
    "Notifications": "నోటిఫికేషన్లు",
    "Circulars": "సర్క్యులర్లు",
    "Gallery": "గ్యాలరీ",
    "Photo Gallery": "ఫోటో గ్యాలరీ",
    "Contact": "సంప్రదించండి",
    "Contact Us": "మమ్మల్ని సంప్రదించండి",
    "Login": "లాగిన్",
    "Register": "నమోదు చేసుకోండి",
    "Official Login": "అధికారిక లాగిన్",
    "Official Portal Login": "అధికారిక పోర్టల్ లాగిన్",
    "Role Dashboard": "రోల్ డ్యాష్‌బోర్డ్",
    "Dashboard": "డ్యాష్‌బోర్డ్",
    "Main Portal View": "ప్రధాన పోర్టల్ వీక్షణ",
    "Change Password": "పాస్‌వర్డ్ మార్చండి",
    "Logout": "లాగౌట్",
    "Sign Out": "సైన్ అవుట్",
    "Sign In": "సైన్ ఇన్",
    "Dept Link Pending": "శాఖ లింక్ పెండింగ్‌లో ఉంది",
    "Quick Services": "త్వరిత సేవలు",
    "Access essential information and services": "ముఖ్యమైన సమాచారం మరియు సేవలను పొందండి",
    "View All Services": "అన్ని సేవలను చూడండి",

    // Hero Banner & Quick Links
    "Quality Education for Every Child in Jangaon": "జనగామలోని ప్రతి బిడ్డకూ నాణ్యమైన విద్య",
    "Empowering 1,248 schools and 3,800+ dedicated teachers with digital governance and academic excellence.": "డిజిటల్ పాలన మరియు విద్యా నైపుణ్యంతో 1,248 పాఠశాలలు మరియు 3,800+ మంది ఉపాధ్యాయుల సాధికారత.",
    "Explore Portal": "పోర్టల్‌ను అన్వేషించండి",
    "Telangana Rising": "తెలంగాణ రైజింగ్",
    "Quality Education": "నాణ్యమైన విద్య",
    "Empowered Teachers": "సాధికారత కలిగిన ఉపాధ్యాయులు",
    "Brighter Future": "ఉజ్వల భవిష్యత్తు",
    "Together for a Brighter Jangaon": "ఉజ్వల జనగామ కోసం కలిసికట్టుగా",
    "Find Schools in Jangaon District": "జనగామ జిల్లాలోని పాఠశాలలను కనుగొనండి",
    "Find a School": "పాఠశాలను కనుగొనండి",
    "Search Schools": "పాఠశాలలను శోధించండి",
    "Search schools in Jangaon District": "జనగామ జిల్లాలోని పాఠశాలలను శోధించండి",
    "Select Mandal ▾": "మండలాన్ని ఎంచుకోండి ▾",
    "Select School Type ▾": "పాఠశాల రకాన్ని ఎంచుకోండి ▾",
    "TS Model School": "తెలంగాణ మోడల్ స్కూల్",
    "KGBV Residential": "కేజీబీవీ రెసిడెన్షియల్",
    "Government High School": "ప్రభుత్వ ఉన్నత పాఠశాల",
    "Zilla Parishad (ZPHS)": "జిల్లా పరిషత్ ఉన్నత పాఠశాల (ZPHS)",

    // Notices, Circulars & News
    "Latest Announcements & Circulars": "తాజా ప్రకటనలు & సర్క్యులర్లు",
    "Latest Notifications": "తాజా నోటిఫికేషన్లు",
    "News & Events": "వార్తలు & విశేషాలు",
    "Important Government Orders, Examination Schedules & Department Updates": "ముఖ్యమైన ప్రభుత్వ ఉత్తర్వులు, పరీక్షల షెడ్యూల్స్ & శాఖాపరమైన అప్‌డేట్లు",
    "View All Circulars": "అన్ని సర్క్యులర్లను చూడండి",
    "Download": "డౌన్‌లోడ్",
    "New": "కొత్తది",
    "Date": "తేదీ",
    "Category": "కేటగిరీ",
    "Title": "శీర్షిక",
    "File": "ఫైల్",
    "SSC Public Examinations – Time Table Released": "ఎస్ఎస్సి పబ్లిక్ పరీక్షలు – టైమ్ టేబుల్ విడుదలైంది",
    "School Infrastructure Grants – Utilization Certificates": "పాఠశాల మౌలిక సదుపాయాల గ్రాంట్లు – వినియోగ ధృవపత్రాలు",
    "Revised Academic Calendar for 2025-26": "2025-26 సవరించిన విద్యా క్యాలెండర్",
    "Teacher Transfers – Guidelines and Format": "ఉపాధ్యాయుల బదిలీలు – మార్గదర్శకాలు మరియు ఫార్మాట్",
    "District Level Science Exhibition": "జిల్లా స్థాయి సైన్స్ ఎగ్జిబిషన్",
    "Teachers Training Program": "ఉపాధ్యాయుల శిక్షణ కార్యక్రమం",
    "Inter School Sports Meet 2025": "అంతర్-పాఠశాల క్రీడా పోటీలు 2025",
    "National Education Day Celebrations": "జాతీయ విద్యా దినోత్సవ వేడుకలు",
    "View Details →": "వివరాలు చూడండి →",
    "View All →": "అన్నీ చూడండి →",
    "Download Academic Circulars": "విద్యా సర్క్యులర్లను డౌన్‌లోడ్ చేయండి",
    "Download Hall Ticket Guidelines": "హాల్ టికెట్ మార్గదర్శకాలను డౌన్‌లోడ్ చేయండి",
    "Submit Utilization Certificates for composite school maintenance grants.": "కాంపోజిట్ పాఠశాల నిర్వహణ గ్రాంట్ల కోసం వినియోగ ధృవపత్రాలను సమర్పించండి.",
    "View official timetable, examination guidelines, and syllabus updates.": "అధికారిక టైమ్‌టేబుల్, పరీక్ష మార్గదర్శకాలు మరియు సిలబస్ అప్‌డేట్‌లను చూడండి.",
    "Access guidelines and prepare application for upcoming teacher transfers in Jangaon District.": "జనగామ జిల్లాలో రాబోయే ఉపాధ్యాయ బదిలీల మార్గదర్శకాలను తెలుసుకోండి మరియు దరఖాస్తును సిద్ధం చేయండి.",
    "Track school attendance, term evaluations, and teacher feedback.": "పాఠశాల హాజరు, మూల్యాంకనాలు మరియు ఉపాధ్యాయ అభిప్రాయాలను పర్యవేక్షించండి.",
    "Open Attendance Portal": "హాజరు పోర్టల్ తెరవండి",
    "Update MDM Records": "MDM రికార్డులను అప్‌డేట్ చేయండి",
    "Upload UC Document": "UC పత్రాన్ని అప్‌లోడ్ చేయండి",
    "View Meeting Agendas": "సమావేశ అజెండాలను చూడండి",
    "View Model Papers": "మోడల్ పేపర్లను చూడండి",
    "Open Digital Library": "డిజిటల్ లైబ్రరీని తెరవండి",
    "View Transfer Guidelines": "బదిలీల మార్గదర్శకాలను చూడండి",
    "View Scheme Guidelines": "పథకం మార్గదర్శకాలను చూడండి",
    "Check Progress Card": "పురోగతి కార్డును తనిఖీ చేయండి",
    "Access textbook PDFs and online e-learning content.": "పాఠ్యపుస్తక పిడిఎఫ్లు మరియు ఆన్‌లైన్ ఇ-లెర్నింగ్ కంటెంట్‌ను పొందండి.",
    "Daily nutrition metrics, egg distribution, and grain stock register.": "రోజువారీ పోషకాహార వివరాలు, గుడ్ల పంపిణీ మరియు ఆహార ధాన్యాల నిల్వ రిజిస్టర్.",
    "Daily student attendance logging and continuous comprehensive evaluation (CCE) records.": "రోజువారీ విద్యార్థుల హాజరు నమోదు మరియు నిరంతర సమగ్ర మూల్యాంకనం (CCE) రికార్డులు.",
    "Parent-Teacher Meeting agendas and school development resolutions.": "తల్లిదండ్రుల-ఉపాధ్యాయుల సమావేశ అజెండాలు మరియు పాఠశాల అభివృద్ధి తీర్మానాలు.",
    "Quarterly formative assessments and model question papers.": "త్రైమాసిక నిర్మాణాత్మక మూల్యాంకనాలు మరియు మోడల్ ప్రశ్నపత్రాలు.",

    // Statistics & Counters
    "District at a Glance": "ఒక్క చూపులో జిల్లా",
    "District Education Statistics": "జిల్లా విద్యా గణాంకాలు",
    "Total Schools": "మొత్తం పాఠశాలలు",
    "Total Teachers": "మొత్తం ఉపాధ్యాయులు",
    "Total Students": "మొత్తం విద్యార్థులు",
    "Mandals": "మండలాలు",
    "SSC Pass Percentage": "ఎస్ఎస్సి ఉత్తీర్ణత శాతం",
    "Pass Percentage": "ఉత్తీర్ణత శాతం",
    "Government Schools": "ప్రభుత్వ పాఠశాలలు",
    "Student-Teacher Ratio": "విద్యార్థి-ఉపాధ్యాయ నిష్పత్తి",
    "Students per Teacher": "ఉపాధ్యాయునికి విద్యార్థులు",
    "Digital Classrooms": "డిజిటల్ తరగతి గదులు",
    "Digital Facilities": "డిజిటల్ సౌకర్యాలు",
    "School Staff": "పాఠశాల సిబ్బంది",
    "Teacher Transfers & Cadre": "ఉపాధ్యాయుల బదిలీలు & కేడర్",
    "Transfers, Vacancies, Trainings and More": "బదిలీలు, ఖాళీలు, శిక్షణలు మరియు మరిన్ని",
    "Attendance & Classroom": "హాజరు & తరగతి గది",
    "Teaching Resources": "బోధనా వనరులు",

    // Quick Portals & External links
    "Official Portals & Services": "అధికారిక పోర్టల్స్ & సేవలు",
    "Single Sign-On for education administration, academic monitoring, and citizen services.": "విద్యా పరిపాలన, విద్యా పర్యవేక్షణ మరియు పౌర సేవల కోసం సింగిల్ సైన్-ఆన్.",
    "UDISE+ Portal": "యుడైస్+ పోర్టల్",
    "Access U-DISE+ Portal": "యు-డైస్+ పోర్టల్‌ను తెరవండి",
    "Mid-Day Meal (MDM)": "మధ్యాహ్న భోజన పథకం (MDM)",
    "T-SAT Vidya": "టి-శాట్ విద్యా",
    "Teacher Transfer Portal": "ఉపాధ్యాయుల బదిలీల పోర్టల్",
    "Scholarships (ePass)": "స్కాలర్‌షిప్‌లు (ఈ-పాస్)",
    "Grievance Portal": "ఫిర్యాదుల పోర్టల్",
    "Mid-Day Meal (MDM) Ledger": "మధ్యాహ్న భోజన పథకం (MDM) లెడ్జర్",
    "Nutrition & Schemes": "పోషకాహారం & పథకాలు",
    "Ward Academic Progress": "వార్డు విద్యా పురోగతి",
    "SSC Public Examinations": "ఎస్ఎస్సి పబ్లిక్ పరీక్షలు",
    "Administrative (APO / DEO / MEO)": "పరిపాలన (APO / DEO / MEO)",
    "Mandal Inspection Monitoring": "మండల తనిఖీ పర్యవేక్షణ",
    "School Strength": "పాఠశాలల బలం",
    "School U-DISE+ Data Center": "పాఠశాల యుడైస్+ డేటా సెంటర్",
    "Teacher Login": "ఉపాధ్యాయుల లాగిన్",
    "Teachers Information": "ఉపాధ్యాయుల సమాచారం",
    "Grants & Utilization": "గ్రాంట్లు & వినియోగం",
    "Academic Schedule & Exams": "విద్యా షెడ్యూల్ & పరీక్షలు",
    "Digital Learning Resources": "డిజిటల్ లెర్నింగ్ వనరులు",
    "SMC Committee Notices": "ఎస్ఎంసి కమిటీ నోటీసులు",

    // Officer Dashboard
    "Overview": "అవలోకనం",
    "Schools Information": "పాఠశాలల సమాచారం",
    "Teachers Info": "ఉపాధ్యాయుల సమాచారం",
    "Retirement": "పదవీ విరమణ",
    "Employee Retirements": "ఉద్యోగుల పదవీ విరమణలు",
    "Employee Retirements & Schedules": "ఉద్యోగుల పదవీ విరమణలు & షెడ్యూల్స్",
    "Dynamic Schedules & Countdown": "డైనమిక్ షెడ్యూల్స్ & కౌంట్‌డౌన్",
    "Track upcoming retirements, days remaining (updating daily), current month/year schedules, and archived retired personnel.": "రాబోయే పదవీ విరమణలు, రోజువారీ కౌంట్‌డౌన్, ప్రస్తుత నెల/సంవత్సరం షెడ్యూల్స్ మరియు పదవీ విరమణ చేసిన సిబ్బందిని ట్రాక్ చేయండి.",
    "Open Retirement Schedule": "పదవీ విరమణ షెడ్యూల్ తెరవండి",
    "Open Mandal Retirements": "మండల పదవీ విరమణలు తెరవండి",
    "Mandal Administration": "మండల పరిపాలన",
    "Manage administrative monitoring for your assigned mandal.": "మీకు కేటాయించిన మండలానికి సంబంధించిన పరిపాలనా పర్యవేక్షణను నిర్వహించండి.",
    "Official MEO Dashboard Module": "అధికారిక MEO డ్యాష్‌బోర్డ్ మాడ్యూల్",
    "Oversee school inspections across the 12 mandals of Jangaon District.": "జనగామ జిల్లాలోని 12 మండలాల పాఠశాలల తనిఖీలను పర్యవేక్షించండి.",
    "Open Mandal Audit Matrix": "మండల ఆడిట్ మ్యాట్రిక్స్ తెరవండి",
    "Audit Assigned Mandal": "కేటాయించిన మండలాన్ని ఆడిట్ చేయండి",
    "Grievance Redressal (PGRS)": "ఫిర్యాదుల పరిష్కారం (PGRS)",
    "Review public education petitions and teacher queries.": "ప్రజా విద్యా పిటిషన్లు మరియు ఉపాధ్యాయుల సందేహాలను సమీక్షించండి.",
    "Resolve Petitions": "పిటిషన్లను పరిష్కరించండి",
    "Protected Officer Directory": "రక్షిత అధికారి డైరెక్టరీ",
    "Authorized MEO": "అధికారిక MEO",
    "Assigned Mandal": "కేటాయించిన మండలం",
    "Assigned": "కేటాయించిన",
    "Officer": "అధికారి",
    "Teacher": "ఉపాధ్యాయుడు",
    "Open Teachers Directory": "ఉపాధ్యాయుల డైరెక్టరీ తెరవండి",
    "Open Schools Information": "పాఠశాలల సమాచారం తెరవండి",
    "Open Mandal School Strength": "మండల పాఠశాలల బలాన్ని తెరవండి",
    "← Return to Dashboard Overview": "← డ్యాష్‌బోర్డ్ అవలోకనానికి తిరిగి వెళ్లండి",
    "← Back to Overview": "← అవలోకనానికి తిరిగి వెళ్లండి",
    "Back to Overview": "అవలోకనానికి తిరిగి వెళ్లండి",
    "Return to Dashboard Overview": "డ్యాష్‌బోర్డ్ అవలోకనానికి తిరిగి వెళ్లండి",
    "Official District & Mandal School Particulars (Protected Dashboard)": "అధికారిక జిల్లా & మండల పాఠశాలల వివరాలు (రక్షిత డ్యాష్‌బోర్డ్)",
    "School strength particulars and schools information are protected dashboard features strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official logins.": "పాఠశాలల బలం వివరాలు మరియు సమాచారం రక్షిత డ్యాష్‌బోర్డ్ ఫీచర్లు, ఇవి లాగిన్ అయిన DEO, APO మరియు సంబంధిత MEO అధికారులకు మాత్రమే అందుబాటులో ఉంటాయి.",
    "Teachers Information and employee service records are protected features strictly restricted to authenticated DEO, APO, and authorized MEO officers through their official logins.": "ఉపాధ్యాయుల సమాచారం మరియు సర్వీస్ రికార్డులు రక్షిత ఫీచర్లు, ఇవి అధికారికంగా లాగిన్ అయిన DEO, APO మరియు అధికారిక MEO అధికారులకు మాత్రమే అందుబాటులో ఉంటాయి.",
    "Employee retirement schedules and records are protected dashboard features strictly restricted to authenticated DEO, APO, and authorized MEO officers.": "ఉద్యోగుల పదవీ విరమణ షెడ్యూల్స్ మరియు రికార్డులు అధికారికంగా లాగిన్ అయిన DEO, APO మరియు MEO అధికారులకు మాత్రమే అందుబాటులో ఉంటాయి.",

    // Teachers Information & EMP List Table
    "Official Teacher Records Directory": "అధికారిక ఉపాధ్యాయుల రికార్డుల డైరెక్టరీ",
    "Teachers Information — Jangaon District Directory": "ఉపాధ్యాయుల సమాచారం — జనగామ జిల్లా డైరెక్టరీ",
    "Total Active District Cadre": "మొత్తం క్రియాశీల జిల్లా కేడర్",
    "Verified in Department DB": "శాఖ డేటాబేస్‌లో ధృవీకరించబడింది",
    "100% Synced": "100% సింక్ అయింది",
    "School Assistants (SA)": "స్కూల్ అసిస్టెంట్లు (SA)",
    "Maths, Phys Sci, Bio Sci, Social, Langs": "గణితం, భౌతిక, జీవశాస్త్రం, సాంఘిక, భాషలు",
    "High School / UPS Posts": "హైస్కూల్ / ప్రాథమికోన్నత పోస్టులు",
    "Active Cadre": "క్రియాశీల కేడర్",
    "Secondary Grade (SGT)": "సెకండరీ గ్రేడ్ ఉపాధ్యాయులు (SGT)",
    "Secondary Grade Teachers (SGT)": "సెకండరీ గ్రేడ్ ఉపాధ్యాయులు (SGT)",
    "Primary School Teaching Posts": "ప్రాథమిక పాఠశాల బోధనా పోస్టులు",
    "Classes 1–5 Foundation": "1–5 తరగతుల పునాది",
    "Primary Cadre": "ప్రాథమిక కేడర్",
    "Other Cadres": "ఇతర కేడర్లు",
    "Headmasters, PETs, Lang Pandits": "ప్రధానోపాధ్యాయులు, పీఈటీలు, భాషా పండితులు",
    "Administrative & Special": "పరిపాలనా & ప్రత్యేక పోస్టులు",
    "Special Cadres": "ప్రత్యేక కేడర్లు",
    "Mandal / Jurisdiction": "మండలం / పరిధి",
    "— All 12 Mandals (District View) —": "— అన్ని 12 మండలాలు (జిల్లా వీక్షణ) —",
    "Designation / Cadre": "హోదా / కేడర్",
    "— All Designations —": "— అన్ని హోదాలు —",
    "Search Keyword": "శోధన పదం",
    "Enter Treasury Code, Teacher Name, or School...": "ట్రెజరీ కోడ్, ఉపాధ్యాయుని పేరు లేదా పాఠశాల నమోదు చేయండి...",
    "Active Criteria:": "క్రియాశీల ప్రమాణాలు:",
    "Mandal:": "మండలం:",
    "Designation:": "హోదా:",
    "Search:": "శోధన:",
    "↺ Reset All Filters": "↺ అన్ని ఫిల్టర్లను రీసెట్ చేయండి",
    "Print Directory View": "డైరెక్టరీ వీక్షణను ప్రింట్ చేయండి",
    "S.No": "వ.సంఖ్య",
    "Treasury Code": "ట్రెజరీ కోడ్",
    "Teacher's Name": "ఉపాధ్యాయుని పేరు",
    "Designation": "హోదా",
    "Mandal": "మండలం",
    "School Name": "పాఠశాల పేరు",
    "Date of First Appointment": "మొదటి నియామక తేదీ",
    "Date of Joining the Feeder Cadre": "ఫీడర్ కేడర్‌లో చేరిన తేదీ",
    "Date of Joining the Present Cadre": "ప్రస్తుత కేడర్‌లో చేరిన తేదీ",
    "Date of Joining in Present School": "ప్రస్తుత పాఠశాలలో చేరిన తేదీ",
    "Mobile No.": "మొబైల్ నంబర్",
    "Actions": "చర్యలు",
    "View Individual Profile": "వ్యక్తిగత ప్రొఫైల్ చూడండి",
    "Loading official teacher records...": "అధికారిక ఉపాధ్యాయుల రికార్డులను లోడ్ చేస్తోంది...",
    "No teacher records found matching the selected criteria.": "ఎంచుకున్న ప్రమాణాలకు సరిపోలే ఉపాధ్యాయ రికార్డులు కనుగొనబడలేదు.",
    "Previous": "మునుపటి",
    "Next": "తరువాతి",
    "Showing": "చూపిస్తోంది",
    "of": "నుండి",
    "Teachers": "ఉపాధ్యాయులు",
    "matching your criteria.": "మీ ప్రమాణాలకు సరిపోలుతున్నాయి.",
    "Page": "పేజీ",

    // Retirement Dashboard
    "Track upcoming retirements, dynamic countdowns, monthly and yearly schedules, and retired personnel.": "రాబోయే పదవీ విరమణలు, కౌంట్‌డౌన్, నెలవారీ మరియు వార్షిక షెడ్యూల్స్, పదవీ విరమణ చేసిన ఉద్యోగులను ట్రాక్ చేయండి.",
    "This Month": "ఈ నెల",
    "Every Month": "ప్రతి నెల",
    "This Year": "ఈ సంవత్సరం",
    "Every Year": "ప్రతి సంవత్సరం",
    "Upcoming Retirements": "రాబోయే పదవీ విరమణలు",
    "Retired Archive": "పదవీ విరమణ చేసినవారు",
    "Retiring This Month": "ఈ నెలలో పదవీ విరమణ చేస్తున్నవారు",
    "Retiring This Year": "ఈ సంవత్సరంలో పదవీ విరమణ చేస్తున్నవారు",
    "Upcoming (All Future)": "రాబోయే పదవీ విరమణలు (మొత్తం)",
    "Retired Personnel": "పదవీ విరమణ చేసిన సిబ్బంది",
    "Select Year:": "సంవత్సరాన్ని ఎంచుకోండి:",
    "Select Month:": "నెలను ఎంచుకోండి:",
    "Filter by Mandal:": "మండలం వారీగా ఫిల్టర్ చేయండి:",
    "Search Employee:": "ఉద్యోగిని శోధించండి:",
    "Days Remaining": "మిగిలిన రోజులు",
    "Retirement Date": "పదవీ విరమణ తేదీ",
    "Retiring Today": "ఈరోజే పదవీ విరమణ",
    "Retired": "పదవీ విరమణ పొందారు",
    "ago": "క్రితం",
    "days": "రోజులు",
    "day": "రోజు",
    "Open Profile": "ప్రొఫైల్ తెరవండి",
    "Interactive Monthly Breakdown": "నెలవారీ పంపిణీ విశ్లేషణ",
    "Month-wise Distribution": "నెలవారీ పంపిణీ",
    "Retirement Schedule Records": "పదవీ విరమణ షెడ్యూల్ రికార్డులు",
    "Search Treasury Code, Name, School, Designation...": "ట్రెజరీ కోడ్, పేరు, పాఠశాల, హోదా శోధించండి...",
    "All Years": "అన్ని సంవత్సరాలు",
    "All Mandals": "అన్ని మండలాలు",
    "Complete current year schedule": "ప్రస్తుత సంవత్సర పూర్తి షెడ్యూల్",
    "Chronological countdown": "కౌంట్‌డౌన్ క్రమం",
    "Official superannuation archive": "అధికారిక పదవీ విరమణ రికార్డులు",

    // Months
    "January": "జనవరి",
    "February": "ఫిబ్రవరి",
    "March": "మార్చి",
    "April": "ఏప్రిల్",
    "May": "మే",
    "June": "జూన్",
    "July": "జూలై",
    "August": "ఆగస్టు",
    "September": "సెప్టెంబర్",
    "October": "అక్టోబర్",
    "November": "నవంబర్",
    "December": "డిసెంబర్",
    "Jan": "జన", "Feb": "ఫిబ్ర", "Mar": "మార్చి", "Apr": "ఏప్రి", "Jun": "జూన్",
    "Jul": "జూలై", "Aug": "ఆగ", "Sep": "సెప్టెం", "Oct": "అక్టో", "Nov": "నవం", "Dec": "డిసెం",

    // Schools Information & Analytics
    "Schools Information & Analytics": "పాఠశాలల సమాచారం & విశ్లేషణ",
    "District Level Infrastructure, Enrolment, and Faculty Strength": "జిల్లా స్థాయి మౌలిక సదుపాయాలు, నమోదు మరియు ఉపాధ్యాయుల బలం",
    "Primary Schools (PS)": "ప్రాథమిక పాఠశాలలు (PS)",
    "Upper Primary (UPS)": "ప్రాథమికోన్నత పాఠశాలలు (UPS)",
    "High Schools (HS)": "ఉన్నత పాఠశాలలు (HS)",
    "Total Enrolment": "మొత్తం నమోదు",
    "Total Sanctioned Posts": "మొత్తం మంజూరైన పోస్టులు",
    "Working Teachers": "పనిచేస్తున్న ఉపాధ్యాయులు",
    "Vacant Posts": "ఖాళీ పోస్టులు",
    "Sanctioned Posts": "మంజూరైన పోస్టులు",
    "Pupil-Teacher Ratio (PTR)": "విద్యార్థి-ఉపాధ్యాయ నిష్పత్తి (PTR)",
    "Mandal-Wise Strength": "మండలం వారీగా బలం",
    "District Consolidation": "జిల్లా స్థాయి సమగ్ర నివేదిక",
    "Statistical Charts": "గణాంక చార్టులు",
    "Export to Excel": "ఎక్సెల్‌కు ఎగుమతి చేయండి",
    "Print Report": "నివేదికను ప్రింట్ చేయండి",
    "Filter by Category": "కేటగిరీ వారీగా ఫిల్టర్ చేయండి",
    "Filter by Management": "యాజమాన్యం వారీగా ఫిల్టర్ చేయండి",
    "School Category": "పాఠశాల కేటగిరీ",
    "School Management": "పాఠశాల యాజమాన్యం",
    "DISE Code": "డైస్ కోడ్",
    "Management": "యాజమాన్యం",
    "Medium": "మాధ్యమం",
    "Boys Enrolment": "బాలుర నమోదు",
    "Girls Enrolment": "బాలికల నమోదు",
    "Sanctioned": "మంజూరైనవి",
    "Working": "పనిచేస్తున్నవి",
    "Vacant": "ఖాళీలు",
    "PTR": "పీటీఆర్",
    "School Strength & Analytics": "పాఠశాలల బలం & విశ్లేషణ",
    "Search by school name, DISE code, or mandal...": "పాఠశాల పేరు, డైస్ కోడ్ లేదా మండలం ద్వారా శోధించండి...",
    "All Mandals": "అన్ని మండలాలు",
    "All Schools": "అన్ని పాఠశాలలు",
    "All Types": "అన్ని రకాలు",
    "School Type (Optional)": "పాఠశాల రకం (ఐచ్ఛికం)",
    "SCHOOL CATEGORY - WISE TOTAL (NUMBER OF SCHOOLS)": "పాఠశాల కేటగిరీ వారీగా మొత్తం (పాఠశాలల సంఖ్య)",
    "DISTRICT CLASS / STAGE-WISE STUDENT ENROLLMENT": "జిల్లా తరగతి / దశల వారీ విద్యార్థుల నమోదు",
    "Source: District Schools Strength Sheet 1": "మూలం: జిల్లా పాఠశాలల బలం షీట్ 1",
    "Reset": "రీసెట్",
    "Locked to Assigned": "కేటాయించిన మండలానికి మాత్రమే",
    "of District": "జిల్లాలో",
    "of Mandal": "మండలంలో",
    "of School": "పాఠశాలలో",
    "Filter table records...": "పట్టిక రికార్డులను ఫిల్టర్ చేయండి...",

    // Individual Teacher Profile / Service Record
    "Telangana School Education Department": "తెలంగాణ పాఠశాల విద్యాశాఖ",
    "Comprehensive Teacher Service Profile": "సమగ్ర ఉపాధ్యాయ సేవా ప్రొఫైల్",
    "Official Digital Record": "అధికారిక డిజిటల్ రికార్డు",
    "Print Service Profile": "సేవా ప్రొఫైల్‌ను ప్రింట్ చేయండి",
    "Back to Teacher Directory": "← ఉపాధ్యాయుల డైరెక్టరీకి తిరిగి వెళ్లండి",
    "1. Personal Details": "1. వ్యక్తిగత వివరాలు",
    "2. Spouse & Family Details": "2. జీవిత భాగస్వామి & కుటుంబ వివరాలు",
    "3. Residential Details": "3. నివాస వివరాలు",
    "4. School/Working Details": "4. పాఠశాల / పని వివరాలు",
    "5. Academic Qualifications": "5. విద్యా అర్హతలు",
    "6. Professional Qualifications": "6. వృత్తిపరమైన అర్హతలు",
    "7. Departmental Tests": "7. శాఖాపరమైన పరీక్షలు",
    "8. Service Details": "8. సేవా వివరాలు",
    "9. Working/Appointment Details": "9. పని / నియామక వివరాలు",
    "10. Eligible Promotions": "10. అర్హతగల పదోన్నతులు",
    "11. Bank Account Details": "11. బ్యాంక్ ఖాతా వివరాలు",
    "12. Declarations & Certificates": "12. ధృవీకరణలు & సర్టిఫికెట్లు",
    "Personal Details": "వ్యక్తిగత వివరాలు",
    "Spouse & Family Details": "జీవిత భాగస్వామి & కుటుంబ వివరాలు",
    "Residential Details": "నివాస వివరాలు",
    "School/Working Details": "పాఠశాల / పని వివరాలు",
    "Academic Qualifications": "విద్యా అర్హతలు",
    "Professional Qualifications": "వృత్తిపరమైన అర్హతలు",
    "Departmental Tests": "శాఖాపరమైన పరీక్షలు",
    "Service Details": "సేవా వివరాలు",
    "Working/Appointment Details": "పని / నియామక వివరాలు",
    "Eligible Promotions": "అర్హతగల పదోన్నతులు",
    "Bank Account Details": "బ్యాంక్ ఖాతా వివరాలు",
    "Declarations & Certificates": "ధృవీకరణలు & సర్టిఫికెట్లు",
    "Employee identity, demographics, personal profile": "ఉద్యోగి గుర్తింపు, జనాభా వివరాలు, వ్యక్తిగత ప్రొఫైల్",
    "Family information and marital record": "కుటుంబ సమాచారం మరియు వైవాహిక వివరాలు",
    "Official residential address and postal jurisdiction": "అధికారిక నివాస చిరునామా మరియు పోస్టల్ పరిధి",
    "Current school allocation, DISE code, and cadre": "ప్రస్తుత పాఠశాల కేటాయింపు, డైస్ కోడ్ మరియు కేడర్",
    "Degree level education, boards, and completion details": "డిగ్రీ స్థాయి విద్య, బోర్డులు మరియు పూర్తి వివరాలు",
    "Pedagogy training (B.Ed / D.Ed) and teaching certifications": "బోధనా శిక్షణ (బి.ఎడ్ / డి.ఎడ్) మరియు బోధనా ధృవపత్రాలు",
    "Department test compliance (GOT / EOT)": "శాఖాపరమైన పరీక్షల వివరాలు (GOT / EOT)",
    "Cadre seniority, joining chronology, and service milestones": "కేడర్ సీనియారిటీ, చేరిన క్రమం మరియు సేవా మైలురాళ్ళు",
    "Appointing authority, category, and DSC selection": "నియామక అధికారి, వర్గం మరియు డీఎస్సీ ఎంపిక",
    "Promotional entitlement, feeder post, and eligibility status": "పదోన్నతి అర్హత, ఫీడర్ పోస్ట్ మరియు హోదా",
    "Salary disbursement bank, branch, and account data": "జీతం చెల్లింపు బ్యాంకు, బ్రాంచ్ మరియు ఖాతా వివరాలు",
    "Department attestation, verification, and undertakings": "శాఖ ధృవీకరణ మరియు డిక్లరేషన్లు",
    "EMPLOYEE TREASURY CODE": "ఉద్యోగి ట్రెజరీ కోడ్",
    "TEACHER NAME": "ఉపాధ్యాయుని పేరు",
    "DESIGNATION": "హోదా",
    "GENDER": "లింగం",
    "DATE OF BIRTH": "పుట్టిన తేదీ",
    "AGE": "వయస్సు",
    "DATE OF RETIREMENT": "పదవీ విరమణ తేదీ",
    "REMAINING DAYS TO RETIRE": "పదవీ విరమణకు మిగిలిన రోజులు",
    "CASTE": "కులం",
    "MOBILE NUMBER": "మొబైల్ నంబర్",
    "PHC STATUS": "దివ్యాంగ (PHC) స్థితి",
    "PHC PERCENTAGE": "దివ్యాంగ శాతం",
    "MARITAL STATUS": "వైవాహిక స్థితి",
    "SPOUSE NAME": "జీవిత భాగస్వామి పేరు",
    "SPOUSE OCCUPATION": "జీవిత భాగస్వామి వృత్తి",
    "DOOR / HOUSE NO": "ఇంటి నంబర్",
    "STREET / COLONY": "వీధి / కాలనీ",
    "VILLAGE / HABITATION / TOWN": "గ్రామం / ఆవాసం / పట్టణం",
    "MANDAL": "మండలం",
    "DISTRICT": "జిల్లా",
    "PIN CODE": "పిన్ కోడ్",
    "RESIDENTIAL MANDAL": "నివాస మండలం",
    "PRESENT WORKING SCHOOL": "ప్రస్తుతం పనిచేస్తున్న పాఠశాల",
    "SCHOOL DISE CODE": "పాఠశాల డైస్ కోడ్",
    "MEDIUM": "బోధనా మాధ్యమం",
    "MEDIUM OF SCHOOL": "పాఠశాల మాధ్యమం",
    "CATEGORY OF SCHOOL": "పాఠశాల వర్గం",
    "MANAGEMENT": "యాజమాన్యం",
    "HRA CATEGORY": "హెచ్‌ఆర్‌ఏ వర్గం",
    "DATE OF FIRST APPOINTMENT": "మొదటి నియామక తేదీ",
    "DATE OF JOINING IN THE FEEDER CADRE": "ఫీడర్ కేడర్‌లో చేరిన తేదీ",
    "DATE OF JOINING IN THE PRESENT CADRE": "ప్రస్తుత కేడర్‌లో చేరిన తేదీ",
    "DATE OF JOINING IN THE PRESENT SCHOOL": "ప్రస్తుత పాఠశాలలో చేరిన తేదీ",
    "APPOINTMENT MANAGEMENT": "నియామక యాజమాన్యం",
    "APPOINTED AREA": "నియామక ప్రాంతం",
    "YEAR OF DSC": "డీఎస్సీ సంవత్సరం",
    "DSC LIST NO": "డీఎస్సీ జాబితా సంఖ్య",
    "QUALIFICATION / DEGREE": "అర్హత / డిగ్రీ",
    "BOARD / UNIVERSITY": "బోర్డు / విశ్వవిద్యాలయం",
    "YEAR OF PASSING": "ఉత్తీర్ణత సంవత్సరం",
    "MARKS / GRADE": "మార్కులు / గ్రేడ్",
    "TEST NAME / PAPER CODE": "పరీక్ష పేరు / పేపర్ కోడ్",
    "HALL TICKET NO": "హాల్ టికెట్ నంబర్",
    "MONTH & YEAR": "నెల & సంవత్సరం",
    "STATUS": "స్థితి",
    "PROMOTION POST": "పదోన్నతి పోస్ట్",
    "ELIGIBILITY DATE": "అర్హత తేదీ",
    "BANK NAME": "బ్యాంకు పేరు",
    "BRANCH NAME": "బ్రాంచ్ పేరు",
    "ACCOUNT NUMBER": "ఖాతా సంఖ్య",
    "IFSC CODE": "ఐఎఫ్ఎస్సీ కోడ్",
    "PAN NUMBER": "పాన్ నంబర్",
    "AADHAAR NUMBER": "ఆధార్ నంబర్",
    "CPS / GPF NUMBER": "సిపిఎస్ / జిపిఎఫ్ సంఖ్య",
    "Male": "పురుషుడు",
    "Female": "మహిళ",
    "Married": "వివాహితులు",
    "Unmarried": "అవివాహితులు",
    "YES": "అవును",
    "NO": "కాదు",
    "Passed": "ఉత్తీర్ణత",
    "Failed": "ఫెయిల్",

    // Authentication, Modals & Alerts
    "Administrative Official Login": "పరిపాలనా అధికారిక లాగిన్",
    "Administrative Login": "పరిపాలనా లాగిన్",
    "Administrative Verification Status": "పరిపాలనా ధృవీకరణ స్థితి",
    "Teacher Login": "ఉపాధ్యాయుల లాగిన్",
    "Officer Passkey Login": "అధికారుల పాస్‌కీ లాగిన్",
    "Officer Password Login": "అధికారుల పాస్‌వర్డ్ లాగిన్",
    "Username": "యూజర్ పేరు",
    "Password": "పాస్‌వర్డ్",
    "Enter your password": "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
    "Mobile Number": "మొబైల్ నంబర్",
    "Employee ID": "ఉద్యోగి ఐడి",
    "Select Role": "పాత్రను ఎంచుకోండి",
    "Select Authorized Role *": "అధికారిక పాత్రను ఎంచుకోండి *",
    "Remember Me": "నన్ను గుర్తుంచుకో",
    "Forgot Password?": "పాస్‌వర్డ్ మర్చిపోయారా?",
    "Sign In": "లాగిన్ అవ్వండి",
    "Register Now": "ఇప్పుడే నమోదు చేసుకోండి",
    "Register now": "ఇప్పుడే నమోదు చేసుకోండి",
    "Create Account": "ఖాతాను సృష్టించండి",
    "Full Name": "పూర్తి పేరు",
    "Enter your full name": "మీ పూర్తి పేరు నమోదు చేయండి",
    "Confirm Password": "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    "Re-enter password": "పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి",
    "Enter your 10-digit mobile number": "మీ 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి",
    "Enter your 7-digit Employee ID": "మీ 7 అంకెల ఉద్యోగి ఐడిని నమోదు చేయండి",
    "Passkey Authentication": "పాస్‌కీ ప్రామాణీకరణ",
    "Login with Passkey": "పాస్‌కీతో లాగిన్ అవ్వండి",
    "Login with Password": "పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి",
    "Login with Teacher Passkey": "ఉపాధ్యాయ పాస్‌కీతో లాగిన్ అవ్వండి",
    "Use Device Biometrics (Fingerprint / Face ID / PIN)": "పరికర బయోమెట్రిక్స్ ఉపయోగించండి (వేలిముద్ర / ఫేస్ ఐడి / పిన్)",
    "Verify & Sign In": "ధృవీకరించి సైన్ ఇన్ అవ్వండి",
    "Cancel": "రద్దు చేయండి",
    "Close": "మూసివేయండి",
    "Submit": "సమర్పించండి",
    "Save": "సేవ్ చేయండి",
    "Save Changes": "మార్పులను సేవ్ చేయండి",
    "Loading...": "లోడ్ అవుతోంది...",
    "Please wait...": "దయచేసి వేచి ఉండండి...",
    "Access Denied": "యాక్సెస్ నిరాకరించబడింది",
    "403 — Access Denied": "403 — యాక్సెస్ నిరాకరించబడింది",
    "Protected Officer Feature": "రక్షిత అధికారి ఫీచర్",
    "Protected DEO/APO Module": "రక్షిత DEO/APO మాడ్యూల్",
    "Authentication required.": "ధృవీకరణ అవసరం.",
    "Official User Registration": "అధికారిక వినియోగదారు నమోదు",
    "Official Account Recovery": "అధికారిక ఖాతా పునరుద్ధరణ",
    "Already have an official account?": "ఇప్పటికే అధికారిక ఖాతా ఉందా?",
    "Are you a Teacher?": "మీరు ఉపాధ్యాయులా?",
    "Are you an administrative officer?": "మీరు పరిపాలనా అధికారినా?",
    "Assigned Mandal (Strict Role-Based Access) *": "కేటాయించిన మండలం (కఠినమైన పాత్ర-ఆధారిత యాక్సెస్) *",
    "New administrative officer?": "కొత్త పరిపాలనా అధికారినా?",
    "Login here": "ఇక్కడ లాగిన్ అవ్వండి",
    "Min 6 characters": "కనీసం 6 అక్షరాలు",
    "Mobile Number / Employee ID": "మొబైల్ నంబర్ / ఎంప్లాయ్ ఐడి",
    "Mobile Number / Official User ID *": "మొబైల్ నంబర్ / అధికారిక యూజర్ ఐడి *",
    "Registered Mobile Number *": "నమోదిత మొబైల్ నంబర్ *",
    "Show password": "పాస్‌వర్డ్ చూపించు",
    "Show passwords": "పాస్‌వర్డ్‌లను చూపించు",
    "Skip for now & Continue to Dashboard →": "ప్రస్తుతానికి దాటవేసి డ్యాష్‌బోర్డ్‌కు వెళ్లండి →",
    "Proceed to Dashboard": "డ్యాష్‌బోర్డ్‌కు వెళ్లండి",
    "PREVIEW MODE": "ప్రివ్యూ మోడ్",
    "Register Device Passkey": "పరికర పాస్‌కీని నమోదు చేయండి",
    "Secure Passkey Authentication": "సురక్షిత పాస్‌కీ ప్రామాణీకరణ",
    "Secure Your Official Account": "మీ అధికారిక ఖాతాను సురక్షితం చేసుకోండి",
    "Secure with a Passkey": "పాస్‌కీతో భద్రపరచండి",
    "View My Service Record": "నా సేవా రికార్డును చూడండి",
    "My Service Record": "నా సేవా రికార్డు",
    "OFFICIAL SERVICE REGISTER": "అధికారిక సర్వీస్ రిజిస్టర్",
    "or with password": "లేదా పాస్‌వర్డ్‌తో",
    "enrolled with passkey?": "పాస్‌కీతో నమోదు చేసుకున్నారా?",
    "Other authorized role": "ఇతర అధికారిక పాత్ర",
    "Opening Device Passkey Dialog...": "పరికర పాస్‌కీ డైలాగ్‌ను తెరుస్తోంది...",
    "Opening Device Prompt...": "పరికర ప్రాంప్ట్‌ను తెరుస్తోంది...",
    "Verifying Department Record...": "శాఖ రికార్డును ధృవీకరిస్తోంది...",
    "Verifying Passkey...": "పాస్‌కీని ధృవీకరిస్తోంది...",
    "Creating Account...": "ఖాతాను సృష్టిస్తోంది...",
    "Account Created Successfully": "ఖాతా విజయవంతంగా సృష్టించబడింది",
    "Account registered. Please create your device passkey.": "ఖాతా నమోదైంది. దయచేసి మీ పరికర పాస్‌కీని సృష్టించండి.",
    "Continue to Register Passkey →": "పాస్‌కీ నమోదుకు కొనసాగండి →",
    "Continue to Teacher Portal →": "ఉపాధ్యాయ పోర్టల్‌కు కొనసాగండి →",
    "No schools found for selection.": "ఎంపిక కోసం పాఠశాలలు కనుగొనబడలేదు.",
    "Loading Retirement Dashboard...": "పదవీ విరమణ డ్యాష్‌బోర్డ్‌ను లోడ్ చేస్తోంది...",
    "Loading Schools Information...": "పాఠశాలల సమాచారాన్ని లోడ్ చేస్తోంది...",
    "Loading Teacher Service Record...": "ఉపాధ్యాయ సేవా రికార్డును లోడ్ చేస్తోంది...",
    "Loading Teachers Information...": "ఉపాధ్యాయుల సమాచారాన్ని లోడ్ చేస్తోంది...",

    // System Messages & Error Strings
    "Invalid credentials.": "చెల్లని ఆధారాలు.",
    "Invalid mobile number. Please enter a valid 10-digit Indian mobile number.": "చెల్లని మొబైల్ నంబర్. దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.",
    "Passkey Successfully Created & Verified": "పాస్‌కీ విజయవంతంగా సృష్టించబడింది & ధృవీకరించబడింది",
    "Passkey authentication failed for recovery.": "రికవరీ కోసం పాస్‌కీ ప్రమాణీకరణ విఫలమైంది.",
    "Passkey authentication failed.": "పాస్‌కీ ప్రమాణీకరణ విఫలమైంది.",
    "Passkey creation cancelled or unavailable.": "పాస్‌కీ సృష్టి రద్దు చేయబడింది లేదా అందుబాటులో లేదు.",
    "Passkey login failed or was cancelled.": "పాస్‌కీ లాగిన్ విఫలమైంది లేదా రద్దు చేయబడింది.",
    "Passkey registration failed or cancelled.": "పాస్‌కీ నమోదు విఫలమైంది లేదా రద్దు చేయబడింది.",
    "Passkey registration was cancelled or unsupported on this device.": "పాస్‌కీ నమోదు రద్దు చేయబడింది లేదా ఈ పరికరంలో సపోర్ట్ లేదు.",
    "Passkey verification cancelled.": "పాస్‌కీ ధృవీకరణ రద్దు చేయబడింది.",
    "Teacher Passkey login failed.": "ఉపాధ్యాయ పాస్‌కీ లాగిన్ విఫలమైంది.",
    "Teacher verification failed.": "ఉపాధ్యాయ ధృవీకరణ విఫలమైంది.",
    "Password and Confirm Password do not match.": "పాస్‌వర్డ్ మరియు కన్ఫర్మ్ పాస్‌వర్డ్ సరిపోలడం లేదు.",
    "Password must be at least 6 characters long.": "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.",
    "Please enter both Employee ID and Registered Mobile Number.": "దయచేసి ఎంప్లాయ్ ఐడి మరియు నమోదిత మొబైల్ నంబర్ రెండింటినీ నమోదు చేయండి.",
    "Please enter both Mobile Number / User ID and Password.": "దయచేసి మొబైల్ నంబర్ / యూజర్ ఐడి మరియు పాస్‌వర్డ్ రెండింటినీ నమోదు చేయండి.",
    "Please enter your Employee ID to login with Passkey.": "పాస్‌కీతో లాగిన్ అవ్వడానికి దయచేసి మీ ఎంప్లాయ్ ఐడిని నమోదు చేయండి.",
    "Please enter your Mobile Number or Official User ID.": "దయచేసి మీ మొబైల్ నంబర్ లేదా అధికారిక యూజర్ ఐడిని నమోదు చేయండి.",
    "Please enter your full name (at least 3 characters).": "దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (కనీసం 3 అక్షరాలు).",
    "Registration failed. Please try again.": "నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    "WebAuthn / Passkeys are not supported on this browser or platform.": "ఈ బ్రౌజర్ లేదా ప్లాట్‌ఫామ్‌లో WebAuthn / పాస్‌కీలకు మద్దతు లేదు.",
    "Government Teachers: Enter your official Employee ID and registered phone number to authenticate directly against department records.": "ప్రభుత్వ ఉపాధ్యాయులు: శాఖ రికార్డులతో నేరుగా ధృవీకరించడానికి మీ అధికారిక ఎంప్లాయ్ ఐడి మరియు నమోదిత ఫోన్ నంబర్‌ను నమోదు చేయండి.",
    "Information regarding Mid-Day Meals, uniforms, and government textbooks.": "మధ్యాహ్న భోజనం, యూనిఫాంలు మరియు ప్రభుత్వ పాఠ్యపుస్తకాల గురించిన సమాచారం.",
    "Manage school infrastructure, student strength, and facility audits.": "పాఠశాల మౌలిక సదుపాయాలు, విద్యార్థుల బలం మరియు సౌకర్యాల ఆడిట్‌లను నిర్వహించండి.",

    // Mandals of Jangaon
    "BACHANNAPETA": "బచ్చన్నపేట",
    "CHILPUR": "చిల్పూర్",
    "DEVARUPPULA": "దేవరుప్పుల",
    "GANPUR (STN)": "స్టేషన్ ఘన్‌పూర్",
    "GHANPUR STN": "స్టేషన్ ఘన్‌పూర్",
    "Station Ghanpur": "స్టేషన్ ఘన్‌పూర్",
    "JANGAON": "జనగామ",
    "KODAKANDLA": "కొడకండ్ల",
    "LINGALAGHANPUR": "లింగాలఘన్‌పూర్",
    "NARMETTA": "నార్మెట్ట",
    "PALAKURTHI": "పాలకుర్తి",
    "RAGHUNATHPALLE": "రఘునాథపల్లి",
    "THARIGOPPULA": "తరిగొప్పుల",
    "ZAFFERGADH": "జాఫర్‌గఢ్",

    // Footer & Links
    "Official Portal of Department of School Education": "పాఠశాల విద్యాశాఖ అధికారిక పోర్టల్",
    "All Rights Reserved": "సర్వ హక్కులు ప్రత్యేకించబడ్డాయి",
    "Designed & Maintained for Government of Telangana": "తెలంగాణ ప్రభుత్వం కోసం రూపొందించబడింది & నిర్వహించబడుతోంది",
    "Privacy Policy": "గోప్యతా విధానం",
    "Terms of Service": "సేవా నిబంధనలు",
    "Terms of Use": "ఉపయోగ నిబంధనలు",
    "Hyperlink Policy": "హైపర్‌లింక్ విధానం",
    "Disclaimer": "నిరాకరణ",
    "Collectorate Road, Jangaon, Telangana – 506167": "కలెక్టరేట్ రోడ్, జనగామ, తెలంగాణ – 506167",
    "District Office Support:": "జిల్లా కార్యాలయ సహాయం:",
    "Follow Us": "మమ్మల్ని అనుసరించండి",
    "Official portal of the District Educational Office, Jangaon District, providing quality school education governance and teacher-student services.": "జిల్లా విద్యాశాఖ కార్యాలయం, జనగామ అధికారిక పోర్టల్ - నాణ్యమైన పాఠశాల విద్యా పాలన మరియు ఉపాధ్యాయ-విద్యార్థి సేవలను అందిస్తోంది."
  };

  // Build secondary normalized lookup map (trim + lowercase)
  const normalizedMap = {};
  // Build reverse map (Telugu -> English)
  const teToEnMap = {};

  for (const [enKey, teVal] of Object.entries(translations)) {
    if (enKey && teVal) {
      normalizedMap[enKey.trim().toLowerCase()] = teVal;
      teToEnMap[teVal.trim()] = enKey.trim();
    }
  }

  // Dynamic Pattern Replacement Rules
  const dynamicRules = [
    {
      enRegex: /^Showing\s+(\d+)[–-](\d+)\s+of\s+(\d+)\s+Teachers$/i,
      teGen: (m) => `మొత్తం ${m[3]} ఉపాధ్యాయులలో ${m[1]}–${m[2]} చూపిస్తోంది`,
      teRegex: /^మొత్తం\s+(\d+)\s+ఉపాధ్యాయులలో\s+(\d+)[–-](\d+)\s+చూపిస్తోంది$/,
      enGen: (m) => `Showing ${m[2]}–${m[3]} of ${m[1]} Teachers`
    },
    {
      enRegex: /^Showing\s+(\d+)\s+of\s+(\d+)\s+teachers\s+matching\s+your\s+criteria\.?$/i,
      teGen: (m) => `మీ ప్రమాణాలకు సరిపోలుతున్న ${m[1]} / ${m[2]} ఉపాధ్యాయులు.`,
      teRegex: /^మీ\s+ప్రమాణాలకు\s+సరిపోలుతున్న\s+(\d+)\s*\/\s*(\d+)\s+ఉపాధ్యాయులు\.?$/,
      enGen: (m) => `Showing ${m[1]} of ${m[2]} teachers matching your criteria.`
    },
    {
      enRegex: /^Page\s+(\d+)\s+of\s+(\d+)$/i,
      teGen: (m) => `పేజీ ${m[1]} / ${m[2]}`,
      teRegex: /^పేజీ\s+(\d+)\s*\/\s*(\d+)$/,
      enGen: (m) => `Page ${m[1]} of ${m[2]}`
    },
    {
      enRegex: /^Retiring\s+This\s+Month\s*\((\d+)\)$/i,
      teGen: (m) => `ఈ నెలలో పదవీ విరమణ (${m[1]})`,
      teRegex: /^ఈ\s+నెలలో\s+పదవీ\s+విరమణ\s*\((\d+)\)$/,
      enGen: (m) => `Retiring This Month (${m[1]})`
    },
    {
      enRegex: /^Retiring\s+This\s+Year\s*\((\d{4})\)$/i,
      teGen: (m) => `ఈ సంవత్సరంలో పదవీ విరమణ (${m[1]})`,
      teRegex: /^ఈ\s+సంవత్సరంలో\s+పదవీ\s+విరమణ\s*\((\d{4})\)$/,
      enGen: (m) => `Retiring This Year (${m[1]})`
    },
    {
      enRegex: /^Retirements:\s*(.+)$/i,
      teGen: (m) => `పదవీ విరమణలు: ${m[1]}`,
      teRegex: /^పదవీ\s+విరమణలు:\s*(.+)$/,
      enGen: (m) => `Retirements: ${m[1]}`
    },
    {
      enRegex: /^Authorized\s+MEO:\s*(.+)$/i,
      teGen: (m) => `అధికారిక MEO: ${m[1]}`,
      teRegex: /^అధికారిక\s+MEO:\s*(.+)$/,
      enGen: (m) => `Authorized MEO: ${m[1]}`
    },
    {
      enRegex: /^School\s+Strength\s*\((.+)\)$/i,
      teGen: (m) => `పాఠశాలల బలం (${m[1]})`,
      teRegex: /^పాఠశాలల\s+బలం\s*\((.+)\)$/,
      enGen: (m) => `School Strength (${m[1]})`
    },
    {
      enRegex: /^Teachers\s+Info\s*\((.+)\)$/i,
      teGen: (m) => `ఉపాధ్యాయుల సమాచారం (${m[1]})`,
      teRegex: /^ఉపాధ్యాయుల\s+సమాచారం\s*\((.+)\)$/,
      enGen: (m) => `Teachers Info (${m[1]})`
    },
    {
      enRegex: /^\(in\s+(\d+)\s+days?\)$/i,
      teGen: (m) => `(${m[1]} రోజుల్లో)`,
      teRegex: /^\((\d+)\s+రోజుల్లో\)$/,
      enGen: (m) => `(in ${m[1]} days)`
    },
    {
      enRegex: /^\((\d+)d\s+ago\)$/i,
      teGen: (m) => `(${m[1]} రోజుల క్రితం)`,
      teRegex: /^\((\d+)\s+రోజుల\s+క్రితం\)$/,
      enGen: (m) => `(${m[1]}d ago)`
    },
    {
      enRegex: /^\(1d\s+ago\)$/i,
      teGen: () => `(నిన్న)`,
      teRegex: /^\(నిన్న\)$/,
      enGen: () => `(1d ago)`
    },
    {
      enRegex: /^\(today\)$/i,
      teGen: () => `(ఈరోజు)`,
      teRegex: /^\(ఈరోజు\)$/,
      enGen: () => `(today)`
    },
    {
      enRegex: /^Mandal:\s*(.+)$/i,
      teGen: (m) => `మండలం: ${m[1]}`,
      teRegex: /^మండలం:\s*(.+)$/,
      enGen: (m) => `Mandal: ${m[1]}`
    },
    {
      enRegex: /^User\s+ID:\s*(.+)$/i,
      teGen: (m) => `యూజర్ ఐడి: ${m[1]}`,
      teRegex: /^యూజర్\s+ఐడి:\s*(.+)$/,
      enGen: (m) => `User ID: ${m[1]}`
    },
    {
      enRegex: /^Last\s+Login:\s*(.+)$/i,
      teGen: (m) => `చివరి లాగిన్: ${m[1]}`,
      teRegex: /^చివరి\s+లాగిన్:\s*(.+)$/,
      enGen: (m) => `Last Login: ${m[1]}`
    },
    {
      enRegex: /^Preview\s+(.+)\s+Officer$/i,
      teGen: (m) => `ప్రివ్యూ ${m[1]} అధికారి`,
      teRegex: /^ప్రివ్యూ\s+(.+)\s+అధికారి$/,
      enGen: (m) => `Preview ${m[1]} Officer`
    },
    {
      enRegex: /^Welcome,\s*(.+)$/i,
      teGen: (m) => `స్వాగతం, ${m[1]}`,
      teRegex: /^స్వాగతం,\s*(.+)$/,
      enGen: (m) => `Welcome, ${m[1]}`
    },
    {
      enRegex: /^Open\s+Mandal\s+School\s+Strength\s*\((.+)\)$/i,
      teGen: (m) => `మండల పాఠశాలల బలాన్ని తెరవండి (${m[1]})`,
      teRegex: /^మండల\s+పాఠశాలల\s+బలాన్ని\s+తెరవండి\s*\((.+)\)$/,
      enGen: (m) => `Open Mandal School Strength (${m[1]})`
    },
    {
      enRegex: /^Open\s+Teachers\s+Directory\s*\((.+)\)$/i,
      teGen: (m) => `ఉపాధ్యాయుల డైరెక్టరీ తెరవండి (${m[1]})`,
      teRegex: /^ఉపాధ్యాయుల\s+డైరెక్టరీ\s+తెరవండి\s*\((.+)\)$/,
      enGen: (m) => `Open Teachers Directory (${m[1]})`
    }
  ];

  // Translates an English string to Telugu while preserving leading/trailing whitespace & icons
  function translateStringWithIcons(str) {
    if (!str || typeof str !== 'string') return str;
    const trimmed = str.trim();
    if (!trimmed) return str;

    // Do NOT translate pure numbers, treasury codes, phone numbers, dates (DD-MM-YYYY)
    if (/^[\d\s\-/:.,()+%#@*_]+$/.test(trimmed)) {
      return str;
    }
    // Do NOT translate email addresses or URLs
    if (trimmed.includes('@') || trimmed.startsWith('http') || trimmed.startsWith('/')) {
      return str;
    }

    const lead = str.match(/^\s*/)[0];
    const trail = str.match(/\s*$/)[0];

    // 1. Direct match
    if (translations[trimmed]) {
      return lead + translations[trimmed] + trail;
    }

    // 2. Dynamic pattern matching
    for (let i = 0; i < dynamicRules.length; i++) {
      const rule = dynamicRules[i];
      const match = trimmed.match(rule.enRegex);
      if (match) {
        return lead + rule.teGen(match) + trail;
      }
    }

    // 3. Match text with emoji / symbol prefixes like "👨‍🏫 Teachers Information", "← Back to Overview"
    const prefixMatch = str.match(/^(\s*[\p{Extended_Pictographic}\u200D\uFE0F\u2190-\u21FF\u2600-\u26FF\u2700-\u27BF•—–+*#:,.\/-]+\s*)(.+?)(\s*)$/u);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const core = prefixMatch[2].trim();
      const suffix = prefixMatch[3];
      if (translations[core] || normalizedMap[core.toLowerCase()]) {
        const trans = translations[core] || normalizedMap[core.toLowerCase()];
        return prefix + trans + suffix;
      }
    }

    // 4. Match trailing icons/badges like "About ▾", "Schools ▾", "English ▾"
    const suffixMatch = str.match(/^(\s*)(.+?)(\s*[▾▼▲•—–+*#:,.\/-]+\s*)$/u);
    if (suffixMatch) {
      const prefix = suffixMatch[1];
      const core = suffixMatch[2].trim();
      const suffix = suffixMatch[3];
      if (translations[core] || normalizedMap[core.toLowerCase()]) {
        const trans = translations[core] || normalizedMap[core.toLowerCase()];
        return prefix + trans + suffix;
      }
    }

    // 5. Normalized lowercase lookup
    const lower = trimmed.toLowerCase();
    if (normalizedMap[lower]) {
      return lead + normalizedMap[lower] + trail;
    }

    return str;
  }

  // Translates a Telugu string back to English
  function translateTeluguToEnglish(str) {
    if (!str || typeof str !== 'string') return str;
    const trimmed = str.trim();
    if (!trimmed) return str;

    const lead = str.match(/^\s*/)[0];
    const trail = str.match(/\s*$/)[0];

    // 1. Direct reverse dictionary lookup
    if (teToEnMap[trimmed]) {
      return lead + teToEnMap[trimmed] + trail;
    }

    // 2. Dynamic pattern reverse matching
    for (let i = 0; i < dynamicRules.length; i++) {
      const rule = dynamicRules[i];
      const match = trimmed.match(rule.teRegex);
      if (match) {
        return lead + rule.enGen(match) + trail;
      }
    }

    // 3. Match reverse with emoji/symbol prefixes
    const prefixMatch = str.match(/^(\s*[\p{Extended_Pictographic}\u200D\uFE0F\u2190-\u21FF\u2600-\u26FF\u2700-\u27BF•—–+*#:,.\/-]+\s*)(.+?)(\s*)$/u);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const core = prefixMatch[2].trim();
      const suffix = prefixMatch[3];
      if (teToEnMap[core]) {
        return prefix + teToEnMap[core] + suffix;
      }
    }

    // 4. Match reverse trailing icons
    const suffixMatch = str.match(/^(\s*)(.+?)(\s*[▾▼▲•—–+*#:,.\/-]+\s*)$/u);
    if (suffixMatch) {
      const prefix = suffixMatch[1];
      const core = suffixMatch[2].trim();
      const suffix = suffixMatch[3];
      if (teToEnMap[core]) {
        return prefix + teToEnMap[core] + suffix;
      }
    }

    return str;
  }

  // Translation core function
  function t(text, fallback) {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'en') {
      return text;
    }
    const res = translateStringWithIcons(text);
    if (res !== text) return res;
    return fallback || text;
  }

  // DOM node translation engine
  let isTranslating = false;

  function translateNode(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      // Ignore text inside script, style, code, pre tags
      const parent = node.parentElement;
      if (parent) {
        const tag = parent.tagName.toUpperCase();
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE') {
          return;
        }
      }

      if (currentLang === 'te') {
        const translated = translateStringWithIcons(text);
        if (translated !== text) {
          if (!node.__portalOriginalEn) {
            node.__portalOriginalEn = text;
          }
          node.nodeValue = translated;
        }
      } else if (currentLang === 'en') {
        if (node.__portalOriginalEn) {
          node.nodeValue = node.__portalOriginalEn;
          delete node.__portalOriginalEn;
        } else {
          const enText = translateTeluguToEnglish(text);
          if (enText !== text) {
            node.nodeValue = enText;
          }
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toUpperCase();
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;

      // Translate attributes: placeholder, title, aria-label
      if (node.placeholder) {
        if (currentLang === 'te') {
          const tPlace = translateStringWithIcons(node.placeholder);
          if (tPlace !== node.placeholder) {
            if (!node.__portalOrigPlaceholder) node.__portalOrigPlaceholder = node.placeholder;
            node.placeholder = tPlace;
          }
        } else {
          if (node.__portalOrigPlaceholder) {
            node.placeholder = node.__portalOrigPlaceholder;
            delete node.__portalOrigPlaceholder;
          } else {
            const enPlace = translateTeluguToEnglish(node.placeholder);
            if (enPlace !== node.placeholder) node.placeholder = enPlace;
          }
        }
      }

      if (node.title) {
        if (currentLang === 'te') {
          const tTitle = translateStringWithIcons(node.title);
          if (tTitle !== node.title) {
            if (!node.__portalOrigTitle) node.__portalOrigTitle = node.title;
            node.title = tTitle;
          }
        } else {
          if (node.__portalOrigTitle) {
            node.title = node.__portalOrigTitle;
            delete node.__portalOrigTitle;
          } else {
            const enTitle = translateTeluguToEnglish(node.title);
            if (enTitle !== node.title) node.title = enTitle;
          }
        }
      }

      // Traverse children
      for (let i = 0; i < node.childNodes.length; i++) {
        translateNode(node.childNodes[i]);
      }
    }
  }

  function applyTranslations(root) {
    if (!root) root = document.body;
    if (!root) return;
    isTranslating = true;
    try {
      translateNode(root);
    } finally {
      isTranslating = false;
    }
  }

  function restoreEnglish(root) {
    if (!root) root = document.body;
    if (!root) return;
    isTranslating = true;
    try {
      translateNode(root);
    } finally {
      isTranslating = false;
    }
  }

  // Setup MutationObserver to automatically translate newly added DOM nodes in Telugu mode
  let observer = null;
  function setupObserver() {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    if (observer) observer.disconnect();

    observer = new MutationObserver(function (mutations) {
      if (isTranslating || currentLang !== 'te') return;
      isTranslating = true;
      try {
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (m.type === 'childList') {
            for (let j = 0; j < m.addedNodes.length; j++) {
              translateNode(m.addedNodes[j]);
            }
          } else if (m.type === 'characterData') {
            translateNode(m.target);
          }
        }
      } finally {
        isTranslating = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function setLanguage(newLang) {
    const norm = (newLang === 'te' || newLang === 'తెలుగు') ? 'te' : 'en';
    currentLang = norm;

    try {
      localStorage.setItem(STORAGE_KEY, norm);
    } catch (e) {}

    if (document.documentElement) {
      document.documentElement.lang = norm;
    }

    if (norm === 'te') {
      if (document.title) {
        document.title = 'జిల్లా విద్యాశాఖ కార్యాలయం, జనగామ | పాఠశాల విద్యాశాఖ, తెలంగాణ';
      }
      applyTranslations(document.body);
    } else {
      if (document.title) {
        document.title = 'District Educational Office, Jangaon | School Education Department, Telangana';
      }
      restoreEnglish(document.body);
    }

    // Dispatch custom event for React components and external subscribers
    try {
      window.dispatchEvent(new CustomEvent('portal-language-change', {
        detail: { lang: norm }
      }));
    } catch (e) {}
  }

  function getLanguage() {
    return currentLang;
  }

  function isTelugu() {
    return currentLang === 'te';
  }

  // React hook integration
  function useI18n() {
    if (typeof React === 'undefined' || !React.useState || !React.useEffect) {
      return { lang: currentLang, t, isTelugu: isTelugu(), setLanguage };
    }
    const [lang, setLangState] = React.useState(currentLang);
    React.useEffect(() => {
      const handler = (e) => {
        if (e && e.detail && e.detail.lang) {
          setLangState(e.detail.lang);
        }
      };
      window.addEventListener('portal-language-change', handler);
      return () => window.removeEventListener('portal-language-change', handler);
    }, []);
    return {
      lang,
      isTelugu: lang === 'te',
      t,
      setLanguage
    };
  }

  // Public API
  window.i18n = {
    getLanguage,
    setLanguage,
    isTelugu,
    t,
    translateElement: applyTranslations,
    restoreEnglish,
    translations,
    useI18n
  };

  // Initialize on DOMContentLoaded or immediate execution
  function init() {
    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }
    setupObserver();
    if (currentLang === 'te') {
      if (document.title) {
        document.title = 'జిల్లా విద్యాశాఖ కార్యాలయం, జనగామ | పాఠశాల విద్యాశాఖ, తెలంగాణ';
      }
      if (document.body) {
        applyTranslations(document.body);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
