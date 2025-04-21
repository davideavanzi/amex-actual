import Imap from 'imap';
import { simpleParser } from 'mailparser';

export async function fetchUnseenEmails() {
  const allowed = process.env.ALLOWED_SENDERS.split(',').map(e => e.trim().toLowerCase());

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.EMAIL,
      password: process.env.EMAIL_PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        servername: 'imap.gmail.com', // necessary for SNI
      },
      authTimeout: 3000,
    });

    const validEmails = [];

    function openInbox(cb) {
      imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', () => {
      openInbox((err, box) => {
        if (err) return reject(err);

        imap.search(['UNSEEN'], (err, results) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            imap.end();
            return resolve([]);
          }

          const f = imap.fetch(results, { bodies: '', markSeen: true });

          f.on('message', (msg) => {
            let raw = '';

            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                raw += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(raw);
                const sender = parsed.from?.value?.[0]?.address.toLowerCase();

                if (allowed.includes(sender) && parsed.html) {
                  validEmails.push({ html: parsed.html });
                }
              } catch (err) {
                console.error('❌ Error parsing message:', err);
              }
            });
          });

          f.once('error', (err) => {
            reject(err);
          });

          f.once('end', () => {
            imap.end();
            resolve(validEmails);
          });
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.once('end', () => {
      // Connection closed
    });

    imap.connect();
  });
}
