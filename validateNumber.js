const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const contactList = [
    { name: 'Eliel Filho', number: '' },
    { name: 'Novo Contato', number: '558491234567' },
    { name: 'propesqsec', number: ''}
];

const confirmedContactsFile = 'subscritos.json';


function loadConfirmedContacts() {
    if (fs.existsSync(confirmedContactsFile)) {
        const data = fs.readFileSync(confirmedContactsFile, 'utf-8').trim();
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error("❌ Erro ao carregar JSON, recriando arquivo...", error);
                fs.writeFileSync(confirmedContactsFile, '[]', 'utf-8');
                return [];
            }
        }
    }
    return [];
}

// Função para salvar contatos confirmados
function saveConfirmedContact(number) {
    const confirmedContacts = loadConfirmedContacts();
    if (!confirmedContacts.includes(number)) {
        confirmedContacts.push(number);
        fs.writeFileSync(confirmedContactsFile, JSON.stringify(confirmedContacts, null, 2), 'utf-8');
        console.log(`📌 Número ${number} salvo como subscrito.`);
    }
}

client.on('qr', qr => {
    console.log('Escaneie o QR Code abaixo para conectar:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ WhatsApp conectado com sucesso!');

    console.log('*****[///// Iniciando envio de mensagens /////]*****');

    const confirmedContacts = loadConfirmedContacts(); 

    for (const contact of contactList) {
        if (!contact.number || confirmedContacts.includes(contact.number)) {
            console.log(`🔹 Pulando ${contact.number}, já confirmado.`);
            continue;
        }

        await sendValidation(contact.number);
        const waitTime = 5000 + Math.random() * 5000;
        console.log(`⏳ Aguardando ${Math.round(waitTime / 1000)} segundos antes do próximo envio...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    console.log('✅ *****[ Todos os envios foram concluídos ]*****');
});

async function sendValidation(contactNumber) {
    try {
        const numberId = await client.getNumberId(contactNumber);
        if (!numberId) {
            console.log(`❌ Número ${contactNumber} não está registrado no WhatsApp.`);
            return;
        }

        const message = `*Olá, você se inscreveu para receber nossas notícias pelo WhatsApp.*\n\n` +
                        `Para garantir que você realmente solicitou este serviço, responda com *!SIM* para confirmar a inscrição.\n\n` +
                        `A Pró-reitoria de Pesquisa da UFRN agradece a sua adesão ao serviço.\n\n` +
                        `Caso tenha sido um engano, basta ignorar esta mensagem e você não receberá mais conteúdos.\n\n` +
                        `Aguardamos sua confirmação! 😊`;

        await client.sendMessage(numberId._serialized, message);
        console.log(`✅ Mensagem enviada para ${contactNumber}`);
    } catch (error) {
        console.error(`⚠️ Erro ao enviar para ${contactNumber}:`, error);
    }
}

client.on('message_create', async (message) => {
    if (message.body.toLowerCase() === '!sim') {
        await client.sendMessage(message.from, 'Ótimo, agora você é um subscritor das notícias da PROPESQ! 🎉');
        console.log(`✅ Confirmação recebida de ${message.from}`);


        saveConfirmedContact(message.from);
    }
});

client.initialize();
