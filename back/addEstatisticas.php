<?php

$date="2022-10-10";
$season=substr($date, 0, 4);
// Inicializa a requisição cURL para obter os fixtures (partidas) no período especificado
$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_URL => "https://v3.football.api-sports.io/fixtures?league=71&season=$season&date=$date",
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
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
    exit;
}

// Função para mapear estatísticas de cada time para o banco de dados
function mapStats($stats, $prefix) {
    $mapped = [];
    foreach ($stats as $stat) {
        switch ($stat['type']) {
            case "Shots on Goal": $mapped[$prefix . "chutesGol"] = $stat['value']; break;
            case "Shots off Goal": $mapped[$prefix . "chutesFora"] = $stat['value']; break;
            case "Total Shots": $mapped[$prefix . "totalChutes"] = $stat['value']; break;
            case "Blocked Shots": $mapped[$prefix . "chutesBloq"] = $stat['value']; break;
            case "Shots insidebox": $mapped[$prefix . "chutesDentroArea"] = $stat['value']; break;
            case "Shots outsidebox": $mapped[$prefix . "chutesForaArea"] = $stat['value']; break;
            case "Fouls": $mapped[$prefix . "faltas"] = $stat['value']; break;
            case "Corner Kicks": $mapped[$prefix . "escanteios"] = $stat['value']; break;
            case "Offsides": $mapped[$prefix . "impedimentos"] = $stat['value']; break;
            case "Ball Possession": $mapped[$prefix . "posseBola"] = $stat['value']; break;
            case "Yellow Cards": $mapped[$prefix . "cAmarelos"] = $stat['value']; break;
            case "Red Cards": $mapped[$prefix . "cVermelhos"] = $stat['value']; break;
            case "Goalkeeper Saves": $mapped[$prefix . "defesasGoleiro"] = $stat['value']; break;
            case "Total passes": $mapped[$prefix . "totalPasses"] = $stat['value']; break;
            case "Passes accurate": $mapped[$prefix . "passesCertos"] = $stat['value']; break;
            case "Passes %": $mapped[$prefix . "porcentPasses"] = $stat['value']; break;
        }
    }
    return $mapped;
}


// Para cada fixture (partida) encontrada, faz uma nova requisição para buscar as estatísticas
foreach ($data['response'] as $fixture) {
    $fixtureId = $fixture['fixture']['id'];

    echo"<br><br><br> $fixtureId <br><br><br>";

    // Inicializa a requisição cURL para obter as estatísticas específicas de cada partida
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://v3.football.api-sports.io/fixtures/statistics?fixture=$fixtureId",
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

    $statsResponse = curl_exec($curl);
    curl_close($curl);

    if ($statsResponse === false) {
        echo "Erro na requisição para estatísticas: " . curl_error($curl);
        continue;
    }

    $statsData = json_decode($statsResponse, true);

    if (!isset($statsData['response']) || count($statsData['response']) < 2) {
        echo "Estatísticas incompletas para a partida $fixtureId.<br>";
        continue;
    }

    // Mapeia as estatísticas dos dois times
    $statsA = mapStats($statsData['response'][0]['statistics'], "A");
    $statsB = mapStats($statsData['response'][1]['statistics'], "B");

    // Defina os IDs dos times com base nos dados retornados pela API
$idTimeA = $statsData['response'][0]['team']['id'];
$idTimeB = $statsData['response'][1]['team']['id'];


    // Prepara a query de inserção
// Prepara a query de inserção
$sql = "INSERT INTO estatisticas (
    idPartida,
    idTimeA,
    idTimeB,
    chutesGolA,
    chutesGolB,
    chutesForaA,
    chutesForaB,
    totalChutesA,
    totalChutesB,
    chutesBloqA,
    chutesBloqB,
    chutesDentroAreaA,
    chutesDentroAreaB,
    chutesForaAreaA,
    chutesForaAreaB,
    faltasA,
    faltasB,
    escanteiosA,
    escanteiosB,
    impedimentosA,
    impedimentosB,
    posseBolaA,
    posseBolaB,
    cAmarelosA,
    cAmarelosB,
    cVermelhosA,
    cVermelhosB,
    defesasGoleiroA,
    defesasGoleiroB,
    totalPassesA,
    totalPassesB,
    passesCertosA,
    passesCertosB,
    porcentPassesA,
    porcentPassesB
) VALUES (
    :idPartida,
    :idTimeA,
    :idTimeB,
    :chutesGolA,
    :chutesGolB,
    :chutesForaA,
    :chutesForaB,
    :totalChutesA,
    :totalChutesB,
    :chutesBloqA,
    :chutesBloqB,
    :chutesDentroAreaA,
    :chutesDentroAreaB,
    :chutesForaAreaA,
    :chutesForaAreaB,
    :faltasA,
    :faltasB,
    :escanteiosA,
    :escanteiosB,
    :impedimentosA,
    :impedimentosB,
    :posseBolaA,
    :posseBolaB,
    :cAmarelosA,
    :cAmarelosB,
    :cVermelhosA,
    :cVermelhosB,
    :defesasGoleiroA,
    :defesasGoleiroB,
    :totalPassesA,
    :totalPassesB,
    :passesCertosA,
    :passesCertosB,
    :porcentPassesA,
    :porcentPassesB
)";
$stmt = $pdo->prepare($sql);


