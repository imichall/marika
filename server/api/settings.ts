import { serverSupabaseClient } from '#supabase/server';

interface BankAccount {
  group_name: string;
  account_number: string;
  bank_code: string;
}

interface Settings {
  marikaSingers: { accountNumber: string; bankCode: string };
  five: { accountNumber: string; bankCode: string };
  voices: { accountNumber: string; bankCode: string };
  [key: string]: { accountNumber: string; bankCode: string };
}

// Funkce pro extrakci čísla účtu z IBAN
const extractAccountFromIBAN = (iban: string) => {
  if (!iban) return '';
  // IBAN formát: CZ3030300000002350851015
  // Odstraníme prefix CZ, kód banky (4 znaky) a přední nuly
  const match = iban.match(/^CZ\d{4}0*(\d+)$/);
  if (!match) return iban;
  return match[1];
};

// Funkce pro vytvoření IBAN
const createIBAN = (accountNumber: string, bankCode: string) => {
  if (!accountNumber) return '';
  const paddedAccount = accountNumber.padStart(16, '0');
  return `CZ${bankCode}${paddedAccount}`;
};

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  // GET request - načtení nastavení
  if (event.method === 'GET') {
    try {
      console.log('Fetching bank accounts from Supabase...');
      const { data: bankAccounts, error } = await client
        .from('bank_accounts')
        .select('*') as { data: BankAccount[] | null; error: any };

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw bank accounts data:', bankAccounts);

      // Převedeme na formát, který očekává frontend
      const settings: Settings = {
        marikaSingers: {
          accountNumber: '',
          bankCode: '3030'
        },
        five: {
          accountNumber: '',
          bankCode: '3030'
        },
        voices: {
          accountNumber: '',
          bankCode: '3030'
        }
      };

      // Naplníme daty z databáze
      if (bankAccounts) {
        bankAccounts.forEach(account => {
          console.log('Processing account:', account);
          const key = account.group_name.toLowerCase().replace(/\s+/g, '');
          console.log('Mapped key:', key);
          const extractedAccount = extractAccountFromIBAN(account.account_number);
          console.log('Extracted account number:', extractedAccount);

          if (key === 'marikasingers' || key === 'five' || key === 'voices') {
            settings[key === 'marikasingers' ? 'marikaSingers' : key] = {
              accountNumber: extractedAccount,
              bankCode: account.bank_code
            };
          }
        });
      }

      console.log('Final settings object:', settings);
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw createError({
        statusCode: 500,
        message: 'Chyba při načítání nastavení'
      });
    }
  }

  // POST request - uložení nastavení
  if (event.method === 'POST') {
    try {
      const body = await readBody(event) as Settings;
      console.log('Received POST data:', body);

      // Připravíme data pro upsert
      const upsertData: BankAccount[] = Object.entries(body).map(([key, value]) => ({
        group_name: key === 'marikaSingers' ? 'Marika Singers' :
                   key === 'five' ? 'Five' : 'Voices',
        account_number: createIBAN(value.accountNumber, value.bankCode),
        bank_code: value.bankCode
      }));

      console.log('Upserting data:', upsertData);

      const { error } = await client
        .from('bank_accounts')
        .upsert(upsertData, {
          onConflict: 'group_name'
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }

      console.log('Upsert successful');
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      throw createError({
        statusCode: 500,
        message: 'Chyba při ukládání nastavení'
      });
    }
  }
});