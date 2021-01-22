import AWS from 'aws-sdk';
import customMiddleware from '../Middleware/middleware';
import createError from 'http-errors'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) 
{

    let auctions;
    try 
    {
        const res = await dynamoDb.scan({
            TableName: process.env.AUCTIONS_TABLE_NAME
        }).promise();

        auctions = res.Items;
    }
     catch (error) 
    {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({auctions}),
    };
}

export const handler = customMiddleware(getAuctions);



