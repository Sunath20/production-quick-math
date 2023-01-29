

const jsonwebtoken = require("jsonwebtoken")
const { isExpired } = require("../token")

const tokenExpiredMiddleWare = (req,res,next) => {
    const token = req.headers.authorization
    if(!token)return res.status(403).send({'error':"User is not verified"})
    const data = jsonwebtoken.decode(token,{json:true})
    if(isExpired(data.exp)){
        return res.status(403).send({'error':"User is not verified"})
    }else{
        next()
    }
}

module.exports = {
    tokenExpiredMiddleWare
}