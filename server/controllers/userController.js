import User from '../models/user.js'
import { Purchase } from "../models/purchase.js";
import Stripe from "stripe"
import Course from '../models/course.js';
import { CourseProgress } from '../models/CourseProgress.js';

export const getUserData = async(req, res)=>{
    try {
        const userId = req.auth.userId
        const user = await User.findById(userId)
        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        res.json({success:true, user})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

// user enrolled courses with lecture link

export const userEnrolledCourses =  async(req, res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({success: true, enrolledCourses: userData.enrolledCourses})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Purchase course
export const purschaseCourse = async(req, res)=>{

    console.log('sucess user controller')

    try {
         const {courseId} = req.body
         const {origin} = req.headers
         const userId = req.auth.userId
         const userData = await User.findById(userId)
         const courseData = await Course.findById(courseId)

         if(!userData || !courseData){
            return res.json({success: false, message: 'data not found'})
         }

         const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
         }

         const newPurchase = await Purchase.create(purchaseData)

         //Stripe Gateway Initialize
         const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

         const currency = process.env.CURRENCY.toLowerCase()

         //Creating line items to for stripe
         const line_itmes = [{
            price_data:{
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url:  `${origin}/`,
            line_items: line_itmes,
            mode:'payment',
            metadata:{
                purchaseId: newPurchase._id.toString()
            }
         })

         res.json({success: true, session_url: session.url})


    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

// update user course progress
export const updateUserCourseProgress = async (req, res)=>{
    try {
        const useId = req.auth.useId
        const { courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({useId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success: true, message: 'Lecture Already Completed'})
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else{
            await CourseProgress.create({
                useId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({success:true, message: 'progress updated'})


    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// get user course progress
export const getUserCourseProgress = async(req,res) =>{
    try {
        const useId = req.auth.useId
        const { courseId} = req.body
        const progressData = await CourseProgress.findOne({useId, courseId})
        res.json({success:true, progressData})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// add uder rating to course
export const addUserRating = async (req,res)=>{
    const userId = req.auth.useId
    const {courseId, rating} = req.body;

    if(!courseId || !userId || !rating || rating<1 || rating > 5){
        return res.json({success: false, message: 'Invalide Details'})
    }
    try {
        const course = await Course.findById(courseId)

        if(!course){
            return res.json({success: false, message: 'Course not found'})
        }

        const user = await User.findById(userId);

        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success: false, message: 'User has not purchased this course'})
        }

        const existingRatingIndex = course.courseRatings.findIndex(r = r.useId === userId)

        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }else{
            course.courseRatings.push({userId, rating})
        }
        await course.save()

        return res.json({success: true, message: 'Rating Added'})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}