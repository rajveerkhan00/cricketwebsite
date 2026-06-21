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
  },
  {
    timestamps: true,
  }
);

export const PricingTier = models.PricingTier || model("PricingTier", PricingTierSchema);
