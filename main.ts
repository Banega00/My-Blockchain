import {config} from 'dotenv'
config()

import { createServer } from 'http';
import app from "./src/app";

export const PORT = process.env.PORT ?? 8000

export const server = createServer(app);
server.listen(PORT, () =>{
    console.log(`Server is up, and listening on port ${PORT}`)
})

if(process.env.IS_ROOT_NODE?.toLowerCase() == 'true'){
    console.log("ROOT NODE DEPLOYED")
}