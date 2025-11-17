# Návod k nasazení systému oddílů členské sekce

## ✅ Co bylo vytvořeno

### 1. Databázové schéma
**Soubor:** `server/config/database/migrations/20251113_add_member_departments.sql`

**Nové tabulky:**
- `member_departments` - oddíly s jejich hesly
- `member_users` - členové přiřazení k oddílům
- `member_login_logs` - záznamy o přihlášení

**Funkce:**
- `verify_department_password()` - ověření hesla oddílu
- `hash_department_password()` - vytvoření bcrypt hashe

**Výchozí oddíly:**
- Alt (heslo: alt2024)
- Bas (heslo: bas2024)
- Hosté (heslo: hoste2024)
- Hudebníci (heslo: hudebnici2024)
- Podpora (heslo: podpora2024)
- Soprán (heslo: sopran2024)
- Vedení (heslo: vedeni2024)

### 2. API Endpoints
- `POST /api/member-departments/create` - vytvoření oddílu
- `POST /api/member-departments/update-password` - změna hesla oddílu
- `POST /api/member-auth/login` - přihlášení pomocí oddílu

### 3. Composables
- `useMemberDepartments` - správa oddílů
- `useMemberManagement` - správa členů

### 4. Admin rozhraní
**Soubor:** `pages/admin/clenska-sekce-uzivatele.vue`

Nová administrační stránka s třemi záložkami:
- **Oddíly** - správa oddílů a jejich hesel
- **Členové** - správa členů a jejich přiřazení k oddílům
- **Historie přihlášení** - sledování přihlášení

### 5. Přihlašovací systém
**Upravený soubor:** `pages/clenska-sekce/prihlaseni.vue`

Přidány dvě možnosti přihlášení:
- **E-mail** - pro admin uživatele (stávající systém)
- **Oddíl** - pro členy sboru (nový systém)

### 6. Middleware
**Upravený soubor:** `middleware/members.ts`

Rozšířeno o podporu přihlášení pomocí oddílu (localStorage).

## 🚀 Postup nasazení

### Krok 1: Spuštění migrace

1. Přihlaste se do Supabase projektu
2. Otevřete **SQL Editor**
3. Zkopírujte a spusťte obsah souboru:
   ```
   server/config/database/migrations/20251113_add_member_departments.sql
   ```
4. Zkontrolujte, že migrace proběhla bez chyb

### Krok 2: Změna výchozích hesel

⚠️ **DŮLEŽITÉ:** Ihned po migraci změňte výchozí hesla všech oddílů!

```sql
-- Příklad změny hesla pro oddíl Alt
UPDATE member_departments
SET password_hash = crypt('noveHesloAlt123', gen_salt('bf', 10))
WHERE name = 'alt';
```

Nebo použijte admin rozhraní:
1. Přejděte do **Admin → Členská sekce - Správa uživatelů**
2. Na záložce **Oddíly** klikněte u každého oddílu na **Heslo**
3. Zadejte nové bezpečné heslo

### Krok 3: Přidání členů

**Možnost A: Manuálně přes admin rozhraní**
1. Přejděte do **Admin → Členská sekce - Správa uživatelů**
2. Záložka **Členové** → **Přidat člena**
3. Vyplňte údaje a vyberte oddíl

**Možnost B: Import z CSV souborů**

Máte připravené CSV soubory v `/backup`:
- `MarikaSingers_seznam_clenu-alt.csv`
- `MarikaSingers_seznam_clenu-bas.csv`
- atd.

Vytvořte importní skript nebo použijte Supabase Table Editor pro CSV import.

Ukázkový import skript:

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Získání ID oddílu
const { data: dept } = await supabase
  .from('member_departments')
  .select('id')
  .eq('name', 'alt')
  .single()

// Import členů
const csv = fs.readFileSync('./backup/MarikaSingers_seznam_clenu-alt.csv', 'utf-8')
const records = parse(csv, { columns: true })

