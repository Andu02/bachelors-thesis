# Link

Access to the deployed web application is available via Render (https://render.com):

- not available

# Description

This project is a Web Application for Demonstrating Cryptographic Methods and Cyber Attack Simulations, developed as part of a Bachelor's thesis. It is built using Node.js, Express.js, PostgreSQL, and the EJS templating engine.

The application allows users to register and log in with encrypted passwords, experiment with various cryptographic algorithms (both classical and modern), and simulate brute-force attacks to illustrate the importance of secure password storage and encryption. It is intended as an educational tool for understanding core principles of web security and applied cryptography.

The cryptographic methods are implemented server-side, with support for user-defined keys and parameters, offering real-time encryption, decryption, and hash comparisons. The simulation module highlights how weak or predictable passwords can be exploited by attackers.

# Key Features

- Secure user registration and login with hashed passwords
- Manual encryption and decryption using:
  - Classical ciphers: Caesar, Affine, Hill
  - Modern symmetric ciphers: ECB, CBC
  - Asymmetric encryption: RSA
  - Hashing functions: SHA256 and Bcrypt (with salt support)
- User-defined key inputs for all encryption algorithms
- Live feedback for encryption/decryption processes
- Password strength validation and hash comparison
- Brute-force simulation module for demonstrating insecure passwords
- Error handling for invalid keys, duplicates, and malformed input

# Technologies Used

- Node.js
- Express.js
- PostgreSQL (hosted via [Neon](https://neon.tech))
- EJS templating engine
- Axios (for API and internal HTTP requests)
- Crypto module (native Node.js)
- Bcrypt (for password hashing)
- Body-parser and express-session middleware

# Preview

## Home Page

![home_page](https://github.com/user-attachments/assets/cc6ef6c7-c9ce-4a84-b191-cda584899792)

## Register Page

![register_page](https://github.com/user-attachments/assets/970652b6-b231-4c7e-867e-49abb12b62f7)

## Simulation Page

![simulation_page](https://github.com/user-attachments/assets/45d88424-504f-4721-9226-15831b7bbf92)
