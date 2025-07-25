const passport = require('passport')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const BearerStrategy = require('passport-http-bearer')
/*
    require mongodb models
*/
const User = require('../models/Customers')
const OauthToken = require('../models/OauthToken')
//token verification
passport.use(
    new BearerStrategy(async (token, done) => {
        // if token is not given return
        if (!token) {
            console.log("I am in authentication file => Token Nahi mila")

            return done(null, false)
        } else {
            try {
                console.log("I am in authentication file => Token Mil gya")
                // verify token with secret
                // and retrieve token payload
                console.log("TOKEN => ", token)
                let payload = await jwt.verify(token, process.env.CLIENT_SECRET)

                // Check if the token is not revoked
                let accessToken = await OauthToken.findById(
                    payload.accessTokenId
                )
                console.log("accessToken => ", accessToken)

                console.log("I am in authentication file => Access token mil gaya")
                if (!accessToken || !!accessToken.revoked) {
                    // Unauthenticated if access token not in database
                    console.log("I am in authentication file => Access token revoked hogya!")
                    // or the access token has been revoked
                    return done(null, false)
                }

                // retrieve user from payload
                let user = await User.findById(payload.userId)

                // return user with token data to
                // callback function for current route
                return done(null, user, payload)
            } catch (error) {
                console.log("I am in authentication file => Error agya")
                console.log(error)
                return done(null, false)
            }
        }
    })
)
module.exports = passport.authenticate('bearer', {
    session: false,
})