for (const record of records) {
  await supabase.from('member_users').insert({
    department_id: dept.id,
    full_name: record.full_name,
    email: record.email || null,
    phone: record.phone || null,
    is_active: true
  })
}
```

### Krok 4: Testování

1. **Test přihlášení oddílem:**
   - Otevřete `/clenska-sekce/prihlaseni`
   - Vyberte záložku "Oddíl"
   - Zvolte oddíl a zadejte heslo
   - Měli byste se úspěšně přihlásit

2. **Test admin rozhraní:**
   - Přihlaste se jako admin
   - Otevřete **Členská sekce - Správa uživatelů**
   - Vyzkoušejte vytvoření/úpravu oddílu
   - Vyzkoušejte přidání/úpravu člena

3. **Test historie přihlášení:**
   - Po několika přihlášeních různých oddílů
   - Zkontrolujte záložku **Historie přihlášení**
   - Měli byste vidět záznamy s IP adresami

### Krok 5: Distribuce hesel

Sdělte vedoucím jednotlivých oddílů jejich nová hesla bezpečným způsobem:
- Osobně
- Přes šifrovanou zprávu
- **NIKDY** je nesdílejte veřejně nebo emailem

## 📝 Důležité poznámky

### Bezpečnost
- Hesla oddílů jsou hashována pomocí bcrypt
- Každé přihlášení je logováno (IP, user agent, čas)
- Doporučujeme měnit hesla minimálně jednou ročně

### Oprávnění
- **Administrátoři** - plný přístup ke všem oddílům a členům
- **Editoři** - mohou spravovat členy, ale nemohou mazat oddíly
- **Členové** - přihlašují se přes společné heslo oddílu

### Kompatibilita
- Stávající admin uživatelé se nadále přihlašují emailem
- Nový systém oddílů nijak neovlivní existující autentizaci
- Oba systémy fungují souběžně

### Migrace dat
- Databázová migrace je idempotentní (lze spustit opakovaně)
- Neruší žádná existující data
- Přidává pouze nové tabulky a oprávnění

## 🔧 Řešení problémů

### Migrace selže na již existujících tabulkách
```sql
-- Pokud je potřeba začít znovu:
DROP TABLE IF EXISTS member_login_logs CASCADE;
DROP TABLE IF EXISTS member_users CASCADE;
DROP TABLE IF EXISTS member_departments CASCADE;
-- Pak spusťte migraci znovu
```

### Heslo oddílu nefunguje
1. Zkontrolujte, že je oddíl aktivní (`is_active = true`)
2. Ověřte název oddílu (case-sensitive)
3. Zkuste heslo resetovat přes admin rozhraní

### Členové nevidí členskou sekci
- Oddílové přihlášení poskytuje přístup ke všem sekcím
- Middleware automaticky povolí přístup při přihlášení oddílem
- Zkontrolujte, že je v localStorage uložen `memberDepartment`

### Import členů z CSV selhal
- Ověřte formát CSV (UTF-8 encoding)
- Zkontrolujte, že department_id existuje
- Zkontrolujte SQL logy v Supabase

## 📚 Dokumentace

Detailní uživatelská dokumentace je dostupná v:
- `docs/clenska-sekce-uzivatele.md` - kompletní návod pro administrátory a členy

## ✅ Kontrolní seznam nasazení

- [ ] Migrace spuštěna v Supabase
- [ ] Změněna všechna výchozí hesla oddílů
- [ ] Importováni členové (nebo připraven proces pro import)
- [ ] Otestováno přihlášení oddílem
- [ ] Otestováno admin rozhraní
- [ ] Hesla distribuována vedoucím oddílů
- [ ] Ověřena historie přihlášení
- [ ] Dokumentace sdílena s adminy

## 🎉 Hotovo!

Systém je nyní připraven k použití. Členové se mohou přihlašovat pomocí hesel svých oddílů a vy máte plný přehled o tom, kdo se kdy přihlásil.

