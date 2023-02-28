import mongoose from "mongoose"
import bscrypt from "bcrypt"

const { Schema, model } = mongoose

const UsersSchema = new Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  colorLibrary: [{ type: String, required: false }],
  productLibrary: [{ type: String, required: false }],
  projects: { type: Schema.Types.ObjectId, ref: "Projects", required: false, default: {} }
})

export default model("Users", UsersSchema)
