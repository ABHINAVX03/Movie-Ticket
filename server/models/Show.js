import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.Mixed, required: true },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true, min: 0 },
    occupiedSeats: { type: Object, default: {} },
  },
  { timestamps: true }
);

showSchema.index({ showDateTime: 1 });
showSchema.index({ "movie.id": 1, showDateTime: 1 });

const Show = mongoose.model("Show", showSchema);
export default Show;
