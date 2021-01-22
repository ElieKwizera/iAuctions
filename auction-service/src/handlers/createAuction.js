import { v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import customMiddleware from '../Middleware/middleware';
import createError from 'http-errors'



const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) 
{

  const {title}  = event.body;
  const now  = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = 
  {
    id:uuid(),
    title,
    status:'OPEN',
    createdAt: new Date().toISOString(),
    highestBid: {
      amount: 0,
    },
    endingAt: endDate.toISOString(),
  };

try 
{
  await dynamoDb.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  }).promise();
} 
catch (error) 
{
  console.log(error);
  throw new createError.InternalServerError(error);
}



  return {
    statusCode: 201,
    body: JSON.stringify({auction}),
  };
}

export const handler = customMiddleware(createAuction);


