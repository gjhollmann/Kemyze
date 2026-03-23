-- Eric Cheyssial | Sprint 2 | Kemyze

-- KM-32: Insert User Records
-- Return rows, evaluate schema (primary access at top). 
SELECT * 
FROM kemyzeDatabase.users
ORDER BY access_level ASC;

-- Insert records for users of each access level.
INSERT INTO kemyzeDatabase.users (
	user_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    password,
    access_level,
    location_id
) 
VALUES 
	(976432, 'Alice', 'Robin', 'something1@mail.com', '0009567890', 'DCX342&ghd', 1, 1),
    (734209, 'Bob', 'Broussard', '456bob@mail.com', '1112354679', 'dfzx342vghbN&543', 2, 1),
    (043257, 'John', 'Smith', 'john1@mymail.com', '1235469999', 'ertyhjS78DE%$@', 2, 1),
    (14578223, 'Maria','Johnson', 'mjj123@mymail.com', '8876290321', '124fdyujHH$%&', 3, 1),
    (216789, 'Chris', 'Ahren', 'cah23@mail.com', '2221113333', '90&%hdsazxcvV', 3, 1),
    (09873243, 'Stacy', 'Reyes', 'stre4@newmail.com', '9998887777', '546hg&%$#utr', 4, 1),
    (445568902, 'Bill', 'Roberts', 'billr99@mail.com', '3456210987', '405hujnds#@$%', 4, 1);

-- KM-33: Update User Records
UPDATE kemyzeDatabase.users
SET email = 'bbroussard414@mail.com', phone = '9087652133'
WHERE user_id = 734209;

UPDATE kemyzeDatabase.users
SET phone = '8972340000', last_name = 'Adams'
WHERE user_id = 14578223;

UPDATE kemyzeDatabase.users
SET email = 'cadams44@newmail.com', phone = '9897632411'
WHERE user_id = 216789;

-- KM-32: Perform Test Queries on Users Table
-- Number of users for each access level.
SELECT access_level, COUNT(*) as user_count
FROM kemyzeDatabase.users
GROUP BY access_level;

-- Check for null fields like location or phone number. 
SELECT user_id, first_name, last_name
FROM kemyzeDatabase.users
WHERE location_id IS NULL OR phone_number IS NULL;

-- Check for duplicate column values (e.g., email).
SELECT email, COUNT(email)
FROM kemyzeDatabase.users
GROUP BY email
HAVING COUNT(email) > 1;

-- Check for nulls in mandatory fields (e.g., user_id, password)
SELECT *
FROM kemyzeDatabase.users
WHERE user_id IS NULL OR password IS NULL;

-- KM-25: Verify Container Record Update
-- Return all rows in 'containers.'
SELECT * 
FROM kemyzeDatabase.containers;

-- Update existing container records. 
UPDATE kemyzeDatabase.containers
SET acqn_date = '2026-01-07', expr_date = '2027-01-07'
WHERE container_id = 4;

UPDATE kemyzeDatabase.containers
SET acqn_date = '2026-02-23', cas_number = '987-65-1'
WHERE container_id = 5;

-- Verify changes made to selected containers.
SELECT acqn_date, expr_date, cas_number
FROM kemyzeDatabase.containers
WHERE container_id IN (4, 5);






