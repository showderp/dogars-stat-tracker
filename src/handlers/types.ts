export interface User {
    discordId: string;
    showdownIds: string[];
    isActive: boolean;
    isChamp: boolean;
}

export interface Battle {
    isChamp: boolean;
}

export interface BattleStats {
    totalBattles: number;
    totalChampBattles: number;
}

export interface GetAllUsersRequest {
    lastUserId?: string;
}

export type GetAllUsersResponse = User[];

export interface GetShowdownUserBattleStatsRequest {
    showdownId: string;
    rangeEnd: string;
}

export type GetShowdownUserBattleStatsResponse = BattleStats;

export interface CombineAllShowdownUserBattleStatsRequest {
    battleStatsList: BattleStats[];
}

export type CombineAllShowdownUserBattleStatsResponse = BattleStats;

export interface UpdateUserRoleRequest {
    user: User;
    battleStats: BattleStats;
}

export interface UpdateUserRoleResponse {
    isActive: boolean;
    activeStatusChanged: boolean;
    isChamp: boolean;
    champStatusChanged: boolean;
}
