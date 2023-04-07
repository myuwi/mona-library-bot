import * as fs from 'fs';
import * as path from 'path';

import { __rootdir__ } from './root';
import { Config } from './types';

const configFile = path.join(__rootdir__, '..', 'config.json');
export const config: Config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
