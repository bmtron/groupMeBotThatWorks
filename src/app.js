require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const https = require('https')
const axios = require('axios')
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
function sarcastic(str) {
    str = str.toLowerCase();
    str = str.split('');
  
    for (let i = 0; i < str.length - 1; i++) {
      let rand = Math.floor((Math.random() * 10) + 1);
      if (rand < 5) {
       str[i] = str[i].toUpperCase();
      }
    }
    str = str.join('')
    return str;
  }
  function getMeme() {
      let meme;
      let subs = ['BikiniBottomTwitter', 'dankmemes', 'PrequelMemes', 'lotrmemes']
      let randomSub = Math.floor(Math.random() * 4) + 1;
      let randomPost = Math.floor(Math.random() * 25) + 1;
      axios.get(`http://www.reddit.com/r/${subs[randomSub]}/new.json?sort=hot`)
      .then(response => {
        
          meme = response.data.data.children[randomPost].data.url
          
          return meme
      }).catch(error => {
          console.log(error)
      })
  }
function sendMessage(text) {
    let message = text;
    let response;
    let command = false
    let meme = false;
    switch (message.text) {
        case "!memes":
            meme = true;
            response = getMeme();
            break;
        case "!bot":
            command = true;
            response = "Current commands: !test, !stinky"
            break;
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
    
    if (meme) {
        let meme;
      let subs = ['BikiniBottomTwitter', 'dankmemes', 'PrequelMemes', 'lotrmemes']
      let randomSub = Math.floor(Math.random() * 4) + 1;
      let randomPost = Math.floor(Math.random() * 25) + 1;
      axios.get(`http://www.reddit.com/r/${subs[randomSub]}/new.json?sort=hot`)
      .then(response => {
        
          meme = response.data.data.children[randomPost].data.url
          const body = {
            "bot_id": process.env.BOT_ID,
            "text": meme
        }
        const botReq = https.request(options, res => {
            console.log('works')
        })
        botReq.end(JSON.stringify(body));
          
      }).catch(error => {
          console.log(error)
      })
    }
    
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