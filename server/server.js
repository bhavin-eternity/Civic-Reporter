require('dotenv').config();
const connectDB = require('./config/db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const { initSocket } = require('./config/socket');

const app = express();

const server =  http.createServer(app);

initSocket(server)

connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/issues', issueRoutes)


server.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`)
})



