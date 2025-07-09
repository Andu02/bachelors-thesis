# Link

Access to the deployed web application is available via Render (https://render.com):

- https://bachelors-thesis-web-app.onrender.com/simulation

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

![home_page](https://github.com/user-attachments/assets/dd788726-06f3-4f93-bd68-533f87140f10)

## Register Page

![register_page](https://github.com/user-attachments/assets/8fe9c87a-0355-4204-8fcc-d316fceab342)

## Login Page

![login_page](https://github.com/user-attachments/assets/de282dc3-4204-4be9-8080-ad9d9b2383dd)

## Simulation Page

![simulation_page](https://github.com/user-attachments/assets/c5321178-9c52-402d-b131-b91e9968e200)
