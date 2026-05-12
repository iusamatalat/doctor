import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema(
  {
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientProblem: { type: String, required: true },
    doctorId: { type: String, ref: "Doctor", required: true },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ["online", "physical"], required: true },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

AppointmentSchema.set("toJSON", {
  transform(_, ret) {
    ret.id = ret._id.toString();
    return ret;
  },
});

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
