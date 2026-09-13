import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    eventType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) { return !this.startDate || value >= this.startDate; },
        message: "End date cannot be before start date.",
      },
    },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    venue: { type: String, trim: true, default: "", maxlength: 150 },
    category: { type: String, required: true, enum: ["planner", "performer", "crew"] },
    categoryDetails: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Requirement", requirementSchema);
