DELIMITER $$

CREATE TRIGGER trg_containers_insert
AFTER INSERT ON containers
FOR EACH ROW
BEGIN
    INSERT INTO container_audit_log (
        container_id,
        action_type,
        new_values,
        changed_by
    )
    VALUES (
        NEW.container_id,
        'INSERT',
        JSON_OBJECT (
            'chemical_name', NEW.chemical_name,
            'cas_number', NEW.cas_number,
            'expr_date', NEW.expr_date,
            'acqn_date', NEW.acqn_date,
            'location_id', NEW.location_id,
            'quantity', NEW.quantity
        ),
        @current_user_id
	);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_containers_update
AFTER UPDATE ON containers
FOR EACH ROW
BEGIN
    INSERT INTO container_audit_log (
        container_id,
        action_type,
        old_values,
        new_values,
        changed_by
    )
    VALUES (
        NEW.container_id,
        'UPDATE',
        JSON_OBJECT (
            'chemical_name', OLD.chemical_name,
            'cas_number', OLD.cas_number,
            'expr_date', OLD.expr_date,
            'acqn_date', OLD.acqn_date,
            'location_id', OLD.location_id,
            'quantity', OLD.quantity
        ), 
        JSON_OBJECT (
            'chemical_name', NEW.chemical_name,
            'cas_number', NEW.cas_number,
            'expr_date', NEW.expr_date,
            'acqn_date', NEW.acqn_date,
            'location_id', NEW.location_id,
            'quantity', NEW.quantity
        ),
        @current_user_id
    );
END$$

DELIMITER ;

  
DELIMITER $$

CREATE TRIGGER trg_containers_delete
AFTER DELETE ON containers
FOR EACH ROW
BEGIN
    INSERT INTO container_audit_log (
        container_id,
        action_type,
        old_values,
        changed_by
    )
    VALUES (
        OLD.container_id,
        'DELETE',
        JSON_OBJECT (
            'chemical_name', OLD.chemical_name,
            'cas_number', OLD.cas_number,
            'expr_date', OLD.expr_date,
            'acqn_date', OLD.acqn_date,
            'location_id', OLD.location_id,
            'quantity', OLD.quantity
        ),
        @current_user_id
	);
END$$ 

DELIMITER ;