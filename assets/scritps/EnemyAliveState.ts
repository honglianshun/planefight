import type { IEnemyState } from './IEnemyState';
import type { enemy } from './enemy';
import { EnemyDeadState } from './EnemyDeadState';

/** 存活状态:下落移动,被子弹击中扣血,hp<=0 或被炸弹击杀时进入死亡 */
export class EnemyAliveState implements IEnemyState {
    static readonly instance: EnemyAliveState = new EnemyAliveState();

    private constructor() {}

    onEnter(_owner: enemy): void {}

    onUpdate(owner: enemy, dt: number): void {
        if (!owner.node || !owner.node.isValid) return;
        const p = owner.node.position;
        owner.node.setPosition(p.x, p.y - owner.speed * dt, p.z);
        if (owner.node.position.y < -500) {
            owner.node.destroy();
        }
    }

    onExit(_owner: enemy): void {}

    onHitByBullet(owner: enemy): void {
        if (!owner || !owner.node || !owner.node.isValid) return;
        try {
            owner.takeBulletHit();
            if (owner.hp < 1 && owner.fsm) {
                owner.fsm.changeState(EnemyDeadState.instance);
            }
        } catch (e) {
            console.error('Error in EnemyAliveState onHitByBullet:', e);
        }
    }

    killNow(owner: enemy): void {
        owner.fsm.changeState(EnemyDeadState.instance);
    }
}
