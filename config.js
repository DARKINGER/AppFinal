import { Config } from 'dotenv'

config()

export const PORT = process.env.PORT || 8085
export const HOST = process.env.HOST || 'localhost'
export const USER = process.env.USER || 'admin'
export const PASSWORD = process.env.PASSWORD || 'Dima.zdla1'
export const DATABASE = process.env.DATABASE || 'hola'
// export const HOST = process.env.HOST || 'localhost'


