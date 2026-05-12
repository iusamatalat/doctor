export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  type: "online" | "physical";
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  city: string;
  consultationType: "online" | "physical" | "both";
  experience: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  bio: string;
  education: string[];
  languages: string[];
  feeOnline: number;
  feePhysical: number;
  availableSlots: TimeSlot[];
  isAvailableNow: boolean;
  aiAssistantMode: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "patient" | "doctor" | "ai";
  message: string;
  timestamp: string;
  senderName: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  date: string;
  time: string;
  type: "online" | "physical";
  status: "confirmed" | "pending" | "cancelled";
  problem: string;
}

export interface AISuggestion {
  symptom: string;
  specializations: string[];
  urgency: "low" | "medium" | "high";
  description: string;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Ahmed",
    specialization: "Orthopedic Surgeon",
    location: "Aga Khan University Hospital, Karachi",
    city: "Karachi",
    consultationType: "both",
    experience: 12,
    rating: 4.8,
    reviewCount: 234,
    avatar: "https://ui-avatars.com/api/?name=Sarah+Ahmed&background=0ea5e9&color=fff&size=200",
    bio: "Dr. Sarah Ahmed is a board-certified orthopedic surgeon with over 12 years of experience treating musculoskeletal conditions, sports injuries, and joint replacements. She completed her fellowship at Johns Hopkins Hospital and is passionate about minimally invasive surgical techniques.",
    education: [
      "MBBS – Aga Khan University, Karachi (2008)",
      "FCPS Orthopedics – CPSP Pakistan (2014)",
      "Fellowship in Joint Replacement – Johns Hopkins, USA (2016)",
    ],
    languages: ["English", "Urdu"],
    feeOnline: 2500,
    feePhysical: 3500,
    availableSlots: [
      { id: "s1", date: "2026-05-13", time: "09:00 AM", available: true, type: "physical" },
      { id: "s2", date: "2026-05-13", time: "10:00 AM", available: false, type: "physical" },
      { id: "s3", date: "2026-05-13", time: "11:00 AM", available: true, type: "physical" },
      { id: "s4", date: "2026-05-14", time: "02:00 PM", available: true, type: "online" },
      { id: "s5", date: "2026-05-14", time: "03:00 PM", available: true, type: "online" },
      { id: "s6", date: "2026-05-15", time: "09:30 AM", available: true, type: "physical" },
    ],
    isAvailableNow: true,
    aiAssistantMode: false,
  },
  {
    id: "2",
    name: "Dr. Hamza Malik",
    specialization: "Cardiologist",
    location: "Shaukat Khanum Hospital, Lahore",
    city: "Lahore",
    consultationType: "both",
    experience: 18,
    rating: 4.9,
    reviewCount: 512,
    avatar: "https://ui-avatars.com/api/?name=Hamza+Malik&background=10b981&color=fff&size=200",
    bio: "Dr. Hamza Malik is a leading cardiologist specializing in interventional cardiology and heart failure management. With 18 years of clinical experience, he has performed over 3,000 successful cardiac procedures and is a fellow of the American College of Cardiology.",
    education: [
      "MBBS – King Edward Medical University, Lahore (2004)",
      "MRCP – Royal College of Physicians, UK (2009)",
      "Fellowship in Interventional Cardiology – Cleveland Clinic, USA (2012)",
    ],
    languages: ["English", "Urdu", "Punjabi"],
    feeOnline: 3000,
    feePhysical: 5000,
    availableSlots: [
      { id: "s7", date: "2026-05-13", time: "10:00 AM", available: true, type: "online" },
      { id: "s8", date: "2026-05-13", time: "11:30 AM", available: true, type: "online" },
      { id: "s9", date: "2026-05-14", time: "09:00 AM", available: false, type: "physical" },
      { id: "s10", date: "2026-05-15", time: "04:00 PM", available: true, type: "online" },
    ],
    isAvailableNow: false,
    aiAssistantMode: true,
  },
  {
    id: "3",
    name: "Dr. Ayesha Khan",
    specialization: "Dermatologist",
    location: "CMH Hospital, Rawalpindi",
    city: "Rawalpindi",
    consultationType: "online",
    experience: 8,
    rating: 4.7,
    reviewCount: 189,
    avatar: "https://ui-avatars.com/api/?name=Ayesha+Khan&background=8b5cf6&color=fff&size=200",
    bio: "Dr. Ayesha Khan is a certified dermatologist specializing in medical and cosmetic dermatology. She has expertise in treating skin conditions like acne, eczema, psoriasis, and offers advanced aesthetic treatments.",
    education: [
      "MBBS – Army Medical College, Rawalpindi (2012)",
      "FCPS Dermatology – CPSP Pakistan (2018)",
    ],
    languages: ["English", "Urdu"],
    feeOnline: 2000,
    feePhysical: 2800,
    availableSlots: [
      { id: "s11", date: "2026-05-13", time: "01:00 PM", available: true, type: "online" },
      { id: "s12", date: "2026-05-13", time: "02:00 PM", available: true, type: "online" },
      { id: "s13", date: "2026-05-14", time: "11:00 AM", available: true, type: "online" },
    ],
    isAvailableNow: true,
    aiAssistantMode: false,
  },
  {
    id: "4",
    name: "Dr. Usman Raza",
    specialization: "Neurologist",
    location: "Liaquat National Hospital, Karachi",
    city: "Karachi",
    consultationType: "physical",
    experience: 15,
    rating: 4.6,
    reviewCount: 301,
    avatar: "https://ui-avatars.com/api/?name=Usman+Raza&background=f59e0b&color=fff&size=200",
    bio: "Dr. Usman Raza is a consultant neurologist with 15 years of experience in diagnosing and treating neurological disorders including epilepsy, Parkinson's disease, stroke, and multiple sclerosis.",
    education: [
      "MBBS – Dow Medical College, Karachi (2005)",
      "FCPS Neurology – CPSP Pakistan (2012)",
      "Post-Fellowship in Epileptology – Toronto Western Hospital (2014)",
    ],
    languages: ["English", "Urdu", "Sindhi"],
    feeOnline: 0,
    feePhysical: 4000,
    availableSlots: [
      { id: "s14", date: "2026-05-14", time: "10:00 AM", available: true, type: "physical" },
      { id: "s15", date: "2026-05-14", time: "11:00 AM", available: true, type: "physical" },
      { id: "s16", date: "2026-05-15", time: "09:00 AM", available: false, type: "physical" },
    ],
    isAvailableNow: false,
    aiAssistantMode: false,
  },
  {
    id: "5",
    name: "Dr. Fatima Zahra",
    specialization: "Gynecologist",
    location: "Services Hospital, Lahore",
    city: "Lahore",
    consultationType: "both",
    experience: 20,
    rating: 4.9,
    reviewCount: 678,
    avatar: "https://ui-avatars.com/api/?name=Fatima+Zahra&background=ec4899&color=fff&size=200",
    bio: "Dr. Fatima Zahra is a highly experienced gynecologist and obstetrician with 20 years of practice. She specializes in high-risk pregnancies, fertility treatment, laparoscopic surgery, and women's health.",
    education: [
      "MBBS – Fatima Jinnah Medical University, Lahore (2000)",
      "FCPS Gynecology & Obstetrics – CPSP Pakistan (2007)",
      "MRCOG – Royal College of Obstetricians & Gynaecologists, UK (2010)",
    ],
    languages: ["English", "Urdu", "Punjabi"],
    feeOnline: 2500,
    feePhysical: 4500,
    availableSlots: [
      { id: "s17", date: "2026-05-13", time: "09:00 AM", available: true, type: "physical" },
      { id: "s18", date: "2026-05-13", time: "10:30 AM", available: true, type: "physical" },
      { id: "s19", date: "2026-05-14", time: "03:00 PM", available: true, type: "online" },
      { id: "s20", date: "2026-05-15", time: "11:00 AM", available: true, type: "physical" },
    ],
    isAvailableNow: true,
    aiAssistantMode: true,
  },
  {
    id: "6",
    name: "Dr. Bilal Chaudhry",
    specialization: "General Physician",
    location: "Islamabad Medical Complex, Islamabad",
    city: "Islamabad",
    consultationType: "both",
    experience: 6,
    rating: 4.5,
    reviewCount: 145,
    avatar: "https://ui-avatars.com/api/?name=Bilal+Chaudhry&background=06b6d4&color=fff&size=200",
    bio: "Dr. Bilal Chaudhry is a general physician focused on preventive healthcare, chronic disease management, and primary care. He believes in a patient-centered approach and leverages telemedicine to reach patients nationwide.",
    education: [
      "MBBS – Quaid-i-Azam University, Islamabad (2016)",
      "MCPS Family Medicine – CPSP Pakistan (2020)",
    ],
    languages: ["English", "Urdu"],
    feeOnline: 1500,
    feePhysical: 2000,
    availableSlots: [
      { id: "s21", date: "2026-05-13", time: "08:00 AM", available: true, type: "online" },
      { id: "s22", date: "2026-05-13", time: "09:00 AM", available: true, type: "physical" },
      { id: "s23", date: "2026-05-13", time: "05:00 PM", available: true, type: "online" },
      { id: "s24", date: "2026-05-14", time: "08:00 AM", available: true, type: "online" },
    ],
    isAvailableNow: true,
    aiAssistantMode: false,
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "m1",
    sender: "ai",
    senderName: "AI Assistant",
    message: "Hello! I'm the AI assistant for Dr. Sarah Ahmed's clinic. Dr. Ahmed is currently unavailable, but I can help collect your information and schedule an appointment. May I have your full name?",
    timestamp: "10:02 AM",
  },
  {
    id: "m2",
    sender: "patient",
    senderName: "You",
    message: "Hi, my name is Ali Hassan.",
    timestamp: "10:03 AM",
  },
  {
    id: "m3",
    sender: "ai",
    senderName: "AI Assistant",
    message: "Thank you, Ali! Could you please share your contact number so the doctor can reach you?",
    timestamp: "10:03 AM",
  },
  {
    id: "m4",
    sender: "patient",
    senderName: "You",
    message: "Sure, it's 0321-4567890.",
    timestamp: "10:04 AM",
  },
  {
    id: "m5",
    sender: "ai",
    senderName: "AI Assistant",
    message: "Got it! Now, please briefly describe the main issue or symptoms you're experiencing so Dr. Ahmed can prepare for your consultation.",
    timestamp: "10:04 AM",
  },
  {
    id: "m6",
    sender: "patient",
    senderName: "You",
    message: "I've been having severe lower back pain for the past two weeks. It gets worse when I sit for long periods.",
    timestamp: "10:05 AM",
  },
  {
    id: "m7",
    sender: "ai",
    senderName: "AI Assistant",
    message: "Thank you for sharing that. Based on your symptoms (lower back pain worsening with prolonged sitting), Dr. Ahmed will likely review your posture, check for lumbar strain or disc issues. I've logged your appointment request. Dr. Ahmed will confirm your slot shortly. Is there anything else you'd like to add?",
    timestamp: "10:05 AM",
  },
];

