

// This is where quick-math-api server starts

const express  = require("express")
require("dotenv").config()
const app = express()

// Connect mongodb
const mongoose = require("mongoose")
const mongodbURL = process.env.MONGO_DB_URL
const {authRouter} = require("./routers/auth")
// const 
const cors = require("cors")



mongoose.set('strictQuery',true)
mongoose.connect(mongodbURL)


const bodyParser = require("body-parser")
const { gameRouter } = require("./routers/user")

app.use(cors({allowedHeaders:"*",methods:"*",origin:"*",exposedHeaders:"*"}))
// Server apis
app.use(bodyParser({extended:true}))
// app.use(express.json({limit:"50mb"}))
// app.use(express.urlencoded({extended:true}))

app.use("/auth",authRouter)
app.use("/user",gameRouter)

// This is where quick-math-api server code ends


const path = require("path")

app.use(express.static(path.join(__dirname,"/dist")))

const http = require("http")
const server = http.createServer(app)

const {Server} = require("socket.io")


const math = require("mathjs")
const uuid = require('uuid')
const { genBaseOnLevel } = require("./generator")



// // Game Socket

io = new Server(server,{
    cors:{
        allowedHeaders:"*",
        origin:"*",
        methods:"*",
        
    }
})


games = {}
currentGameUsers = 0
currentGame = 0

const getGameObject = (level,gameId) => {
    return games[level][gameId]
}

const createGameLevelIfNot = (levelName) => {
    console.log(`levelName has been set to ${levelName}`)
    if(!games[levelName]){
        games[levelName] = {}
    }
}

const initializeANewGame = (level,gameId) => {
    // console.log(`New Game -> ${level} -> ${gameId}`)
    games[level][gameId] = {
        'sockets':[]
    }

    // console.log(`Initialized a new game -> ${level} -> ${gameId} -> sockets -> []`)
}

const getGameSockets = (level,gameId) => {
    if(!games[level][gameId]['sockets']){
        games[level][gameId]['sockets'] = []
    }

    return games[level][gameId]['sockets']
}

const setStateForGameReady = (levelId,gameId,value) => {
    games[levelId][gameId]['readyForQuestion'] = value
}

const getReadyStateForGame = (levelId,gameId) => {
    return games[levelId][gameId]['readyForQuestion']
}

const initializeAndResetGameReadyState = (levelId,gameId) => {
    if(!getReadyStateForGame(levelId,gameId)){
        setStateForGameReady(levelId,gameId,[])
    }

    if(getReadyStateForGame(levelId,gameId).length >= 2) {
        setStateForGameReady(levelId,gameId,[])
    }
}


const getAnswersOfAGame = (level,gameId) => {
    if(!getGameObject(level,gameId)['answers']){
        games[level][gameId]['answers'] = []
    }
    return getGameObject(level,gameId)["answers"]
}

const setGameAnswers = (level,gameId,state) => {
    games[level][gameId]['answers'] = state
}

const getSocresOfAGame = (level,gameId) => {
    return getGameObject(level,gameId)["rightAnswers"]
}


const createGetterAndSetterForASubComponent = (level,game,compo) => {
    const set = (state) => {
        games[level][game][compo] = state
    }

    const get = () => {
        return games[level][game][compo]
    }

    return [set,get]
}



io.on('connection',(socket) => {

    let username;
    let gameId;
    let nextAnswer;
    let userLevel;

    // Start by name
    socket.on("my name",(name) => {
        username = name
        io.emit("name saved")
    })

    socket.on('new game',(level) => {

        // Reset to a new game if two users already join into a new one
        userLevel = level

        // Create a game level for players
        createGameLevelIfNot(level)

        if(currentGameUsers == 2){
            currentGameUsers = 0 
            currentGame +=1
            initializeANewGame(level,currentGame)
            
        }

        gameId = currentGame

        // games[gameId] = games[gameId] ? games[gameId] : {sockets:[]}
        if(!games[level][gameId]){
            initializeANewGame(level,currentGame)
        }
        if(!getGameSockets(userLevel,gameId)){
            games[level][gameId]['sockets'] = []
        }

        if(getGameSockets(level,gameId).indexOf(username) < 0){
            // console.log(username)
            games[level][gameId]['sockets'].push(username)
        }

        // console.log(`Socket Joined Room -> ${gameId} -> ${username}`)
    
        currentGameUsers += 1
        

        // move user into the game room
        socket.join(+gameId.toString())

        // if there are two users send them a message to start to play
        if(getGameSockets(level,gameId).length == 2){
            // console.log(getGameSockets(level,gameId))
            io.to(+gameId.toString()).emit("start play",getGameSockets(level,gameId))
        }
    })


    socket.on("ready for the question",() => {

        // games[gameId]['readyForQuestion'] = games[gameId]['readyForQuestion'] && games[gameId]['readyForQuestion'].length  ? games[gameId]['readyForQuestion']  : []  

        initializeAndResetGameReadyState(userLevel,gameId)

        if(getReadyStateForGame(userLevel,gameId).indexOf(username) < 0 ){
            getReadyStateForGame(userLevel,gameId).push(username)
        }

        if(getReadyStateForGame(userLevel,gameId).length == 2){

            const {expression,numOne,numTwo,sign} = genBaseOnLevel(userLevel)

            nextAnswer = numOne + numTwo
            io.emit("question",expression,{numOne,numTwo,operator:sign,id:uuid.v1()})
        }

    })


    socket.on("answer",num => {
        // console.log(`Before Answer: ${getAnswersOfAGame(userLevel,gameId)}`)
        let keyword = 'answers'
        if(!getAnswersOfAGame(userLevel,gameId)){
            setGameAnswers(userLevel,gameId,[])
        }

        if(getAnswersOfAGame(userLevel,gameId).length == 2){
            setGameAnswers(userLevel,gameId,[])
        }

        

        if(getAnswersOfAGame(userLevel,gameId).indexOf(username) < 0 ){
            getAnswersOfAGame(userLevel,gameId).push(username)
        }
        
        if(getAnswersOfAGame(userLevel,gameId).length == 2){
           
            io.emit("correction",nextAnswer)
            setGameAnswers(userLevel,gameId,[])
        }

        // console.log(`After Answer: ${getAnswersOfAGame(userLevel,gameId)}`)
        
    })



    socket.on("game score",score => {
        let keyword = 'rightAnswers'
        const [setAnswers,getAnswres] = createGetterAndSetterForASubComponent(userLevel,gameId,keyword)
        if(!getAnswres()){
            setAnswers([])
        }

        if(getAnswres().length == 2){
            setAnswers([])
        }

        console.log(username)

        if(getAnswres().indexOf({username,rightAnswers:score}) < 0 ){
            getAnswres().push({username,rightAnswers:score})
        }
        
        if(getAnswres().length == 2){
            io.emit("game winner",games[userLevel][gameId][keyword])
           setAnswers([])
        }
    })

    socket.on('finish game',() => {
        socket.leave(gameId.toString())
        socket.emit("game is finished")
    })
   
})


server.listen(8000,() => {
    console.log("Server is listening...")
})
