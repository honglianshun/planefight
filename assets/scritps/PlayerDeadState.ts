import { Collider2D } from 'cc';
import type { IPlayerState } from './IPlayerState';
import type { player } from './player';
import type { reward } from './reward';
import { gamemanager } from './gamemanager';

/** 死亡状态:禁碰撞,0.4 秒后触发游戏结束(director.pause 会随之冻结 update) */
export class PlayerDeadState implements IPlayerState {
    static readonly instance: PlayerDeadState = new PlayerDeadState();

    private constructor() {}

    onEnter(owner: player): void {
        const collider = owner.getComponent(Collider2D);
        if (collider) {
            collider.enabled = false;
        }
        owner.deathTimer = 0;
        owner.deathFired = false;
    }

    onUpdate(owner: player, dt: number): void {
        if (owner.deathFired) return;
        owner.deathTimer += dt;
        if (owner.deathTimer >= 0.4) {
            owner.deathFired = true;
            gamemanager.getInstance().onGameOver();
        }
    }

    onExit(_owner: player): void {}

    onHitEnemy(_owner: player): void {}

    onPickReward(_owner: player, _r: reward): void {}
}
