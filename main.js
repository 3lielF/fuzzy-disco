const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

client.once('ready', () => {
    console.log('Client is ready!');

});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

client.on('message_create', message => {
    if(message.body === '!ping') {
        message.reply('pong');
    }
});

client.initialize();