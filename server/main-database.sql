-- Main file to execute outside the python server

-- SELECT messages.id as message_id, chats.id as chat_id, user_names.name as user_name, medic_names.name as medic_name, messages.message, messages.sent_at
-- FROM chats
-- INNER JOIN (SELECT "id", "name" FROM "users") user_names ON chats.user_id = user_names.id
-- INNER JOIN (SELECT "id", "name" FROM "users") medic_names ON chats.medic_id = medic_names.id
-- INNER JOIN messages ON messages.chat_id = chats.id;

-- SELECT users.name, usernames.username
-- FROM (SELECT "id", "name" FROM "users") users
-- INNER JOIN (SELECT "id", "username" FROM "users") usernames ON usernames.id = users.id;

-- SELECT messages.id, messages.chat_id, messages.message, list.name, messages.sent_at
-- FROM messages
-- LEFT JOIN (
--     SELECT users.id as user_id, medic.id as medic_id, users.name as name
--     FROM users
--     LEFT JOIN medic ON medic.user_id = users.id
-- ) list ON list.user_id = messages.sender_id OR list.medic_id = messages.sender_id
-- ORDER BY messages.sent_at ASC;

-- SELECT chats.id as chat_id, chats.active, messages.message, messages.sent_at, users.name as user_name, COALESCE(medic.speciality, 'Not Medic')
-- FROM chats
-- LEFT JOIN messages ON messages.chat_id = chats.id
-- LEFT JOIN medic ON messages.sender_id = medic.id
-- LEFT JOIN users ON medic.user_id = users.id OR messages.sender_id = users.id
-- ORDER BY messages.sent_at ASC;

-- SELECT users.id as user_id, medic.id as medic_id, users.name as name
-- FROM users
-- LEFT JOIN medic ON medic.user_id = users.id;

-- SELECT chats.id, chats.medic_id, chats.user_id, chats.created_at, chats.active, 
-- medic_list.name as medic_name, users.name as user_name
-- FROM chats
-- LEFT JOIN (
--     SELECT users.id as user_id, medic.id as medic_id, users.name
--     FROM users
--     LEFT JOIN medic ON medic.user_id = users.id
-- ) as medic_list ON medic_list.medic_id = chats.medic_id
-- LEFT JOIN users on chats.user_id = users.id
-- WHERE users.id = 2003;

-- SELECT chats.id, chats.medic_id, medic_list.name as medic_name, chats.user_id, 
-- users.name as user_name, chats.created_at, chats.active
-- FROM chats
-- LEFT JOIN (
--     SELECT users.id as user_id, medic.id as medic_id, users.name
--     FROM users
--     LEFT JOIN medic ON medic.user_id = users.id
-- ) as medic_list ON medic_list.medic_id = chats.medic_id
-- LEFT JOIN users on chats.user_id = users.id
-- WHERE users.id = 2005 OR medic_list.user_id = 2005;

-- SELECT users.id as user_id, medic.id as medic_id, patient.id as patient_id, users.name as name
-- FROM users
-- LEFT JOIN medic ON medic.user_id = users.id
-- LEFT JOIN patient ON patient.user_id = users.id;

-- add
-- history -> users
-- appoointments
-- chats
-- 11-30-1992

-- SELECT * FROM patient;

-- SELECT * FROM messages;

-- INSERT INTO "history"("patient_id","medic_id","notes", "created_at") VALUES
--     (20001, 200001, 'Primer control postoperatorio', '2025-04-01'),
--     (20002, 200002, 'Control rutinario de Presión Arterial', '2025-03-21'),
--     (20003, 200001, 'Seguimiento de tratamiento cardiológico', '2025-03-22'),
--     (20004, 200002, 'Control de seguimiento de tratamiento', '2025-03-23'),
--     (20005, 200001, 'Evaluación de síntomas respiratorios', '2025-03-23'),
--     (20006, 200002, 'Revisión de historial médico familiar', '2025-03-23');

-- INSERT INTO "appointments"("history_id", "medic_id", "user_id", "date", "diagnose", "treatment", "clinic_id") VALUES
--     (100001, 200001, 2001, '2025-04-01', 'Control postoperatorio', 'Seguir tratamiento', 1),
--     (100002, 200002, 2003, '2025-04-02', 'Hipertensión arterial', 'Ajuste de medicación', 2),
--     (100003, 200001, 2004, '2025-04-03', 'Insuficiencia cardíaca', 'Continuar monitoreo', 1),
--     (100004, 200002, 2006, '2025-04-04', 'Control de seguimiento', 'Continuar con el tratamiento actual', 2),
--     (100005, 200001, 2007, '2025-04-05', 'Bronquitis crónica', 'Ajuste de medicación inhalada', 1),
--     (100006, 200002, 2008, '2025-04-06', 'Salud decayente', 'Recomendaciones de estilo de vida', 2);

--  INSERT INTO "chats"("id", "user_id", "medic_id", "created_at", "active") VALUES
--  (100002, 2004, 200001, '2025-03-23', TRUE),
--  (100003, 2005, 200002, '2025-03-23', TRUE),
--  (100004, 2006, 200001, '2025-03-23', TRUE),
--  (100005, 2007, 200002, '2025-03-23', TRUE),
--  (100006, 2008, 200001, '2025-03-23', TRUE),
--  (100007, 2004, 200002, '2025-03-23', TRUE),
--  (100008, 2005, 200001, '2025-03-23', TRUE),
--  (100009, 2006, 200002, '2025-03-23', TRUE);

