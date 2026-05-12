import { promises as fs } from "fs";
import path from "path";
import { doctors as mockDoctors } from "@/lib/mockData";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export interface FallbackSlot {
  slotId: string;
  date: string;
  time: string;
  available: boolean;
  type: "online" | "physical";
}

export interface FallbackDoctor {
  _id: string;
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
  availableSlots: FallbackSlot[];
  isAvailableNow: boolean;
  aiAssistantMode: boolean;
  weeklySchedule: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface FallbackAppointment {
  _id: string;
  patientName: string;
  patientPhone: string;
  patientProblem: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: "online" | "physical";
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface FallbackStoreFile {
  doctors: FallbackDoctor[];
  appointments: FallbackAppointment[];
}

const STORE_PATH = path.join(process.cwd(), "data", "fallback-store.json");

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeSlot(slot: any): FallbackSlot {
  return {
    slotId: String(slot.slotId ?? slot.id ?? `${slot.date}-${slot.time}`),
    date: String(slot.date ?? ""),
    time: String(slot.time ?? ""),
    available: Boolean(slot.available),
    type: slot.type === "physical" ? "physical" : "online",
  };
}

function mapMockDoctorToFallback(doc: any): FallbackDoctor {
  const now = nowIso();
  return {
    _id: String(doc.id),
    name: String(doc.name),
    specialization: String(doc.specialization),
    location: String(doc.location),
    city: String(doc.city),
    consultationType:
      doc.consultationType === "online" ||
      doc.consultationType === "physical" ||
      doc.consultationType === "both"
        ? doc.consultationType
        : "both",
    experience: Number(doc.experience ?? 0),
    rating: Number(doc.rating ?? 0),
    reviewCount: Number(doc.reviewCount ?? 0),
    avatar: String(doc.avatar ?? ""),
    bio: String(doc.bio ?? ""),
    education: Array.isArray(doc.education)
      ? doc.education.map((v: unknown) => String(v))
      : [],
    languages: Array.isArray(doc.languages)
      ? doc.languages.map((v: unknown) => String(v))
      : [],
    feeOnline: Number(doc.feeOnline ?? 0),
    feePhysical: Number(doc.feePhysical ?? 0),
    availableSlots: Array.isArray(doc.availableSlots)
      ? doc.availableSlots.map(normalizeSlot)
      : [],
    isAvailableNow: Boolean(doc.isAvailableNow),
    aiAssistantMode: Boolean(doc.aiAssistantMode),
    weeklySchedule: {},
    createdAt: now,
    updatedAt: now,
  };
}

async function ensureStore(): Promise<FallbackStoreFile> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<FallbackStoreFile>;
    return {
      doctors: Array.isArray(parsed.doctors) ? parsed.doctors : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
    };
  } catch {
    const seed: FallbackStoreFile = {
      doctors: mockDoctors.map(mapMockDoctorToFallback),
      appointments: [],
    };
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
}

async function writeStore(store: FallbackStoreFile): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function listFallbackDoctors(): Promise<FallbackDoctor[]> {
  const store = await ensureStore();
  return store.doctors;
}

export async function getFallbackDoctorById(id: string): Promise<FallbackDoctor | null> {
  const store = await ensureStore();
  return store.doctors.find((d) => d._id === id) ?? null;
}

export async function upsertFallbackDoctor(
  id: string,
  patch: Partial<FallbackDoctor>
): Promise<FallbackDoctor> {
  const store = await ensureStore();
  const idx = store.doctors.findIndex((d) => d._id === id);
  const now = nowIso();

  const normalizedSlots = Array.isArray(patch.availableSlots)
    ? patch.availableSlots.map(normalizeSlot)
    : undefined;

  if (idx === -1) {
    const created: FallbackDoctor = {
      _id: id,
      name: String(patch.name ?? ""),
      specialization: String(patch.specialization ?? ""),
      location: String(patch.location ?? ""),
      city: String(patch.city ?? ""),
      consultationType:
        patch.consultationType === "online" ||
        patch.consultationType === "physical" ||
        patch.consultationType === "both"
          ? patch.consultationType
          : "both",
      experience: Number(patch.experience ?? 0),
      rating: Number(patch.rating ?? 0),
      reviewCount: Number(patch.reviewCount ?? 0),
      avatar: String(patch.avatar ?? ""),
      bio: String(patch.bio ?? ""),
      education: Array.isArray(patch.education)
        ? patch.education.map((v) => String(v))
        : [],
      languages: Array.isArray(patch.languages)
        ? patch.languages.map((v) => String(v))
        : [],
      feeOnline: Number(patch.feeOnline ?? 0),
      feePhysical: Number(patch.feePhysical ?? 0),
      availableSlots: normalizedSlots ?? [],
      isAvailableNow: Boolean(patch.isAvailableNow),
      aiAssistantMode: Boolean(patch.aiAssistantMode),
      weeklySchedule:
        patch.weeklySchedule && typeof patch.weeklySchedule === "object"
          ? (patch.weeklySchedule as Record<string, string[]>)
          : {},
      createdAt: now,
      updatedAt: now,
    };
    store.doctors.push(created);
    await writeStore(store);
    return created;
  }

  const existing = store.doctors[idx];
  const updated: FallbackDoctor = {
    ...existing,
    ...patch,
    availableSlots: normalizedSlots ?? existing.availableSlots,
    updatedAt: now,
  };
  store.doctors[idx] = updated;
  await writeStore(store);
  return updated;
}

export async function upsertFallbackDoctorsFromMock(): Promise<number> {
  const store = await ensureStore();
  const now = nowIso();

  for (const mockDoc of mockDoctors) {
    const mapped = mapMockDoctorToFallback(mockDoc);
    const existingIdx = store.doctors.findIndex((d) => d._id === mapped._id);
    if (existingIdx === -1) {
      store.doctors.push(mapped);
    } else {
      store.doctors[existingIdx] = {
        ...store.doctors[existingIdx],
        ...mapped,
        createdAt: store.doctors[existingIdx].createdAt || now,
        updatedAt: now,
      };
    }
  }

  await writeStore(store);
  return mockDoctors.length;
}

export async function listFallbackAppointments(
  doctorId?: string
): Promise<FallbackAppointment[]> {
  const store = await ensureStore();
  const list = doctorId
    ? store.appointments.filter((a) => a.doctorId === doctorId)
    : store.appointments;

  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createFallbackAppointment(input: {
  patientName: string;
  patientPhone: string;
  patientProblem: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: "online" | "physical";
}): Promise<FallbackAppointment> {
  const store = await ensureStore();
  const now = nowIso();
  const created: FallbackAppointment = {
    _id: `appt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    patientProblem: input.patientProblem,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    date: input.date,
    time: input.time,
    type: input.type,
    status: "confirmed",
    createdAt: now,
    updatedAt: now,
  };

  store.appointments.push(created);

  const doc = store.doctors.find((d) => d._id === input.doctorId);
  if (doc) {
    const slot = doc.availableSlots.find(
      (s) => s.date === input.date && s.time === input.time
    );
    if (slot) slot.available = false;
    doc.updatedAt = now;
  }

  await writeStore(store);
  return created;
}

export async function updateFallbackAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<FallbackAppointment | null> {
  const store = await ensureStore();
  const idx = store.appointments.findIndex((a) => a._id === id);
  if (idx === -1) return null;

  store.appointments[idx] = {
    ...store.appointments[idx],
    status,
    updatedAt: nowIso(),
  };
  await writeStore(store);
  return store.appointments[idx];
}

