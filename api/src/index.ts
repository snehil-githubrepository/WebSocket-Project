import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const port = process.env.PORT || 10000;

// Create an HTTP server
const server = http.createServer(function (req, res) {
  console.log(new Date() + "Received Request for :" + req.url);
  res.end("Hi there");
});

const wss = new WebSocketServer({ server });

function broadcast(sender: WebSocket, message: string) {
  wss.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({message}));
    }
  });
}

wss.on("connection", function connection(ws) {
  console.log("New client connected!");

  ws.on("error", console.error);

  ws.on("message", function incoming(data) {
    try {
      const parsed = JSON.parse(data.toString());
      console.log("Message received:", parsed.message);

      broadcast(ws, parsed.message);
    } catch (err) {
      console.error("Error parsing message : ", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });

  ws.send(JSON.stringify({ message: "Welcome to the chat!" }));
});

server.listen(port, function () {
  console.log(new Date() + ` Server running on port ${port}`);
});
