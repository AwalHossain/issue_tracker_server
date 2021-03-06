/* eslint-disable prettier/prettier */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDb = require('./db/connectDB');

const app = express();
const port = process.env.PORT || 5000;
// middleware
const errorMiddleware = require('./middleware/error');

app.use(cors());
app.use(express.json());

// connect with mongoDb function
connectDb();

console.log(process.env.JWT_EXPIRE, 'ex');

// import routes
const user = require('./routes/userRoutes');

app.use('/api', user);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
