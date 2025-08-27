import mongoose from "mongoose";

// Connect to the MonogoDB database
const connectDB = async ()=>{
    mongoose.connection.on('connected', ()=> console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/lmsForOviz`)
}

export default connectDB