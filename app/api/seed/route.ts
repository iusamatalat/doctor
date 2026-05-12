import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Doctor from "@/lib/models/Doctor";
import { doctors } from "@/lib/mockData";

export async function POST() {
  try {
    await connectDB();

    const results = await Promise.all(
      doctors.map((d) =>
        Doctor.findOneAndUpdate(
          { _id: d.id },
          {
            _id: d.id,
            name: d.name,
            specialization: d.specialization,
            location: d.location,
            city: d.city,
            consultationType: d.consultationType,
            experience: d.experience,
            rating: d.rating,
            reviewCount: d.reviewCount,
            avatar: d.avatar,
            bio: d.bio,
            education: d.education,
            languages: d.languages,
            feeOnline: d.feeOnline,
            feePhysical: d.feePhysical,
            availableSlots: d.availableSlots.map((s) => ({
              slotId: s.id,
              date: s.date,
              time: s.time,
              available: s.available,
              type: s.type,
            })),
            isAvailableNow: d.isAvailableNow,
            aiAssistantMode: d.aiAssistantMode,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    return NextResponse.json({
      message: `Seeded ${results.length} doctors successfully.`,
      count: results.length,
    });
  } catch (err) {
    console.error("[POST /api/seed]", err);
    return NextResponse.json({ error: "Seed failed", detail: String(err) }, { status: 500 });
  }
}

// GET just returns current DB count
export async function GET() {
  try {
    await connectDB();
    const count = await Doctor.countDocuments();
    return NextResponse.json({ doctorsInDB: count });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
