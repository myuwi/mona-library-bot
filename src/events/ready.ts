import chalk from 'chalk';
import { MClient } from '../client/MClient';

export const event = async (client: MClient) => {
    console.log(chalk.cyan(`Logged in as ${client.user!.tag}`));
};
