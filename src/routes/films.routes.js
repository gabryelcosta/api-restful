const { Router } = require("express")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const FilmsController = require("../controllers/FilmsController")

const filmsRoutes = Router()

const filmsController = new FilmsController()

filmsRoutes.use(ensureAuthenticated)

filmsRoutes.get("/", filmsController.index)
filmsRoutes.post("/", filmsController.create)
filmsRoutes.get("/:id", filmsController.show)
filmsRoutes.delete("/:id", filmsController.delete)

module.exports = filmsRoutes