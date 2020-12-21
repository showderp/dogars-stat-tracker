import { Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { GetAllUsersRequest, GetAllUsersResponse, User } from './types';

const dynamoDBClient = new DynamoDB.DocumentClient();
const userTableName = process.env.USER_TABLE_NAME as string;

export const handler: Handler<GetAllUsersRequest, GetAllUsersResponse> = async (request) => {
  const parameters: DynamoDB.DocumentClient.ScanInput = {
    TableName: userTableName,
  };

  if (request.lastUserId) {
    parameters.ExclusiveStartKey = { discordId: request.lastUserId };
  }

  const response = await dynamoDBClient.scan(parameters).promise();

  if (response.Items) {
    return response.Items as User[];
  }

  return [];
};
