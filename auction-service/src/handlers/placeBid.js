import { v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import customMiddleware from '../Middleware/middleware';
import createError from 'http-errors';
import {getAuctionById} from './getAuction';



const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) 
{

    const { amount } = event.body;
    const { id } = event.pathParameters;

    const auction = await getAuctionById(id);

    if(auction.status === 'CLOSED')
    {
        throw new createError.Forbidden(`You can't bid on a closed auction`);

    }
    if(amount <= auction.highestBid.amount)
    {
        throw new createError.Forbidden(`Your price must be higher than ${auction.highestBid.amount}`);
    }

    const params = 
    {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {id},
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues:
        {
            ':amount': amount
        },
        ReturnValues: 'ALL_NEW',

    };

    let updatedAuction;
    try 
    {
        const result = await dynamoDb.update(params).promise();
        updatedAuction = result.Attributes;
    } 
    catch (error) 
    {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({updatedAuction}),
    };


}

export const handler = customMiddleware(placeBid);


