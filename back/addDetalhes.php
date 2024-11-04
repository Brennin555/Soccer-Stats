<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$date="2022-09-19";
$season=substr($date, 0, 4);
$lastDate = "";

// Conectar ao banco de dados
$host = "localhost";
$db = "soccer-stats-db";
$user = "root";
$pass = ""; 

try {
    // Tenta conectar ao banco de dados
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtém a chave API da tabela configuracoes
    $sql = "SELECT apiKey, ultimo_dia_verificado FROM configuracoes LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $config = $stmt->fetch(PDO::FETCH_ASSOC);
    $apiKey = $config['apiKey'];
    $lastDate = $config['ultimo_dia_verificado'];

} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
    exit;
}
// Inicializa a requisição cURL para obter os fixtures (partidas) no período especificado
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => "https://v3.football.api-sports.io/fixtures?league=71&season=$season&from=$lastDate&to=$date",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_HTTPHEADER => array(
        'x-rapidapi-key: ' . $apiKey,
        'x-rapidapi-host: v3.football.api-sports.io'
    ),
));

$response = curl_exec($curl);
curl_close($curl);

if ($response === false) {
    echo "Erro na requisição: " . curl_error($curl);
    exit;
}

$data = json_decode($response, true);

// Verifica se obteve a lista de partidas
if (!isset($data['response']) || empty($data['response'])) {
    echo "Nenhuma partida encontrada.";
    exit;
}

// inserir jogador se nn existir na tabela 'jogador'
function inserirJogadorSeNecessario($pdo, $idJogador, $nomeJogador) {
    if ($idJogador !== null) {
        // Verifica se o jogador já existe no banco
        $sqlCheck = "SELECT COUNT(*) FROM jogador WHERE id = :idJogador";
        $stmtCheck = $pdo->prepare($sqlCheck);
        $stmtCheck->bindValue(':idJogador', $idJogador);
        $stmtCheck->execute();
        echo "Jogador verificado: " . $nomeJogador . "<br>";
        
        // Se o jogador não existe, insere-o
        if ($stmtCheck->fetchColumn() == 0) {
            $sqlInsertJogador = "INSERT INTO jogador (id, nome) VALUES (:idJogador, :nomeJogador)";
            $stmtInsertJogador = $pdo->prepare($sqlInsertJogador);
            $stmtInsertJogador->bindValue(':idJogador', $idJogador);
            $stmtInsertJogador->bindValue(':nomeJogador', $nomeJogador);
            $stmtInsertJogador->execute();
            echo "Jogador inserido: " . $nomeJogador . "<br>";
        }
    }
}

// Verificar se evento já existe
function verificarEventoExistente($pdo, $fixtureId, $idJogador1, $hora, $evento) {
    $sqlCheck = "SELECT COUNT(*) FROM detalhespartida WHERE idPartida = :idPartida AND idJogador1 = :idJogador1 
     AND hora = :hora AND evento = :evento";
    $stmtCheck = $pdo->prepare($sqlCheck);
    $stmtCheck->bindValue(':idPartida', $fixtureId);
    $stmtCheck->bindValue(':idJogador1', $idJogador1);
    $stmtCheck->bindValue(':hora', $hora);
    $stmtCheck->bindValue(':evento', $evento);
    $stmtCheck->execute();
    return $stmtCheck->fetchColumn() > 0;
}


// Atualizar evento existente
function atualizarEvento($pdo, $fixtureId, $idJogador1, $idJogador2, $hora, $evento, $detalheEv, $comentario) {
    $sqlUpdate = "UPDATE detalhespartida SET idJogador1 = :idJogador1, idJogador2 = :idJogador2, hora = :hora, evento = :evento, detalheEv = :detalheEv, comentario = :comentario
                  WHERE idPartida = :idPartida AND idJogador1 = :idJogador1 AND idJogador2 = :idJogador2 AND hora = :hora AND evento = :evento AND detalheEv = :detalheEv AND comentario = :comentario";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->bindValue(':idPartida', $fixtureId);
    $stmtUpdate->bindValue(':idJogador1', $idJogador1);
    $stmtUpdate->bindValue(':idJogador2', $idJogador2);
    $stmtUpdate->bindValue(':hora', $hora);
    $stmtUpdate->bindValue(':evento', $evento);
    $stmtUpdate->bindValue(':detalheEv', $detalheEv);
    $stmtUpdate->bindValue(':comentario', $comentario);
    $stmtUpdate->execute();
}

