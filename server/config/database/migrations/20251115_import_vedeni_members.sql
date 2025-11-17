-- Import členů oddílu "Vedení"
-- Tento script importuje 3 členy ze starého systému do nové databáze

-- Nejprve se ujistíme, že oddíl "vedení" existuje
DO $$
DECLARE
  v_department_id uuid;
BEGIN
  -- Najdeme nebo vytvoříme oddíl "vedení"
  SELECT id INTO v_department_id
  FROM member_departments
  WHERE name = 'vedeni'
  LIMIT 1;

  -- Pokud oddíl neexistuje, vytvoříme ho
  IF v_department_id IS NULL THEN
    INSERT INTO member_departments (name, display_name, description, is_active, permissions)
    VALUES (
      'vedeni',
      'Vedení',
      'Vedení sboru',
      true,
      '{
        "repertoire_view": true,
        "repertoire_edit": true,
        "member_directory_view": true,
        "members_area_view": true,
        "member_resources_view": true,
        "member_resources_upload": true
      }'::jsonb
    )
    RETURNING id INTO v_department_id;

    RAISE NOTICE 'Vytvořen oddíl "Vedení" s ID: %', v_department_id;
  ELSE
    RAISE NOTICE 'Oddíl "Vedení" již existuje s ID: %', v_department_id;
  END IF;

  -- Importujeme členy (pouze pokud již neexistují dle emailu)

  -- 1. Divišová Marika
  IF NOT EXISTS (SELECT 1 FROM member_users WHERE email = 'marika.divisova@centrum.cz') THEN
    INSERT INTO member_users (
      department_id, full_name, email, phone,
      street, city, postal_code, full_address,
      birth_date, birth_place, is_active
    )
    VALUES (
      v_department_id,
      'Divišová Marika',
      'marika.divisova@centrum.cz',
      '737 289 982',
      'Bezručova 337',
      'Roztoky',
      '252 63',
      'Bezručova 337, 252 63 Roztoky',
      '1963-09-11',
      'Michalovce, SK',
      true
    );
    RAISE NOTICE 'Importován člen: Divišová Marika';
  ELSE
    RAISE NOTICE 'Člen Divišová Marika již existuje, přeskakuji';
  END IF;

  -- 2. Štok Jiří
  IF NOT EXISTS (SELECT 1 FROM member_users WHERE email = 'jiri.stok@seznam.cz') THEN
    INSERT INTO member_users (
      department_id, full_name, email, phone,
      street, city, postal_code, full_address,
      birth_date, birth_place, is_active
    )
    VALUES (
      v_department_id,
      'Štok Jiří',
      'jiri.stok@seznam.cz',
      '602 189 946',
      'Šebkova 1845',
      'Roztoky',
      '252 63',
      'Šebkova 1845, 252 63 Roztoky',
      '1971-01-04',
      'Písek',
      true
    );
    RAISE NOTICE 'Importován člen: Štok Jiří';
  ELSE
    RAISE NOTICE 'Člen Štok Jiří již existuje, přeskakuji';
  END IF;

  -- 3. Slavíková Daniela
  IF NOT EXISTS (SELECT 1 FROM member_users WHERE email = 'danaso@centrum.cz') THEN
    INSERT INTO member_users (
      department_id, full_name, email, phone,
      street, city, postal_code, full_address,
      birth_date, birth_place, is_active
    )
    VALUES (
      v_department_id,
      'Slavíková Daniela',
      'danaso@centrum.cz',
      '721 485 938',
      'Topělec 48',
      'Písek',
      '397 01',
      'Topělec 48, 397 01 Písek',
      '1994-11-14',
      'Písek',
      true
    );
    RAISE NOTICE 'Importován člen: Slavíková Daniela';
  ELSE
    RAISE NOTICE 'Člen Slavíková Daniela již existuje, přeskakuji';
  END IF;

  RAISE NOTICE 'Import dokončen!';
END $$;

-- Zobrazíme výsledek
SELECT
  mu.full_name AS "Jméno",
  mu.email AS "Email",
  mu.phone AS "Telefon",
  md.display_name AS "Oddíl",
  mu.is_active AS "Aktivní"
FROM member_users mu
JOIN member_departments md ON mu.department_id = md.id
WHERE md.name = 'vedeni'
ORDER BY mu.full_name;

