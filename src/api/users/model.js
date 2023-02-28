import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UsersSchema = new Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  colorLibrary: [{ type: String, required: false }],
  productLibrary: [{ type: String, required: false }],
  projects: { type: Schema.Types.ObjectId, ref: "Projects", required: false }
})

UsersSchema.pre("save", async function (next) {
  const currentUser = this
  if (currentUser.isModified("password")) {
    const plainPW = currentUser.password
    const hash = await bcrypt.hash(plainPW, 11)
    currentUser.password = hash
  }

  next()
})

UsersSchema.methods.toJson = function () {
  const userDocument = this
  const user = userDocument.toObject()

  delete user.password
  delete user.createdAt
  delete user.updatedAt
  delete user.__v
  return user
}

UsersSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email })

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (passwordMatch) {
      return user
    } else {
      return null
    }
  } else {
    return null
  }
})

export default model("Users", UsersSchema)
