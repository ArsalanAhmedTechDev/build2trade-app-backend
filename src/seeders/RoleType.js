const RoleType = require('../models/RoleType');
let RoleTypeData = require('./data/RoleType'); // Use let instead of var
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function run() {
    try {
        console.log('Role Type seeder started!');
        await RoleType.collection.drop();
        RoleTypeData =await RoleTypeData.map(data => ({
            ...data,
            _id: new ObjectId(data._id), // Convert _id to ObjectId
        }));
        await RoleType.insertMany(RoleTypeData);
        console.log('Role Type Done!');
    } catch (e) {
        console.log('exception',e);
        if (e.code === 26) {
            console.log(RoleType.collection.name + ' not found');
            console.log('Role Type Done!');
            RoleTypeData = await RoleTypeData.map(data => ({
                ...data,
                _id: new ObjectId(data._id), // Convert _id to ObjectId
            }));
            await RoleType.insertMany(RoleTypeData);
        } else {
            console.log(e);
        }
    }
}

module.exports = {
    roleTypeSeeder: run,
};
