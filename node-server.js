var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs");
port = process.argv[2] || 8888;

http
  .createServer(function(request, response) {
    var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), "docs", uri);

    var extname = path.extname(filename);
    var contentType = "text/html";
    switch (extname) {
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".ico":
        contentType = "image/x-icon";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    fs.exists(filename, function(exists) {
      if (!exists) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("404 Not Found\n");
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) filename += "/index.html";

      fs.readFile(filename, "binary", function(err, file) {
        if (err) {
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.write(err + "\n");
          response.end();
          return;
        }
        response.writeHead(200, { "Content-Type": contentType });
        response.write(file, "binary");
        response.end();
      });
    });
  })
  .listen(parseInt(port, 10));

console.log("WebUI Aria2 Server is running on http://localhost:" + port);



const express = require('express');
const fs = require('fs');

const app = express();

app.use('/', express.static('public'));

app.get('/download', (req, res) => {
  const filePath = req.query.filePath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ data: 'OMFG file not found' });
  }
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    let parts = range.replace(/bytes=/, '').split('-');
    let start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    let chunkSize = end - start + 1;
    let file = fs.createReadStream(filePath, {
      start,
      end,
    });
    let headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(3000, () => console.log('server started'));
