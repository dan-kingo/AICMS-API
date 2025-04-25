import mongoose, { Document, Schema } from "mongoose";

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  description: string;
  category: string;
  status: string;
  createdAt: Date;
  assignedTo: string;
  supportingFile?: string;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    assignedTo: { type: String, required: true },
    status: { type: String, default: "Pending" },
    supportingFile: { type: String, required: false }, // ✅ Now properly added
  },
  { timestamps: true }
);

const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
