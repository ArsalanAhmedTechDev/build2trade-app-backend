const Role = require('../models/Role')
const RoleData = require('./data/Role')

async function run() {
    try {
        await Role.collection.drop()
        await Role.insertMany(RoleData)
        console.log('Role Done!')
    } catch (e) {
        console.log(e)
        if (e.code === 26) {
            console.log(Role.collection.name + 'not found')
            console.log('Role Done!')
            await Role.insertMany(RoleData)
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    roleSeeder: run,
}
