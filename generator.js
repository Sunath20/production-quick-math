

const operatorSigns = ["+","-","/","*"]

const genBaseOnLevel = (player_level) => {
    const level = Number.parseInt(player_level)
    const randomHights = 1 + (Math.pow(10,level))
    const numOne = Math.floor(Math.random() * randomHights)
    const numTwo = Math.floor(Math.random() * randomHights)
    const sign = operatorSigns[Math.floor(Math.random() * operatorSigns.length)]

    return {"expression":`${numOne} ${sign} ${numTwo}`,numOne,numTwo,sign}

}


module.exports = {
    genBaseOnLevel
}