import express from "express"
import mongoose from "mongoose"
import SwatchSchema from "./model.js"
import { jwtAuthMiddleware } from "../lib/jwtAuth.js"
import { AdminOnlyMiddleware } from "../lib/AdminOnly.js"
import { componentToHex, getCategoryFromRGB } from "../lib/colorSorter.js"

const adminRouter = express.Router()

adminRouter.post("/swatch", jwtAuthMiddleware, AdminOnlyMiddleware, async (req, res, next) => {
  try {
    const { r, g, b } = req.body
    const rgb = [r, g, b]
    console.log("rgb from body", rgb)
    const hex = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
    console.log("hex color from rgb", hex)
    const basicCategory = getCategoryFromRGB(rgb)

    const newColor = new SwatchSchema({
      rgbValue: rgb,
      hexValue: hex,
      baseColor: basicCategory
    })

    const newColorSaved = await newColor.save()
    res.status(201).send(newColorSaved)
  } catch (error) {
    next(error)
  }
})

adminRouter.get("/swatches", async (req, res, next) => {
  try {
    const colors = await SwatchSchema.find({})
    res.send(colors)
  } catch (error) {
    next(error)
  }
})
export default adminRouter
