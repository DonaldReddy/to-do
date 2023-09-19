import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

var password = process.env.mongo_password;

async function connectToDatabase() {
    const password = process.env.mongo_password;
    try {
        console.log(password)
        await mongoose.connect(`mongodb+srv://donaldreddy2712:${password}@cluster0.ua9gngy.mongodb.net/to-do`);
        await List.findOne({ list_name: "Home" }).then(async (data) => {
            if (!data) {
                await List.insertMany({
                    list_name: "Home",
                    tasks: [],
                })
            }
        })
        console.log("Connected to Mongo Atlas");
    } catch (error) {
        throw new Error(error.message);
    }
}

// Declaring Schemas.

var task_schema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    }
});

var list_schema = new mongoose.Schema({
    list_name: {
        type: String,
        required: true,
        unique: true,
    },
    tasks: {
        type: [task_schema],
    }
})

// Creating Models(Collections).

var Task = mongoose.model("Task", task_schema);
var List = mongoose.model("List", list_schema);


export { List, Task, mongoose, connectToDatabase };