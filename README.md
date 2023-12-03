# Loconos Project

    Abusa da função "Pessoas Próximas" do Telegram para triangular a posição aproximada dos usuários com essa função. O a ideia de triangulação de users tem sido amplamente utilizada pelo campo de Inteligência de Fontes Abertas (OSINT), e a automação do abuse junto à localização com OpenStreetMap desse projeto é um fork do projeto 'telegram-nearby-map', do git https://github.com/tejado;
    O projeto consiste coletar os dados de Latitude e Longitude produzidas pela API do Telegram em diferentes posições, e calcular automaticamente a posição aproximadada dos usuários a partir de três ou mais ocorrências (triangulaçao geográfica). A cada 25 segundos segundos são recebidos os dados do TDLib (https://github.com/tdlib/td), que incluen a distância dos usuários próximas à minha localização (que é alterada usando a ideia de Fake GPS). 


## Instalação

1. Cadastre uma API do Telegram usando as Ferramentas de Desenvolvedor do Telegram; somente um server é permitido por usuário de Telegram; [Link](https://my.telegram.org) 
2. Salve o número da API e sua respectiva hash; 
3. Instale o NODE.js no seu dispostivo; o node é utilizado para a interface web que será utilizada na integração dos dados TdLib e OpenstreetMap; [Link](https://nodejs.org/en/download)
4. Edite o arquivo config.js para receber os seus dados da API;
5. Clone o projeto [git clone https://github.com/podpoleguy/loconos/]
6. Vá até a pasta do projeto, abra o terminal no diretório e instale todas depedências pelo comando 'npm install'
7. Inicie a o server com 'npm start'
8. O terminal solicitará a autenticação do seu usuário do Telegram. Digite o seu telefone, e autentique o usuário provendo o código de acesso.
9. Abre o navegador e acesso o servidor web na porta 3000; http://localhost:3000
