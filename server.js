const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const publicDir = path.join(__dirname, 'public');
const logDir = path.join(__dirname, 'logs');
const logPath = path.join(logDir, 'operations.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

app.use(express.json());
app.use(express.static(publicDir));

const algorithmMap = {
  aes: 'aes-256-gcm',
  des: 'des-cbc'
};

function deriveKey(secret, algorithm) {
  const keyLength = algorithm === 'aes' ? 32 : 8;
  const hash = crypto.createHash('sha256').update(secret, 'utf8').digest();
  return hash.slice(0, keyLength);
}

function getIv(algorithm, ivHex) {
  const ivLength = algorithm === 'aes' ? 12 : 8;
  if (ivHex) {
    const buffer = Buffer.from(ivHex, 'hex');
    if (buffer.length !== ivLength) {
      throw new Error(`IV length must be ${ivLength} bytes for ${algorithm.toUpperCase()}`);
    }
    return buffer;
  }
  return crypto.randomBytes(ivLength);
}

function safeLog(entry) {
  const message = `${new Date().toISOString()} ${entry}\n`;
  fs.appendFileSync(logPath, message, { encoding: 'utf8' });
}

function encryptSymmetric({ algorithm, plaintext, secret, ivHex }) {
  const nodeAlgo = algorithmMap[algorithm];
  if (!nodeAlgo) {
    throw new Error('Unsupported symmetric algorithm');
  }

  const iv = getIv(algorithm, ivHex);
  const key = deriveKey(secret, algorithm);
  const cipher = crypto.createCipheriv(nodeAlgo, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const result = {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('hex')
  };

  if (algorithm === 'aes') {
    result.authTag = cipher.getAuthTag().toString('base64');
  }

  return result;
}

function decryptSymmetric({ algorithm, ciphertext, secret, ivHex, authTag }) {
  const nodeAlgo = algorithmMap[algorithm];
  if (!nodeAlgo) {
    throw new Error('Unsupported symmetric algorithm');
  }

  const iv = getIv(algorithm, ivHex);
  const key = deriveKey(secret, algorithm);
  const decipher = crypto.createDecipheriv(nodeAlgo, key, iv);

  if (algorithm === 'aes') {
    if (!authTag) {
      throw new Error('authTag is required for AES-GCM decryption');
    }
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  }

  const decrypted = Buffer.concat([decipher.update(ciphertext, 'base64'), decipher.final()]);

  return decrypted.toString('utf8');
}

app.post('/api/encrypt', (req, res) => {
  const { algorithm, plaintext, secret, iv } = req.body;

  if (!algorithm || !plaintext || !secret) {
    return res.status(400).json({ error: 'algorithm, plaintext, and secret are required' });
  }

  try {
    const result = encryptSymmetric({ algorithm, plaintext, secret, ivHex: iv });
    safeLog(`operation=encrypt algorithm=${algorithm} secretPresent=${Boolean(secret)} ivProvided=${Boolean(iv)}`);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/decrypt', (req, res) => {
  const { algorithm, ciphertext, secret, iv, authTag } = req.body;

  if (!algorithm || !ciphertext || !secret || !iv) {
    return res.status(400).json({ error: 'algorithm, ciphertext, secret, and iv are required' });
  }

  if (algorithm === 'aes' && !authTag) {
    return res.status(400).json({ error: 'authTag is required for AES-GCM decryption' });
  }

  try {
    const plaintext = decryptSymmetric({ algorithm, ciphertext, secret, ivHex: iv, authTag });
    safeLog(`operation=decrypt algorithm=${algorithm} secretPresent=${Boolean(secret)} ivProvided=true`);
    return res.json({ plaintext });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/rsa/generate', (req, res) => {
  const { modulusLength = 2048 } = req.body;

  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });

    safeLog(`operation=rsa-generate modulusLength=${modulusLength}`);
    return res.json({ publicKey, privateKey });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/rsa/encrypt', (req, res) => {
  const { publicKey, plaintext } = req.body;

  if (!publicKey || !plaintext) {
    return res.status(400).json({ error: 'publicKey and plaintext are required' });
  }

  try {
    const buffer = Buffer.from(plaintext, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    safeLog('operation=rsa-encrypt publicKeyPresent=true');
    return res.json({ ciphertext: encrypted.toString('base64') });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/rsa/decrypt', (req, res) => {
  const { privateKey, ciphertext } = req.body;

  if (!privateKey || !ciphertext) {
    return res.status(400).json({ error: 'privateKey and ciphertext are required' });
  }

  try {
    const buffer = Buffer.from(ciphertext, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    safeLog('operation=rsa-decrypt privateKeyPresent=true');
    return res.json({ plaintext: decrypted.toString('utf8') });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Hybrid encryption: AES for message + RSA(OAEP) for AES key
app.post('/api/hybrid/encrypt', (req, res) => {
  const { publicKey, plaintext } = req.body;

  if (!publicKey || !plaintext) {
    return res.status(400).json({ error: 'publicKey and plaintext are required' });
  }

  try {
    // Generate random AES-256 key and IV
    const key = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16);

    // Encrypt plaintext with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Encrypt the AES key with RSA OAEP (SHA-256)
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      key
    );

    safeLog('operation=hybrid-encrypt publicKeyPresent=true');
    return res.json({
      ciphertext: encrypted.toString('base64'),
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('base64')
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/hybrid/decrypt', (req, res) => {
  const { privateKey, ciphertext, encryptedKey, iv, authTag } = req.body;

  if (!privateKey || !ciphertext || !encryptedKey || !iv || !authTag) {
    return res.status(400).json({ error: 'privateKey, ciphertext, encryptedKey, iv, and authTag are required' });
  }

  try {
    // Decrypt AES key using RSA OAEP (SHA-256)
    const keyBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(encryptedKey, 'base64')
    );

    const ivBuffer = Buffer.from(iv, 'hex');

    // Decrypt ciphertext with AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const decrypted = Buffer.concat([decipher.update(ciphertext, 'base64'), decipher.final()]);

    safeLog('operation=hybrid-decrypt privateKeyPresent=true');
    return res.json({ plaintext: decrypted.toString('utf8') });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/compare', (req, res) => {
  return res.json({
    algorithms: [
      {
        name: 'AES-256-GCM',
        type: 'Symmetric',
        strength: 'Strong',
        keySize: '256 bits',
        useCase: 'Modern secure data encryption',
        notes: 'Provides confidentiality, integrity, and authentication.'
      },
      {
        name: 'DES-CBC',
        type: 'Symmetric (legacy)',
        strength: 'Weak',
        keySize: '56 bits',
        useCase: 'Compatibility and legacy systems only',
        notes: 'Not recommended for new systems; use AES instead.'
      },
      {
        name: 'RSA-OAEP',
        type: 'Asymmetric',
        strength: 'Strong',
        keySize: '2048+ bits',
        useCase: 'Key exchange and digital signatures',
        notes: 'Use for secure key transport and identity verification.'
      }
    ]
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Encryption web app running at http://localhost:${port}`);
});
