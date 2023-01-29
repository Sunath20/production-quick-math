const { UserModel } = require("../schemas/UserSchema")

const {sendPasswordResetEmail} = require("../mail")
const router = require("express").Router()
const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECERET


router.post("/signup",async (req,res) => {
    const requiredAttributes = ['username','email','password']

    

    const data = req.body

    for(const requiredKey of requiredAttributes){
        if(!data[requiredKey])return res.status(403).send({error:`${requiredKey} is required`})
    }

    if(data['password'].length < 8)return res.status(403).send({'error':"Password must be eight or more letters"})

    try{
        const user = await UserModel.findOne({username:data.username})
        if(user)return res.status(403).send({'error':"Username is already taken"})
    }catch(ex){
        console.log(ex)
    }

    try{
        const user = await UserModel.findOne({email:data.email})
        if(user)return res.status(403).send({'error':"Email is already used"})
    }catch(ex){
        console.log(ex)
    }

    try{

        const user = await UserModel.findOne({password:data.password})
        if(user)return res.status(403).send({'error':"Password is a common used one"})
    }catch(ex){
        console.log(ex)
    }
    


    const newUser = new UserModel(data)
    newUser.save().then(e => {
        res.status(200).send({"saved":true})
    })
    
})


router.post("/login",(req,res) => {
    const data = req.body
    UserModel.findOne({username:data.username,password:data.password}).then(e => {
        if(e){
            return res.status(200).send({"token":jwt.sign({username:e.username,_id:e._id},secret,{expiresIn:60*60})})
        }

        return res.status(403).send({"error":"invalid credentials"})

    })
})


const { createHost } = require("../get_custom_url")



router.post("/change-password-request",async (req,res) => {
    const email = req.body.email

    const user = await UserModel.findOne({email:email})
    if(user){
       const token =  jwt.sign({
            username:user.username,
            email:email,
            id:user._id,
            
        },secret,{expiresIn:60*5})
        // console.log(req.baseUrl)
        const url = createHost("/change-password?resetLink="+token,"http://localhost:5173")
        await sendPasswordResetEmail(user.email,url)
        return res.status(200).send({'sent':true})
    }else{
        // return res.status(500).send({'error':"Internal server error"})
        return res.status(200).send({'error':"Email not found"})
    }


})


router.post("/change-password",async(req,res) => {
    const token = req.body.token
    const newPassword = req.body.password
    
    let data;
    try{
        data = jwt.decode(token,{json:true})
        const limit = data.exp
        const currentTime = Math.round(new Date().getTime() / 1000)
        if(limit < currentTime){
            return res.status(403).send({'error':"Token is invalid"})
        }
    }catch(ex){
        return res.status(403).send({'error':"Token is invalid.It might have been expireds"})
    }

    const dbUser = await UserModel.findOne({username:data['username']})
    if(dbUser){
        dbUser.password = newPassword
        dbUser.save().then(e => {
            return res.status(200).send({'changed':true})
        }).catch(e => {
            return res.status(403).send({'error':"User not found"})
        })
    }else{
        return res.status(404).send({'error':"Invalid credentials"})
    }
    
    
})


module.exports = {authRouter:router}