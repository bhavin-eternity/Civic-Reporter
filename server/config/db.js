const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MONGO-DB CONNECTED');
    } catch (error) {
        console.error('Error in MongoDb connection:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;