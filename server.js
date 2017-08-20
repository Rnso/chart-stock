import config from './config'
import express from 'express'
import path from 'path'


const server = express()

server.use(express.static('dist'))


server.listen(config.port, () => {
    console.info('Express Listening on port:', config.port)
})
