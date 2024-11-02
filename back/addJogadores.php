<?php
// Conectar ao banco de dados
$host = "localhost"; // Defina seu host
$db = "soccer-stats-db"; // Defina o nome da sua base de dados
$user = "root"; // Defina seu usuário
$pass = ""; // Defina sua senha

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta para obter os IDs dos times
    $stmt = $pdo->query("SELECT id FROM time"); // Altere para o nome correto da tabela se necessário
    $times = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($times as $time) {
        $teamId = $time['id'];

        // Inicializa a sessão cURL
        $curl = curl_init();

        // Configura as opções do cURL
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://v3.football.api-sports.io/players?league=71&team=$teamId&season=2022", // Adiciona o id do time
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

        // Executa a requisição
        $response = curl_exec($curl);
        curl_close($curl);

        // Verifica se a resposta foi bem-sucedida
        if ($response === false) {
            echo "Erro na requisição para o time ID $teamId: " . curl_error($curl) . "<br>";
            continue; // Pula para o próximo time
        }

        // Decodifica o JSON para um array associativo
        $data = json_decode($response, true);

        // Verifica se a resposta contém dados
        if (!isset($data['response']) || empty($data['response'])) {
            echo "Nenhum jogador encontrado para o time ID $teamId.<br>";
            continue; // Pula para o próximo time
        }

        // Itera sobre a resposta dos jogadores
        foreach ($data['response'] as $playerData) {
            $player = $playerData['player'];
            $statistics = $playerData['statistics'][0]; // Assume que há pelo menos um conjunto de estatísticas

            // Obtém os dados necessários
            $id = $player['id'];
            $idTime = $statistics['team']['id'];
            $nome = $player['name'];
            $idade = $player['age'];
            $nGols = $statistics['goals']['total'];
            $nAssists = $statistics['goals']['assists'] ?? 0; // Define 0 se não houver assistência
            $nCAmarelos = $statistics['cards']['yellow'] ?? 0; // Define 0 se não houver cartões
            $nCVermelhos = $statistics['cards']['red'] ?? 0; // Define 0 se não houver cartões
            $nJogos = $statistics['games']['appearences'] ?? 0; // Define 0 se não houver aparições

            // Preparar a query de inserção
            $sql = "INSERT INTO jogador (id, idTime, nome, idade, nGols, nAssists, nCAmarelos, nCVermelhos, nJogos)
                    VALUES (:id, :idTime, :nome, :idade, :nGols, :nAssists, :nCAmarelos, :nCVermelhos, :nJogos)
                    ON DUPLICATE KEY UPDATE
                    idTime = VALUES(idTime),
                    nome = VALUES(nome),
                    idade = VALUES(idade),
                    nGols = VALUES(nGols),
                    nAssists = VALUES(nAssists),
                    nCAmarelos = VALUES(nCAmarelos),
                    nCVermelhos = VALUES(nCVermelhos),
                    nJogos = VALUES(nJogos)";

            $stmt = $pdo->prepare($sql);

            // Bind dos parâmetros
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':idTime', $idTime);
            $stmt->bindParam(':nome', $nome);
            $stmt->bindParam(':idade', $idade);
            $stmt->bindParam(':nGols', $nGols);
            $stmt->bindParam(':nAssists', $nAssists);
            $stmt->bindParam(':nCAmarelos', $nCAmarelos);
            $stmt->bindParam(':nCVermelhos', $nCVermelhos);
            $stmt->bindParam(':nJogos', $nJogos);

            // Executa a inserção ou atualização
            if ($stmt->execute()) {
                echo "Jogador inserido/atualizado com sucesso: $nome (Time ID: $idTime)<br>";
            } else {
                echo "Erro ao inserir/atualizar jogador: $nome (Time ID: $idTime)<br>";
            }
        }

        echo "Dados de todos os jogadores do time ID $teamId inseridos/atualizados com sucesso!<br>";
    }

} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
}
?>
