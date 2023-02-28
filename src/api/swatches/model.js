import mongoose from "mongoose"
const { Schema, model } = mongoose
const SwatchSchema = new Schema(
  {
    rgbValue: [{ type: Number, required: true }],
    hexValue: { type: String, required: true },
    name: { type: String, required: false },
    baseColor: { type: String, required: true }
  },
  {
    timestamps: true
  }
)
export default model("Swatches", SwatchSchema)
