const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {headless: true,
    args: [ '--no-sandbox', '--disable-setuid-sandbox']    
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('*****[/////client is ready/////]*****')
});

client.initialize();

const contactList =[
    {name: "name", number: "number"},
    {name: "name", number: "number"},

    //loadmore
];

async function sendStructureMessage(contactNumber) {
    try {
        //SI - number
        const formattedNumber = contactNumber.includes('@c.us') 
            ? contactNumber 
            : `${contactNumber}@c.us`;
        
        //numero_valido?
        const isRegistered = await client.isRegisteredUser(formattedNumber);
        
        if (!isRegistered) {
            console.log(`Número ${formattedNumber} não está registrado no WhatsApp`);
            return;
        }
        
        
        const message = `
*PROPESQ divulga Mesa-Redonda: "Construindo Pontes: Gênero, Raça e a Presença Feminina na Pesquisa Científica"*

No mês das mulheres, a Pró-Reitoria de Pesquisa da Universidade Federal do Rio Grande do Norte convida todos para um debate essencial sobre diversidade e inclusão na ciência!

*📌 Participantes confirmadas:*
- *Fernanda Staniscuaski*: Professora Associada IV do Departamento de Biologia Molecular e Biotecnologia e pesquisadora líder do Grupo de Pesquisa em Políticas e Dados para o Ensino Superior e Ciência.
- *Márcia Cristina Bernardes Barbosa*: Reitora da UFRGS. Membro titular da Academia Brasileira de Ciências e da Academia Mundial de Ciências.
- *Adriana Alves*: Professora Associada no Instituto de Geociências da Universidade de São Paulo.

*📅 Data:* 24 de março de 2025
*🏛 Local:* Auditório do Departamento de Educação Física da UFRN
*⏰ Hora:* 9h
*🎓 Certificado de 2h para os participantes!*

As vagas são limitadas! Garanta a sua agora mesmo pelo Sigeventos.

Venha fazer parte dessa conversa essencial e contribuir para um futuro mais inclusivo na ciência!
        `;
        
        //send_msg
        await client.sendMessage(formattedNumber, message);
        console.log(`Mensagem enviada para ${formattedNumber}`);
        
    } catch (error) {
        console.error(`Erro ao enviar para ${contactNumber}:`, error);
    }
}

client.on('ready', async () => {
    console.log('*****[///// iniciando envio de mensagens /////]*****');

    for (const contact of contactList) {
        await sendStructureMessage(contact.number);
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
    }
    console.log('*****[///// todos os envios foram concluídos /////]*****')
})