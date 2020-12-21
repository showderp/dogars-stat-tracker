import { Handler } from 'aws-lambda';
import {
    CombineAllShowdownUserBattleStatsRequest,
    CombineAllShowdownUserBattleStatsResponse,
} from './types';

export const handler: Handler<CombineAllShowdownUserBattleStatsRequest, CombineAllShowdownUserBattleStatsResponse> = async (request, context) => {
  const battleStats = request.battleStatsList.reduce((totalBattleStats, battleStats) => {
    return {
      totalBattles: totalBattleStats.totalBattles + battleStats.totalBattles,
      totalChampBattles: totalBattleStats.totalChampBattles + battleStats.totalChampBattles,
    };
  }, { totalBattles: 0, totalChampBattles: 0 });

  return battleStats;
};
