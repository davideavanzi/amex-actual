import dotenv from 'dotenv';
dotenv.config();

import { shutdownActual, connectToActual, listAccounts } from './actual.js';

console.log('Connecting to Actual Budget');
await connectToActual();

console.log('Listing Accounts');
listAccounts();

console.log('Shutting down connection');
await shutdownActual();