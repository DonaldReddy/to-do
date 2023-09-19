import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import _ from "lodash";

// connecting to Data Base.

mongoose.connect("mongodb://127.0.0.1:27017/to-do").then((data) => {
    console.log("Connected to DataBase");
}).catch((error) => {
    console.log("Failed to Connect to DataBase");
})

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

// Adding Default Tasks into Home list.

List.findOne({ list_name: "Home" }).then(async (data) => {
    if (!data) {
        await List.insertMany({
            list_name: "Home",
            tasks: [],
        })
    }
})

// Initializing Express App and Port Number.

const app = express();
const PORT = 3000;

// Backend Logics and Routing.

var custom_lists = [];

var current_list = "Home"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"))

app.set("views", "./views");
// Post request to Delete a custom list except Home list.
app.post("/delete-list", async (req, res) => {
    let list_name = req.body.list_name;
    if (list_name != "Home") {
        try {
            await List.findOneAndDelete({ list_name: list_name });
        } catch (error) {
            console.log(error.message);
        }
    }
    current_list = "Home";
    res.redirect("/")
})
// Post request to add new custom list.
app.post("/list", async (req, res) => {
    let name = req.body.custom_name;
    if (name) {
        name = _.capitalize(name);
        if (!custom_lists.includes(name)) {
            custom_lists.push(name);

            List.findOne({ list_name: name }).then(async (data) => {
                if (!data) {
                    await List.insertMany({
                        list_name: name,
                        tasks: [],
                    })
                }
            })
        }
        current_list = name;
    }
    res.redirect("/")
})
// Get request to change current list.
app.get("/list", (req, res) => {
    current_list = req.query.list_name;
    res.redirect("/")
})
// Post request to delete a to-do from the current list.
app.post("/delete", async (req, res) => {
    await List.findOneAndUpdate({ list_name: current_list }, { $pull: { tasks: { _id: req.body.task_id } } });
    res.redirect("/");
})
// Post request to add to-do into current list.
app.post("/add", async (req, res) => {
    let task = req.body.task;
    if (task) {
        var list = await List.findOne({ list_name: current_list });
        list.tasks.push(new Task({ task: task }));
        list.save();
    }
    res.redirect("/");
})
// Home Page where to-do's are listed.
app.get("/", async (req, res) => {
    try {
        var list = await List.findOne({ list_name: current_list });
        custom_lists = await List.find({}).select({ "list_name": 1, "_id": 0 });
        res.render("index.ejs", { list_name: current_list, tasks: list.tasks, custom_lists: custom_lists });
    } catch (error) {
        console.log(error.message);
    }
})
// Listening on given port.
app.listen(PORT, () => {
    console.log(`Running on PORT ::${PORT}`);
})