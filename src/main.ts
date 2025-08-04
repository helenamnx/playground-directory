import { configureApp } from './shared/utils/configure-app.utils';

async function bootstrap() {
  await configureApp();
}
bootstrap().catch(handleError);
function handleError(error: unknown) {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
process.on('uncaughtException', handleError);
