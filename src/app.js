const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const {port} = require('./config')

const platformRoutes = require('./routes')

function start() {
    const app = express()

    app.use(helmet())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    app.use('/api/v1', platformRoutes)

    app.listen(port, ()=>{
        console.log(`listening on port: ${port}`)
    })
}

module.exports.start = start;

