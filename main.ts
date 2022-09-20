import {config} from 'dotenv'
config()

import { env } from './src/helpers';

import { createServer } from 'http';
import app from "./src/app";

export const PORT = env.port ?? 8000

export const server = createServer(app);
server.listen(PORT, () =>{
    console.log(`Server is up, and listening on port ${PORT}`)
})

if(env.is_root_node){
    console.log("ROOT NODE DEPLOYED")
}