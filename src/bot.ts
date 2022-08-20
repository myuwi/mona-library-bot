import { MClient } from './client/MClient';

const client = new MClient()
  // .on('debug', console.log)
  .on('warn', console.log);

client.run();
