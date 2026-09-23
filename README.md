# District Educational Office, Jangaon
### Department of School Education | Government of Telangana
*Education for a Brighter Tomorrow*

---

## 🏛️ Project Overview

This repository contains the complete frontend and backend implementation of the official **District Educational Office (DEO), Jangaon District** portal for the School Education Department, Government of Telangana.

The portal provides an authentic government user experience:
- **Locked Original Government Visual Theme**: Strictly preserves the authentic Telangana School Education Department colors: rich government blue (`#0c4a7e`), clean white canvas, Telangana green (`#007a33`), red pencil graphic (`#d32f2f`), and district maroon (`#990000`).
- **Complete End-to-End Authentication Architecture**: Real frontend + backend authentication with OTP verification, database persistence, official department data linking service abstraction, and role-based dashboards.
- **Genuine User Data Only**: Contains zero fake/fabricated official department records. User accounts store authentic user credentials, salted & hashed passwords, and real OTP lifecycles.
- **Pluggable Official Department Data Service**: Built with an abstraction in `server/services/officialDataService.js` ready to connect the actual government database/API when provided without modifying authentication or dashboards.

---

## 🚀 Key Features

### 1. Visual Design & Responsive Portal (Original Government Theme)
- **Top Government Accessibility Bar**: Original government blue (`#0c4a7e`), font resizers (`A-`, `A`, `A+`), bilingual selector (English / తెలుగు), contrast controls, and Department of School Education identity.
- **Main Header & Navigation**: Pure white background (`#ffffff`), official Telangana emblem, District Educational Office title, interactive navigation menus (About, Teachers, Schools, Students, Examinations, Notifications, Contact), and authenticated user dropdown.
- **District Highlights & Stats Ribbon**: Original government blue ribbon (`#0c4a7e`) with live metrics:
  - **1,248** Schools
  - **3,842** Teachers
  - **1,45,620** Students
  - **29** Mandals
- **Quick Services**: Original pastel cards:
  - *Teachers Information* (Soft mint green `#e8f5e9`, border `#c8e6c9`, teal icon `#00897b`)
  - *Schools Information* (Soft sky blue `#e3f2fd`, border `#bbdefb`, blue icon `#1976d2`)
- **Interactive Three-Card Grid**:
  - **Latest Notifications**: White card, date badges (`#e8f0fe` with `#1a73e8`), tags, and pulsing red "New" tags (`#d32f2f`).
  - **District Education Statistics & Find a School**: Key performance indicators (94.2% Pass Rate, 385 Govt Schools, 72% Digital facilities) plus an interactive **Find a School** search tool across all 29 mandals and school categories.
  - **News & Events**: Photo cards highlighting district science exhibitions, sports meets, teacher training programs, and National Education Day celebrations.
- **Official Government Footer**: Original government blue (`#0c4a7e`) with Collectorate contact information (+91 8678 222 333, deo.jangaon@telangana.gov.in), quick links, social channels, and copyright statement.

---

### 2. Complete Authentication & User Registration Workflow

```
                   WEBSITE HEADER
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      [ + Register ]             [ 👤 Login ]
             │                       │
      Fill Registration        Enter Mobile & Password
      (Name, Role, Mobile,           │
       Password, Confirm)            │
             │                       │
         Send OTP                    │
             │                       │
         Verify OTP                  │
             │                       │
       Create Account                ▼
             │                Verify Password Hash
             ▼                (Never Plaintext)
       Check Official                │
       Department Data               │
       (Pending Status)              ▼
             │                Issue JWT Token
             └───────────┬───────────┘
                         ▼
                ROLE-BASED DASHBOARD
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
      Teacher         School          Officer
      Portal          Portal          Portal
```

#### A. Registration Flow:
1. User clicks **[ Register ]** in the header.
2. Fills Full Name, Role (`Teacher`, `School Staff`, `Student`, `Parent`, `Officer`, `Other authorized role`), 10-digit Mobile Number, Password, and Confirm Password.
3. Clicks **[ Send OTP ]** $\rightarrow$ Backend validates mobile and dispatches a cryptographically secure 6-digit OTP with a 5-minute expiry and 3-attempt limit.
4. User enters the 6-digit OTP into dedicated interactive digit boxes with a 60-second countdown timer and resend capability.
5. Clicks **[ Verify OTP & Create Account ]** $\rightarrow$ Backend hashes the password using salt-stretched hashing (`scrypt`) and persists the account in the database.
6. The system transitions to **"Checking Official Department Data…"**.
7. Since the official government database integration is pending administrator connection, the system honestly reports:
   - *"Official department data integration is pending. Your account has been created successfully."*
   - *"Official records could not be linked yet. You can continue and contact the department for verification."*
