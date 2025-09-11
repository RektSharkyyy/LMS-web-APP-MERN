 import mongoose from "mongoose";

 const courseProgressSchema = new mongoose.Schema({
    useId: {type: String, required: true},
    courseId: {type: String, required: true},
    completed: {type: Boolean, required: false},
    lectureCompleted: []
 }, {minimize:false});

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema)