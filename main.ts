import {config} from 'dotenv'
config()

import app from "./src/app";

const PORT = process.env.PORT ?? 8000

app.listen(PORT, () =>{
    console.log(`Server is up, and listening on port ${PORT}`)
})