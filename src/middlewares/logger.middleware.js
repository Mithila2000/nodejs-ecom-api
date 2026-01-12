import fs from 'fs';
import winston from 'winston';

const fsPromise = fs.promises; // promises is an object in fs that lets us read and write the files without using callbacks

// async function log(logData) {
//     try {
//         logData = `\n ${new Date().toString()} - ${logData}`;
//         await fsPromise. appendFile("log.txt", logData)
//     } catch(err) {
//         console.log(err);
//     }
// }

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'request-logging'},
    transports: [
        new winston.transports.File({filename: 'logs.txt'})
    ]
})

const loggerMiddleware = async (req, res, next) => {
    //1. Log request body
    if(!req.url.includes("signin")) {
        const logData = `${req.url} - ${JSON.stringify(req.body)}`
        // await log(logData);
        logger.info(logData)
    }
    next();
}

export default loggerMiddleware;