import createHttpError from "http-errors"
import { verifyAccessToken, createAccessToken } from "./tools.js"

// export const jwtAuthMiddleware = async (req, res, next) => {
//   if (!req.headers.authorization) {
//     next(createHttpError(401, "Please provide Bearer token in authorization header"))
//   } else {
//     try {
//       const accessToken = req.headers.authorization.replace("Bearer ", "")
//       const payload = await verifyAccessToken(accessToken)
//       req.user = {
//         _id: payload._id,
//         role: payload.role
//       }
//       console.log(payload)
//       next()
//     } catch (error) {
//       next(createHttpError(401, "Token not valid."))
//     }
//   }
// }

export const jwtAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide Bearer token in authorization header"))
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "")
      const payload = await verifyAccessToken(accessToken)
      req.user = {
        _id: payload._id,
        role: payload.role
      }

      // Check if a new token has been generated
      if (payload.tokenVersion !== req.user.tokenVersion) {
        const newAccessToken = await createAccessToken(req.user._id, req.user.role, req.user.tokenVersion)
        res.setHeader("Authorization", `Bearer ${newAccessToken}`)
      }

      next()
    } catch (error) {
      next(createHttpError(401, "Token not valid."))
    }
  }
}
