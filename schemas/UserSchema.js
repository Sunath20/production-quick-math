

const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username:{
        type:String,
        nullable:false,
        unique:true
    },
    email:{
        type:String,
        nullable:false,
        unique:true
    },
    password:{
        type:String,
        nullable:false,
        unique:true,
        minLength:8
    }
})

const UserModel = mongoose.model('Users',UserSchema)

module.exports = {UserModel,UserSchema}