import { Schema, model, models } from "mongoose";

// ScoreboardAccess tracks who has active access to a scoreboard theme.
// Access is keyed by: email + themeSlug (where themeSlug can be "all-themes" or specific theme slug)
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
      required: false,
    },
    trxId: {
      type: String,
      default: "ADMIN_UNLOCK",
      trim: true,
    },
    grantedBy: {
      type: String,
      default: "admin",
      trim: true,
    },
    durationLabel: {
      type: String,
      default: "Custom",
      trim: true,
    },
    note: {
      type: String,
      default: "",
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
      index: true,
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

