import { Handler } from 'aws-lambda';
import { Client } from 'eris';
import {
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
} from './types';

const token = `Bot ${process.env.BOT_TOKEN as string}`;
const guild = process.env.GUILD_ID as string;
const activeRole = process.env.ACTIVE_ROLE_ID as string;
const champRole = process.env.CHAMP_ROLE_ID as string;
const activeThreshold = +(process.env.ACTIVE_THRESHOLD as string);
const champThreshold = +(process.env.CHAMP_THRESHOLD as string);

const discordClient = new Client(token, { restMode: true });

const modifyRole = async (addRole: boolean, id: string, role: string) => {
  try {
    if (addRole) {
      return await discordClient.addGuildMemberRole(guild, id, role);
    }

    return await discordClient.removeGuildMemberRole(guild, id, role);
  } catch (error) {
    throw error;
  }
};

export const handler: Handler<UpdateUserRoleRequest, UpdateUserRoleResponse> = async (request) => {
  const promises: Promise<void>[] = [];

  if ((request.battleStats.totalBattles > activeThreshold) !== request.user.isActive) {
    promises.push(modifyRole(
      request.battleStats.totalBattles > activeThreshold,
      request.user.discordId,
      activeRole,
    ));
  }

  if ((request.battleStats.totalChampBattles > champThreshold) !== request.user.isChamp) {
    promises.push(modifyRole(
      request.battleStats.totalChampBattles > champThreshold,
      request.user.discordId,
      champRole,
    ));
  }

  await Promise.all(promises);

  return {
    isActive: request.battleStats.totalBattles > activeThreshold,
    activeStatusChanged: (request.battleStats.totalBattles > activeThreshold) !== request.user.isActive,
    isChamp: request.battleStats.totalChampBattles > champThreshold,
    champStatusChanged: (request.battleStats.totalChampBattles > champThreshold) !== request.user.isChamp,
  };
};
