import { createServer } from 'vite';

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port: 4179,
    strictPort: true,
  },
});

server.middlewares.use('/__e2e-shutdown', (_req, res) => {
  res.statusCode = 204;
  res.end();
  setTimeout(close, 0);
});

await server.listen();
server.printUrls();

let closing = false;

const close = async () => {
  if (closing) {
    return;
  }

  closing = true;
  await server.close();
  process.exit(0);
};

process.on('SIGINT', close);
process.on('SIGTERM', close);
