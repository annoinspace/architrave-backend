import mongoose from "mongoose"
const { Schema, model } = mongoose

const ProjectsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: false },
    budget: { type: Number, required: true },
    cushion: { type: Number, required: false },
    status: { type: String, required: true, enum: ["Planning", "In Progress", "Complete"] },
    products: [{ type: Schema.Types.ObjectId, ref: "Users.productLibrary" }]
  },
  { timestamps: true }
)

export default model("Projects", ProjectsSchema)
