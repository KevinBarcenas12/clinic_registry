-- Main file to start and insert base items into the database 

-- Drop existing tables (if they exist) 
DROP TABLE IF EXISTS "interop";
DROP TABLE IF EXISTS "block";
DROP TABLE IF EXISTS "messages";
DROP TABLE IF EXISTS "chats";
DROP TABLE IF EXISTS "predictive_diagnose";
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "history";
DROP TABLE IF EXISTS "clinics";
DROP TABLE IF EXISTS "log";
DROP TABLE IF EXISTS "medic";
DROP TABLE IF EXISTS "patient";
DROP TABLE IF EXISTS "medical_plans";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "role_permissions";
DROP TABLE IF EXISTS "permissions";
DROP TABLE IF EXISTS "roles";
DROP TABLE IF EXISTS "role";

-- Drop existing sequences
DROP SEQUENCE IF EXISTS users_serial;
DROP SEQUENCE IF EXISTS medical_plans_serial;
DROP SEQUENCE IF EXISTS patient_serial;
DROP SEQUENCE IF EXISTS appointments_serial;
DROP SEQUENCE IF EXISTS medic_serial;
DROP SEQUENCE IF EXISTS history_serial;
DROP SEQUENCE IF EXISTS chats_serial;
DROP SEQUENCE IF EXISTS messages_serial;
DROP SEQUENCE IF EXISTS clinics_serial;

-- Create the tables (since they got deleted) with updated values 

CREATE SEQUENCE IF NOT EXISTS users_serial START 20000;
CREATE SEQUENCE IF NOT EXISTS medical_plans_serial START 101;
CREATE SEQUENCE IF NOT EXISTS patient_serial START 10001;
CREATE SEQUENCE IF NOT EXISTS appointments_serial START 80001;
CREATE SEQUENCE IF NOT EXISTS medic_serial START 8001;
CREATE SEQUENCE IF NOT EXISTS history_serial START 30001;
CREATE SEQUENCE IF NOT EXISTS chats_serial START 60001;
CREATE SEQUENCE IF NOT EXISTS messages_serial START 1000001;
CREATE SEQUENCE IF NOT EXISTS clinics_serial START 401;

