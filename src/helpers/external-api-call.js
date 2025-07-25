const axios = require('axios')

module.exports = async (url, input, additionalHeaders = {}, type = 'POST') => {
    console.log('sending call', url)

    try {
        let {data} = await axios({
            url: url,
            method: type,
            data: input,
            headers: {
                // ...input.getHeaders(),
                ...additionalHeaders
            }

        })

        if (data.data) {
            return data.data
        }
        if (data.error) {
            return data.error
        }
        console.log('data returned from api', data)

        return data
    } catch (error) {
        console.log('error while requesting', url, error.message)
    }
}
