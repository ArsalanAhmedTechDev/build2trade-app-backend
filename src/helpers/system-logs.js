const Log = require('../models/Log')
const _ = require('lodash')


async function composeSystemLogs(params) {
    try {

        var log = new Log()
        log.userId = params.userId ? params.userId : null
        log.userIp = params.userIp ? params.userIp : null
        log.roleId = params.roleId ? params.roleId : null
        log.module = params.module ? params.module : null
        log.action = params.action ? params.action : null
        log.data = params.data ? params.data : null

        await log.save()
        // if (
        //     params.action == 'update' ||
        //     params.action == 'archived' ||
        //     params.action == 'unarchived'
        // ) {
        //     log.data = await updateDiff(params)
        //     if (Object.keys(log.data).length > 0) {
        //         await log.save()
        //     }
        // } else {
        //     log.data = await createDiff(params)
        //     if (Object.keys(log.data).length > 0 && log.action == 'create') {
        //         await log.save()
        //     } else if (log.action == 'list') {
        //         await log.save()
        //     }
        // }
        return true
    } catch (error) {
        console.log('--- Error in Saving Logs ---',params,error)
        return false
    }
}

async function createDiff(params) {
    let data = params.data
    let diffObj = {}
    for (var property in data) {
        if (params.properties) {
            if (_.includes(params.properties, property)) {
                if (data[property]) {
                    diffObj[property] = {
                        newValue: data[property],
                        oldValue: '',
                    }
                }
            }
        }
    }

    return diffObj
}

async function updateDiff(params) {
    let data = params.data
    let previousData = params.previousData
    let diffObj = {}
    for (var property in previousData) {
        if (_.includes(params.properties, property)) {
            if (typeof previousData[property] === 'object') {

                let difference = _.differenceWith(
                    [previousData[property]],
                    [data[property]],
                    _.isEqual
                )
                if (difference.length) {
                    if(property == 'avatar'){
                        diffObj['profilePicture'] = {
                            oldValue: previousData[property].originalName,
                            newValue:  data[property].originalName,
                        }
                       
                    }else{
                        diffObj[property] = {
                            oldValue: previousData[property],
                            newValue: data[property],
                        }
                    }
                    
                }
            } else {
                if (
                    previousData[property] != undefined &&
                    data[property] != undefined
                ) {
                    if (previousData[property] !== data[property]) {
                        diffObj[property] = {
                            oldValue: previousData[property],
                            newValue: data[property],
                        }
                    }
                }
            }
        }
    }
    return diffObj
}
module.exports = {
    composeSystemLogs,
}