CREATE TABLE IF NOT EXISTS "roles" (
  "id" serial PRIMARY KEY,
  "type" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "permissions" (
  "id" serial PRIMARY KEY,
  "name" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" int NOT NULL,
  "permission_id" int NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" int DEFAULT nextval('users_serial') UNIQUE,
  "username" varchar(50) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "email" varchar(50) NOT NULL UNIQUE,
  "phone" varchar(14) NOT NULL UNIQUE,
  "birth_date" NUMERIC NOT NULL,
  "gender" varchar(12) NOT NULL,
  "age" integer NOT NULL,
  "location" varchar(100) NOT NULL,
  "password" varchar(60) NOT NULL,
  "registered_at" NUMERIC NOT NULL DEFAULT extract(epoch from now()) * 1000,
  "role_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "medical_plans" (
  "id" int DEFAULT nextval('medical_plans_serial') UNIQUE,
  "type" varchar(25) NOT NULL,
  "benefit_level" integer NOT NULL,
  "price_month" float NOT NULL,
  "duration" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "patient" (
  "id" int DEFAULT nextval('patient_serial') UNIQUE,
  "user_id" integer NOT NULL,
  "active" boolean DEFAULT FALSE,
  "plan_id" integer NOT NULL,
  "plan_expiration" FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" int DEFAULT nextval('appointments_serial') UNIQUE,
  "history_id" integer NOT NULL,
  "medic_id" integer NOT NULL,
  "user_id" integer NOT NULL DEFAULT 0,
  "date" FLOAT NOT NULL,
  "diagnose" varchar(255) NOT NULL,
  "treatment" varchar(255) NOT NULL,
  "clinic_id" int NOT NULL
);

CREATE TABLE IF NOT EXISTS "medic" (
  "id" int DEFAULT nextval('medic_serial') UNIQUE,
  "user_id" integer NOT NULL,
  "clinic_id" integer NOT NULL,
  "speciality" varchar(50) NOT NULL,
  "active" boolean DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "log" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "action" varchar(255) NOT NULL,
  "executed_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "history" (
  "id" int DEFAULT nextval('history_serial') UNIQUE,
  "patient_id" integer NOT NULL,
  "medic_id" integer NOT NULL,
  "notes" varchar(255),
  "created_at" FLOAT NOT NULL DEFAULT extract(epoch from now()) * 1000,
  "last_modified_at" FLOAT NOT NULL DEFAULT extract(epoch from now()) * 1000
);

CREATE TABLE IF NOT EXISTS "predictive_diagnose" (
  "id" serial PRIMARY KEY,
  "history_id" integer NOT NULL,
  "predicted_date" FLOAT NOT NULL DEFAULT extract(epoch from now()) * 1000,
  "predicted_decease" varchar(255) NOT NULL,
  "notes" varchar(255),
  "probability" float NOT NULL
);

CREATE TABLE IF NOT EXISTS "chats" (
  "id" int DEFAULT nextval('chats_serial') UNIQUE,
  "medic_id" integer,
  "user_id" integer NOT NULL,
  "created_at" FLOAT NOT NULL DEFAULT extract(epoch from now()) * 1000,
  "active" boolean NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" int DEFAULT nextval('messages_serial') UNIQUE,
  "chat_id" integer NOT NULL,
  "message" TEXT NOT NULL,
  "sender_id" integer NOT NULL,
  "sent_at" FLOAT NOT NULL DEFAULT extract(epoch from now()) * 1000
);

CREATE TABLE IF NOT EXISTS "block" (
  "id" serial PRIMARY KEY,
  "history_id" integer NOT NULL,
  "hash" varchar(255) NOT NULL,
  "time" timestamp NOT NULL,
  "action" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "clinics" (
  "id" int DEFAULT nextval('clinics_serial') UNIQUE,
  "name" varchar(100) NOT NULL,
  "location" varchar(250) NOT NULL,
  "phone" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "interop" (
  "id" serial PRIMARY KEY,
  "history_id" int NOT NULL,
  "origin_clinic" int NOT NULL,
  "target_clinic" int NOT NULL,
  "action" varchar(255) NOT NULL,
  "requested_at" NUMERIC NOT NULL DEFAULT extract(epoch from now()) * 1000
);

-- Alter the serial sequences for each table 
ALTER SEQUENCE users_serial OWNED BY users.id;
ALTER SEQUENCE medical_plans_serial OWNED BY medical_plans.id;
ALTER SEQUENCE patient_serial OWNED BY patient.id;
ALTER SEQUENCE appointments_serial OWNED BY appointments.id;
ALTER SEQUENCE medic_serial OWNED BY medic.id;
ALTER SEQUENCE history_serial OWNED BY history.id;
ALTER SEQUENCE chats_serial OWNED BY chats.id;
ALTER SEQUENCE messages_serial OWNED BY messages.id;
ALTER SEQUENCE clinics_serial OWNED BY clinics.id;

-- Create relations between the tables 
ALTER TABLE "role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE;
ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE;
ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE;
ALTER TABLE "patient" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "patient" ADD FOREIGN KEY ("plan_id") REFERENCES "medical_plans" ("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD FOREIGN KEY ("history_id") REFERENCES "history" ("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD FOREIGN KEY ("medic_id") REFERENCES "medic" ("id") ON DELETE CASCADE;
ALTER TABLE "appointments" ADD FOREIGN KEY ("clinic_id") REFERENCES "clinics" ("id") ON DELETE CASCADE;
ALTER TABLE "medic" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "log" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "history" ADD FOREIGN KEY ("patient_id") REFERENCES "patient" ("id") ON DELETE CASCADE;
ALTER TABLE "history" ADD FOREIGN KEY ("medic_id") REFERENCES "medic" ("id") ON DELETE CASCADE;
ALTER TABLE "predictive_diagnose" ADD FOREIGN KEY ("history_id") REFERENCES "history" ("id") ON DELETE CASCADE;
ALTER TABLE "chats" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "chats" ADD FOREIGN KEY ("medic_id") REFERENCES "medic" ("id") ON DELETE CASCADE;
ALTER TABLE "messages" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE;
ALTER TABLE "block" ADD FOREIGN KEY ("history_id") REFERENCES "history" ("id") ON DELETE CASCADE;
ALTER TABLE "interop" ADD FOREIGN KEY ("history_id") REFERENCES "history" ("id") ON DELETE CASCADE;
ALTER TABLE "interop" ADD FOREIGN KEY ("origin_clinic") REFERENCES "clinics" ("id") ON DELETE CASCADE;
ALTER TABLE "interop" ADD FOREIGN KEY ("target_clinic") REFERENCES "clinics" ("id") ON DELETE CASCADE;

-- Insert all the base values to the table 

INSERT INTO "roles"("id", "type") VALUES
  (100, 'Paciente'),
  (200, 'Recepcionista'),
  (300, 'Médico'),
  (400, 'Administrador');

INSERT INTO "permissions"("id","name") VALUES
  (111, 'users:view:self'),
  (112, 'users:view:others'),
  (121, 'users:edit:self'),
  (122, 'users:edit:others'),
  (131, 'users:delete:self'),
  (132, 'users:delete:others'),
  (140, 'users:create'),
  (211, 'medical_plan:view:self'),
  (212, 'medical_plan:view:others'),
  (220, 'medical_plan:edit'),
  (230, 'medical_plan:delete'),
  (240, 'medical_plan:create'),
  (311, 'appointments:view:self'),
  (312, 'appointments:view:others'),
  (313, 'appointments:view:all'),
  (321, 'appointments:edit:self'),
  (322, 'appointments:edit:others'),
  (323, 'appointments:edit:all'),
  (331, 'appointments:delete:self'),
  (332, 'appointments:delete:others'),
  (333, 'appointments:delete:all'),
  (341, 'appointments:create:self'),
  (342, 'appointments:create:others'),
  (411, 'history:view:self'),
  (412, 'history:view:others'),
  (420, 'history:edit'),
  (430, 'history:delete'),
  (440, 'history:create'),
  (511, 'chats:view:self'),
  (512, 'chats:view:others'),
  (600, 'predictive_diagnosis:use'),
  (710, 'clinics:view'),
  (720, 'clinics:edit'),
  (730, 'clinics:delete'),
  (740, 'clinics:create');

INSERT INTO "role_permissions"("role_id", "permission_id") VALUES
  (100, 111),
  (100, 121),
  (100, 131),
  (100, 211),
  (100, 311),
  (100, 321),
  (100, 331),
  (100, 341),
  (100, 411),
  (100, 511),
  (100, 710),
  (200, 111),
  (200, 112),
  (200, 140),
  (200, 311),
  (200, 312),
  (200, 313),
  (200, 321),
  (200, 322),
  (200, 323),
  (200, 341),
  (200, 342),
  (200, 511),
  (200, 512),
  (200, 710),
  (300, 111),
  (300, 112),
  (300, 121),
  (300, 122),
  (300, 131),
  (300, 132),
  (300, 140),
  (300, 211),
  (300, 212),
  (300, 311),
  (300, 312),
  (300, 313),
  (300, 321),
  (300, 322),
  (300, 323),
  (300, 331),
  (300, 332),
  (300, 333),
  (300, 341),
  (300, 342),
  (300, 411),
  (300, 412),
  (300, 420),
  (300, 511),
  (300, 512),
  (300, 600),
  (300, 710),
  (400, 111),
  (400, 112),
  (400, 121),
  (400, 122),
  (400, 131),
  (400, 132),
  (400, 140),
  (400, 211),
  (400, 212),
  (400, 220),
  (400, 230),
  (400, 240),
  (400, 311),
  (400, 312),
  (400, 313),
  (400, 321),
  (400, 322),
  (400, 323),
  (400, 331),
  (400, 332),
  (400, 333),
  (400, 341),
  (400, 342),
  (400, 411),
  (400, 412),
  (400, 420),
  (400, 430),
  (400, 440),
  (400, 511),
  (400, 512),
  (400, 600),
  (400, 710),
  (400, 720),
  (400, 730),
  (400, 740);

INSERT INTO "users"("username", "email", "name", "phone", "birth_date", "gender", "age", "location", "registered_at", "password", "role_id") VALUES
  (
    '@Bot',
    'Desconocido@Bot',
    'Bot',
    '00000000',
    extract(epoch from TO_TIMESTAMP('01-01-2000', 'MM-DD-YYYY')) * 1000,
    'Desconocido',
    0,
    'Desconocido',
    extract(epoch from TO_TIMESTAMP('05-07-2021', 'MM-DD-YYYY')) * 1000,
    '',
    100
  ),
  (
    '@Invitado',
    'Desconocido@Invitado',
    'Invitado',
    '00000001',
    extract(epoch from TO_TIMESTAMP('01-01-2000', 'MM-DD-YYYY')) * 1000,
    'Desconocido',
    0,
    'Desconocido',
    extract(epoch from TO_TIMESTAMP('05-07-2021', 'MM-DD-YYYY')) * 1000,
    '',
    100
  ),
  (
    'juan.perez',
    'juan.perez@gmail.com',
    'Juan Perez',
    '22345678',
    extract(epoch from TO_TIMESTAMP('05-14-1990', 'MM-DD-YYYY')) * 1000,
    'Masculino',
    34,
    'Colonia Centro, Tegucigalpa',
    extract(epoch from TO_TIMESTAMP('06-06-2023', 'MM-DD-YYYY')) * 1000,
    '$2b$12$FaVcHvYPzdE0C2KzNr5KzOOWOpAHL/aRXPvJD1czZR9hNI387uX.2', -- pass1112
    100
  ), 
  (
    'ana.gomez',
    'ana.gomez@gmail.com',
    'Ana Gomez',
    '22345679',
    extract(epoch from TO_TIMESTAMP('02-22-1985', 'MM-DD-YYYY')) * 1000,
    'Femenino',
    39,
    'Colonia Kennedy, Tegucigalpa',
    extract(epoch from TO_TIMESTAMP('07-22-2024', 'MM-DD-YYYY')) * 1000,
    '$2b$12$KfVqaF025cLktbdo6vqkaeLQtS403SAN5yx1LRUduwVHQyQjKyqGS', -- pass1213
    300
  ),
  (
    'carlos.lopez',
    'carlos.lopez@gmail.com',
    'Carlos Lopez',
    '22345680',
    extract(epoch from TO_TIMESTAMP('11-30-1992', 'MM-DD-YYYY')) * 1000,
    'Masculino',
    32,
    'Barrio Abajo, Comayagua',
    extract(epoch from TO_TIMESTAMP('05-25-2025', 'MM-DD-YYYY')) * 1000,
    '$2b$12$CyUeaKeJE2GUMuTiMQ9zEO3hVY9GnvuYi9tnHO4kRQarwt.hETYsC', -- pass1314
    300
  ),
  (
    'maria.reyes',
    'maria.reyes@gmail.com',
    'Maria Reyes',
    '22345681',
    extract(epoch from TO_TIMESTAMP('03-15-1988', 'MM-DD-YYYY')) * 1000,
    'Femenino',
    36,
    'Colonia San Carlos, Comayagua',
    extract(epoch from TO_TIMESTAMP('09-25-2024', 'MM-DD-YYYY')) * 1000,
    '$2b$12$7y5PzV2geKZ4WMLwF0ySr.MFES6HLsCCbQcsIq3cQmulwHd0AGB1q', -- pass1415
    100
  ),
  (
    'pedro.ramos',
    'pedro.ramos@gmail.com',
    'Pedro Ramos',
    '22345682',
    extract(epoch from TO_TIMESTAMP('07-19-1995', 'MM-DD-YYYY')) * 1000,
    'Masculino',
    29,
    'Colonia El Carmen, La Ceiba',
    extract(epoch from TO_TIMESTAMP('05-22-2025', 'MM-DD-YYYY')) * 1000,
    '$2b$12$jr1RUyMEMlw1jgXfbNgIZ.Z356aHxj1NxZEwmpqMElN5P4zJDjMKS', -- pass1516
    200
  ),
  (
    'laura.diaz',
    'laura.diaz@gmail.com',
    'Laura Diaz',
    '22345683',
    extract(epoch from TO_TIMESTAMP('12-25-1993', 'MM-DD-YYYY')) * 1000,
    'Femenino',
    31,
    'Colonia Miramar, La Ceiba',
    extract(epoch from TO_TIMESTAMP('01-18-2021', 'MM-DD-YYYY')) * 1000,
    '$2b$12$aEj6cVnHoEOvCwwhL6LeYuNuJNthEfVoO3c9sbKUpvVTJzSn7WwA6', -- pass1617
    100
  ),
  (
    'luis.torres',
    'luis.torres@gmail.com',
    'Luis Torres',
    '22345684',
    extract(epoch from TO_TIMESTAMP('09-10-1991', 'MM-DD-YYYY')) * 1000,
    'Masculino',
    33,
    'Barrio El Centro, Gracias',
    extract(epoch from TO_TIMESTAMP('11-13-2021', 'MM-DD-YYYY')) * 1000,
    '$2b$12$5KHsYUTGzFi4PV0CteF8GuolOfb7z1seA0rRuZUKFuDlsxFMYs2B2', -- pass1718
    100
  ),
  (
    'elena.martinez',
    'elena.martinez@gmail.com',
    'Elena Martinez',
    '22345685',
    extract(epoch from TO_TIMESTAMP('04-05-1987', 'MM-DD-YYYY')) * 1000,
    'Femenino',
    37,
    'Colonia Lempira, Gracias',
    extract(epoch from TO_TIMESTAMP('02-23-2021', 'MM-DD-YYYY')) * 1000,
    '$2b$12$3FzLC7dzI6eUByU.wubEHOlhGkn5jdX/RjjWu6TV/I7X.ahYdxp2y', -- pass1819
    400
  );

SELECT * FROM users;

INSERT INTO "medical_plans"("type", "benefit_level", "price_month", "duration") VALUES
  ('Personal A', 2, 100.00, 1),
  ('Personal A+', 2, 85.00, 3),
  ('Personal B', 3, 150.00, 1),
  ('Personal B', 3, 130.00, 3),
  ('Family A', 2, 300.00, 1),
  ('Family A Member', 2, 0.00, 1),
  ('Family B', 3, 500.00, 3),
  ('Family B Member', 3, 0.00, 3),
  ('Family C', 4, 1200.00, 5),
  ('Family C Member', 4, 0.00, 5);

SELECT * FROM medical_plans;

INSERT INTO "patient"("user_id", "plan_id", "active", "plan_expiration") VALUES
  (20002, 102, TRUE, extract(epoch from TO_TIMESTAMP('01-20-2027', 'MM-DD-YYYY')) * 1000),
  (20005, 104, TRUE, extract(epoch from TO_TIMESTAMP('06-15-2028', 'MM-DD-YYYY')) * 1000),
  (20007, 102, TRUE, extract(epoch from TO_TIMESTAMP('04-30-2027', 'MM-DD-YYYY')) * 1000),
  (20008, 107, TRUE, extract(epoch from TO_TIMESTAMP('05-21-2031', 'MM-DD-YYYY')) * 1000);

SELECT * FROM patient;

INSERT INTO "clinics"("name", "location", "phone") VALUES
  ('Hospital General', 'Calle Principal, 2da Cuadra, Ciudad A', '2287-5678'),
  ('Clínica Norte', '2da Avenida, Ciudad B', '2209-8123');

SELECT * FROM clinics;

INSERT INTO "medic"("user_id", "speciality", "clinic_id") VALUES
  (20001, 'Bot', 401),
  (20003, 'Cardiología', 401),
  (20004, 'Neurología', 402);

SELECT * FROM medic;

INSERT INTO "history"("patient_id","medic_id","notes", "created_at") VALUES
  (10001, 8003, 'Primer control postoperatorio', extract(epoch from TO_TIMESTAMP('04-01-2025', 'MM-DD-YYYY')) * 1000),
  (10002, 8002, 'Control rutinario de Presión Arterial', extract(epoch from TO_TIMESTAMP('03-21-2025', 'MM-DD-YYYY')) * 1000),
  (10003, 8003, 'Seguimiento de tratamiento cardiológico', extract(epoch from TO_TIMESTAMP('03-22-2025', 'MM-DD-YYYY')) * 1000),
  (10004, 8002, 'Control de seguimiento de tratamiento', extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000);

SELECT * FROM history;

INSERT INTO "appointments"("history_id", "medic_id", "user_id", "date", "diagnose", "treatment", "clinic_id") VALUES
  (30001, 8003, 20001, extract(epoch from TO_TIMESTAMP('04-01-2025', 'MM-DD-YYYY')) * 1000, 'Control postoperatorio', 'Seguir tratamiento', 401),
  (30002, 8002, 20003, extract(epoch from TO_TIMESTAMP('04-02-2025', 'MM-DD-YYYY')) * 1000, 'Hipertensión arterial', 'Ajuste de medicación', 402),
  (30003, 8003, 20004, extract(epoch from TO_TIMESTAMP('04-03-2025', 'MM-DD-YYYY')) * 1000, 'Insuficiencia cardíaca', 'Continuar monitoreo', 401),
  (30004, 8002, 20006, extract(epoch from TO_TIMESTAMP('04-04-2025', 'MM-DD-YYYY')) * 1000, 'Control de seguimiento', 'Continuar con el tratamiento actual', 402),
  (30002, 8003, 20003, extract(epoch from TO_TIMESTAMP('04-05-2025', 'MM-DD-YYYY')) * 1000, 'Bronquitis crónica', 'Ajuste de medicación inhalada', 401),
  (30003, 8002, 20004, extract(epoch from TO_TIMESTAMP('04-06-2025', 'MM-DD-YYYY')) * 1000, 'Salud general decayente', 'Recomendaciones de estilo de vida', 402);

SELECT * FROM appointments;

INSERT INTO "chats"("user_id", "medic_id", "created_at", "active") VALUES
  (20004, 8001, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20005, 8002, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20006, 8001, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20007, 8002, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20008, 8001, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20004, 8002, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20005, 8001, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE),
  (20006, 8002, extract(epoch from TO_TIMESTAMP('03-23-2025', 'MM-DD-YYYY')) * 1000, FALSE);

SELECT * FROM chats;

INSERT INTO "messages"("chat_id", "message", "sender_id") VALUES
  (60001, 'Buenos días, necesito consultar sobre mi tratamiento actual', 20004),
  (60001, 'Por supuesto, que específicamente necesita consltar?', 8001),
  (60002, 'Hola, tengo una pregunta sobre mi próxima cita', 20005),
  (60002, 'Hola, claro, Que necesitaba saber sobre su cita?', 8002),
  (60003, 'Buenos días, podría ayudarme con una consulta médica?', 2006),
  (60003, 'Por supuesto, que tipo de consulta necesita?', 80001),
  (60004, 'Necesito una consulta urgente sobre mis resultados de laboratorio', 20007),
  (60004, 'Por supuesto, ¿cuáles resultados específicos necesita revisar?', 8002),
  (60004, 'Los resultados de la última prueba de sangre', 20007),
  (60004, 'Ya los veo. ¿Le gustaría que le explique los resultados?', 8002),
  (60005, 'Tengo una pregunta sobre mi medicación actual', 20008),
  (60005, '¿Qué medicamento específicamente le preocupa?', 8001),
  (60005, 'El que me recetó para la presión arterial', 20008),
  (60005, 'Entiendo. ¿Ha notado algún efecto secundario?', 8001),
  (60006, '¿Podría hacerme una consulta sobre nutrición?', 20004),
  (60006, 'Por supuesto, ¿qué aspecto de la nutrición le interesa?', 8002),
  (60006, 'Me gustaría saber sobre una dieta equilibrada para mi condición', 20004),
  (60006, 'Perfecto, le prepararé un plan personalizado', 8002),
  (60007, 'Necesito hacer una consulta sobre prevención', 20005),
  (60007, '¿Qué tipo de prevención le interesa conocer?', 8001),
  (60007, 'Sobre prevención de enfermedades cardíacas', 20005),
  (60007, 'Excelente elección. Le enviaré información detallada', 8001),
  (60008, 'Tengo una pregunta sobre mi tratamiento actual', 20006),
  (60008, '¿Qué específicamente sobre su tratamiento?', 8002),
  (60008, 'Sobre la dosis del medicamento', 20006),
  (60008, 'Entendido, le ajustaré la dosis según su caso', 8002);

SELECT * FROM messages;
