import type { IState } from './IState';
import type { enemy } from './enemy';

/** 敌机状态接口:在通用生命周期之上扩展碰撞/击杀事件 */
export interface IEnemyState extends IState<enemy> {
    onHitByBullet(owner: enemy): void;
    killNow(owner: enemy): void;
}
