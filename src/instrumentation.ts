export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV !== 'production') {
    let isTerminating = false;

    const handleShutdown = (): void => {
      if (isTerminating) {
        process.exit(1);
      }
      isTerminating = true;
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

    if (process.platform === 'win32' && process.stdin.isTTY) {
      import('node:readline')
        .then(({ createInterface }) => {
          const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.on('SIGINT', () => {
            process.emit('SIGINT');
          });
        })
        .catch(() => {});
    }
  }
}
