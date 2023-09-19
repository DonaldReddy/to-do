import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.port;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"))

app.set("views", "./views");

export default app;