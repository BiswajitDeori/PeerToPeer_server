# Server-Side Setup for Peer-to-Peer File Transfer System

This section outlines how to set up the **server-side** of the Peer-to-Peer (P2P) file transfer system using **Node.js**, **Express.js**, and **Socket.io** for signaling between peers.

## Key Server Features:
- **Express.js Backend:** Provides a RESTful API and serves the static frontend files.
- **Socket.io for Signaling:** Manages WebRTC signaling for establishing peer-to-peer connections.
- **CORS Configuration:** Handles Cross-Origin Resource Sharing (CORS) to allow frontend-backend communication during development and production.

## Tech Stack for Server:
- **Node.js**: Backend JavaScript runtime.
- **Express.js**: Web framework for Node.js.
- **Socket.io**: Real-time communication library.
- **WebRTC**: For peer-to-peer file transfer.

## Installation & Setup for Server:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/peer-to-peer-file-transfer.git
2 Start the application
   ```bash
   npm install
   node server.js
