import mongoose from "mongoose"
const { Schema, model } = mongoose

const productSchema = new Schema({
  name: { type: String, required: false },
  category: { type: String, required: false },
  link: { type: String, required: false },
  price: { type: String, required: false },
  image: { type: String, required: false },
  quantity: { type: Number, required: false, default: 1 }
})

const moodboardSchema = new Schema({
  backgroundColor: { type: String, required: false },
  border: { type: Boolean, required: false },
  imageShadow: { type: Boolean, required: false },
  moodboardImage: { type: String, required: false },
  swatchStyle: { type: String, required: false }
})

const colorSchema = new Schema({
  paletteName: { type: String, required: true },
  colors: { type: [String], required: true }
})

const ProjectsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: false },
    currency: { type: String, required: true },
    budget: { type: Number, required: true },
    cushion: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, enum: ["Planning", "Complete"], default: "Planning" },
    products: [productSchema],
    palette: colorSchema,
    moodboardImage: { type: String, required: false },
    moodboard: moodboardSchema
  },
  { timestamps: true }
)

export default model("Projects", ProjectsSchema)
