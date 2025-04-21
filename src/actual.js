import api from '@actual-app/api';

export async function connectToActual() {
  await api.init({
    dataDir: '/tmp',
    serverURL: process.env.ACTUAL_SERVER,
    password: process.env.ACTUAL_PASSWORD
  });
  await api.downloadBudget(process.env.ACTUAL_BUDGET_ID);
}

export async function shutdownActual() {
  await api.shutdown();
}

export async function addTransaction(info) {
  const { date, payee, amount, cardLast6 } = info;
  const cents = Math.round(parseFloat(amount.replace(',', '.')) * 100);

  const transaction = {
    date,
    amount: -cents,
    payee_name: payee,
    notes: `AutoAMEX: Card ending in ${cardLast6}`,
    cleared: false
  };

  const result = await api.importTransactions(process.env.ACTUAL_ACCOUNT_ID, [transaction]);

  if (result.errors.length > 0) {
    console.error('❌ Error:', result.errors);
  } else {
    console.log('✔ Added:', transaction);
  }
}

export async function listAccounts() {
  try {

    // Fetch the list of accounts
    const accounts = await api.getAccounts();  
    console.log('💼 Accounts and IDs:');
    accounts.forEach(account => {
      console.log(`- Name: ${account.name}, ID: ${account.id}`);
    });

    // Shutdown the API connection
    await api.shutdown();
  } catch (error) {
    console.error('❌ Error while listing accounts:', error);
    process.exit(1);
  }
}
