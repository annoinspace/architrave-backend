import express from "express"
import mongoose from "mongoose"
import { jwtAuthMiddleware } from "../lib/jwtAuth.js"
import ProjectsModel from "./model.js"
import UsersModel from "../users/model.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"
import createHttpError from "http-errors"

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "architrave"
    }
  })
}).single("moodboard")

const projectsRouter = express.Router()

projectsRouter.post("/new", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)
    console.log("req.body", req.body)

    if (user) {
      const newProject = new ProjectsModel({ user: user._id, ...req.body })
      const savedProject = await newProject.save()
      if (savedProject) {
        user.projects.push(savedProject)
        await user.save()
        console.log("---------new project created------------")
        res.status(200).send(savedProject)
      } else {
        createHttpError(500, "Error saving project")
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.get("/all", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const allProjects = await ProjectsModel.find({ user: req.user._id })

      if (allProjects) {
        res.status(200).send(allProjects)
      } else {
        res.status(404).send({ message: "this user does not have any projects" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.get("/:projectId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const project = await ProjectsModel.findById({ _id: req.params.projectId })
      if (project) {
        res.status(200).send(project)
      } else {
        res.status(404).send({ message: "this project does not exist" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.put("/:projectId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)
    const { title, summary, budget, cushion } = req.body
    const projectId = req.params.projectId

    if (user) {
      const project = await ProjectsModel.findByIdAndUpdate(
        projectId,
        { ...req.body },
        { new: true, runValidators: true }
      )
      if (project) {
        res.status(200).send(project)
      } else {
        res.status(404).send({ message: "this project does not exist" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.get("/:projectId/products", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const project = await ProjectsModel.findById({ _id: req.params.projectId })
      if (project) {
        res.status(200).send(project.products)
      } else {
        res.status(404).send({ message: "this project does not exist" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.put("/:projectId/products", jwtAuthMiddleware, async (req, res, next) => {
  const { productId } = req.body
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const project = await ProjectsModel.findById({ _id: req.params.projectId })
      if (project) {
        const product = user.productLibrary.find((product) => product._id == productId)
        if (product) {
          console.log(product)
          project.products.push(product)
          await project.save()
          res.status(200).send(project)
        }
      } else {
        res.status(404).send({ message: "this project does not exist" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.get("/:projectId/products/:productId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const project = await ProjectsModel.findById(req.params.projectId)
      if (project) {
        const product = project.products.find((product) => product._id == req.params.productId)
        if (product) {
          res.status(200).send(product)
        } else {
          res.status(404).send({ message: "This product does not exist in the project" })
        }
      } else {
        res.status(404).send({ message: "This project does not exist" })
      }
    } else {
      createHttpError(404, "User not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.put("/:projectId/products/:productId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)
    const { quantity } = req.body

    if (user) {
      const project = await ProjectsModel.findById(req.params.projectId)
      if (project) {
        const product = project.products.find((product) => product._id == req.params.productId)
        if (product) {
          product.quantity = quantity
          await project.save()
          res.status(200).send({ message: "Product quantity updated successfully", updatedProducts: project.products })
        } else {
          res.status(404).send({ message: "This product does not exist in the project" })
        }
      } else {
        res.status(404).send({ message: "This project does not exist" })
      }
    } else {
      createHttpError(404, "User not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.delete("/:projectId/products/:productId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const project = await ProjectsModel.findById(req.params.projectId)
      if (project) {
        const productIndex = project.products.findIndex((product) => product._id == req.params.productId)
        if (productIndex !== -1) {
          project.products.splice(productIndex, 1)
          await ProjectsModel.findByIdAndUpdate(req.params.projectId, { products: project.products })
          res.status(200).send({ message: "Product deleted successfully", remainingProducts: project.products })
        } else {
          res.status(404).send({ message: "This product does not exist in the project" })
        }
      } else {
        res.status(404).send({ message: "This project does not exist" })
      }
    } else {
      createHttpError(404, "User not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.put("/:projectId/moodboardImage", jwtAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
  try {
    const imageUrl = req.file.path
    console.log("---------------imageUrl---------", imageUrl)
    const user = await UsersModel.findById(req.user._id)
    const projectId = req.params.projectId

    if (projectId) {
      console.log("---------------in the moodboard image router---------")
      const projectUpdated = await ProjectsModel.findByIdAndUpdate(
        req.params.projectId,
        { moodboardImage: imageUrl, ...req.body },
        { new: true, runValidators: true }
      )
      if (projectUpdated) {
        res.status(200).send(projectUpdated)
        console.log("---------------success---------")
      } else {
        res.status(404).send({ message: "error updating project" })
      }
    } else {
      createHttpError(404, "project not found")
    }
  } catch (error) {
    next(error)
  }
})

projectsRouter.delete("/:projectId", jwtAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id)

    if (user) {
      const projectDeleted = await ProjectsModel.findByIdAndDelete(req.params.projectId)
      if (projectDeleted) {
        res.status(200).send({ message: "Project deleted successfully" })
      } else {
        res.status(404).send({ message: "error deleting project" })
      }
    } else {
      createHttpError(404, "user not found")
    }
  } catch (error) {
    next(error)
  }
})

export default projectsRouter