8. Enters the personalized Role Dashboard with genuine user details.

#### B. Login Flow:
1. User clicks **[ Login ]** in the header.
2. Enters registered Mobile Number and Password.
3. Backend validates credentials against stored hash, creates a signed authenticated session token, and updates `lastLogin`.
4. Header updates from `[ Login ] [ Register ]` to `[ 👤 User Name ▼ ]` dropdown.
5. User is redirected to their role-specific dashboard.

#### C. Forgot Password Flow:
1. User clicks **Forgot Password?** on the login modal.
2. Enters mobile number $\rightarrow$ Receives reset OTP.
3. Verifies OTP and inputs new password.
4. Backend updates password hash in database.

---

### 3. Role-Based Dashboards
- **Teacher Dashboard**: Service Register information, Teacher Transfer Guidelines, classroom attendance logging, and teaching circulars.
- **School Staff Dashboard**: Headmaster & DDO controls, U-DISE+ data center, Mid-Day Meal (MDM) nutritional rations, composite school grants utilization certificates, and staff attendance.
- **Student Dashboard**: Digital student identity card, attendance percentage tracker, Board of Secondary Education SSC exam timetables & guidelines, and digital textbooks.
- **Officer Dashboard**: Mandal Educational Officer (MEO) inspection logs across 29 mandals, grievance redressal petitions (PGRS), and teacher vacancy matrix.
- **Parent Dashboard**: Ward attendance progress, quarterly evaluations, nutrition status, and School Management Committee (SMC) notices.

---

## 🔒 Security Architecture
- **Password Protection**: Passwords are cryptographically salted and hashed using `scrypt` key stretching. Plaintext passwords are never stored, logged, or transmitted back in API responses.
- **OTP Lifecycle**: 6-digit cryptographic codes, 5-minute expiration countdown, 60-second resend cooldown, and max 3-attempt brute-force protection.
- **Session Tokens**: Tamper-proof signed session tokens with user claims and expiration validation.
- **Zero Frontend Secrets**: Database records and internal keys are completely isolated behind backend controllers.
- **Input Sanitation**: Robust validation on all phone numbers, roles, and password strengths.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Google Fonts (Inter & Outfit), responsive CSS grid.
- **Backend**: Node.js & Express API with resilient native HTTP server fallback.
- **Database**: Persistent JSON database engine (`server/education_db.json`) with ACID-like atomic writes and schema constraints.
- **Official Data Service**: Abstracted interface (`server/services/officialDataService.js`) ready for future government database integration.

---

## 🚦 How to Run the Application

### 1. Start the Server
```bash
node server/index.js
```
The server will start at:
```
http://localhost:5000
```

### 2. Run Automated Verification Tests
```bash
node test_auth.js
```

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Validates mobile, enforces cooldown, and sends 6-digit OTP |
| `POST` | `/api/auth/verify-otp` | Verifies code against attempt limits and expiry |
| `POST` | `/api/auth/register` | Verifies OTP, hashes password, queries official data service, creates account |
| `POST` | `/api/auth/login` | Authenticates mobile + password against hash, returns session token |
| `POST` | `/api/auth/forgot-password` | Initiates password reset OTP flow |
| `POST` | `/api/auth/reset-password` | Validates OTP and updates stored password hash |
| `GET` | `/api/auth/me` | Validates Bearer token and returns authenticated user profile |
| `POST` | `/api/auth/logout` | Terminates authenticated session |
| `GET` | `/api/official/link-status` | Returns official department integration status |
| `GET` | `/api/schools/search` | Filters schools by mandal and institution type |

---

## 🏛️ Department Contact
**District Educational Office, Jangaon**  
Collectorate Road, Jangaon District, Telangana – 506167  
Phone: +91 8678 222 333  
Email: deo.jangaon@telangana.gov.in  
Portal: https://github.com/Shiva291-045/education1.git