// Para cada fixture (partida) encontrada, faz uma nova requisição para buscar os eventos
foreach ($data['response'] as $fixture) {

    
    $fixtureId = $fixture['fixture']['id'];
    echo "<br><br><br> $fixtureId <br><br><br>";

    // Inicializa a requisição cURL para obter os eventos específicos de cada partida
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://v3.football.api-sports.io/fixtures/events?fixture=$fixtureId",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_HTTPHEADER => array(
            'x-rapidapi-key: 339925210cc657b54c360219edf39de5',
            'x-rapidapi-host: v3.football.api-sports.io'
        ),
    ));
    echo "Requisição de eventos para a partida $fixtureId.<br>";
    $eventResponse = curl_exec($curl);
    curl_close($curl);

    if ($eventResponse === false) {
        echo "Erro na requisição para eventos: " . curl_error($curl);
        continue;
    }

    $eventsData = json_decode($eventResponse, true);

    if (!isset($eventsData['response']) || empty($eventsData['response'])) {
        echo "Nenhum evento encontrado para a partida $fixtureId.<br>";
        continue;
    }

    foreach ($eventsData['response'] as $event) {
        $idJogador1 = $event['player']['id'] ?? null;
        $nomeJogador1 = $event['player']['name'] ?? "Nome não disponível";
        $idJogador2 = $event['assist']['id'] ?? null;
        $nomeJogador2 = $event['assist']['name'] ?? "Nome não disponível";
        $idTime = $event['team']['id'] ?? null;
        $hora = $event['time']['elapsed'] ?? null;
        $evento = $event['type'] ?? null;
        $detalheEv = $event['detail'] ?? null;
        $comentario = $event['comments'] ?? null;
    
        $horaFormatada = $hora !== null ? sprintf("%02d:00:00", $hora) : "00:00:00";
        echo "hora formatada: " . $horaFormatada . "<br>";

        // Insere jogador 1 e jogador 2 na tabela 'jogador' caso ainda não existam
        inserirJogadorSeNecessario($pdo, $idJogador1, $nomeJogador1);
        inserirJogadorSeNecessario($pdo, $idJogador2, $nomeJogador2);

        if ($idTime !== null && $idJogador1 !== null && $hora !== null && $evento !== null) {

            if (verificarEventoExistente($pdo, $fixtureId, $idJogador1, $hora, $evento)) {
                echo "Evento já existente e atualizado para " . $nomeJogador1 . " no minuto " . $hora . " na partida $fixtureId.<br>";
            } else {
                // Insere um novo evento
                $sql = "INSERT INTO detalhespartida (idPartida, idTime, idJogador1, idJogador2, hora, evento, detalheEv, comentario)
                        VALUES (:idPartida, :idTime, :idJogador1, :idJogador2, :hora, :evento, :detalheEv, :comentario)";
                $stmt = $pdo->prepare($sql);
            
                $stmt->bindValue(':idPartida', $fixtureId);
                $stmt->bindValue(':idTime', $idTime);
                $stmt->bindValue(':idJogador1', $idJogador1);
                $stmt->bindValue(':idJogador2', $idJogador2);
                $stmt->bindValue(':hora', $hora);
                $stmt->bindValue(':evento', $evento);
                $stmt->bindValue(':detalheEv', $detalheEv);
                $stmt->bindValue(':comentario', $comentario);
            
                if ($stmt->execute()) {
                    echo "Evento inserido com sucesso: " . $evento . " para " . $nomeJogador1 . " no minuto " . $hora . " na partida $fixtureId.<br>";
                }
            }
        } else {
            echo "Dados insuficientes para inserir o evento para o jogador: " . $nomeJogador1 . " na partida $fixtureId.<br>";
        }
    }
}
?>