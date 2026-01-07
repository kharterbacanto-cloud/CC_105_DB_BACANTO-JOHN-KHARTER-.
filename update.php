<?php
require_once _DIR_ . '/../db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Invalid JSON']); exit; }

$required = ['student_number','full_name','birthday','age','course_id','permanent_address','current_address'];
foreach ($required as $r) if (!isset($input[$r]) || (trim($input[$r]) === '')) { http_response_code(400); echo json_encode(['success'=>false,'error'=>"$r is required"]); exit; }

try {
    // insert addresses
    $stmt = $pdo->prepare('INSERT INTO addresses (city, province, full_address) VALUES (?, ?, ?)');
    // current address (we store the full string in full_address)
    $stmt->execute(['', '', $input['current_address']]);
    $current_address_id = $pdo->lastInsertId();

    // permanent address
    $stmt->execute(['', '', $input['permanent_address']]);
    $permanent_address_id = $pdo->lastInsertId();

    // insert student
    $s = $pdo->prepare('INSERT INTO students (student_number, full_name, birthday, age, course_id, current_address_id, permanent_address_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $s->execute([
        $input['student_number'],
        $input['full_name'],
        $input['birthday'],
        (int)$input['age'],
        (int)$input['course_id'],
        $current_address_id,
        $permanent_address_id
    ]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>