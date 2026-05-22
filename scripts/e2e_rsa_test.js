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
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error('Invalid JSON response: ' + err.message));
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

    console.log('2) Encrypting message with public key...');
    const plaintext = 'End-to-end RSA test message';
    const enc = await post('/api/rsa/encrypt', { publicKey, plaintext });
    if (enc.error) throw new Error('Encrypt error: ' + enc.error);

    const ciphertext = enc.ciphertext;
    console.log('  Ciphertext (truncated):', ciphertext && ciphertext.slice(0, 80) + '...');

    console.log('3) Decrypting message with private key...');
    const dec = await post('/api/rsa/decrypt', { privateKey, ciphertext });
    if (dec.error) throw new Error('Decrypt error: ' + dec.error);

    console.log('  Decrypted:', dec.plaintext);

    if (dec.plaintext === plaintext) {
      console.log('\nE2E RSA test PASSED');
      process.exit(0);
    } else {
      console.error('\nE2E RSA test FAILED: plaintext mismatch');
      process.exit(2);
    }
  } catch (err) {
    console.error('\nE2E RSA test ERROR:', err.message || err);
    process.exit(1);
  }
})();
