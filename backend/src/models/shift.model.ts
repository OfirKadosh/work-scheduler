import { Schema, model, Document } from "mongoose";

export interface IShift extends Document {
  date: Date;
  startHour: string; // למשל "09:00"
  endHour: string;   // למשל "17:00"
  assignedTo: string; // user._id (עובד)
  createdBy: string;  // user._id (מנהל)
}

const shiftSchema = new Schema<IShift>({
  date: { type: Date, required: true },
  startHour: { type: String, required: true },
  endHour: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Shift = model<IShift>("Shift", shiftSchema);
