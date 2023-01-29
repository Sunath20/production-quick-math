const { default: mongoose } = require("mongoose");



const GameSchema = mongoose.Schema({
    username:String,
    game:Object
})


const GameModel = mongoose.model("games",GameSchema)
module.exports = {GameModel}