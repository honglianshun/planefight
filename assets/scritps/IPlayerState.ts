import type { IState } from './IState';
import type { player } from './player';
import type { reward } from './reward';

/** 玩家状态接口:在通用生命周期之上扩展碰撞事件 */
export interface IPlayerState extends IState<player> {
    onHitEnemy(owner: player): void;
    onPickReward(owner: player, r: reward): void;
}
