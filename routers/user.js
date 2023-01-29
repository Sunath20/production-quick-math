
const express  =require("express")
const { GameModel } = require("../schemas/GameSchema")
const {UserModel} = require("../schemas/UserSchema")
const router = express.Router()
const {tokenExpiredMiddleWare} = require("../middlewares/token.expired")

const fs = require("fs")
const path = require("path")

router.post("/save-game",tokenExpiredMiddleWare,(req,res) => {

    
    const rootPath = path.join(__dirname,"../games")
    const userPath = path.join(__dirname,"../games/"+req.body.username+".csv")

    if(!fs.existsSync(rootPath)){
        fs.mkdir(rootPath,(error) => {
            console.log(error)
        })
    }

    const username = req.body.username
    
    // console.log(username)
    if(!fs.existsSync(userPath)){
        const defaultHeaders = "username,first,second,operator,answer,user_answer,time\n"
        fs.writeFileSync(userPath,defaultHeaders)
    }

    const gameFilePath = path.join(__dirname,"../games/all.csv")

    if(!fs.existsSync(gameFilePath)){
        const defaultHeaders = "username,first,second,operator,answer,user_answer,time\n"
        fs.writeFileSync(gameFilePath,defaultHeaders)
    }
    const game = req.body.game

    for(let i = 0 ; i < game.length;i++){
        // console.log(`${username},${game[i].meta['numOne']},${game[i].meta['numTwo']},${game[i].meta['operator']},${game[i]['answer']},${game[i]['realAnswer']},${game[i]['time']}`)

        const firstNumber = game[i].meta['numOne']
        const secondNumber = game[i].meta['numTwo']
        const operator = game[i].meta['operator']
        const userAnswer = game[i]['answer']
        const  realAnswer = game[i]['realAnswer']
        const time = game[i]['time']
    
        const appendRow = `${username},${firstNumber},${secondNumber},${operator},${userAnswer.toString()},${realAnswer.toString()},${time}\n`
        fs.appendFile(gameFilePath,appendRow,e => {
            console.log(e)
        })

        fs.appendFile(userPath,appendRow,e => {
            console.log(e)
        })
    }



    const newModel = new GameModel(req.body)
    newModel.save().then(e => {
        res.status(201).send({'saved':true})
    })

})




module.exports = {
    gameRouter:router
}