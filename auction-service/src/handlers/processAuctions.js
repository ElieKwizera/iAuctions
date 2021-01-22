import AWS from 'aws-sdk';
import createError from 'http-errors';
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function getEndedAuctions()
{
    const now  = new Date();
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status AND endingAt <= :now',
        ExpressionAttributeValues:
        {
            ':status': 'OPEN',
            ':now': now.toISOString()
        },
        ExpressionAttributeNames:
        {
            '#status': 'status'
        }
    };

    const res = await DynamoDB.query(params).promise();

    return res.Items;
}

async function closeAuction(auction)
{
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
          ':status': 'CLOSED',
        },
        ExpressionAttributeNames: {
          '#status': 'status',
        },
      };
    
      const result  =await DynamoDB.update(params).promise();
      return result;
    
  
}

async function processAuctions()
{
    
    try 
    {
        const endedAuctions = await getEndedAuctions();
        const promises = endedAuctions.map( auction => {
            console.log(auction);
            closeAuction(auction); 
        });
        await Promise.all(promises);
    }
     catch (error) 
    {
        console.log("error:",error);
        throw new createError.InternalServerError(error);
    }
}

export const handler  = processAuctions;