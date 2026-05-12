import mongoose, { Schema } from "mongoose";

// String _id matches mock data IDs ("1","2"…) so existing links never break
const TimeSlotSchema = new Schema(
  {
    slotId: String,
    date: String,
    time: String,
    available: { type: Boolean, default: true },
    type: { type: String, enum: ["online", "physical"] },
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ["online", "physical", "both"],
      default: "both",
    },
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    education: [String],
    languages: [String],
    feeOnline: { type: Number, default: 0 },
    feePhysical: { type: Number, default: 0 },
    availableSlots: [TimeSlotSchema],
    isAvailableNow: { type: Boolean, default: true },
    aiAssistantMode: { type: Boolean, default: false },
    // Weekly schedule from dashboard grid: { Mon: ["09:00 AM", "10:00 AM"], ... }
    weeklySchedule: { type: Map, of: [String], default: {} },
  },
  { timestamps: true }
);

// Expose `id` so UI code (.id) works the same as mock data
DoctorSchema.set("toJSON", {
  transform(_, ret) {
    ret.id = ret._id;
    return ret;
  },
});

export default mongoose.models.Doctor ||
  mongoose.model("Doctor", DoctorSchema);
