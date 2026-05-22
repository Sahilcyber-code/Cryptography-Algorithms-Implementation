# Text Encryption Project

A secure website demo for encrypting and decrypting text with AES, DES, and RSA.

## Features

- AES-256-CBC symmetric encryption
- DES-CBC legacy symmetric encryption
- RSA-OAEP asymmetric encryption
- Secure key handling with passphrase-derived keys
- Comparison screen for modern and legacy algorithm use cases
- Clean responsive UI with backend encryption logic
- Operation logging that does not store secrets or private keys

## Setup

1. Open the project folder in your terminal.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open http://localhost:3000 in your browser.

## Project structure

- `server.js` — Express backend, symmetric and RSA endpoints, secure logging
- `public/index.html` — Web UI
- `public/style.css` — UI styling
- `public/app.js` — Frontend behavior and API calls
- `logs/operations.log` — Operation log file (created automatically)

## Notes

- AES is recommended for secure symmetric encryption.
- DES is included as a legacy algorithm and should not be used for production.
- RSA is ideal for exchanging keys and encrypting short data.
- Secrets are only used in memory during encryption/decryption and are not persisted.
