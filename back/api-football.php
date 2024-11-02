<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  // CURLOPT_URL => 'https://v3.football.api-sports.io/fixtures?league=71&season=2022&from=2022-10-15&to=2022-10-25',
  // CURLOPT_URL => 'https://v3.football.api-sports.io/standings?league=71&season=2022',
  // CURLOPT_URL => 'https://v3.football.api-sports.io/teams?id=127',
  // CURLOPT_URL => 'https://v3.football.api-sports.io/players?league=71&team=131&season=2022',
  CURLOPT_URL => 'https://v3.football.api-sports.io/fixtures/events?fixture=838301',
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
echo $response;
echo "<br><br><br><br>";

// Verifique se a resposta contém dados
if (!isset($data['response']) || empty($data['response'])) {
    echo "Nenhuma partida encontrada para as datas especificadas.";
} else {
    // Exemplo de como iterar sobre as rodadas (fixtures)
    foreach ($data['response'] as $fixture) {
        echo "Jogo: " . $fixture['teams']['home']['name'] . " vs " . $fixture['teams']['away']['name'] . "<br>";
        echo "ID:" . $fixture['fixture']['id'] . "<br>"; 
        echo "Data: " . $fixture['fixture']['date'] . "<br>";
        echo "Status: " . $fixture['fixture']['status']['long'] . "<br>";
        echo "Resultado: " . $fixture['goals']['home'] . " x " . $fixture['goals']['away'] . "<br>";
        echo "<br>";
    }
}
?>
