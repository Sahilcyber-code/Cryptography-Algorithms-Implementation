const http = require('http');

function post(path, payload) {
  const data = JSON.stringify(payload);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // return raw body if JSON parse fails for easier debugging
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error('Invalid JSON response: ' + body.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async function main() {
  try {
    console.log('1) Generating RSA keys...');
    const gen = await post('/api/rsa/generate', { modulusLength: 2048 });
    if (gen.error) throw new Error('Generate error: ' + gen.error);

    const { publicKey, privateKey } = gen;

    console.log('2) Hybrid encrypting message...');
    const plaintext = 'Hybrid e2e test message';
    const enc = await post('/api/hybrid/encrypt', { publicKey, plaintext });
    if (enc.error) throw new Error('Hybrid encrypt error: ' + enc.error);

    console.log('  ciphertext len', enc.ciphertext.length);
    console.log('  encryptedKey len', enc.encryptedKey.length);
    console.log('  iv', enc.iv);

    console.log('3) Hybrid decrypting...');
    const dec = await post('/api/hybrid/decrypt', {
      privateKey,
      ciphertext: enc.ciphertext,
      encryptedKey: enc.encryptedKey,
      authTag: enc.authTag,
      iv: enc.iv
    });
    if (dec.error) throw new Error('Hybrid decrypt error: ' + dec.error);

    console.log('  decrypted:', dec.plaintext);
    if (dec.plaintext === plaintext) {
      console.log('\nHybrid E2E PASSED');
      process.exit(0);
    } else {
      console.error('\nHybrid E2E FAILED - mismatch');
      process.exit(2);
    }
  } catch (err) {
    console.error('\nHybrid E2E ERROR:', err.message || err);
    process.exit(1);
  }
})();
