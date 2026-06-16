# Cryptography Algorithms Implementation

## Advanced Hybrid Cryptography System

A comprehensive web-based cryptography platform that demonstrates the implementation of modern encryption algorithms, secure key management, and hybrid encryption techniques. This project enables users to encrypt and decrypt sensitive information using both symmetric and asymmetric cryptographic methods.

---

## Project Overview

This project was developed to explore and implement fundamental cryptographic algorithms used in modern cybersecurity systems. It provides hands-on experience with encryption, decryption, key generation, authentication, and secure communication principles.

The application supports:

* AES-256-GCM Symmetric Encryption
* RSA-2048 Asymmetric Encryption
* Hybrid Encryption Concepts
* Authentication Tags (GCM)
* Secure Initialization Vector (IV) Handling
* Public/Private Key Management

---

## Features

### Symmetric Encryption (AES-256-GCM)

* Secure text encryption and decryption
* Authentication tag generation and verification
* Random IV generation
* Strong passphrase-based encryption
* Confidentiality and integrity protection

### Asymmetric Encryption (RSA-2048)

* RSA key pair generation
* Public key encryption
* Private key decryption
* Secure key management
* Demonstration of asymmetric cryptography principles

### Security Features

* AES-256-GCM authenticated encryption
* RSA-OAEP secure encryption scheme
* Secure random IV generation
* Authentication tag verification
* Sensitive data processed in memory only
* No storage of plaintext passwords or private keys

### User Interface

* Modern responsive web interface
* Easy-to-use encryption and decryption workflows
* Real-time cryptographic operations
* Clear visualization of encrypted outputs

---

## Technologies Used

### Backend

* Node.js
* Express.js

### Frontend

* HTML5
* CSS3
* JavaScript

### Cryptography

* Node.js Crypto Module
* AES-256-GCM
* RSA-2048
* RSA-OAEP

---

## Cryptographic Algorithms Implemented

| Algorithm                | Type               | Purpose                                       |
| ------------------------ | ------------------ | --------------------------------------------- |
| AES-256-GCM              | Symmetric          | Secure data encryption with authentication    |
| RSA-2048                 | Asymmetric         | Public-key encryption and secure key exchange |
| RSA-OAEP                 | Padding Scheme     | Secure RSA encryption                         |
| SHA-based Key Derivation | Security Mechanism | Passphrase-based key generation               |

---

## Project Structure

```text
Cryptography-Algorithms-Implementation/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── scripts/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Sahilcyber-code/Cryptography-Algorithms-Implementation.git
cd Cryptography-Algorithms-Implementation
```

### Install Dependencies

```bash
npm install
```

### Start Application

```bash
npm start
```

### Access Application

Open your browser and navigate to:

```text
http://localhost:3000
```

---

## Learning Outcomes

Through this project, the following cybersecurity concepts were explored:

* Symmetric Cryptography
* Asymmetric Cryptography
* Hybrid Encryption Systems
* Secure Key Management
* Authentication and Integrity Verification
* Secure Communication Principles
* Modern Encryption Standards

---

## Security Considerations

* AES-256-GCM is recommended for modern secure encryption.
* RSA is suitable for key exchange and secure transmission of small amounts of data.
* Authentication tags ensure data integrity and authenticity.
* Initialization Vectors (IVs) must never be reused with the same encryption key.
* Private keys should always remain confidential.

---

## Future Enhancements

* File Encryption Support
* Digital Signature Implementation
* ECC (Elliptic Curve Cryptography)
* Hybrid AES + RSA Encryption Workflow
* User Authentication System
* Secure Cloud Key Storage

---

## Author

**Sahil Sharma**

Cybersecurity Internship Project

---

## License

This project is intended for educational, research, and cybersecurity learning purposes.
