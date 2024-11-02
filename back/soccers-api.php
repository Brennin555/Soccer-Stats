<?php
// Sua chave da API
$apiKey = 'SUA_API_KEY_AQUI';

// URL da API que você deseja acessar
$url = 'https://api.soccersapi.com/v2.2/matches/?user=seu_usuario&token=' . $apiKey . '&t=schedule';

// Iniciando o cURL
$ch = curl_init();

// Configurando opções do cURL
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Fazendo a requisição
$response = curl_exec($ch);

// Fechando o cURL
curl_close($ch);

// Verificando a resposta
if ($response === false) {
    echo 'Erro ao fazer a requisição!';
} else {
    // Decodificando a resposta JSON
    $data = json_decode($response, true);

    // Verificando e tratando os dados
    if (isset($data['data'])) {
        foreach ($data['data'] as $match) {
            echo "Partida: " . $match['home_team']['name'] . " vs " . $match['away_team']['name'] . "<br>";
            echo "Data: " . $match['match_start'] . "<br><br>";
        }
    } else {
        echo 'Nenhuma partida encontrada!';
    }
}
?>
