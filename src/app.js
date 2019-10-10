require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const https = require('https')
const app = express()
const jsonParser = express.json()
const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'common')

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

function pingBotWithGet() {
    const options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    }
    const body = {
        "bot_id": process.env.BOT_ID,
        "text": "stinky"
    }
    const botReq = https.request(options, res => {
        console.log('works')
    })
    botReq.end(JSON.stringify(body));
}

function sendMessage(text) {
    let message = text;
    let response;
    let command = false
    switch (message.text) {
        case "!test":
            command = true;
            response = "This is working.";
            break;
        case "!stinky":
            command = true;
            response = "Someone needs to shower.";
            break;
    }
    const options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    }

    
    if (command) {
        const body = {
            "bot_id": process.env.BOT_ID,
            "text": response
        }
        const botReq = https.request(options, res => {
            console.log('works')
        })
        botReq.end(JSON.stringify(body));
    }
    
    console.log(command)
}
app.get('/', (req, res) => {
    pingBotWithGet()
    res.send('works')
})
app.post('/', jsonParser, (req, res) => {
    let message = req.body
    sendMessage(message)
    //console.log(req.body.text)
    res.json(req.body)
})
app.use(function errorHandler(error, req, res, next) {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    }
    else {
        console.log(error)
        response = { message: error.message, error}
    }
    res.status(500).json(response)
})
module.exports = app