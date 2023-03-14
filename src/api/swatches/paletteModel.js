import mongoose from "mongoose"

const { Schema, model } = mongoose

const ColorsSchema = new Schema({
  paletteName: { type: String, required: true },
  colors: { type: [String], required: true }
})

export default model("Colors", ColorsSchema)
