<?php
require_once _DIR_ . '/../db.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['id'])) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'id required']); exit; }

$id = (int)$input['id'];

try {
    // update student basic fields
    $fields = [];
    $params = [];
    if (isset($input['student_number'])) { $fields[] = 'student_number = ?'; $params[] = $input['student_number']; }
    if (isset($input['full_name'])) { $fields[] = 'full_name = ?'; $params[] = $input['full_name']; }
    if (isset($input['birthday'])) { $fields[] = 'birthday = ?'; $params[] = $input['birthday']; }
    if (isset($input['age'])) { $fields[] = 'age = ?'; $params[] = (int)$input['age']; }
    if (isset($input['course_id'])) { $fields[] = 'course_id = ?'; $params[] = (int)$input['course_id']; }

    if (count($fields) > 0) {
        $params[] = $id;
        $sql = 'UPDATE students SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>