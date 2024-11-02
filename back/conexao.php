<?php
$servername = "localhost";
$username = "root";  // Usuário padrão do XAMPP
$password = "";      // Senha padrão do XAMPP é vazia
$dbname = "soccer-stats-db";

// Criando a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Checando a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}
echo "Conexão bem-sucedida!";
?>
