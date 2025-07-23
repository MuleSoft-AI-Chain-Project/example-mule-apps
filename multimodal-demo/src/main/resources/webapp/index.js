const express = require('express');
const app = express();
const port = 3000; // Your API port

app.use(express.static('/')); 

// Serve static files from the current directory
app.use(express.static('.'));

// Route handler for the root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 