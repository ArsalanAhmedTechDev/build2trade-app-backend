const defaultModel = require('../models/Notifications')
var defaultData = require('./data/Notifications')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function run() {
    try {
        await defaultModel.collection.drop()
        // defaultData =await defaultData.map(data => ({
        //     ...data,
        //     _id: new ObjectId(data._id), // Convert _id to ObjectId
        // }));
        await defaultModel.insertMany(defaultData)
        console.log('Done!')
    } catch (e) {
        console.log(e)
        if (e.code === 26) {
            console.log(defaultModel.collection.name + 'not found')
            console.log('Done!')
            // defaultData =await defaultData.map(data => ({
            //     ...data,
            //     _id: new ObjectId(data._id), // Convert _id to ObjectId
            // }));
            await defaultModel.insertMany(defaultData)
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    run,
}
