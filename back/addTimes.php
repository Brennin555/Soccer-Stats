<?php
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://v3.football.api-sports.io/standings?league=71&season=2022',
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
    echo "Nenhuma classificação encontrada.";
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

    // Verifique se a chave "standings" existe antes de iterar
    if (isset($data['response'][0]['league']['standings']) && is_array($data['response'][0]['league']['standings'])) {
        // Iterar sobre todos os times nas classificações
        foreach ($data['response'][0]['league']['standings'][0] as $teamData) {
            // Verificar se o time possui informações completas
            if (isset($teamData['team']) && isset($teamData['all'])) {
                // Mostrar os dados que estão sendo processados para cada time
                echo "Processando time: " . $teamData['team']['name'] . "<br>";
                echo "ID: " . $teamData['team']['id'] . "<br>";
                echo "Posição: " . $teamData['rank'] . "<br>";
                echo "Pontos: " . $teamData['points'] . "<br>";
                echo "Vitórias: " . $teamData['all']['win'] . "<br>";
                echo "Empates: " . $teamData['all']['draw'] . "<br>";
                echo "Derrotas: " . $teamData['all']['lose'] . "<br>";
                echo "Jogos: " . $teamData['all']['played'] . "<br>";
                echo "Gols: " . $teamData['all']['goals']['for'] . "<br>";
                echo "Escudo: " . $teamData['team']['logo'] . "<br><br>";

                // Preparar a query de inserção
                $sql = "INSERT INTO time (id, nome, posicao, pontos, nVitorias, nEmpates, nDerrotas, nJogos, nGols, escudo)
                        VALUES (:id, :nome, :posicao, :pontos, :nVitorias, :nEmpates, :nDerrotas, :nJogos, :nGols, :escudo)
                        ON DUPLICATE KEY UPDATE
                        posicao = VALUES(posicao),
                        pontos = VALUES(pontos),
                        nVitorias = VALUES(nVitorias),
                        nEmpates = VALUES(nEmpates),
                        nDerrotas = VALUES(nDerrotas),
                        nJogos = VALUES(nJogos),
                        nGols = VALUES(nGols),
                        escudo = VALUES(escudo)";

                $stmt = $pdo->prepare($sql);

                // Bind dos parâmetros
                $stmt->bindParam(':id', $teamData['team']['id']);
                $stmt->bindParam(':nome', $teamData['team']['name']);
                $stmt->bindParam(':posicao', $teamData['rank']);
                $stmt->bindParam(':pontos', $teamData['points']);
                $stmt->bindParam(':nVitorias', $teamData['all']['win']);
                $stmt->bindParam(':nEmpates', $teamData['all']['draw']);
                $stmt->bindParam(':nDerrotas', $teamData['all']['lose']);
                $stmt->bindParam(':nJogos', $teamData['all']['played']);
                $stmt->bindParam(':nGols', $teamData['all']['goals']['for']);
                $stmt->bindParam(':escudo', $teamData['team']['logo']);
                
                // Executa a inserção ou atualização
                if ($stmt->execute()) {
                    echo "Time inserido/atualizado com sucesso: " . $teamData['team']['name'] . "<br><br>";
                } else {
                    echo "Erro ao inserir/atualizar time: " . $teamData['team']['name'] . "<br><br>";
                }
            } else {
                echo "Dados incompletos para o time. Verifique a estrutura.<br>";
            }
        }
    } else {
        echo "Dados de classificação não encontrados.<br>";
    }

    echo "Dados de todos os times inseridos/atualizados com sucesso!";
    
} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
}
?>
