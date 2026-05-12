import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";
import { createFallbackAppointment, listFallbackAppointments } from "@/lib/fallbackStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId") || undefined;

  try {
    await connectDB();

    const filter = doctorId ? { doctorId } : {};
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      appointments.map((a: any) => ({ ...a, id: String(a._id) }))
    );
  } catch (err) {
    console.warn("[GET /api/appointments] Mongo unavailable, using fallback store:", err);
    const appointments = await listFallbackAppointments(doctorId);
    return NextResponse.json(appointments.map((a) => ({ ...a, id: String(a._id) })));
  }
}

export async function POST(req: NextRequest) {
  const { patientName, patientPhone, patientProblem, doctorId, doctorName, date, time, type } =
    await req.json();

  if (!patientName || !patientPhone || !patientProblem || !doctorId || !date || !time || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await connectDB();

    // Create the appointment
    const appt = await Appointment.create({
      patientName,
      patientPhone,
      patientProblem,
      doctorId,
      doctorName,
      date,
      time,
      type,
      status: "confirmed",
    });

    // Mark the slot as unavailable on the doctor document
    await Doctor.updateOne(
      { _id: doctorId, "availableSlots.date": date, "availableSlots.time": time },
      { $set: { "availableSlots.$.available": false } }
    );

    return NextResponse.json({ ...appt.toJSON(), id: appt._id.toString() }, { status: 201 });
  } catch (err) {
    console.warn("[POST /api/appointments] Mongo unavailable, using fallback store:", err);

    const created = await createFallbackAppointment({
      patientName: String(patientName),
      patientPhone: String(patientPhone),
      patientProblem: String(patientProblem),
      doctorId: String(doctorId),
      doctorName: String(doctorName ?? ""),
      date: String(date),
      time: String(time),
      type: type === "physical" ? "physical" : "online",
    });

    return NextResponse.json({ ...created, id: String(created._id) }, { status: 201 });
  }
}