-- INSERT INTO "messages"("id", "chat_id", "message", "sender_id") VALUES
-- (10000008, 100002, 'Buenos días, necesito consultar sobre mi tratamiento actual', 2004),
-- (10000009, 100002, 'Por supuesto, que específicamente necesita consltar?', 20001),
-- (10000010, 100003, 'Hola, tengo una pregunta sobre mi próxima cita', 2005),
-- (10000011, 100003, 'Hola, claro, Que necesitaba saber sobre su cita?', 20002),
-- (10000012, 100004, 'Buenos días, podría ayudarme con una consulta médica?', 2006),
-- (10000013, 100004, 'Por supuesto, que tipo de consulta necesita?', 200001),
-- (10000014, 100005, 'Necesito una consulta urgente sobre mis resultados de laboratorio', 2007),
-- (10000015, 100005, 'Por supuesto, ¿cuáles resultados específicos necesita revisar?', 200002),
-- (10000016, 100005, 'Los resultados de la última prueba de sangre', 2007),
-- (10000017, 100005, 'Ya los veo. ¿Le gustaría que le explique los resultados?', 200002),
-- (10000018, 100006, 'Tengo una pregunta sobre mi medicación actual', 2008),
-- (10000019, 100006, '¿Qué medicamento específicamente le preocupa?', 200001),
-- (10000020, 100006, 'El que me recetó para la presión arterial', 2008),
-- (10000021, 100006, 'Entiendo. ¿Ha notado algún efecto secundario?', 200001),
-- (10000022, 100007, '¿Podría hacerme una consulta sobre nutrición?', 2004),
-- (10000023, 100007, 'Por supuesto, ¿qué aspecto de la nutrición le interesa?', 200002),
-- (10000024, 100007, 'Me gustaría saber sobre una dieta equilibrada para mi condición', 2004),
-- (10000025, 100007, 'Perfecto, le prepararé un plan personalizado', 200002),
-- (10000026, 100008, 'Necesito hacer una consulta sobre prevención', 2005),
-- (10000027, 100008, '¿Qué tipo de prevención le interesa conocer?', 200001),
-- (10000028, 100008, 'Sobre prevención de enfermedades cardíacas', 2005),
-- (10000029, 100008, 'Excelente elección. Le enviaré información detallada', 200001),
-- (10000030, 100009, 'Tengo una pregunta sobre mi tratamiento actual', 2006),
-- (10000031, 100009, '¿Qué específicamente sobre su tratamiento?', 200002),
-- (10000032, 100009, 'Sobre la dosis del medicamento', 2006),
-- (10000033, 100009, 'Entendido, le ajustaré la dosis según su caso', 200002);

-- SELECT * FROM users
-- LEFT JOIN role ON role.id = users.role_id

-- SELECT history.id, medic_list.medic_id, medic_list.name, users.id, users.name, history.notes, history.created_at, history.last_modified_at
-- FROM history
-- LEFT JOIN patient ON patient.id = history.patient_id
-- LEFT JOIN (
--     SELECT users.id as user_id, medic.id as medic_id, users.name as name
--     FROM users
--     LEFT JOIN medic ON medic.user_id = users.id
-- ) as medic_list ON medic_list.medic_id = history.medic_id
-- LEFT JOIN users ON users.id = patient.user_id;

-- SELECT history.id as history_id, medic_list.medic_id, medic_list.name as medic_name, 
-- users.id as user_id, users.name as user_name, history.notes, history.created_at, history.last_modified_at
-- FROM history
-- LEFT JOIN patient ON patient.id = history.patient_id
-- LEFT JOIN (
--     SELECT medic.id as medic_id, users.name as name
--     FROM users
--     LEFT JOIN medic ON users.id = medic.user_id
-- ) as medic_list ON medic_list.medic_id = history.medic_id
-- LEFT JOIN users ON users.id = patient.user_id
-- WHERE users.id = 2006

-- SELECT messages.id, messages.message, messages.sender_id, messages.sent_at, list.name
-- FROM messages
-- LEFT JOIN (
--     SELECT users.id as user_id, medic.id as medic_id, users.name
--     FROM users
--     LEFT JOIN medic on medic.user_id = users.id
-- ) as list ON list.user_id = messages.sender_id OR list.medic_id = messages.sender_id
-- -- WHERE chat_id = 100004;'

-- SELECT * FROM users;
-- SELECT

-- SELECT * FROM users;
-- SELECT * FROM medical_plans;
-- SELECT * FROM patient;
-- SELECT * FROM appointments;
-- SELECT * FROM medic;
-- SELECT * FROM history;
-- SELECT * FROM chats;
-- SELECT * FROM messages;
-- SELECT * FROM clinics;

-- Select (
--     Select 
--         timestamp '2025-12-31 23:59:59' + 
--         random() * (timestamp '2020-01-01 00:00:01' - timestamp '2025-12-31 23:59:59')
-- )::date As fecha_random;


-- SELECT
--     medic.id,
--     medic.speciality,
--     clinics.id,
--     clinics.name,
--     clinics.location,
--     medic.active
-- FROM medic
-- LEFT JOIN clinics ON medic.clinic_id = clinics.id
-- WHERE medic.user_id = 20005;

-- SELECT * FROM medic;
-- SELECT * FROM clinics;

-- SELECT
--     medic.id,
--     medic.speciality,
--     clinics.id,
--     clinics.name,
--     clinics.location,
--     medic.active
-- FROM medic
-- LEFT JOIN clinics ON medic.clinic_id = clinics.id
-- WHERE medic.active = true AND medic.id > 8001

-- select extract(epoch from TO_TIMESTAMP('10-23-2021', 'MM-DD-YYYY')) * 1000;

SELECT * FROM appointments
