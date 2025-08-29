import mongoose from "mongoose";
import { useId } from "react";

const purchaseSchema = new mongoose.Schema({
    courseId: {type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    useId: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: {type: Number, required: true},
    status: {type: String, enum:['pending','completed','failed'],default:'pending'}
}, {timestamps:true});

export const Purchase = mongoose.model('Purchase', purchaseSchema)