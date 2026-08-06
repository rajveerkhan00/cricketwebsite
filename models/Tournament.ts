import { Schema, model, models } from "mongoose";

const TournamentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Tournament location is required"],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export const Tournament = models.Tournament || model("Tournament", TournamentSchema);
