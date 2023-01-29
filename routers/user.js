
const express  =require("express")
const { GameModel } = require("../schemas/GameSchema")
const {UserModel} = require("../schemas/UserSchema")
const router = express.Router()


const fs = require("fs")
const path = require("path")

router.post("/save-game",(req,res) => {
    
    const newModel = new GameModel(req.body)
    newModel.save().then(e => {
        return res.status(201).send({'saved':true})
    }).catch(ex => {
        return res.status(500).send({'error':"internal server error"})
    })

})




module.exports = {
    gameRouter:router
}