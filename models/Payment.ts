import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    senderNumber: {
      type: String,
      required: [true, "Sender number is required"],
      trim: true,
    },
    trxId: {
      type: String,
      required: [true, "Transaction ID (TRX ID) is required"],
      trim: true,
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
    },
    itemPrice: {
      type: String,
      required: [true, "Item price is required"],
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = models.Payment || model("Payment", PaymentSchema);
