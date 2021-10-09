import { MClient } from './client/MClient';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new MClient()
    .on('debug', console.log)
    .on('warn', console.log);

client.start(process.env.TOKEN!);
