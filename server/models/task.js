import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    roadmapId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Roadmap',
        required:true,
    },
    title:{type:String,required:true},
    category:{
        type:String,
        enum:['DSA','Development','Contest'],
        required:true,
    },
    resourceLink:{type:String,default:""},
    status:{
        type:String,
        enum:['Pending','In progress','Completed'],
        default:'Pending',
    },

    //How much this specific task bumps their Lpa when completed
    lpaWeight:{type:Number,required:true},
},{timestamps:true});

export const Task = mongoose.model("Task",taskSchema);