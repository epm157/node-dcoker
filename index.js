
const {MONGO_IP, MONGO_PORT, MONGO_USER, MONGO_PASSWORD, SESSION_SECRET, REDIS_URL, REDIS_PORT} = require('./config')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const redis = require('redis')
const RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})




const app = express()
app.use(cors({}))
app.use(express.json())

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const DB_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
const connectWithRetry = () => {
    mongoose.connect(DB_URL)
        .then(() => console.log("Successfully connected to DB"))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        })
}

connectWithRetry()

app.enable("trust proxy")

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30 * 1000
    }
}))

app.get('/api/v1', (req, res) => {
    console.log('Request came!')
    return res.send('Hello world!!!')
})

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/users', userRouter)


const port = process.env.PORT || 5002;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
}

start()



