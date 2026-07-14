require('dotenv').config()
const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors')

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})


app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`)
})



