import dotenv from 'dotenv';
import { buildConfig } from './config-utils.mjs';

dotenv.config();

export const config = buildConfig(process.env);
