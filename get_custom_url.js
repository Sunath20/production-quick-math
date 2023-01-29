

const production = process.env.PRODUCTION
const defualtHost = process.env.HOSTNAME

const createHost = (url,hostname) => {
    if(production == 'FALSE'){
        return hostname + url
    }
    return defualtHost + url
}

module.exports = {createHost}