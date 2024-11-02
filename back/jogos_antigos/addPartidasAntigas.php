<?php
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

// Verifique se a resposta foi bem-sucedida
if ($response === false) {
    echo "Erro na requisição: " . curl_error($curl);
    exit;
}

// Decodifica o JSON para um array associativo
$data = json_decode($response, true);

// Verifique se a resposta contém dados
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
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Função para garantir que o time está inserido no banco de dados
    function inserirTimeSeNaoExistir($pdo, $teamId, $teamName) {
        // Verifica se o time já existe
        $sqlVerificaTime = "SELECT id FROM time WHERE id = :id";
        $stmtVerificaTime = $pdo->prepare($sqlVerificaTime);
        $stmtVerificaTime->bindParam(':id', $teamId);
        $stmtVerificaTime->execute();

        if ($stmtVerificaTime->rowCount() == 0) {
            // Se o time não existir, insira-o
            $sqlInserirTime = "INSERT INTO time (id, nome) VALUES (:id, :nome)";
            $stmtInserirTime = $pdo->prepare($sqlInserirTime);
            $stmtInserirTime->bindParam(':id', $teamId);
            $stmtInserirTime->bindParam(':nome', $teamName);
            $stmtInserirTime->execute();
            echo "Time inserido: $teamName<br>";
        } else {
            echo "Time já existente: $teamName<br>";
        }
    }

    foreach ($data['response'] as $matchData) {
        // Informações dos times
        $timeAId = $matchData['teams']['home']['id'];
        $timeAName = $matchData['teams']['home']['name'];
        $timeBId = $matchData['teams']['away']['id'];
        $timeBName = $matchData['teams']['away']['name'];

        $golsA = $matchData['goals']['home'];
        $golsB = $matchData['goals']['away'];
        
        // Certifique-se de que os times existem
        inserirTimeSeNaoExistir($pdo, $timeAId, $timeAName);
        inserirTimeSeNaoExistir($pdo, $timeBId, $timeBName);
        
        // Informações da partida
        $id = $matchData['fixture']['id'];
        $local = $matchData['fixture']['venue']['name'];
        $juiz = $matchData['fixture']['referee'];
        $rodada = $matchData['league']['round'];

        $horario = $matchData['fixture']['date'];

        // Inserir a partida na tabela 'partida'
        $sqlPartida = "INSERT INTO partida (id, local, juiz, horario, timeA, timeB, rodada, golsA, golsB)
                       VALUES (:id, :local, :juiz, :horario, :timeA, :timeB, :rodada, :golsA, :golsB)
                       ON DUPLICATE KEY UPDATE
                       local = VALUES(local),
                       juiz = VALUES(juiz),
                       horario = VALUES(horario),
                       timeA = VALUES(timeA),
                       timeB = VALUES(timeB),
                       rodada = VALUES(rodada),
                       golsA = VALUES(golsA),
                       golsB = VALUES(golsB)";

        $stmtPartida = $pdo->prepare($sqlPartida);
        $stmtPartida->bindParam(':id', $id);
        $stmtPartida->bindParam(':local', $local);
        $stmtPartida->bindParam(':juiz', $juiz);
        $stmtPartida->bindParam(':horario', $horario);
        $stmtPartida->bindParam(':timeA', $timeAId);
        $stmtPartida->bindParam(':timeB', $timeBId);
        $stmtPartida->bindParam(':rodada', $rodada);
        $stmtPartida->bindParam(':golsA', $golsTimeA);
        $stmtPartida->bindParam(':golsB', $golsTimeB);

        if ($stmtPartida->execute()) {
            echo "Partida inserida/atualizada com sucesso: $timeAName vs $timeBName<br>";
        } else {
            echo "Erro ao inserir/atualizar partida: $timeAName vs $timeBName<br>";
        }

        // Processar os gols da partida
        if (isset($matchData['goals'])) {
            $golsTimeA = $matchData['goals']['home'];
            $golsTimeB = $matchData['goals']['away'];

            // Inserir gols do time A
            for ($i = 0; $i < $golsTimeA; $i++) {
                // Insere gol para o time A
                $instante = "Tempo indefinido"; // Ajustar conforme os dados reais
                // Inserir o gol
                $sqlGol = "INSERT INTO gol (instante)
                           VALUES (:instante)";
                $stmtGol = $pdo->prepare($sqlGol);
                $stmtGol->bindParam(':instante', $instante);
                $stmtGol->execute();

                $idGol = $pdo->lastInsertId();

                // Inserir a relação partida-gol
                $sqlPartidaGol = "INSERT INTO partida_gols (idPartida, idGol)
                                  VALUES (:idPartida, :idGol)";
                $stmtPartidaGol = $pdo->prepare($sqlPartidaGol);
                $stmtPartidaGol->bindParam(':idPartida', $id);
                $stmtPartidaGol->bindParam(':idGol', $idGol);
                $stmtPartidaGol->execute();
            }

            // Inserir gols do time B
            for ($i = 0; $i < $golsTimeB; $i++) {
                // Insere gol para o time B
                $instante = "Tempo indefinido";
                $sqlGol = "INSERT INTO gol (instante)
                           VALUES (:instante)";
                $stmtGol = $pdo->prepare($sqlGol);
                $stmtGol->bindParam(':instante', $instante);
                $stmtGol->execute();

                $idGol = $pdo->lastInsertId();

                $sqlPartidaGol = "INSERT INTO partida_gols (idPartida, idGol)
                                  VALUES (:idPartida, :idGol)";
                $stmtPartidaGol = $pdo->prepare($sqlPartidaGol);
                $stmtPartidaGol->bindParam(':idPartida', $id);
                $stmtPartidaGol->bindParam(':idGol', $idGol);
                $stmtPartidaGol->execute();
            }
        }
    }

    echo "Dados das partidas e gols inseridos/atualizados com sucesso!";

} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
}
?>
