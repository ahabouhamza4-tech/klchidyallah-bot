const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('--- SCAN HAD QR ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('T9TA3, kan3awd nconnecti...');
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('BOT KHEDDAM ✅');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        console.log('Message:', text);

        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: 'pong 🏓 Bot khedam!' });
        }
        if (text.toLowerCase() === 'سلام' || text.toLowerCase() === 'salam') {
            await sock.sendMessage(from, { text: 'Wa 3alaykom salam! Ana bot dyal Klchidyallah 🤖\nKteb *ping* bach tjarabni' });
        }
        if (text.toLowerCase() === 'menu' || text.toLowerCase() === '.menu') {
            await sock.sendMessage(from, { text: '📋 MENU:\n1. ping - test\n2. salam - salutation\n3. menu - had menu' });
        }
    });
}

startBot();
