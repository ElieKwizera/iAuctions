import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrors from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import createError from 'http-errors'



export default handler =>middy(handler)
.use([
    jsonBodyParser(),
    httpEventNormalizer(),
    httpErrors(),
]);