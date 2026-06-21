import { Schema, model, models } from "mongoose";

const ScoreboardThemeSchema = new Schema(
  {
    themeId: {
      type: Number,
      required: [true, "Theme ID is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Theme Name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Theme Slug is required"],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    badge: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ScoreboardTheme = models.ScoreboardTheme || model("ScoreboardTheme", ScoreboardThemeSchema);
