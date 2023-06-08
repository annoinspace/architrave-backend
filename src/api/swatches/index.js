import express from "express"
import mongoose from "mongoose"
import SwatchModel from "./model.js"
import { jwtAuthMiddleware } from "../lib/jwtAuth.js"
// import { AdminOnlyMiddleware } from "../lib/AdminOnly.js"
import { componentToHex, getCategoryFromRGB } from "../lib/colorSorter.js"

const adminRouter = express.Router()

adminRouter.post(
  "/swatch",
  jwtAuthMiddleware,
  // AdminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const { r, g, b, name, baseColor } = req.body
      const rgb = [r, g, b]
      console.log("rgb from body", rgb)
      const existingSwatch = await SwatchModel.findOne({ rgbValue: rgb })

      if (existingSwatch) {
        res.status(409).send({ message: "Swatch already exists with the same RGB value" })
      } else {
        const hex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
        console.log("hex color from rgb", hex)

        const basicCategory = req.body.baseColor ? req.body.baseColor : getCategoryFromRGB(rgb)

        const newColor = new SwatchModel({
          rgbValue: rgb,
          hexValue: hex,
          baseColor: basicCategory,
          name: name
        })

        const newColorSaved = await newColor.save()
        res.status(201).send(newColorSaved)
      }
    } catch (error) {
      next(error)
    }
  }
)

adminRouter.get("/swatches", async (req, res, next) => {
  try {
    const colors = await SwatchModel.find({})
    res.send(colors)
  } catch (error) {
    next(error)
  }
})
export default adminRouter
