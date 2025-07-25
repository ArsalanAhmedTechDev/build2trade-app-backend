const defaultModel = require('../models/TeamMembers')
var defaultData = require('./data/TeamMembers')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function run() {
    try {
        await defaultModel.collection.drop()
        await defaultModel.insertMany(defaultData)
        console.log('Done!')
    } catch (e) {
        console.log(e)
        if (e.code === 26) {
            console.log(defaultModel.collection.name + 'not found')
            console.log('Done!')
            await defaultModel.insertMany(defaultData)
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    run,
}
