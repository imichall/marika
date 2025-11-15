# Členská sekce - Správa uživatelů a oddílů

## Přehled

Systém umožňuje správu členů sboru organizovaných do oddílů (hlasů). Každý oddíl má společné heslo, které se používá pro přihlášení do členské sekce.

## Struktura

### Oddíly (Departments)
- **Alt** - oddíl altů
- **Bas** - oddíl basů
- **Hosté** - hosté sboru
- **Hudebníci** - hudebníci sboru
- **Podpora** - podpůrný tým
- **Soprán** - oddíl sopránů
- **Vedení** - vedení sboru

Každý oddíl má:
- Unikátní název (ID)
- Zobrazovaný název
- Společné heslo (hashované pomocí bcrypt)
- Popis (volitelný)
- Status (aktivní/neaktivní)

### Členové (Members)
Jednotliví členové přiřazení k oddílům s těmito informacemi:
- Jméno a příjmení
- Oddíl (povinné)
- Email (volitelný)
- Telefon (volitelný)
- Poznámky (volitelné)
- Status (aktivní/neaktivní)

### Historie přihlášení (Login Logs)
Systém zaznamenává:
- Datum a čas přihlášení
- Oddíl, který se přihlásil
- IP adresu
- User agent prohlížeče

## Použití

### Pro administrátory

#### 1. Správa oddílů

Navigace: **Admin** → **Členská sekce - Správa uživatelů** → záložka **Oddíly**

**Vytvoření oddílu:**
1. Klikněte na "Přidat oddíl"
2. Zadejte:
   - Název (ID) - např. "alt", "bas" (malá písmena, bez diakritiky)
   - Zobrazovaný název - např. "Alt", "Bas"
   - Heslo - minimálně 6 znaků (toto heslo budou používat všichni členové oddílu)
   - Popis (volitelný)
3. Klikněte "Vytvořit"

**Úprava oddílu:**
1. U vybraného oddílu klikněte na "Upravit"
2. Můžete změnit zobrazovaný název, popis a aktivovat/deaktivovat oddíl
3. Název (ID) oddílu nelze měnit

**Změna hesla oddílu:**
1. U vybraného oddílu klikněte na "Heslo"
2. Zadejte nové heslo (minimálně 6 znaků)
3. Klikněte "Změnit heslo"
4. **Důležité:** Po změně hesla informujte všechny členy oddílu o novém heslu!

#### 2. Správa členů

Navigace: **Admin** → **Členská sekce - Správa uživatelů** → záložka **Členové**

**Přidání člena:**
1. Klikněte na "Přidat člena"
2. Vyplňte:
   - Jméno (povinné)
   - Oddíl (povinné)
   - Email (volitelný, pro kontakt)
   - Telefon (volitelný)
   - Poznámky (volitelné)
   - Zaškrtněte "Aktivní člen"
3. Klikněte "Přidat"

**Úprava člena:**
1. U vybraného člena klikněte na ikonu úprav (tužka)
2. Upravte potřebné údaje
3. Můžete také změnit oddíl nebo deaktivovat člena
4. Klikněte "Uložit"

**Smazání člena:**
1. U vybraného člena klikněte na ikonu smazání (koš)
2. Potvrďte smazání

**Filtrování členů:**
- Použijte dropdown "Všechny oddíly" k zobrazení členů konkrétního oddílu

#### 3. Historie přihlášení

Navigace: **Admin** → **Členská sekce - Správa uživatelů** → záložka **Historie přihlášení**

Zde můžete sledovat:
- Kdy se jednotlivé oddíly přihlásily
- Z jaké IP adresy
- Jaký prohlížeč používali

### Pro členy sboru

#### Přihlášení do členské sekce

1. Přejděte na stránku přihlášení členské sekce
2. Vyberte záložku **Oddíl**
3. Z rozbalovacího menu vyberte svůj oddíl (Alt, Bas, Soprán, atd.)
4. Zadejte heslo vašeho oddílu (které jste obdrželi od vedení)
5. Klikněte "Přihlásit se"

**Poznámka:** Stále je možné se přihlásit i pomocí e-mailu, pokud máte admin účet.

## Technické detaily

### Databázové tabulky

- `member_departments` - oddíly s hesly
- `member_users` - členové přiřazení k oddílům
- `member_login_logs` - záznamy o přihlášení

### Bezpečnost

- Hesla oddílů jsou hashována pomocí bcrypt s 10 iteracemi
- Každé přihlášení je zaznamenáno včetně IP adresy a user agenta
- Administrátoři mají plný přístup ke všem oddílům a členům
- Editoři mohou spravovat členy, ale nemohou mazat oddíly

### API Endpoints

- `POST /api/member-departments/create` - vytvoření oddílu
- `POST /api/member-departments/update-password` - změna hesla oddílu
- `POST /api/member-auth/login` - přihlášení pomocí oddílu a hesla

## Migrace dat

### Spuštění migrace

Migrace vytvoří:
- Tabulky pro oddíly, členy a logy přihlášení
- Výchozí oddíly s hesly (formát: `nazevoddilu2024`)
- Potřebná oprávnění pro admin a editor role

```bash
# V Supabase SQL Editor spusťte:
# server/config/database/migrations/20251113_add_member_departments.sql
```

**DŮLEŽITÉ:** Po migraci změňte výchozí hesla všech oddílů!

### Import členů z CSV

Pokud máte existující data v CSV souborech (např. v `/backup`):

```javascript
// Ukázkový skript pro import
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const csvData = fs.readFileSync('./backup/MarikaSingers_seznam_clenu-alt.csv', 'utf-8')
const records = parse(csvData, { columns: true })

for (const record of records) {
  await supabase.from('member_users').insert({
    department_id: 'ID_ODDILU_ALT', // Získejte z member_departments
    full_name: record.full_name,
    email: record.email || null,
    phone: record.phone || null,
    is_active: true
  })
}
```

## Nejčastější otázky

**Q: Co se stane, když zapomenu heslo oddílu?**
A: Kontaktujte administrátora, který může heslo změnit v admin sekci.

**Q: Mohou členové jednoho oddílu vidět data jiných oddílů?**
A: Všichni členové mají stejný přístup do členské sekce, bez ohledu na oddíl. Oddíl slouží pouze k organizaci a přihlášení.

**Q: Lze mít individuální účty pro každého člena?**
A: Ano, můžete vytvořit klasické admin účty s emailem a heslem v sekci "Správa uživatelů". Ty pak mohou používat e-mailové přihlášení.

**Q: Jak často by se měla měnit hesla oddílů?**
A: Doporučujeme měnit hesla alespoň jednou ročně nebo kdykoliv dojde k podezření na kompromitaci.

**Q: Ovlivní tato změna stávající admin uživatele?**
A: Ne, stávající admin uživatelé se mohou nadále přihlašovat pomocí e-mailu a hesla. Oddíly jsou nová, doplňková možnost přihlášení.

## Podpora

V případě problémů kontaktujte technickou podporu nebo vytvořte issue na GitHubu projektu.

