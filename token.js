



const isExpired = (exp) => {
    const currentTime = Math.round(new Date().getTime () / 1000)
    if(exp < currentTime)return true;
    return false;
}

module.exports = {
    isExpired
}