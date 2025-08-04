import 'winston-daily-rotate-file';

import { utilities, WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

export const winstonLoggerConfig = (appName: string) => {
  return WinstonModule.createLogger({
    transports: [
      // file on daily rotation (error only)
      new transports.DailyRotateFile({
        // %DATE will be replaced by the current date
        filename: `logs/%DATE%-error.log`,
        level: 'error',
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false, // don't want to zip our logs
        maxFiles: '30d', // will keep log until they are older than 30 days
      }),
      // same for all levels
      new transports.DailyRotateFile({
        filename: `logs/%DATE%-combined.log`,
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '30d',
      }),
      new transports.Console({
        format: format.combine(
          format.ms(),
          format.splat(),
          format.timestamp(),
          format.printf((info) => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
          }),
          utilities.format.nestLike(appName, {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });
};
