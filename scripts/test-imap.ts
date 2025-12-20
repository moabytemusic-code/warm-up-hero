import imaps from 'imap-simple';

// ---------------------------------------------------------
// PASTE YOUR CREDENTIALS HERE
const EMAIL = 'your_email@example.com';
const PASSWORD = 'your_app_password';
const IMAP_HOST = 'imap.gmail.com'; // or your provider
const IMAP_PORT = 993;
// ---------------------------------------------------------

const SPAM_BOX_NAMES = ['spam', 'junk', 'bulk', 'junk e-mail', 'junk email'];

async function testImap() {
    console.log(`Connecting to ${IMAP_HOST}:${IMAP_PORT} as ${EMAIL}...`);

    const config = {
        imap: {
            user: EMAIL,
            password: PASSWORD,
            host: IMAP_HOST,
            port: IMAP_PORT,
            tls: IMAP_PORT === 993,
            authTimeout: 10000,
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    let connection;
    try {
        connection = await imaps.connect(config);
        console.log('✅ Connected successfully.');

        // 1. List all boxes
        const boxes = await connection.getBoxes();
        console.log('\n📂 ALL MAILBOXES FOUND:');

        // Helper to print keys recursively
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const printBoxes = (boxList: any, indent = 0) => {
            for (const key in boxList) {
                console.log(`${' '.repeat(indent)}- ${key}`);
                if (boxList[key].children) {
                    printBoxes(boxList[key].children, indent + 2);
                }
            }
        };
        printBoxes(boxes);

        // 2. Find Spam Box
        let spamBoxPath: string | null = null;

        // Manual checks for Gmail/Providers structure logic
        if (boxes['[Gmail]'] && boxes['[Gmail]'].children) {
            if (boxes['[Gmail]'].children['Spam']) spamBoxPath = '[Gmail]/Spam';
            else if (boxes['[Gmail]'].children['Junk']) spamBoxPath = '[Gmail]/Junk';
        }

        if (!spamBoxPath) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const traverseBoxes = (boxList: any, parentPath: string = "") => {
                if (spamBoxPath) return;
                for (const key in boxList) {
                    const lowerKey = key.toLowerCase();
                    if (SPAM_BOX_NAMES.includes(lowerKey)) {
                        spamBoxPath = parentPath ? (parentPath + '/' + key) : key;
                        // Specific fix for Gmail logic if it wasn't caught above
                        if (parentPath === '[Gmail]') spamBoxPath = `[Gmail]/${key}`;
                        return;
                    }
                    if (boxList[key].children) {
                        traverseBoxes(boxList[key].children, key);
                    }
                }
            };
            traverseBoxes(boxes);
        }

        if (spamBoxPath) {
            console.log(`\n🎯 TARGET SPAM BOX: "${spamBoxPath}"`);

            await connection.openBox(spamBoxPath);
            console.log(`Checked inside "${spamBoxPath}". searching for X-Warmup-Hero header...`);

            const searchCriteria = [
                'UNSEEN',
                ['HEADER', 'X-Warmup-Hero', 'true']
            ];

            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: false
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            if (messages.length > 0) {
                console.log(`\n🔥 SECRET HEADER FOUND in ${messages.length} email(s)!`);
                messages.forEach((msg, idx) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const header = msg.parts.find((p: any) => p.which === 'HEADER');
                    const subject = header?.body?.subject?.[0] || '(No Subject)';
                    const from = header?.body?.from?.[0] || '(Unknown)';
                    console.log(`   ${idx + 1}. [${from}] "${subject}"`);
                    console.log(`      WOULD ACTION: Mark Read -> Star -> Move to Inbox -> Reply`);
                });
            } else {
                console.log('\n🤷 No warmup emails found in spam (that are unread).');
            }

        } else {
            console.log('\n❌ Could not identify a Spam folder automatically.');
        }

        connection.end();

    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        console.error('\n❌ ERROR:', error.message);
    }
}

testImap();
