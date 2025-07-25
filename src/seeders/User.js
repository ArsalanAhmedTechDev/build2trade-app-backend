const User = require('../models/Customers')
const UserData = require('./data/User')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const salt = parseInt(process.env.SALT)
async function run() {
    try {
        _.each(UserData, function(item, index) {
            item.password = bcrypt.hashSync(item.password, salt)
        })
        await User.collection.drop()
        await User.insertMany(UserData)
        console.log('User Done!')
        //process.exit()
    } catch (e) {
        if (e.code === 26) {
            console.log('namespace %s not found')
            await User.insertMany(UserData)
            //process.exit()
        } else {
            console.log(e)
            //process.exit()
        }
    }
}

module.exports = {
    userSeeder: run,
}
