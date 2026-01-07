<?php
require_once _DIR_ . '/../db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT s.id, s.student_number, s.full_name, s.birthday, s.age, c.id AS course_id, c.code AS course_code, c.name AS course_name,
        a1.full_address AS current_address, a2.full_address AS permanent_address
        FROM students s
        JOIN courses c ON s.course_id = c.id
        LEFT JOIN addresses a1 ON s.current_address_id = a1.id
        LEFT JOIN addresses a2 ON s.permanent_address_id = a2.id
        ORDER BY s.created_at DESC");
    $students = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $students]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>