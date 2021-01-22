import AWS from 'aws-sdk';
import customMiddleware from '../Middleware/middleware';
import createError from 'http-errors'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id)
{
    let auction;
    try 
    {
        const res = await dynamoDb.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: {id}
        }).promise();

        auction = res.Item;
    }
     catch (error) 
    {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    if(!auction)
    {
        throw new createError.NotFound(`Item with id ${id} not found`);
    }

    return auction;

}
async function getAuction(event, context) 
{

    
    const { id } = event.pathParameters;

    const auction  = await getAuctionById(id);
    
    return {
        statusCode: 200,
        body: JSON.stringify({auction}),
    };
}

export const handler = customMiddleware(getAuction);



