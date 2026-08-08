import type { IPlayerState } from './IPlayerState';
import type { player } from './player';
import type { reward } from './reward';
import { PlayerInvincibleState } from './PlayerInvincibleState';
import { PlayerDeadState } from './PlayerDeadState';

/** 正常状态:射击与奖励去抖动;受撞后按剩余血量切到无敌或死亡 */
export class PlayerNormalState implements IPlayerState {
    static readonly instance: PlayerNormalState = new PlayerNormalState();

    private constructor() {}

    onEnter(_owner: player): void {}

    onUpdate(owner: player, dt: number): void {
        if (!owner || !owner.node || !owner.node.isValid) return;
        try {
            owner.updateAlive(dt);
        } catch (e) {
            console.error('Error in PlayerNormalState update:', e);
        }
    }

    onExit(_owner: player): void {}

    onHitEnemy(owner: player): void {
        if (!owner || !owner.node || !owner.node.isValid) {
            return;
        }
        try {
            owner.takeHit();
            if (owner.hp > 0 && owner.fsm) {
                owner.fsm.changeState(PlayerInvincibleState.instance);
            } else if (owner.fsm) {
                owner.fsm.changeState(PlayerDeadState.instance);
            }
        } catch (e) {
            console.error('Error in PlayerNormalState onHitEnemy:', e);
        }
    }

    onPickReward(owner: player, r: reward): void {
        owner.pickReward(r);
    }
}
