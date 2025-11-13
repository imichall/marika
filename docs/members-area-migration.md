## Členská sekce – nasazení & migrace dat

Tento dokument shrnuje, co je potřeba udělat po nasazení nové členské sekce, aby se do ní přenesla data ze starého webu.

### 1. Databázové migrace

1. Pusťte nové SQL skripty na produkčním Supabase projektu (ideálně přes **SQL Editor** nebo `psql`):
   - `server/config/database/migrations/20251109_add_members_area.sql`
   - pokud používáte seed skripty, aktualizujte i `server/config/database/users.sql` a znovu jej spusťte pouze v případě, že stav databáze potřebujete rebuildnout.
2. Po aplikaci migrací zkontrolujte nové tabulky:
   - `repertoire_items`, `repertoire_files`
   - `member_directory`
   - `member_resources`
   - nové řádky v `permissions` a `user_permissions`
3. Migrace zároveň vytvoří privátní Supabase buckety `repertoire` a `member-resources` a nastaví na ně RLS politiky:
   - ověřte v Supabase sekci **Storage → Buckets**, že se vytvořily.
   - pokud jste bucket měli vytvořený ručně, ujistěte se, že se nenarušily existující objekty.

### 2. Nastavení oprávnění

1. Přihlaste se do **Administrace → Správa oprávnění** a zkontrolujte nové sekce:
   - *Repertoár*, *Členský seznam*, *Dokumenty ke stažení*, *Členská sekce*
2. Editoři mají po migraci automaticky přidělená práva na správu repertoáru a dokumentů. Pokud mají mít právo mazat záznamy členů nebo not, zapněte jim akci **Smazat**.
3. Vieweři mají výchozí přístup pouze pro čtení. Pokud potřebují upravovat, přidejte oprávnění ručně.

### 3. Přenos repertoáru ze starého webu

1. Stáhněte si data z původní členské sekce:
   - exportujte seznam skladeb (autor, název, poznámka) do CSV.
   - stáhněte všechny notové soubory; doporučuji zachovat strukturu složek podle skladby.
2. Připravte importní CSV s povinnými sloupci:

   | title | authors | description | files |
   | --- | --- | --- | --- |
   | Hymna Mariky | Petr Diviš | volitelná poznámka | soprán.pdf\|alt.pdf |

   Sloupec `files` obsahuje názvy souborů oddělené svislítkem. Ukázkový skript pro import najdete níže.
3. Pomocí Node skriptu nahrajte data:

```bash
# 1) nainstalujte závislosti
npm install @supabase/supabase-js csv-parse

# 2) proveďte import
node scripts/import-repertoire.js repertoire.csv ./noty/
```

`scripts/import-repertoire.js` (ukázka):

```javascript
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const [,, csvPath, filesDir] = process.argv;
const supabase = createClient(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rows = parse(fs.readFileSync(csvPath), { columns: true, skip_empty_lines: true });

for (const row of rows) {
  const { data: item, error: insertError } = await supabase
    .from('repertoire_items')
    .insert({
      title: row.title,
      authors: row.authors || null,
      description: row.description || null
    })
    .select()
    .single();

  if (insertError) throw insertError;

  if (row.files) {
    for (const fileName of row.files.split('|')) {
      const absolutePath = path.join(filesDir, fileName.trim());
      const fileBuffer = fs.readFileSync(absolutePath);

      const storagePath = `${item.id}/${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('repertoire')
        .upload(storagePath, fileBuffer, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      await supabase.from('repertoire_files').insert({
        repertoire_id: item.id,
        file_name: fileName,
        storage_path: storagePath
      });
    }
  }
}
```

> **Poznámka:** skript používá service-role klíč. Spouštějte jej pouze z důvěryhodného prostředí a klíč po importu zakažte nebo změňte.

### 4. Import členů

1. Připravte CSV s hlavními poli: `full_name, voice_part, joined_at, left_at, email, phone, notes, is_active`.
2. Buď použijte Supabase **Table editor** (umožňuje CSV import přímo), nebo si upravte obdobný skript jako výše (`supabase.from('member_directory').insert(...)`).

### 5. Dokumenty ke stažení

1. V administraci přejděte do sekce **Členská sekce → Ke stažení**.
2. Postupně nahrajte soubory (logo, stanovy, kroniku). Každý dokument může mít vlastní kategorii.
3. Pokud chcete importovat hromadně, využijte storage API stejně jako u repertoáru (`bucket member-resources` a tabulka `member_resources`).

### 6. Testovací scénář

- přihlášení běžným členem → vidí repertoár, soubory lze stáhnout, lze exportovat do Excelu.
- přihlášení editorem → může přidávat/mazat skladby, upravovat seznam členů, nahrávat dokumenty.
- přihlášení adminem → má plná práva, v administraci přibyly nové sekce v matrici oprávnění.

Po úspěšném otestování můžete starou členskou sekci vypnout a z navigace původního webu odebrat starý formulář.

