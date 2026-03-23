CREATE TABLE container_audit_log (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    container_id INT NOT NULL,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);