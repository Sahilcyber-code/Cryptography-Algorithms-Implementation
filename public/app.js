const tabButtons = document.querySelectorAll('.tab-button');
const panels = document.querySelectorAll('.panel');
const compareBody = document.getElementById('compare-body');

function showTab(tabName) {
  panels.forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== `${tabName}-panel`);
  });
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
});

const symmetricAlgo = document.getElementById('symmetric-algo');
const symmetricSecret = document.getElementById('symmetric-secret');
const symmetricText = document.getElementById('symmetric-text');
const symmetricOutput = document.getElementById('symmetric-output');
const symmetricAuthTag = document.getElementById('symmetric-auth-tag');
const symmetricIv = document.getElementById('symmetric-iv');
const encryptButton = document.getElementById('encrypt-button');
const decryptButton = document.getElementById('decrypt-button');
const clearSymmetric = document.getElementById('clear-symmetric');

const rsaModulus = document.getElementById('rsa-modulus');
const generateKeysButton = document.getElementById('generate-keys');
const rsaPublic = document.getElementById('rsa-public');
const rsaPrivate = document.getElementById('rsa-private');
const rsaText = document.getElementById('rsa-text');
const rsaCipher = document.getElementById('rsa-ciphertext');
const rsaDecrypted = document.getElementById('rsa-decrypted-output');
const rsaEncryptButton = document.getElementById('rsa-encrypt-button');
const rsaDecryptButton = document.getElementById('rsa-decrypt-button');
const clearRsa = document.getElementById('clear-rsa');
const hybridPublic = document.getElementById('hybrid-public');
const hybridPlaintext = document.getElementById('hybrid-plaintext');
const hybridCiphertext = document.getElementById('hybrid-ciphertext');
const hybridEncryptedKey = document.getElementById('hybrid-encrypted-key');
const hybridAuthTag = document.getElementById('hybrid-auth-tag');
const hybridIv = document.getElementById('hybrid-iv');
const hybridEncryptButton = document.getElementById('hybrid-encrypt');
const hybridClearButton = document.getElementById('hybrid-clear');
const hybridPrivate = document.getElementById('hybrid-private');
const hybridInputCiphertext = document.getElementById('hybrid-input-ciphertext');
const hybridInputEncryptedKey = document.getElementById('hybrid-input-encrypted-key');
const hybridInputAuthTag = document.getElementById('hybrid-input-auth-tag');
const hybridInputIv = document.getElementById('hybrid-input-iv');
const hybridDecryptButton = document.getElementById('hybrid-decrypt');
const hybridClearDecrypt = document.getElementById('hybrid-clear-decrypt');
const hybridDecryptedOutput = document.getElementById('hybrid-decrypted-output');

