-- Eric Cheyssial | Sprint 2 | Kemyze

-- KM-32
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

-- Return rows, verify insert correctness. 
SELECT * 
FROM kemyzeDatabase.users;








