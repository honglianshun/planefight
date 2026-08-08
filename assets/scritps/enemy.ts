import { _decorator, Animation, AudioClip, CCString, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { bullet } from './bullet';
import { gamemanager } from './gamemanager';
import { enemymanager } from './enemymanager';
import { audiomgr } from './audiomgr';
import { StateMachine } from './StateMachine';
import { EnemyAliveState } from './EnemyAliveState';
import type { IEnemyState } from './IEnemyState';
const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {


    @property
    speed:number = 300;
    @property
    score:number = 100;
    @property
    hp:number = 1;
    @property(Animation)
    anim:Animation = null;
    @property
    animationHint:string="";
    @property
    animationDie:string="";


    @property(AudioClip)
    enemyDieAudio:AudioClip = null;

    public fsm:StateMachine<enemy>|null = null;
    deadTimer:number = 0;

    start() {
        // 确保节点有效
        if (!this.node || !this.node.isValid) {
            this.node.destroy();
            return;
        }

        //注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if(collider){
            collider.on(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
        this.fsm = new StateMachine<enemy>(this);
        this.fsm.setInitial(EnemyAliveState.instance);
    }

    update(deltaTime: number) {
        // 如果节点已无效，不再更新
        if (!this.node || !this.node.isValid) {
            return;
        }
        this.fsm?.update(deltaTime);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null){
         if (!this.fsm || !this.node || !this.node.isValid) {
            return;
        }
        if (otherCollider.getComponent(bullet)){
            otherCollider.node.destroy();
            try {
                (this.fsm.current as IEnemyState).onHitByBullet(this);
            } catch (e) {
                console.error('Error in enemy onHitByBullet:', e);
            }
        }
    }

    /** 被子弹击中扣血;hp>0 播受击动画,hp<=0 的死亡动画交由死亡状态播放 */
    takeBulletHit(){
         if (!this.node || !this.node.isValid) {
            return;
        }
        this.hp -= 1;
        if(this.hp > 0 && this.anim && this.animationHint){
            this.anim.play(this.animationHint);
        }
    }

    /** 炸弹击杀:由当前状态决定(存活则进入死亡,已死则忽略) */
    killNow(){
        if (!this.fsm || !this.node || !this.node.isValid) return;
        (this.fsm.current as IEnemyState).killNow(this);
    }

    protected onDestroy(): void {
     
        // 确保在销毁时清理所有引用
        if (this.fsm) {
            this.fsm.destroy();
            this.fsm = null;
        }

        
        const em = enemymanager.GetInstance();
        if (em && this.node && this.node.isValid) {
            em.removeEnemy(this.node);
        }

        // 移除碰撞回调
        let collider = this.getComponent(Collider2D);
        if(collider){
            collider.off(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
    }
}

