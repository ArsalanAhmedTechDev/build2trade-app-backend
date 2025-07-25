const axios = require('axios')
const qs = require('qs');

module.exports = async (url, input, type = 'POST',xFrom=false,additonalHeaders={}) => {
    console.log('sending call', url)

    let headers = {
        'Content-Type': 'application/json',
            ...additonalHeaders
    }

    console.log('==headers===',headers)
    if(xFrom)
    {
        input = qs.stringify(input);
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    try {
        let {data} = await axios({
            url: url,
            method: type,
            data: input,
            maxBodyLength: Infinity,
            headers: headers
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
