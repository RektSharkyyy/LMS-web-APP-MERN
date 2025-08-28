import express from 'express'
import { addCourse, updateToEducator } from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// Add educator Role
educatorRouter.get('/update-role', updateToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)

export default educatorRouter;