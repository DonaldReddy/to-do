import express from "express";
import { List, Task, mongoose } from "../database/dbconnect.js"
import _ from "lodash";

const router = express.Router();

var custom_lists = [];

var current_list = "Home"

// Post request to Delete a custom list except Home list.
router.post("/delete-list", async (req, res) => {
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
router.post("/list", async (req, res) => {
    let name = req.body.custom_name;
    if (name) {
        name = _.capitalize(name);
        if (!custom_lists.includes(name)) {
            custom_lists.push(name);

            let x = await List.findOne({ list_name: name });
            if (!x) {
                await List.insertMany({
                    list_name: name,
                    tasks: [],
                })
            }
        }
        current_list = name;
    }
    res.redirect("/")
})
// Get request to change current list.
router.get("/list", (req, res) => {
    current_list = req.query.list_name;
    res.redirect("/")
})
// Post request to delete a to-do from the current list.
router.post("/delete", async (req, res) => {
    await List.findOneAndUpdate({ list_name: current_list }, { $pull: { tasks: { _id: req.body.task_id } } });
    res.redirect("/");
})

router.post("/save", async (req, res) => {
    let id = req.body.task_id;
    let task = req.body.taskedit;
    console.log(id, task)
    await List.findOneAndUpdate({ "list_name": current_list, "tasks._id": new mongoose.Types.ObjectId(id) }, { $set: { "tasks.$.task": task } });
    res.redirect("/")
})

// Post request to add to-do into current list.
router.post("/add", async (req, res) => {
    let task = req.body.task;
    if (task) {
        var list = await List.findOne({ list_name: current_list });
        list.tasks.push(new Task({ task: task }));
        list.save();
    }
    res.redirect("/");
})
// Home Page where to-do's are listed.
router.get("/", async (req, res) => {
    try {
        var list = await List.findOne({ list_name: current_list });
        custom_lists = await List.find({}).select({ "list_name": 1, "_id": 0 });
        res.render("index.ejs", { list_name: current_list, tasks: list.tasks, custom_lists: custom_lists });
    } catch (error) {
        console.log(error.message);
    }
})

export default router;