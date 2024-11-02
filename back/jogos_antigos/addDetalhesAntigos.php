<?php
// Inicializa a requisição cURL para obter os fixtures (partidas) no período especificado
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://v3.football.api-sports.io/fixtures?league=71&season=2022&from=2022-10-15&to=2022-10-25',
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

// Conectar ao banco de dados
$host = "localhost"; // Defina seu host
$db = "soccer-stats-db"; // Defina o nome da sua base de dados
$user = "root"; // Defina seu usuário
$pass = ""; // Defina sua senha

try {
    // Tenta conectar ao banco de dados
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
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
function verificarEventoExistente( $pdo, $fixtureId, $idJogador1, $idJogador2, $hora, $evento, $detalheEv, $comentario) {
    $sqlCheck = "SELECT COUNT(*) FROM detalhespartida WHERE idPartida = :idPartida AND idJogador1 = :idJogador1 
     AND idJogador2 = :idJogador2 AND hora = :hora AND evento = :evento AND detalheEv = :detalheEv AND comentario = :comentario";
    $stmtCheck = $pdo->prepare($sqlCheck);
    $stmtCheck->bindValue(':idPartida', $fixtureId);
    $stmtCheck->bindValue(':idJogador1', $idJogador1);
    $stmtCheck->bindValue(':idJogador2', $idJogador2);
    $stmtCheck->bindValue(':hora', $hora);
    $stmtCheck->bindValue(':evento', $evento);
    $stmtCheck->bindValue(':detalheEv', $detalheEv);
    $stmtCheck->bindValue(':comentario', $comentario);
    $stmtCheck->execute();
    return $stmtCheck->fetchColumn() > 0;
}


// Para cada fixture (partida) encontrada, faz uma nova requisição para buscar os eventos
foreach ($data['response'] as $fixture) {

    $fixtureId = $fixture['fixture']['id'];

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

        // Insere jogador 1 e jogador 2 na tabela 'jogador' caso ainda não existam
        inserirJogadorSeNecessario($pdo, $idJogador1, $nomeJogador1);
        inserirJogadorSeNecessario($pdo, $idJogador2, $nomeJogador2);

        if ($idTime !== null && $idJogador1 !== null && $hora !== null && $evento !== null) {

            if(!verificarEventoExistente($pdo, $fixtureId, $idJogador1, $idJogador2, $hora, $evento, $detalheEv, $comentario)) {

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
        } else {
                echo "Erro ao inserir evento: " . $nomeJogador1 . "<br>";
            }
        } else {
            echo "Dados insuficientes para inserir o evento para o jogador: " . $nomeJogador1 . " na partida $fixtureId.<br>";
        }
    }
}
?>
