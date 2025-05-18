import { htmlToText } from 'html-to-text';

export function extractTransactionInfoFromHTML(html) {
  const text = htmlToText(html, { wordwrap: false });
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let date = null, payee = null, amount = null, cardLast6 = null;

  for (const line of lines) {
    if (!date && /^\d{2}-[a-z]{3}-\d{4}/i.test(line)) {
      const match = line.match(/^(\d{2}-[a-z]{3}-\d{4}) (.+)$/i);
      if (match) {
        date = match[1];
        payee = match[2];
      }
    }
    // Fallback for dd/mm/yyyy formats
    if (!date && /^\d{2}\/\d{2}\/\d{4}/.test(line)) {
      const match = line.match(/^(\d{2}\/\d{2}\/\d{4}) (.+)$/);
      if (match) {
        date = match[1];
        payee = match[2];
      }
    }

    const amountRegex = /[€]\s?(\d{1,3}(?:[.,]\d{2}))/g;

    // Find all matches in the text
    const allAmountMatches = [...text.matchAll(amountRegex)];

    if (allAmountMatches.length >= 2) {
      amount = allAmountMatches[1][1];  // second match
    } else if (allAmountMatches.length === 1) {
      amount = allAmountMatches[0][1];
    }

    if (!cardLast6 && /Ultime 6 cifre.*?: (\d{6})/.test(line)) {
      cardLast6 = line.match(/Ultime 6 cifre.*?: (\d{6})/)[1];
    }
  }

// Normalize date if needed
  if (date && /^\d{2}-[a-z]{3}-\d{4}$/i.test(date)) {
    
  const monthMap = {
    // English
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    // Italian
    gen: '01', feb: '02', mar: '03', apr: '04', mag: '05', giu: '06',
    lug: '07', ago: '08', set: '09', ott: '10', nov: '11', dic: '12'
  };


    const [d, mon, y] = date.toLowerCase().split('-');
    const m = monthMap[mon];

    if (m) {
      date = `${y}-${m}-${d}`;
    } else {
      throw new Error(`Invalid month in date: ${date}`);
    }
  }
  return { date, payee, amount, cardLast6 };
}
