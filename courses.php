<?php
require_once _DIR_ . '/../db.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['id'])) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'id required']); exit; }

try {
    $id = (int)$input['id'];
    $stmt = $pdo->prepare('DELETE FROM students WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>