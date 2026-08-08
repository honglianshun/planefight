import type { IPlayerState } from './IPlayerState';
import type { player } from './player';
import type { reward } from './reward';
import { PlayerNormalState } from './PlayerNormalState';

/** 无敌状态:期间仍射击并可拾取奖励,受撞忽略;倒计时结束后回到正常 */
export class PlayerInvincibleState implements IPlayerState {
    static readonly instance: PlayerInvincibleState = new PlayerInvincibleState();

    private constructor() {}

    onEnter(owner: player): void {
        owner.invincibleTimer = 0;
    }

    onUpdate(owner: player, dt: number): void {
        owner.updateAlive(dt);
        owner.invincibleTimer += dt;
        if (owner.invincibleTimer > owner.invincibleTime) {
            owner.fsm.changeState(PlayerNormalState.instance);
        }
    }

    onExit(_owner: player): void {}

    onHitEnemy(_owner: player): void {}

    onPickReward(owner: player, r: reward): void {
        owner.pickReward(r);
    }
}
