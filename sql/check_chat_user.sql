-- Kontrola uživatele v chat_users tabulce
SELECT cu.*, ur.role
FROM chat_users cu
LEFT JOIN user_roles ur ON cu.email = ur.email
WHERE cu.email = 'admin@rjwebdesign.cz';

-- Kontrola oprávnění uživatele pro chat
SELECT p.section, p.action
FROM user_roles ur
JOIN user_permissions up ON ur.id = up.role_id
JOIN permissions p ON up.permission_id = p.id
WHERE ur.email = 'admin@rjwebdesign.cz'
AND p.section = 'chat';

-- Výpis všech uživatelů v chat_users pro kontrolu
SELECT * FROM chat_users;