export const aiSymptomSuggestions: AISuggestion[] = [
  {
    symptom: "back pain",
    specializations: ["Orthopedic Surgeon", "Physiotherapist", "Neurosurgeon"],
    urgency: "medium",
    description: "Back pain may indicate muscle strain, disc issues, or spinal conditions. An orthopedic evaluation is recommended.",
  },
  {
    symptom: "chest pain",
    specializations: ["Cardiologist", "Pulmonologist", "General Physician"],
    urgency: "high",
    description: "Chest pain requires urgent evaluation to rule out cardiac causes. Please seek immediate care if severe.",
  },
  {
    symptom: "skin rash",
    specializations: ["Dermatologist", "Allergist", "General Physician"],
    urgency: "low",
    description: "Skin rashes can result from allergies, infections, or autoimmune conditions. A dermatologist can provide a diagnosis.",
  },
  {
    symptom: "headache",
    specializations: ["Neurologist", "General Physician", "ENT Specialist"],
    urgency: "medium",
    description: "Persistent headaches may indicate tension, migraine, or neurological issues. Consult a neurologist if recurring.",
  },
  {
    symptom: "irregular periods",
    specializations: ["Gynecologist", "Endocrinologist"],
    urgency: "medium",
    description: "Menstrual irregularities can stem from hormonal imbalance or PCOS. A gynecologist evaluation is advised.",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientName: "Ali Hassan",
    doctorId: "1",
    date: "2026-05-13",
    time: "09:00 AM",
    type: "physical",
    status: "confirmed",
    problem: "Severe lower back pain for 2 weeks",
  },
  {
    id: "a2",
    patientName: "Zara Siddiqui",
    doctorId: "1",
    date: "2026-05-13",
    time: "11:00 AM",
    type: "online",
    status: "pending",
    problem: "Knee pain after sports injury",
  },
  {
    id: "a3",
    patientName: "Omar Farooq",
    doctorId: "1",
    date: "2026-05-14",
    time: "02:00 PM",
    type: "online",
    status: "confirmed",
    problem: "Post-surgery follow-up",
  },
];

export const specializations = [
  "All Specializations",
  "Cardiologist",
  "Dermatologist",
  "General Physician",
  "Gynecologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Physiotherapist",
  "Psychiatrist",
  "Pulmonologist",
  "ENT Specialist",
];

export const cities = [
  "All Cities",
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Quetta",
];
