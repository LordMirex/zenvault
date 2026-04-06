import dotenv from 'dotenv';
import { buildConfig } from './config-utils.mjs';

dotenv.config({ quiet: true });

export const config = buildConfig(process.env);
