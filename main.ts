import {config} from 'dotenv'
config()
const PORT = process.env.PORT ?? 8000

console.log(`PORT JE ${PORT}`)

import app from "./src/app";


app.listen(PORT, () =>{
    console.log(`Server is up, and listening on port ${PORT}`)
})