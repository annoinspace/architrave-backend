import mongoose from "mongoose"
const { Schema, model } = mongoose

const productSchema = new Schema({
  name: { type: String, required: false },
  category: { type: String, required: false },
  link: { type: String, required: false },
  price: { type: String, required: false },
  image: { type: String, required: false }
})

const moodboardSchema = new Schema({
  backgroundColor: { type: String, required: false },
  border: { type: Boolean, required: false },
  imageShadow: { type: Boolean, required: false },
  moodboardImage: { type: String, required: false },
  swatchStyle: { type: String, required: false }
})

const colorSchema = new Schema({
  paletteName: { type: String, required: true },
  colors: { type: [String], required: true }
})

const ProjectsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: false },
    currency: { type: String, required: true },
    budget: { type: Number, required: true },
    cushion: { type: Number, required: true },
    status: { type: String, required: true, enum: ["Planning", "In Progress", "Complete"], default: "Planning" },
    products: [productSchema],
    palette: colorSchema,
    moodboardImage: { type: String, required: false },
    moodboard: moodboardSchema
  },
  { timestamps: true }
)

export default model("Projects", ProjectsSchema)

// projectsRouter.put("/:projectId/moodboardImage", jwtAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
//   try {
//     const imageUrl = req.file.path
//     const user = await UsersModel.findById(req.user._id)
//     const projectId = req.params.projectId

//     if (projectId) {
//       const projectUpdated = await ProjectsModel.findByIdAndUpdate(
//         req.params.projectId,
//         { moodboardImage: imageUrl, ...req.body },
//         { new: true, runValidators: true }
//       )
//       if (projectUpdated) {
//         res.status(200).send(projectUpdated)
//       } else {
//         res.status(404).send({ message: "error updating project" })
//       }
//     } else {
//       createHttpError(404, "project not found")
//     }
//   } catch (error) {
//     next(error)
//   }
// })