// Insere os valores no banco de dados usando bindValue
$params = [
    'idPartida' => $fixtureId,
    'idTimeA' => $idTimeA,
    'idTimeB' => $idTimeB,
    'chutesGolA' => $statsA['AchutesGol'] ?? null,
    'chutesGolB' => $statsB['BchutesGol'] ?? null,
    'chutesForaA' => $statsA['AchutesFora'] ?? null,
    'chutesForaB' => $statsB['BchutesFora'] ?? null,
    'totalChutesA' => $statsA['AtotalChutes'] ?? null,
    'totalChutesB' => $statsB['BtotalChutes'] ?? null,
    'chutesBloqA' => $statsA['AchutesBloq'] ?? null,
    'chutesBloqB' => $statsB['BchutesBloq'] ?? null,
    'chutesDentroAreaA' => $statsA['AchutesDentroArea'] ?? null,
    'chutesDentroAreaB' => $statsB['BchutesDentroArea'] ?? null,
    'chutesForaAreaA' => $statsA['AchutesForaArea'] ?? null,
    'chutesForaAreaB' => $statsB['BchutesForaArea'] ?? null,
    'faltasA' => $statsA['Afaltas'] ?? null,
    'faltasB' => $statsB['Bfaltas'] ?? null,
    'escanteiosA' => $statsA['Aescanteios'] ?? null,
    'escanteiosB' => $statsB['Bescanteios'] ?? null,
    'impedimentosA' => $statsA['Aimpedimentos'] ?? null,
    'impedimentosB' => $statsB['Bimpedimentos'] ?? null,
    'posseBolaA' => $statsA['AposseBola'] ?? null,
    'posseBolaB' => $statsB['BposseBola'] ?? null,
    'cAmarelosA' => $statsA['AcAmarelos'] ?? null,
    'cAmarelosB' => $statsB['BcAmarelos'] ?? null,
    'cVermelhosA' => $statsA['AcVermelhos'] ?? null,
    'cVermelhosB' => $statsB['BcVermelhos'] ?? null,
    'defesasGoleiroA' => $statsA['AdefesasGoleiro'] ?? null,
    'defesasGoleiroB' => $statsB['BdefesasGoleiro'] ?? null,
    'totalPassesA' => $statsA['AtotalPasses'] ?? null,
    'totalPassesB' => $statsB['BtotalPasses'] ?? null,
    'passesCertosA' => $statsA['ApassesCertos'] ?? null,
    'passesCertosB' => $statsB['BpassesCertos'] ?? null,
    'porcentPassesA' => $statsA['AporcentPasses'] ?? null,
    'porcentPassesB' => $statsB['BporcentPasses'] ?? null,
];

// Debug: Verifica os parâmetros
print_r($params); // Para verificar se todos os parâmetros estão corretos

foreach ($params as $param => $value) {
    $stmt->bindValue(":$param", $value); // Não precisa do null coalescing se já está sendo tratado acima
}

try {
    if ($stmt->execute()) {
        echo "Estatísticas inseridas com sucesso para a partida $fixtureId.<br>";
    } else {
        echo "Erro ao inserir estatísticas para a partida $fixtureId.<br>";
    }
} catch (PDOException $e) {
    echo "Erro na execução: " . $e->getMessage();
}
}

?>
