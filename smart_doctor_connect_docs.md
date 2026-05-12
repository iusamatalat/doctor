# Smart Doctor Connect AI — Project Documentation

> **Pakistan's First AI-Powered Doctor Discovery & Booking Platform**
> Hackathon Project · Next.js 14 · MongoDB · Groq AI (LLaMA)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Database Models](#4-database-models)
5. [API Routes](#5-api-routes)
6. [Pages & Components](#6-pages--components)
7. [AI Integration Flows](#7-ai-integration-flows)
8. [Key User Flows](#8-key-user-flows)
9. [Doctor Dashboard Flows](#9-doctor-dashboard-flows)
10. [Data Flow Architecture](#10-data-flow-architecture)
11. [Environment Variables](#11-environment-variables)

---

## 1. Project Overview

**Smart Doctor Connect AI** is a full-stack healthcare platform that lets patients in Pakistan discover, filter, and book appointments with verified medical specialists. The platform uses **Groq-powered LLaMA models** for two core AI features:

| Feature | Description |
|---|---|
| **AI Symptom Checker** | Patient types symptoms → AI suggests the right specialist |
| **AI Chat Assistant** | When a doctor is offline, an LLaMA chatbot collects patient info (name, phone, problem) autonomously |
| **AI Doctor Matching** | Symptom string → Groq API → returns exact specialization label |

The platform has two distinct user roles:
- **Patients** — search/filter doctors, check symptoms, book appointments, chat with AI
- **Doctors** — manage profile, set weekly availability, toggle AI mode, view/action appointments

---

## 2. Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14 (App Router)   React 18   TypeScript 5          │
│  Tailwind CSS 3.4          Radix UI Primitives               │
│  Lucide React (icons)      Google Fonts – Inter             │
├──────────────────────────────────────────────────────────────┤
│                        BACKEND (API Routes)                  │
│  Next.js Route Handlers (app/api/**/route.ts)               │
│  Mongoose 9  ←→  MongoDB Atlas                              │
├──────────────────────────────────────────────────────────────┤
│                        AI / LLM LAYER                        │
│  Groq Cloud API (OpenAI-compatible)                         │
│  llama-3.3-70b-versatile  — AI Chat Assistant               │
│  llama-3.1-8b-instant     — Doctor Matching (symptom→spec)  │
├──────────────────────────────────────────────────────────────┤
│                        UI COMPONENT LIBRARY                  │
│  Radix UI: Dialog, Select, Switch, Avatar, Label, Slot      │
│  class-variance-authority + clsx + tailwind-merge           │
└──────────────────────────────────────────────────────────────┘
```

### Key Packages

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.3 | Full-stack React framework (App Router) |
| `mongoose` | 9.6.2 | MongoDB ODM for schema & queries |
| `groq-sdk` | 1.2.0 | Groq AI client (LLaMA models) |
| `lucide-react` | 0.363.0 | Icon system |
| `@radix-ui/*` | various | Headless accessible UI primitives |
| `tailwindcss` | 3.4.1 | Utility-first CSS |
| `typescript` | 5.x | Type safety |

---

## 3. Directory Structure

```
d:/Hackathon/
├── app/                          # Next.js App Router pages & API
│   ├── layout.tsx                # Root layout (Navbar, Footer, FloatingChatButton)
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── page.tsx                  # Homepage (Hero, Stats, Features, Featured Doctors, CTA)
│   │
│   ├── search/
│   │   └── page.tsx              # Doctor search & filter page
│   │
│   ├── doctor/
│   │   └── [id]/                 # Dynamic doctor profile page
│   │       └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx              # Doctor dashboard (sidebar SPA)
│   │
│   ├── add-doctor/               # Admin: add new doctor form
│   │
│   └── api/                      # REST API layer (Next.js Route Handlers)
│       ├── doctors/
│       │   ├── route.ts          # GET (list/filter), POST (create)
│       │   └── [id]/route.ts     # GET (single), PUT (update)
│       ├── appointments/
│       │   ├── route.ts          # GET (list by doctorId), POST (book)
│       │   └── [id]/route.ts     # PUT (update status)
│       ├── chat/
│       │   └── route.ts          # POST → Groq LLaMA-70B (AI chat)
│       ├── match/
│       │   └── route.ts          # POST → Groq LLaMA-8B (symptom→spec)
│       └── seed/
│           └── route.ts          # POST → seed DB with mock doctors
│
├── components/                   # Shared React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── DoctorCard.tsx            # Card used in search results
│   ├── BookingModal.tsx          # 4-step appointment booking dialog
│   ├── ChatInterface.tsx         # Real-time AI chat window
│   ├── AISuggestions.tsx         # Renders AI symptom match results
│   ├── FloatingChatButton.tsx    # Global floating chat FAB
│   ├── FloatingChatModal.tsx     # Global floating chat modal
│   └── ui/                       # Radix-based primitive components
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── label.tsx
│       └── textarea.tsx
│
├── lib/                          # Shared utilities & data layer
│   ├── db.ts                     # MongoDB connection (singleton + hot-reload safe)
│   ├── groq.ts                   # Groq API wrapper (groqChat function)
│   ├── mockData.ts               # Static seed data + TypeScript interfaces
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   └── models/
│       ├── Doctor.ts             # Mongoose Doctor schema
│       └── Appointment.ts        # Mongoose Appointment schema
│
├── .env.local                    # MONGODB_URI, GROQ_API_KEY
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. Database Models

### 4.1 Doctor Model (`lib/models/Doctor.ts`)

```
Doctor {
  _id            : String       // matches mock data IDs ("1","2"...)
  name           : String       // required
  specialization : String       // required
  location       : String       // hospital/clinic name
  city           : String       // Karachi | Lahore | Islamabad | ...
  consultationType: enum        // "online" | "physical" | "both"
  experience     : Number       // years
  rating         : Number       // 0–5.0
  reviewCount    : Number
  avatar         : String       // image URL
  bio            : String       // professional bio
  education      : [String]     // list of degrees
  languages      : [String]     // spoken languages
  feeOnline      : Number       // PKR
  feePhysical    : Number       // PKR
  availableSlots : [TimeSlot]   // embedded sub-documents
  isAvailableNow : Boolean
  aiAssistantMode: Boolean      // true = AI handles chat
  weeklySchedule : Map<String, [String]>  // { "Mon": ["09:00 AM", ...] }
  createdAt      : Date         // auto (timestamps)
  updatedAt      : Date         // auto
}

TimeSlot (embedded) {
  slotId    : String
  date      : String  // "YYYY-MM-DD"
  time      : String  // "09:00 AM"
  available : Boolean
  type      : "online" | "physical"
}
```

### 4.2 Appointment Model (`lib/models/Appointment.ts`)

```
Appointment {
  _id            : ObjectId
  patientName    : String    // required
  patientPhone   : String    // required
  patientProblem : String    // required
  doctorId       : String    // ref → Doctor._id
  doctorName     : String
  date           : String    // "YYYY-MM-DD"
  time           : String    // "09:00 AM"
  type           : "online" | "physical"
  status         : "confirmed" | "pending" | "cancelled"  (default: "confirmed")
  createdAt      : Date
  updatedAt      : Date
}
```

---

## 5. API Routes

### 5.1 Doctors API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/doctors` | List all doctors. Supports query params: `query`, `specialization`, `city`, `type`, `sort` |
| `POST` | `/api/doctors` | Create a new doctor document |
| `GET` | `/api/doctors/[id]` | Fetch single doctor by ID |
| `PUT` | `/api/doctors/[id]` | Partial update (profile, AI mode, schedule, availability) |

**GET /api/doctors — filter params:**

| Param | Example | Behaviour |
|---|---|---|
| `query` | `Cardiologist` | Regex search on name, specialization, city, location |
| `specialization` | `Dermatologist` | Exact-match (case-insensitive) |
| `city` | `Lahore` | Exact match |
| `type` | `Online` | Filters `consultationType` in `["online","both"]` |
| `sort` | `rating` / `experience` / `fee` | MongoDB sort |

---

### 5.2 Appointments API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/appointments?doctorId=1` | List appointments (optionally filtered by doctor) |
| `POST` | `/api/appointments` | Book appointment + mark slot unavailable on Doctor |
| `PUT` | `/api/appointments/[id]` | Update status: `confirmed` / `cancelled` / `pending` |

**POST /api/appointments — required body:**
```json
{
  "patientName": "Ali Hassan",
  "patientPhone": "0321-4567890",
  "patientProblem": "Lower back pain",
  "doctorId": "1",
  "doctorName": "Dr. Sarah Ahmed",
  "date": "2026-05-13",
  "time": "09:00 AM",
  "type": "physical"
}
```

> **Side-effect:** After creating the appointment, the API also runs `Doctor.updateOne()` to mark that exact slot as `available: false`.

---

### 5.3 AI Chat API (`/api/chat`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Sends conversation to Groq LLaMA-70B, returns AI reply |

**Request body:**
```json
{
  "messages": [{ "role": "user", "content": "Hi" }],
  "doctorName": "Dr. Sarah Ahmed"
}
```

**Response:**
```json
{
  "reply": "Hello! May I have your full name?",
  "isDataCollected": false
}
```

**How it works:**
- A system prompt instructs the model to act as the doctor's virtual assistant
- It collects: (1) Full name, (2) Contact number, (3) Problem description — one at a time
- Once all three are collected, the model appends the flag `||DATA_COMPLETE||` to its reply
- The API strips the flag, sets `isDataCollected: true`, and the UI shows a success banner

**Model:** `llama-3.3-70b-versatile` | temp: 0.7 | max_tokens: 512

---

### 5.4 AI Match API (`/api/match`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/match` | Maps a symptom string → specialization label |

**Request:** `{ "symptom": "chest pain" }`
**Response:** `{ "specialization": "Cardiologist" }`

**Valid output labels:** Cardiologist, Dermatologist, Orthopedic, General Physician, Neurologist, Pediatrician, Psychiatrist

**Model:** `llama-3.1-8b-instant` | temp: 0.1 | max_tokens: 10 (extremely focused)

---

### 5.5 Seed API (`/api/seed`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/seed` | Upserts all mock doctors into MongoDB |

Used from the Dashboard Settings panel to populate the database during development/demo.

---

## 6. Pages & Components

### 6.1 Homepage (`app/page.tsx`)

**Sections (top to bottom):**

| Section | Content |
|---|---|
| **Hero** | Gradient background, headline, dual-action search bar (AI Check + Search), quick-specialization pill links |
| **AI Suggestions Panel** | Appears inline after "Check with AI" is clicked. Shows matched specializations + urgency level |
| **Stats Bar** | 2,400+ Doctors · 180K+ Patients · 35+ Cities · <2 min Wait |
| **Features Grid** | AI Symptom Checker · Online & In-Clinic · Verified Specialists · Instant Booking |
| **Featured Doctors** | Top 3 doctors with rating ≥ 4.8, fetched from DB (falls back to mock data) |
| **CTA Section** | "Try AI Symptom Checker" + "Browse All Doctors" |

**State:**
- `query` / `submittedQuery` — controls the search bar and AI panel
- `showAI` — toggles the AI suggestions block
- `allDoctors` — hydrated from `/api/doctors` on mount; falls back to `mockDoctors`

---

### 6.2 Search Page (`app/search/page.tsx`)

**Features:**
- Sticky search header with live filter bar
- Filters: Specialization, City, Consultation Type, Sort By (rating/experience/fee)
- Active filter chips with individual clear buttons
- AI Suggestions panel rendered above results when query matches a symptom
- Client-side filtering layered on top of DB fetch
- Responsive grid: 1 col → 2 col → 3 col
- Empty state with "Clear All Filters" button
- Bottom AI prompt banner

**Data flow:**
```
Mount → fetch /api/doctors → setAllDoctors
searchParams → pre-populate filters
User types/selects → useMemo re-filters in-memory
```

---

### 6.3 Doctor Profile Page (`app/doctor/[id]/page.tsx`)

**Sections:**
- Doctor header (avatar, name, specialization, rating, experience, city, fee)
- Verified badges, consultation type badges
- Bio, Education, Languages
- `ChatInterface` component (full AI chat)
- `BookingModal` trigger button

---

### 6.4 Doctor Dashboard (`app/dashboard/page.tsx`)

A full sidebar SPA (single-page layout with client-side section switching). Always targets `DASHBOARD_DOCTOR_ID = "1"` (Dr. Sarah Ahmed for demo).

**Sidebar sections:**

| Key | Label | Features |
|---|---|---|
| `overview` | Overview | Stats cards (total/confirmed/pending/rating), recent appointments list, quick-action shortcuts |
| `profile` | My Profile | Editable form: name, specialization, city, location, fees, bio, consultation type. Saves via PUT /api/doctors/1 |
| `availability` | Availability | AI mode toggle card, interactive weekly schedule grid (Mon–Sat × 18 time slots), custom slot picker, slot tag list, Save Schedule button |
| `appointments` | Appointments | Status summary (confirmed/pending/cancelled), full appointment list with Confirm/Cancel actions, Refresh button, Seed Data button |
| `settings` | Settings | Notification preference toggles (UI only), Seed Database button |

**AI Mode Toggle:**
- Shown in sidebar footer and in Availability section
- Calls `PUT /api/doctors/1 { aiAssistantMode: true/false }` immediately on toggle
- When ON: chat interface shows AI Mode badge, collects patient data autonomously

---

### 6.5 BookingModal (`components/BookingModal.tsx`)

A 4-step Radix Dialog with progress bar:

```
Step 1: select-type   → Choose Online (PKR X) or In-Clinic (PKR Y)
Step 2: select-slot   → Pick from available slots grouped by date
Step 3: patient-info  → Enter name, phone, problem description
Step 4: confirmation  → Success screen with booking summary
```

**On Confirm (Step 3):**
- Calls `POST /api/appointments`
- On success → advances to Step 4
- On error → shows inline error alert

---

### 6.6 ChatInterface (`components/ChatInterface.tsx`)

Real-time AI chat UI embedded in the doctor profile page.

**Features:**
- Displays chat history with patient/AI/doctor bubbles
- Animated typing indicator (3 bouncing dots) while waiting for Groq response
- AI Mode banner shown when `doctor.aiAssistantMode === true`
- Inline error messages on API failure
- Success banner when `isDataCollected === true` (all 3 pieces of info collected)
- Input locked after data collection completes

**Message flow per send:**
```
User types → POST /api/chat → Groq LLaMA-70B
→ { reply, isDataCollected }
→ Append AI message to chat
→ If isDataCollected: show success banner, lock input
```

---

### 6.7 AISuggestions (`components/AISuggestions.tsx`)

Renders the matched symptom suggestions from `mockData.aiSymptomSuggestions`.

Each suggestion shows:
- Matched symptom keyword
- Urgency badge (low/medium/high with color coding)
- Description text
- Suggested specialization list as clickable links → `/search?specialization=X`

---

### 6.8 FloatingChatButton / FloatingChatModal

A persistent floating action button (bottom-right) on all pages. Opens a modal chat that routes to the general AI assistant (not doctor-specific).

---

## 7. AI Integration Flows

### 7.1 AI Symptom Check Flow

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant mockData

    User->>HomePage: Types symptom, clicks "Check with AI"
    HomePage->>HomePage: setSubmittedQuery, setShowAI(true)
    HomePage->>mockData: Filter aiSymptomSuggestions[]
    mockData-->>HomePage: Matched suggestions (symptom, specializations, urgency)
    HomePage-->>User: Render AISuggestions panel with specialist links
    User->>HomePage: Clicks specialization link
    HomePage-->>User: Navigate to /search?specialization=Cardiologist
```

> **Note:** The AI Symptom Checker on the homepage uses **client-side static matching** from `mockData.ts`. The `/api/match` route (Groq-powered) is available for dynamic matching.

---

### 7.2 AI Doctor Match Flow (API)

```mermaid
sequenceDiagram
    participant Client
    participant MatchAPI as /api/match
    participant Groq as Groq Cloud (LLaMA-8B)

    Client->>MatchAPI: POST { symptom: "chest pain" }
    MatchAPI->>Groq: System: "Return ONLY one specialization from [list]"
    Groq-->>MatchAPI: "Cardiologist"
    MatchAPI->>MatchAPI: Validate against VALID_SPECIALIZATIONS[]
    MatchAPI-->>Client: { specialization: "Cardiologist" }
```

---

### 7.3 AI Chat Assistant Flow

```mermaid
sequenceDiagram
    participant Patient
    participant ChatUI as ChatInterface
    participant ChatAPI as /api/chat
    participant Groq as Groq Cloud (LLaMA-70B)

    Patient->>ChatUI: Types message, presses Send
    ChatUI->>ChatUI: Append user message, show typing indicator
    ChatUI->>ChatAPI: POST { messages: [...], doctorName }
    ChatAPI->>ChatAPI: Build system prompt (collect name, phone, problem)
    ChatAPI->>Groq: Send full conversation history
    Groq-->>ChatAPI: Reply text (may include "||DATA_COMPLETE||")
    ChatAPI->>ChatAPI: Check for DATA_COMPLETE flag
    ChatAPI-->>ChatUI: { reply, isDataCollected }
    ChatUI->>ChatUI: Append AI message
    alt isDataCollected = true
        ChatUI-->>Patient: Show "Information collected!" banner
        ChatUI->>ChatUI: Lock input field
    else isDataCollected = false
        ChatUI-->>Patient: Continue conversation
    end
```

---

## 8. Key User Flows

### 8.1 Patient Booking Flow

```mermaid
flowchart TD
    A([Patient visits Homepage]) --> B[Types symptom or doctor name]
    B --> C{Action chosen}
    C -->|Check with AI| D[AI Suggestions Panel shown]
    C -->|Search| E[/search page with filters]
    D --> F[Clicks specialization link]
    F --> E
    E --> G[Browses DoctorCard grid]
    G --> H[Clicks doctor card]
    H --> I[/doctor/id - Profile Page]
    I --> J{Doctor online?}
    J -->|Yes - chat| K[ChatInterface - live chat]
    J -->|No - AI mode| L[ChatInterface - AI collects info]
    I --> M[Clicks Book Appointment]
    M --> N[BookingModal Step 1 - Select Type]
    N --> O[Step 2 - Select Time Slot]
    O --> P[Step 3 - Enter Patient Info]
    P --> Q[POST /api/appointments]
    Q --> R[Slot marked unavailable in DB]
    R --> S[Step 4 - Confirmation Screen]
```

---

### 8.2 Doctor Search & Filter Flow

```mermaid
flowchart LR
    A[User visits /search] --> B[Fetch /api/doctors]
    B --> C{DB has data?}
    C -->|Yes| D[setAllDoctors from DB]
    C -->|No| E[Keep mockDoctors fallback]
    D --> F[useMemo filters in-memory]
    E --> F
    F --> G{Active filters?}
    G -->|query| H[Filter by name/spec/city]
    G -->|specialization| I[Filter by spec]
    G -->|city| J[Filter by city]
    G -->|type| K[Filter by consultationType]
    H & I & J & K --> L[Sort by rating/experience/fee]
    L --> M[Render DoctorCard grid]
```

---

## 9. Doctor Dashboard Flows

### 9.1 Profile Update Flow

```mermaid
sequenceDiagram
    participant Doctor
    participant Dashboard
    participant API as /api/doctors/1

    Dashboard->>API: GET /api/doctors/1
    API-->>Dashboard: Doctor data
    Dashboard->>Dashboard: Populate profile form state
    Doctor->>Dashboard: Edits fields, clicks Save Profile
    Dashboard->>API: PUT { name, specialization, city, location, bio, fees, consultationType }
    API-->>Dashboard: Updated doctor
    Dashboard->>Dashboard: Re-fetch + show "Profile saved!" toast
```

---

### 9.2 Availability / Schedule Flow

```mermaid
flowchart TD
    A[Doctor opens Availability tab] --> B[Weekly grid rendered Mon–Sat × 18 slots]
    B --> C[Doctor clicks cells to toggle ON/OFF]
    C --> D[Local state: selectedSlots Map updated]
    D --> E[Doctor clicks Save Schedule]
    E --> F[PUT /api/doctors/1 with weeklySchedule map]
    F --> G[MongoDB stores schedule]
    G --> H[Available slots visible to patients on booking]

    A --> I[Doctor toggles AI Mode switch]
    I --> J[PUT /api/doctors/1 with aiAssistantMode: true/false]
    J --> K{AI Mode ON?}
    K -->|Yes| L[Chat shows AI banner + LLaMA handles messages]
    K -->|No| M[Doctor handles chat directly]
```

---

### 9.3 Appointment Management Flow

```mermaid
flowchart TD
    A[Appointment tab opened] --> B[GET /api/appointments?doctorId=1]
    B --> C[Render appointment cards]
    C --> D{Status?}
    D -->|pending| E[Show Confirm + Cancel buttons]
    D -->|confirmed| F[Show Cancel button only]
    D -->|cancelled| G[No action buttons]
    E -->|Confirm clicked| H[PUT /api/appointments/id with status: confirmed]
    E -->|Cancel clicked| I[PUT /api/appointments/id with status: cancelled]
    H & I --> J[Re-fetch appointments]
```

---

## 10. Data Flow Architecture

```mermaid
flowchart TB
    subgraph Client ["Client (Browser)"]
        HP[Homepage]
        SP[Search Page]
        DP[Doctor Profile]
        DB[Dashboard]
        BM[BookingModal]
        CI[ChatInterface]
    end

    subgraph API ["Next.js API Routes (Server)"]
        DR[/api/doctors]
        AR[/api/appointments]
        CR[/api/chat]
        MR[/api/match]
        SR[/api/seed]
    end

    subgraph Data ["Data Layer"]
        MG[(MongoDB Atlas)]
        MD[mockData.ts]
        GQ[Groq Cloud API]
    end

    HP -->|GET doctors| DR
    SP -->|GET doctors + filters| DR
    DP -->|GET doctor by id| DR
    DB -->|GET/PUT doctor, GET/PUT appointments| DR
    DB -->|GET/PUT appointments| AR
    BM -->|POST appointment| AR
    CI -->|POST messages| CR
    HP -->|client-side filter| MD
    SP -->|fallback| MD

    DR <-->|connectDB + Mongoose| MG
    AR <-->|connectDB + Mongoose| MG
    SR -->|upsert mock docs| MG
    CR -->|groqChat()| GQ
    MR -->|groqChat()| GQ
```

---

## 11. Environment Variables

**File:** `.env.local`

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/smart-doctor` |
| `GROQ_API_KEY` | Groq Cloud API key | `gsk_...` |

**DB Connection (`lib/db.ts`):**
- Uses a module-level singleton cache (`global._mongoConn`) to survive Next.js hot-reloads in dev
- Throws at startup if `MONGODB_URI` is not set

**Groq Client (`lib/groq.ts`):**
- Custom fetch wrapper (not the SDK) hitting `https://api.groq.com/openai/v1/chat/completions`
- Bearer token from `process.env.GROQ_API_KEY`

---

## Quick Reference — AI Models Used

| Endpoint | Model | Temperature | Max Tokens | Role |
|---|---|---|---|---|
| `/api/chat` | `llama-3.3-70b-versatile` | 0.7 | 512 | Empathetic patient intake assistant |
| `/api/match` | `llama-3.1-8b-instant` | 0.1 | 10 | Strict symptom → specialization router |

---

## Quick Reference — Pages Summary

| Route | Type | Auth | Key Feature |
|---|---|---|---|
| `/` | Public | None | Hero search, AI symptom check, featured doctors |
| `/search` | Public | None | Full doctor search & filter |
| `/doctor/[id]` | Public | None | Doctor profile, AI chat, booking |
| `/dashboard` | Doctor | None (demo) | Full doctor management SPA |
| `/add-doctor` | Admin | None (demo) | Add new doctor to DB |
