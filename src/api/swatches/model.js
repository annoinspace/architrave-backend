import mongoose from "mongoose"
const { Schema, model } = mongoose
const CommunitySwatchSchema = new Schema(
  {
    name: { type: String, required: true },
    rgb: {
      r: { type: Number, required: true },
      g: { type: Number, required: true },
      b: { type: Number, required: true }
    },
    hex: { type: String, required: false }
  },
  { timestamps: true }
)
export default model("CommunitySwatches", CommunitySwatchSchema)
