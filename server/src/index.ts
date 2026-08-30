import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send("hello neel!")
})

app.get('/health', (_req, res) => {
    res.json({status: 'ok'});
})

app.listen(PORT, () => {
    console.log("server is running on port 8081")
})