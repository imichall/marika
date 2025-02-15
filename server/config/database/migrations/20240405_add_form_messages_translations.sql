-- Přidání překladů pro sekci form_messages
INSERT INTO permission_translations (section, action, language, translation)
VALUES
  ('form_messages', 'view', 'cs', 'Zobrazení zpráv'),
  ('form_messages', 'edit', 'cs', 'Úprava zpráv'),
  ('form_messages', 'delete', 'cs', 'Mazání zpráv'),
  ('form_messages', 'create', 'cs', 'Vytváření zpráv');

-- Přidání překladu pro název sekce
INSERT INTO section_translations (section, language, translation)
VALUES
  ('form_messages', 'cs', 'Zprávy z formuláře');