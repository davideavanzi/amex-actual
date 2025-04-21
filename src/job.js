import dotenv from 'dotenv';
dotenv.config();

import { fetchUnseenEmails } from './email.js';
import { extractTransactionInfoFromHTML } from './parser.js';
import { connectToActual, addTransaction, shutdownActual } from './actual.js';

import cron from 'node-cron';

async function processEmails() {
  console.log('⏰ Running transaction sync...');

  try {
    const emails = await fetchUnseenEmails();
    if (emails.length === 0) return console.log('📭 No new emails.');

    await connectToActual();
    for (const email of emails) {
      const info = extractTransactionInfoFromHTML(email.html);
      if (info.date && info.payee && info.amount) {
        await addTransaction(info);
      } else {
        console.log('⚠️ Incomplete transaction info:', info);
      }
    }

    await shutdownActual();
  } catch (err) {
    console.error('❌ Error during job:', err);
  }
}

// Run immediately
processEmails();

// Schedule: run every hour
cron.schedule('0 * * * *', () => {
  processEmails();
});