async function apiRequest(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

encryptButton.addEventListener('click', async () => {
  symmetricOutput.value = '';
  try {
    const payload = {
      algorithm: symmetricAlgo.value,
      plaintext: symmetricText.value,
      secret: symmetricSecret.value,
      iv: symmetricIv.value.trim() || undefined
    };
    const data = await apiRequest('/api/encrypt', payload);
    if (data.error) {
      symmetricOutput.value = `Error: ${data.error}`;
      return;
    }
    symmetricOutput.value = data.ciphertext;
    symmetricAuthTag.value = data.authTag || '';
    symmetricIv.value = data.iv;
  } catch (error) {
    symmetricOutput.value = `Error: ${error.message}`;
  }
});

decryptButton.addEventListener('click', async () => {
  try {
    const ciphertext = (symmetricOutput.value || symmetricText.value).trim();
    const payload = {
      algorithm: symmetricAlgo.value,
      ciphertext,
      secret: symmetricSecret.value,
      iv: symmetricIv.value.trim(),
      authTag: symmetricAuthTag.value.trim() || undefined
    };
    const data = await apiRequest('/api/decrypt', payload);
    if (data.error) {
      symmetricOutput.value = `Error: ${data.error}`;
      return;
    }
    symmetricOutput.value = data.plaintext;
  } catch (error) {
    symmetricOutput.value = `Error: ${error.message}`;
  }
});

clearSymmetric.addEventListener('click', () => {
  symmetricText.value = '';
  symmetricOutput.value = '';
  symmetricAuthTag.value = '';
  symmetricIv.value = '';
  symmetricSecret.value = '';
});

generateKeysButton.addEventListener('click', async () => {
  rsaPublic.value = '';
  rsaPrivate.value = '';
  rsaCipher.value = '';
  rsaDecrypted.value = '';
  try {
    const data = await apiRequest('/api/rsa/generate', { modulusLength: Number(rsaModulus.value) });
    if (data.error) {
      rsaDecrypted.value = `Error: ${data.error}`;
      return;
    }
    rsaPublic.value = data.publicKey;
    rsaPrivate.value = data.privateKey;
  } catch (error) {
    rsaDecrypted.value = `Error: ${error.message}`;
  }
});

rsaEncryptButton.addEventListener('click', async () => {
  rsaCipher.value = '';
  rsaDecrypted.value = '';
  try {
    const data = await apiRequest('/api/rsa/encrypt', {
      publicKey: rsaPublic.value,
      plaintext: rsaText.value
    });
    if (data.error) {
      rsaDecrypted.value = `Error: ${data.error}`;
      return;
    }
    rsaCipher.value = data.ciphertext;
  } catch (error) {
    rsaDecrypted.value = `Error: ${error.message}`;
  }
});

rsaDecryptButton.addEventListener('click', async () => {
  rsaDecrypted.value = '';
  try {
    const ciphertext = (rsaCipher.value || rsaText.value).trim();
    const data = await apiRequest('/api/rsa/decrypt', {
      privateKey: rsaPrivate.value,
      ciphertext
    });
    if (data.error) {
      rsaDecrypted.value = `Error: ${data.error}`;
      return;
    }
    rsaDecrypted.value = data.plaintext;
  } catch (error) {
    rsaDecrypted.value = `Error: ${error.message}`;
  }
});

clearRsa.addEventListener('click', () => {
  rsaPublic.value = '';
  rsaPrivate.value = '';
  rsaText.value = '';
  rsaCipher.value = '';
  rsaDecrypted.value = '';
});

async function loadComparison() {
  try {
    const response = await fetch('/api/compare');
    const data = await response.json();
    compareBody.innerHTML = data.algorithms
      .map(algorithm => `
        <tr>
          <td>${algorithm.name}</td>
          <td>${algorithm.type}</td>
          <td>${algorithm.strength}</td>
          <td>${algorithm.useCase}</td>
          <td>${algorithm.notes}</td>
        </tr>
      `)
      .join('');
  } catch (error) {
    compareBody.innerHTML = `<tr><td colspan="5">Unable to load comparison data.</td></tr>`;
  }
}

loadComparison();
showTab('symmetric');

// Hybrid handlers
hybridEncryptButton.addEventListener('click', async () => {
  hybridCiphertext.value = '';
  hybridEncryptedKey.value = '';
  hybridIv.value = '';
  try {
    const data = await apiRequest('/api/hybrid/encrypt', {
      publicKey: hybridPublic.value,
      plaintext: hybridPlaintext.value
    });
    if (data.error) {
      hybridEncryptedKey.value = `Error: ${data.error}`;
      return;
    }
    hybridCiphertext.value = data.ciphertext;
    hybridEncryptedKey.value = data.encryptedKey;
    hybridAuthTag.value = data.authTag;
    hybridIv.value = data.iv;
  } catch (error) {
    hybridEncryptedKey.value = `Error: ${error.message}`;
  }
});

hybridClearButton.addEventListener('click', () => {
  hybridPublic.value = '';
  hybridPlaintext.value = '';
  hybridCiphertext.value = '';
  hybridEncryptedKey.value = '';
  hybridAuthTag.value = '';
  hybridIv.value = '';
});

hybridDecryptButton.addEventListener('click', async () => {
  hybridDecryptedOutput.value = '';
  try {
    const data = await apiRequest('/api/hybrid/decrypt', {
      privateKey: hybridPrivate.value,
      ciphertext: hybridInputCiphertext.value.trim(),
      encryptedKey: hybridInputEncryptedKey.value.trim(),
      authTag: hybridInputAuthTag.value.trim(),
      iv: hybridInputIv.value.trim()
    });
    if (data.error) {
      hybridDecryptedOutput.value = `Error: ${data.error}`;
      return;
    }
    hybridDecryptedOutput.value = data.plaintext;
  } catch (error) {
    hybridDecryptedOutput.value = `Error: ${error.message}`;
  }
});

hybridClearDecrypt.addEventListener('click', () => {
  hybridPrivate.value = '';
  hybridInputCiphertext.value = '';
  hybridInputEncryptedKey.value = '';
  hybridInputAuthTag.value = '';
  hybridInputIv.value = '';
  hybridDecryptedOutput.value = '';
});
