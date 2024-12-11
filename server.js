const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Substitua pelo Token da Instância e a URL da API UltraMsg
const TOKEN = 'zj0rqkg5md49qdk'; // Coloque seu token da UltraMsg aqui
const INSTANCE_URL = 'https://api.ultramsg.com/instance101531'; // Coloque o URL da sua instância aqui

// Variável para rastrear o estado da conversa por cliente
const conversationState = {};

// Função para enviar mensagens
async function sendMessage(phone, message) {
    try {
        const response = await axios.post(
            `${INSTANCE_URL}/messages/chat`,
            {
                to: phone,
                body: message,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    token: TOKEN,
                },
            }
        );
        console.log(`Mensagem enviada para ${phone}: ${message}`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem para ${phone}:`, error.response?.data || error.message);
    }
}

// Rota para o Webhook
app.post('/webhook', async (req, res) => {
    const { from, body } = req.body; // Número e mensagem recebida

    console.log(`Mensagem recebida de ${from}: ${body}`);

    // Inicializa o estado da conversa, se não existir
    if (!conversationState[from]) {
        conversationState[from] = 0; // Início da conversa
    }

    // Determina a resposta com base no estado da conversa
    let reply = '';
    switch (conversationState[from]) {
        case 0: // Boas-vindas e pergunta inicial
            reply = '*Muito Bem Vindo ao Esporte Clube VILA NOVA ⚽🇾🇪*\n\nAgradecemos seu contato.\n\nNome Completo do Aluno e Ginásio de treino?\n\nJá deixe sua solicitação aqui que logo respondemos.\nEm que podemos lhe ajudar?';
            conversationState[from] = 1;
            break;

        case 1: // Resposta ao cancelamento
            if (body.toLowerCase().includes('cancelamento')) {
                reply = '*Cancelamento*\n\nPoxa que pena 😕\nAconteceu algo para a desistência do atleta aos treinos?';
                conversationState[from] = 2;
            } else if (body.toLowerCase().includes('matrícula')) {
                reply = '*Matrícula*\n\nVocê já verificou a disponibilidade de vaga?\n\n1. SIM\n\nPara realizar a matrícula do seu filho, acesse o link abaixo, baixe o app e responda as solicitações:\nhttps://atletas.app.link/vilanovaec\n\nSe tiver dúvidas, aqui tem um vídeo explicativo:\nhttps://www.youtube.com/watch?v=v3uunhxtxJ8\n\n2. NÃO\n\nQual o ano de nascimento do atleta?\nTurno de disponibilidade de treino?\nBairro em que residem?';
                conversationState[from] = 3;
            } else if (body.toLowerCase().includes('pagamento')) {
                reply = '*Pagamento*\n\n1. *MENSALIDADE DESTE MÊS*\n\nPara pagamento você deve acessar o app RITMO ATLETAS e seguir o passo abaixo:\nMENU - SEU PLANO - FATURAS\n\nSelecione a forma de pagamento. Para pix, a baixa da mensalidade é feita na hora; para boleto, leva até 2 dias úteis.\n\n2. *MENSALIDADE EM ATRASO*\n\nQual o nome completo do seu filho?\n\nLogo retornaremos para auxiliar na regularização.';
                conversationState[from] = 4;
            } else if (body.toLowerCase().includes('uniforme')) {
                reply = '*Uniforme*\n\nNossos uniformes ficam disponíveis para compra na Loja PlayTennis da Rua Morom, esquina com Fagundes dos Reis - Passo Fundo.\n\n1. Atendemos sua dúvida?\n\n1. Sim\nAgradecemos seu contato e estamos disponíveis 🫱🏻‍🫲🏻\n\n2. Não posso ir em horário comercial\nNão se preocupe, podemos agendar uma melhor forma. Me passe mais informações sobre o que você precisa e o tamanho, que logo lhe retorno.';
                conversationState[from] = 5;
            } else {
                reply = '*Fale Conosco*\n+55 48 9114-1197\n\nPedimos sua compreensão e paciência. Nosso horário de atendimento inicia às 19h neste contato. Antes desse horário, você pode contatar o suporte do app: 048991230304.';
                conversationState[from] = 6;
            }
            break;

        case 2: // Confirmar condições do cancelamento
            reply = 'Lembramos que, para solicitações de cancelamento, as mensalidades devem estar em dia, cumprir o contrato mínimo de 6 meses no clube, e a solicitação deve ocorrer 30 dias antes do vencimento da próxima mensalidade para que possamos finalizar no sistema.';
            conversationState[from] = 1;
            break;

        default: // Mensagem final
            reply = 'Agradecemos o contato! Se precisar de mais informações, estamos à disposição.';
            conversationState[from] = 0; // Reinicia o fluxo
            break;
    }

    // Envia a mensagem de resposta
    await sendMessage(from, reply);

    // Retorna status ao cliente
    res.sendStatus(200);
});

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
"atualização do webhook para ultraMsg"
