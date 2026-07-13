import { Schema, model, models } from "mongoose";

const PricingTierSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      trim: true,
    },
    period: {
      type: String,
      required: [true, "Period is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    buttonText: {
      type: String,
      required: [true, "Button text is required"],
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    // planType: when set, buying this tier unlocks ALL 15 scoreboards for the given duration
    // basic = 1 day, professional = 1 week, enterprise = 1 month
    // null = per-theme purchase (legacy behaviour)
    planType: {
      type: String,
      enum: ["basic", "professional", "enterprise", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PricingTier = models.PricingTier || model("PricingTier", PricingTierSchema);

