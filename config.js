// import { Config } from 'dotenv'
require('dotenv').config()

// config()

const PORT = process.env.PORT || 8085
const HOST = process.env.HOST || 'localhost'
const USER = process.env.USER || 'admin'
const PASSWORD = process.env.PASSWORD || 'Dima.zdla1'
const DATABASE = process.env.DATABASE || 'hola'
// export const HOST = process.env.HOST || 'localhost'

module.exports = {
    PORT, HOST, USER, PASSWORD, DATABASE
}
