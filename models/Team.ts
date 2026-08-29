import { Schema, model, models } from "mongoose";

export interface IPlayer {
  name: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketKeeper?: boolean;
  role?: "Batsman" | "Fast Bowler" | "Spin Bowler" | "Bowler" | "All Rounder" | "Wicket Keeper Batsman";
}

const PlayerSubSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    isWicketKeeper: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["Batsman", "Fast Bowler", "Spin Bowler", "Bowler", "All Rounder", "Wicket Keeper Batsman"],
      default: "Batsman",
    },
  },
  { _id: false }
);

const TeamSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Team Name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    players: {
      type: [PlayerSubSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Team = models.Team || model("Team", TeamSchema);
