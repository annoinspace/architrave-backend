import jwt from "jsonwebtoken"

export const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      { ...payload, tokenVersion: payload.tokenVersion || 0 },
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err)
        else resolve(token)
      }
    )
  )

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) reject(err)
      else resolve(originalPayload)
    })
  )

export const updateUserPassword = async (user, newPassword) => {
  console.log("updateUserPassword - newPassword:", newPassword)

  const hashedNewPassword = await bcrypt.hash(newPassword, 11)
  console.log("updateUserPassword - hashedNewPassword:", hashedNewPassword)

  await UsersModel.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedNewPassword,
        tokenVersion: user.tokenVersion + 1
      }
    }
  )
}
