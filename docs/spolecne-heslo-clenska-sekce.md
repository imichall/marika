# Společné heslo do členské sekce

## Přehled

Systém členské sekce nyní používá **jedno společné heslo** pro všechny oddíly místo samostatných hesel pro každý oddíl.

## Jak to funguje

### Přihlašování členů

Členové se přihlašují pomocí:
1. **Svůj e-mail** - e-mail registrovaný v systému
2. **Společné heslo** - heslo společné pro všechny oddíly

Oddíl se automaticky přiřadí na základě e-mailu člena.

### Výchozí heslo

Po nasazení migrace je výchozí heslo: `marika2024`

**⚠️ DŮLEŽITÉ:** Ihned po nasazení změňte výchozí heslo na stránce [Nastavení hesla](/clenska-sekce/nastaveni-hesla).

## Správa hesla

### Změna hesla

Heslo lze změnit pouze v administraci:

1. Přihlaste se do administrace (`/admin`)
2. V levém menu přejděte na **Systém** → **Uživatelé** (`/admin/uzivatele`)
3. Klikněte na hlavní tab **"Členská sekce"**
4. Klikněte na sub-tab **"Nastavení hesla"**
4. Zadejte:
   - Současné heslo
   - Nové heslo (min. 6 znaků)
   - Potvrzení nového hesla
5. Klikněte na "Změnit heslo"

### Oprávnění

Změna hesla je dostupná pouze pro administrátory a editory, kteří mají přístup k sekci "Uživatelé" v administraci.

## Technická implementace

### Databáze

- Heslo je uloženo v tabulce `settings` jako `member_common_password_hash`
- Heslo je hashováno pomocí bcrypt (`crypt` funkce s `gen_salt('bf')`)

### API Endpointy

- `POST /api/member-auth/login` - přihlášení s ověřením společného hesla
- `POST /api/member-auth/update-common-password` - změna společného hesla

### RPC Funkce

- `verify_member_common_password(p_password TEXT)` - ověření hesla
- `set_member_common_password(p_password TEXT)` - nastavení nového hesla

### Migrace

Soubor: `server/config/database/migrations/20251123_add_member_common_password.sql`

Spusťte migraci:
```bash
# V Supabase SQL Editor nebo přes migrations systém
```

## Bezpečnost

### Audit log

Každá změna hesla se zaznamenává do audit logu včetně:
- E-mailu uživatele, který heslo změnil
- Časového razítka
- IP adresy

### Přihlášení

Každé přihlášení člena se zaznamenává do `member_login_logs` včetně:
- ID oddílu
- ID člena
- IP adresy
- User agent
- Časového razítka

## Doporučení

### Silné heslo

Doporučujeme používat silné heslo s:
- Minimálně 8-12 znaky
- Kombinací velkých a malých písmen
- Čísly
- Speciálními znaky

### Sdílení hesla

- Sdílejte heslo pouze s aktivními členy sboru
- Používejte bezpečné kanály pro sdílení (ne e-mail v čistém textu)
- Změňte heslo pokud opustí významný počet členů

### Pravidelná změna

Doporučujeme měnit heslo:
- Minimálně jednou ročně
- Po odchodu většího počtu členů
- Při podezření na kompromitaci

## Migrace ze starého systému

Pokud jste používali oddílová hesla, stará hesla zůstanou v databázi, ale nebudou se už používat. Systém nyní kontroluje pouze společné heslo.

## Podpora

Pokud máte problémy s heslem, kontaktujte administrátora na info@marikasingers.cz

