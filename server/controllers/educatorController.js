import {clerkClient} from '@clerk/express'
import Course from '../models/course.js'
import {v2 as cloudinary} from 'cloudinary'

export const updateToEducator = async (req, res)=> {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{
                role: 'educator',
            }
        })
        res.json({success:true, message: 'You can publish a course now'})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

// add new course
export const addCourse = async (req, res)=>{
    try {
        const {courseData} = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if(!imageFile){
            return res.json({success: false, message: 'Thumbnail not Attached'})
        }

        const parseCourseData = await JSON.parse(courseData)
        parseCourseData.educator = educatorId
        const newCourse = await Course.create(parseCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.json({success: true, message:'Course Added'})

    } catch (error) {
        res.json({success: false, message:error.message})
    }
}