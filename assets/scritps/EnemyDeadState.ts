import { Collider2D } from 'cc';
import type { IEnemyState } from './IEnemyState';
import type { enemy } from './enemy';
import { gamemanager } from './gamemanager';
import { audiomgr } from './audiomgr';

/** 死亡状态:禁碰撞、加分、播死亡动画与音效,1 秒后销毁节点 */
export class EnemyDeadState implements IEnemyState {
    static readonly instance: EnemyDeadState = new EnemyDeadState();

    private constructor() {}

    onEnter(owner: enemy): void {
        if (!owner.node || !owner.node.isValid) return;
        const collider = owner.getComponent(Collider2D);
        if (collider) {
            collider.enabled = false;
        }
        const gm = gamemanager.getInstance();
        if (gm) {
            gm.addScore(owner.score);
        }
        if (owner.anim && owner.animationDie) {
            owner.anim.play(owner.animationDie);
        }
        if (owner.enemyDieAudio) {
            audiomgr.inst.playOneShot(owner.enemyDieAudio, 1);
        }
        owner.deadTimer = 0;
    }

    onUpdate(owner: enemy, dt: number): void {
        if (!owner.node || !owner.node.isValid) {
            // 如果节点已销毁，立即退出
            return;
        }
        owner.deadTimer += dt;
        if (owner.deadTimer >= 1.0) {
            owner.node.destroy();
        }
    }

    onExit(_owner: enemy): void {}

    onHitByBullet(_owner: enemy): void {}

    killNow(_owner: enemy): void {}
}
