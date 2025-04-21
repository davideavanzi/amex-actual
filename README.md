# amex-actual

American Express email parser to automatically add expenses to actual budget

(definitely, totally not ready for production use!)

## Setup

1. Set up amex notifications in your private area so that every expense is notified
2. Create a gmail account to receive amex notifications
3. Enable 2fa and create an app password at <https://myaccount.google.com/apppasswords>
4. Forward all amex notifications to the newly created email address
5. Make sure the emails you are receiving from amex come from one of the sender addresses in the `.env.example` file
6. Make sure your Actual Budget instance is at the same version of the API used in the `package.json` file
7. `cp .env.example .env` and fill the required info
8. Build the image with `docker compose build`
9. Run the `listAccounts.js` file to fetch the correct account
10. Add the account id of the correct budget to the `.env` file
11. `docker compose up -d`

## TO DO:

- Smart way to list accounts in the setup process
- Multi language support (parse emails in different languages)
- Multi currency support (parse emails containinga currency different than 0)
- Multi card support (mapping cards and accounts)
- Support for encrypted Actual DB
- Adaptable frequency for pulling new emails
- Add unique imported_id for deduplication