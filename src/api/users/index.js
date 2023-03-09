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
    params: {
      folder: "architrave"
    }
  })
}).single("image")

const cloudinaryUploaderMultiple = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "architrave"
    }
  })
}).array("image", 5)

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

usersRouter.post("/me/colorLibrary", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const { paletteName, colors } = req.body

    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        foundUser.colorLibrary.push({ paletteName, colors })
        const updatedUser = await foundUser.save()
        res.send(updatedUser.colorLibrary)
      } else {
        res.status(400).send({ message: `there was a problem creating a new palette` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me/colorLibrary/:paletteId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const paletteId = req.params.paletteId
    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        foundUser.colorLibrary = foundUser.colorLibrary.filter((palette) => palette._id != paletteId)
        const updatedUser = await foundUser.save()
        res.send(updatedUser.colorLibrary)
      } else {
        res.status(400).send({ message: `there was a problem deleting the product` })
      }
    }
  } catch (error) {
    next(error)
  }
})

// usersRouter.post("/me/inspo", jwtAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
//   try {
//     const imageUrl = req.file.path

//     if (req.user) {
//       const foundUser = await UsersModel.findById(req.user._id)
//       if (foundUser) {
//         foundUser.inspo.push({ image: imageUrl })
//         const updatedUser = await foundUser.save()

//         res.status(201).send(updatedUser)
//       } else {
//         res.status(400).send({ message: `there was a problem the inspo images` })
//       }
//     }
//   } catch (error) {
//     next(error)
//   }
// })

usersRouter.post("/me/inspo", jwtAuthMiddleware, cloudinaryUploaderMultiple, async (req, res, next) => {
  try {
    console.log("req.files", req.files)

    const imageUrls = req.files.map((file) => file.path)

    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        const newInspo = imageUrls.map((url) => ({
          url: url
        }))
        foundUser.inspo = foundUser.inspo.concat(newInspo)
        const updatedUser = await foundUser.save()

        res.status(201).send(updatedUser.inspo)
      } else {
        res.status(400).send({ message: `there was a problem the inspo images` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/me/products", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const { name, price, link, category, image } = req.body
    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        cloudinary.uploader.upload(
          image,
          {
            resource_type: "image",
            folder: "architrave"
          },
          async (error, result) => {
            if (error) {
              console.error(error)
              res.status(500).send({ error: "Failed to upload image" })
            } else {
              const imageUrl = result.secure_url
              foundUser.productLibrary.push({ name, price, link, category, image: imageUrl })
              const updatedUser = await foundUser.save()
              res.send(updatedUser.productLibrary)
            }
          }
        )
      } else {
        res.status(400).send({ message: `there was a problem adding a new product` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/me/products", jwtAuthMiddleware, async (req, res, next) => {
  try {
    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        res.send(foundUser.productLibrary)
      } else {
        res.status(400).send({ message: `there was a problem getting the products` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/me/products/imageUpload", jwtAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
  try {
    const imageUrl = req.file.path
    const { name, price, link, category } = req.body
    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        foundUser.productLibrary.push({ name, price, link, category, image: imageUrl })
        const updatedUser = await foundUser.save()

        res.status(201).send(updatedUser.productLibrary)
      } else {
        res.status(400).send({ message: `there was a problem adding a new product` })
      }
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me/products/:productId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const productId = req.params.productId
    if (req.user) {
      const foundUser = await UsersModel.findById(req.user._id)
      if (foundUser) {
        foundUser.productLibrary = foundUser.productLibrary.filter((product) => product._id != productId)
        const updatedUser = await foundUser.save()
        res.send(updatedUser.productLibrary)
      } else {
        res.status(400).send({ message: `there was a problem deleting the product` })
      }
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter
