SET @current_user_id = 43257;

INSERT INTO containers (
    container_id, 
    chemical_name, 
    cas_number, 
    expr_date, 
    acqn_date, 
    location_id, 
    quantity
)
VALUES (
    5, 
    'New Chemical', 
    '999-88-7', 
    '2028-01-01', 
    '2026-03-01', 
    1, 
    'medium'
);

SET @current_user_id = 734209;

UPDATE containers
SET quantity = 'medium'
WHERE container_id = 2;

SET @current_user_id = 976432;

UPDATE containers
SET chemical_name = 'Test 2 Updated', quantity = 'high'
WHERE container_id = 4;

SET @current_user_id = 216789;

DELETE FROM containers
WHERE container_id = 3;

SET @current_user_id = 14578223;

UPDATE containers
SET quantity = 'low'
WHERE location_id = 1;

SELECT * FROM container_audit_log 
WHERE changed_by = 43257;

SELECT * FROM container_audit_log 
WHERE changed_by = 734209;

SELECT * FROM container_audit_log 
WHERE changed_by = 976432;

SELECT * FROM container_audit_log 
WHERE changed_by = 216789;

SELECT * FROM container_audit_log 
WHERE changed_by = 14578223;
