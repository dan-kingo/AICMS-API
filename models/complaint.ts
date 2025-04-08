import mongoose, { Document, Schema } from "mongoose";

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  complaint: string;
  category: string;
  status: string;
  createdAt: Date;
  assignedTo: string;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    complaint: { type: String, required: true },
    category: { type: String, required: true },
    assignedTo: { type: String, required: true },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
