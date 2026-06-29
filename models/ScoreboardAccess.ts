import { Schema, model, models, connection } from "mongoose";

// ScoreboardAccess tracks who has active access to a scoreboard theme.
// Access is keyed by: email + themeSlug
const ScoreboardAccessSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    themeSlug: {
      type: String,
      required: [true, "Theme slug is required"],
      trim: true,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: [true, "Payment ID is required"],
    },
    trxId: {
      type: String,
      required: [true, "Transaction ID is required"],
      trim: true,
    },
    grantedAt: {
      type: Date,
      default: () => new Date(),
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Force-delete cached model to pick up schema changes in Next.js hot reload
if (models.ScoreboardAccess) {
  delete (models as any).ScoreboardAccess;
}

export const ScoreboardAccess = model("ScoreboardAccess", ScoreboardAccessSchema);
