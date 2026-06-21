import { Schema, model, models } from "mongoose";

const MatchSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    team1Name: {
      type: String,
      required: [true, "Team 1 Name is required"],
      trim: true,
    },
    team2Name: {
      type: String,
      required: [true, "Team 2 Name is required"],
      trim: true,
    },
    overs: {
      type: Number,
      required: [true, "Overs is required"],
      min: 1,
    },
    matchNo: {
      type: Number,
      required: [true, "Match No. is required"],
      min: 1,
    },
    tossWonBy: {
      type: String,
      enum: ["team1", "team2"],
      required: [true, "Toss won by is required"],
    },
    optedTo: {
      type: String,
      enum: ["Bat", "Bowl"],
      required: [true, "Opted to is required"],
    },
    matchTied: {
      type: Boolean,
      default: false,
    },
    ballsPerOver: {
      type: Number,
      enum: [4, 5, 6, 8],
      default: 6,
    },
    matchType: {
      type: String,
      enum: [
        "Group Stage",
        "Super Over",
        "Quarter Final",
        "Qualifier 1",
        "Qualifier 2",
        "Eliminator",
        "Semi Final",
        "Final",
      ],
      default: "Group Stage",
    },
    status: {
      type: String,
      enum: ["Not Started", "Live", "Completed"],
      default: "Not Started",
    },
    playersTeam1: {
      type: [String],
      default: [],
    },
    playersTeam2: {
      type: [String],
      default: [],
    },
    scoringState: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Match = models.Match || model("Match", MatchSchema);
