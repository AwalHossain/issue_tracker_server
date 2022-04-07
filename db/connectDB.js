/* eslint-disable camelcase */
const mongoose = require('mongoose');

const db_uri = 'mongodb://localhost:27017/issuTracker';

const connectDb = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log('already connected');
        }

        await mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('connected');
    } catch (err) {
        console.log('Database error');
    }
};
module.exports = connectDb;
