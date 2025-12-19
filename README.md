📄 Text File Compression using Huffman Coding

In this project, I have implemented Huffman Coding, which is a lossless compression technique, to reduce the size of text files.

The program first reads the text file and counts the frequency of each character. Based on these frequencies, a Huffman Tree is created by repeatedly combining the least frequent characters. Each character is then assigned a binary code, where frequently occurring characters get shorter codes.

During compression, the original text is replaced with the generated Huffman codes to produce a compressed file. For decompression, the same Huffman Tree is used to decode the compressed data back to the original text without any loss.

Tech Stack-

React

TypeScript

Tailwind CSS

Node.js

Express

Short Tech Stack

React, TypeScript, Node.js, Express



How to Run the Project Locally -

Clone the repository

git clone https://github.com/aditya531-a/File-Shrinker.git


Install dependencies

npm install


Start the backend server

cd server
npm run dev


Start the frontend

cd client
npm run dev


Open the project in browser

http://localhost:5173