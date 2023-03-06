import express from "express"
import mongoose from "mongoose"
import UsersModel from "./model.js"
import SwatchModel from "../swatches/model.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"
import { createAccessToken } from "../lib/tools.js"
import { jwtAuthMiddleware } from "../lib/jwtAuth.js"
import createHttpError from "http-errors"

const usersRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: () => {
      return { folder: "architrave" }
    }
  }),
  limits: { fileSize: 1024 * 1024 }
}).single("product")

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, email, displayName, password, role } = req.body

    const existingUser = await UsersModel.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      const existingField = existingUser.username === username ? "username" : "email"
      return res.status(400).send({ message: `user with this ${existingField} already exists` })
    }

    const newUser = new UsersModel(req.body)
    const savedUser = await newUser.save()

    res.status(201).send(savedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await UsersModel.checkCredentials(email, password)

    if (user) {
      const payload = { _id: user._id, role: user.role }
      const accessToken = await createAccessToken(payload)
      res.send({ accessToken })
    } else {
      next(createHttpError(401, `Username or Password is incorrect`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", jwtAuthMiddleware, async (req, res, next) => {
  try {
    let users
    if (req.query.search) {
      users = await UsersModel.find(
        {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
          ]
        },
        { password: 0 }
      )
    } else {
      users = await UsersModel.find({}, { password: 0 })
    }

    if (users) {
      res.status(200).send(users)
    } else {
      next(createHttpError(404, "No users were found."))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UsersModel.findById(req.user._id).populate({
        path: "projects"
      })
      if (user) {
        res.send(user)
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})
usersRouter.post("/me/colorLibrary", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const { paletteName, colors } = req.body

    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)

      // Check if the new username or email already exists in the database with a user that is not me
      // const existingUser = await UsersModel.findOne({
      //   $and: [{ _id: { $ne: foundUser._id } }, { $or: [{ username }, { email }] }]
      // })
      // if (existingUser) {
      //   const existingField = existingUser.username === username ? "username" : "email"
      //   return res.status(400).send({ message: `User with this ${existingField} already exists` })
      // }

      // Update the user with the new data and return the updated user
      if (foundUser) {
        foundUser.colorLibrary.push({ paletteName, colors })
        const updatedUser = await foundUser.save()
        res.send(updatedUser)
      } else {
        res.status(400).send({ message: `there was a problem` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const { username, email } = req.body

    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)

      // Check if the new username or email already exists in the database with a user that is not me
      const existingUser = await UsersModel.findOne({
        $and: [{ _id: { $ne: foundUser._id } }, { $or: [{ username }, { email }] }]
      })
      if (existingUser) {
        const existingField = existingUser.username === username ? "username" : "email"
        return res.status(400).send({ message: `User with this ${existingField} already exists` })
      }

      // Update the user with the new data and return the updated user
      foundUser.set(req.body)
      const updatedUser = await foundUser.save()
      res.send(updatedUser)
    }
  } catch (error) {
    next(error)
  }
})

// usersRouter.post("/me/colorLibrary", jwtAuthMiddleware, async (req, res, next) => {
//   try {
//     const { paletteName, colors } = req.body
//     console.log("here")
//     console.log(req.user)
//     const _id = mongoose.Types.ObjectId(req.user._id)

//     const foundUser = await UsersModel.findById(_id).populate({
//       path: "projects"
//     })
//     if (foundUser) {
//       foundUser.colorLibrary.push({ paletteName, colors })
//       const updatedUser = await foundUser.save()
//       res.send(updatedUser)
//     } else {
//       createHttpError(404, "user not found")
//       console.log("user not found")
//     }
//   } catch (error) {
//     next(error)
//   }
// })

export default usersRouter
