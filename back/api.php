<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// Lida com requisições OPTIONS (preflight) de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Conecte-se ao banco de dados (ajuste as credenciais conforme necessário)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "soccer-stats-db";

// Criação da conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die(json_encode(['message' => 'Conexão falhou: ' . $conn->connect_error]));
}

// Obtenha os parâmetros da URL
$request = $_GET;

// Lida com a requisição GET para listar os times
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['times'])) {
    $sql = "SELECT * FROM time";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $times = [];
        while ($row = $result->fetch_assoc()) {
            $times[] = $row;
        }
        echo json_encode($times);
    } else {
        echo json_encode(['message' => 'Nenhum time encontrado']);
    }
}

// Lida com requisição GET para listar as partidas
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['partidas'])) {
    $sql = "SELECT partida.*, timeA.nome AS timeA_nome, timeB.nome AS timeB_nome 
            FROM partida
            JOIN time AS timeA ON partida.timeA = timeA.id
            JOIN time AS timeB ON partida.timeB = timeB.id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $partidas = [];
        while ($row = $result->fetch_assoc()) {
            $partidas[] = $row;
        }
        echo json_encode($partidas);
    } else {
        echo json_encode(['message' => 'Nenhuma partida encontrada']);
    }
}

// Lida com requisição GET para partida especifica
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['partida'])) {
    $sql = "SELECT partida.*, timeA.nome AS timeA_nome, timeB.nome AS timeB_nome 
            FROM partida
            JOIN time AS timeA ON partida.timeA = timeA.id
            JOIN time AS timeB ON partida.timeB = timeB.id
            WHERE partida.id = " . $request['partida'];
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $partidas = [];
        while ($row = $result->fetch_assoc()) {
            $partidas[] = $row;
        }
        echo json_encode($partidas);
    } else {
        echo json_encode(['message' => 'Nenhuma partida encontrada']);
    }
}

// Lida com requisição GET para listar os jogadores
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['jogadores'])) {
    $sql = "SELECT * FROM jogador";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $jogadores = [];
        while ($row = $result->fetch_assoc()) {
            $jogadores[] = $row;
        }
        echo json_encode($jogadores);
    } else {
        echo json_encode(['message' => 'Nenhum jogador encontrado']);
    }
}

// Lida com requisição GET para listar jogadores de um time específico
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['jogadores']) && isset($request['time'])) {
    $sql = "SELECT * FROM jogador WHERE idTime = " . $request['time'];
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $jogadores = [];
        while ($row = $result->fetch_assoc()) {
            $jogadores[] = $row;
        }
        echo json_encode($jogadores);
    } else {
        echo json_encode(['message' => 'Nenhum jogador encontrado para o time ' . $request['time']]);
    }
}

// Lida com requisição GET para jogador específico
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['jogador'])) {
    $sql = "SELECT * FROM jogador WHERE id = " . $request['jogador'];
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $jogadores = [];
        while ($row = $result->fetch_assoc()) {
            $jogadores[] = $row;
        }
        echo json_encode($jogadores);
    } else {
        echo json_encode(['message' => 'Nenhum jogador encontrado']);
    }
}

// Lida com requisição GET para listar as partidas
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['estatisticas'])) {
    $sql = "SELECT estatisticas.*, timeA.nome AS timeA_nome, timeB.nome AS timeB_nome 
            FROM estatisticas
            JOIN time AS timeA ON estatisticas.idTimeA = timeA.id
            JOIN time AS timeB ON estatisticas.idTimeB = timeB.id
            WHERE estatisticas.idPartida = " . $request['idPartida'];
    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $estatisticas = [];
        while ($row = $result->fetch_assoc()) {
            $estatisticas[] = $row;
        }
        echo json_encode($estatisticas);
    } else {
        echo json_encode(['message' => 'Nenhuma estatística encontrada']);
    }
}

// Lida com requisição GET para listar detalhes partida
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['detalhespartida'])) {
    $sql = "SELECT detalhespartida.* 
            FROM detalhespartida
            WHERE detalhespartida.idPartida = " . $request['idPartida'];
    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $detalhespartida = [];
        while ($row = $result->fetch_assoc()) {
            $detalhespartida[] = $row;
        }
        echo json_encode($detalhespartida);
    } else {
        echo json_encode(['message' => 'Nenhuma estatística encontrada para a partida ' . $request['idPartida']]);
    }
}

//  retorna escudo do time
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($request['escudo'])) {
    $sql = "SELECT escudo 
            FROM time
            WHERE id = " . $request['idTime'];
    
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $escudo = $result->fetch_assoc();
        echo json_encode($escudo);
    } else {
        echo json_encode(['message' => 'Nenhum escudo encontrado para o time com ID ' . $request['idTime']]);
    }
}


// Fecha a conexão com o banco de dados
$conn->close();
?>
