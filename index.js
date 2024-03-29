import * as db from "./database/dbconnect.js";
import serverRoutes from "./routes/routes.js";
import app from "./src/app.js";

db.connectToDatabase().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`App Running on PORT :: ${PORT}`);
    })
}).catch((error) => {
    console.log(error.message)
})

app.use("/", serverRoutes);