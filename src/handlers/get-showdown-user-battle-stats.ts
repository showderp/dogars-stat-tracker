import { Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import {
  Battle,
  BattleStats,
  GetShowdownUserBattleStatsRequest,
  GetShowdownUserBattleStatsResponse,
} from './types';

const dynamoDBClient = new DynamoDB.DocumentClient();
const battleTableName = process.env.BATTLE_TABLE_NAME as string;
const battleTableIndex = process.env.BATTLE_TABLE_INDEX as string;
const rangeSize = +(process.env.RANGE_SIZE as string);

type BattleKey = { showdownId: string, battleStartTime: number };

const queryBattles = async (showdownId: string, rangeStart: number, rangeEnd: number, lastEvaluatedKey?: BattleKey) => {
  const parameters: DynamoDB.DocumentClient.QueryInput = {
    TableName: battleTableName,
    IndexName: battleTableIndex,
    ProjectionExpression: 'isChamp',
    KeyConditionExpression: '(showdownId = :showdownId) AND (battleStartTime BETWEEN :rangeStart AND :rangeEnd)',
    ExpressionAttributeValues: {
      ':showdownId': showdownId,
      ':rangeStart': rangeStart,
      ':rangeEnd': rangeEnd,
    },
  };

  if (lastEvaluatedKey) {
    parameters.ExclusiveStartKey = lastEvaluatedKey;
  }

  const response = await dynamoDBClient.query(parameters).promise();

  if (response.Items) {
    const battleStats: BattleStats = (response.Items as Battle[])
      .reduce((totalBattleStats, { isChamp }) => {
        return {
          totalBattles: totalBattleStats.totalBattles + 1,
          totalChampBattles: totalBattleStats.totalChampBattles + (isChamp ? 1 : 0),
        };
      }, { totalBattles: 0, totalChampBattles: 0 });

    if (response.LastEvaluatedKey) {
      return {
        battleStats,
        lastEvaluatedKey: response.LastEvaluatedKey as BattleKey,
      };
    }

    return {
      battleStats,
    }
  }

  throw new Error('meme'); // TODO
};

export const handler: Handler<GetShowdownUserBattleStatsRequest, GetShowdownUserBattleStatsResponse> = async (request) => {
  const rangeEnd = new Date(request.rangeEnd).getTime();
  const rangeStart = rangeEnd - rangeSize;

  let { battleStats, lastEvaluatedKey } = await queryBattles(request.showdownId, rangeStart, rangeEnd);
  let totalBattleStats = battleStats;

  while (lastEvaluatedKey) {
    ({ battleStats, lastEvaluatedKey } = await queryBattles(request.showdownId, rangeStart, rangeEnd, lastEvaluatedKey));

    totalBattleStats = {
      totalBattles: totalBattleStats.totalBattles + battleStats.totalBattles,
      totalChampBattles: totalBattleStats.totalChampBattles + battleStats.totalChampBattles,
    }
  }

  return totalBattleStats;
};
