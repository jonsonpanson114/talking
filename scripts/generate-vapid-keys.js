const webpush = require('web-push');

// VAPIDキーを生成
const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(50));
console.log('VAPID Keys Generated');
console.log('='.repeat(50));
console.log('');
console.log('Public Key (VAPID_PUBLIC_KEY):');
console.log(vapidKeys.publicKey);
console.log('');
console.log('Private Key (VAPID_PRIVATE_KEY):');
console.log(vapidKeys.privateKey);
console.log('');
console.log('='.repeat(50));
console.log('');
console.log('Add these to your .env.local file:');
console.log('');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('='.repeat(50));
