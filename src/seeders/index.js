require('dotenv').config()
async function runSeeders() {
    await require('../config/database')()

  await Promise.all([

      // await require('./RoleType').roleTypeSeeder(),
      // await require('./Role').roleSeeder(),
      // await require('./User').userSeeder()
      // await require('./Notification').run()
      await require('./DefaultSeeder').run()
  ])
}
runSeeders().then(res=> process.exit() )
// require('./OauthClient')
