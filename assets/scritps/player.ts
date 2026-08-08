import { _decorator, Animation, AudioClip, CCString, Collider2D, Component, Contact2DType, EventTouch, Input, input, instantiate, IPhysics2DContact, Node, Prefab, Vec3 } from 'cc';
import { enemy } from './enemy';
import { reward, RewardType } from './reward';
import { gamemanager } from './gamemanager';
import { lifecount } from './UI/lifecount';
import { audiomgr } from './audiomgr';
import { StateMachine } from './StateMachine';
import { PlayerNormalState } from './PlayerNormalState';
import type { IPlayerState } from './IPlayerState';
const { ccclass, property } = _decorator;

enum ShootType{
    OneShoot,
    TwoShoot
}
@ccclass('player')
export class player extends Component {

    @property
    shootRate:number = 0.5;
    shootTimer:number = 0;

    @property
    shootUpperTime:number = 10;
    shootUpperTimer:number = 0;


    @property
    invincibleTime:number = 1;
    invincibleTimer:number = 0;

    @property(AudioClip)
    bulletAudio:AudioClip = null;


    rewardTime:number = 0.1;
    rewardTimer:number = 0;
    isReward = false;

    @property
    hp:number = 3;
    @property(Node)
    bulletParent:Node = null;
    @property(Node)
    bulletPosition1:Node = null;
    @property(Node)
    bulletPosition2:Node = null;
    @property(Node)
    bulletPosition3:Node = null;
    @property(Prefab)
    bullet2Prefab:Prefab = null;
    @property(Prefab)
    bullet1Prefab:Prefab = null;

    @property(Animation)
    anim:Animation = null;
    @property
    animationHint:string="";
    @property
    animationDie:string="";

    @property(lifecount)
    lifeCountUi:lifecount = null;

    @property
    shootType:ShootType = ShootType.OneShoot;

    @property
    maxMoveSpeed: number = 200; // 添加最大移动速度

    @property(AudioClip)
    getBombAudio:AudioClip = null;


    @property(AudioClip)
    getDoubleAudio:AudioClip = null;


    private canControl:boolean = true;

    public fsm:StateMachine<player>|null = null;
    deathTimer:number = 0;
    deathFired:boolean = false;


    start() {
        //注册单个碰撞体的回调函数
        let collider = this.getComponent(Collider2D);
        if(collider){
            collider.on(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
        this.fsm = new StateMachine<player>(this);
        this.fsm.setInitial(PlayerNormalState.instance);
        this.lifeCountUi.onLifeChange(this.hp);
    }

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE,this.onTouchMove,this)
    }
    
    onTouchMove(event:EventTouch){
        if(this.canControl == false)return;
        if(this.hp<1)return;

        // 获取增量移动
        const deltaX = event.getDeltaX();
        const deltaY = event.getDeltaY();

        // 如果增量太小，可能是触摸抖动，忽略
        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
            return;
        }

        // 直接设置位置
        const currentPos = this.node.position;
        let newX = currentPos.x + deltaX * 0.8; // 增加移动幅度
        let newY = currentPos.y + deltaY * 0.8;

        // 限制移动范围
        newX = Math.max(-200, Math.min(200, newX));
        newY = Math.max(-370, Math.min(370, newY));

        // 使用整数位置，避免浮点数累积误差
        newX = Math.round(newX);
        newY = Math.round(newY);

        this.node.setPosition(newX, newY, currentPos.z);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE,this.onTouchMove,this);
        //解绑碰撞回调,避免场景重载后监听残留(enemy.ts 同样处理)
        const collider = this.getComponent(Collider2D);
        if(collider){
            collider.off(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
        }
    }

    protected update(deltaTime: number): void {
        this.fsm?.update(deltaTime);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null){
        if (!this.fsm) return;
        const cur = this.fsm.current as IPlayerState;
        //和敌机碰撞
        if (otherCollider.getComponent(enemy)){
            cur.onHitEnemy(this);
            return;
        }
        //和奖励碰撞
        const rewardComp = otherCollider.getComponent(reward);
        if (rewardComp){
            cur.onPickReward(this, rewardComp);
            return;
        }
    }


    
    /** 存活期间的每帧行为:射击定时器 + 双发限时 + 奖励去抖动 */
    updateAlive(dt: number){
        this.shootTimer += dt;
        if (this.shootTimer > this.shootRate){
            this.shootTimer = 0;
            switch(this.shootType){
                case ShootType.OneShoot:
                    this.oneShoot();
                    break;
                case ShootType.TwoShoot:
                    this.shootUpperTimer += dt;
                    if (this.shootUpperTimer>this.shootUpperTime){
                        this.shootType = ShootType.OneShoot;
                        this.shootUpperTimer = 0;
                    }
                    this.twoShoot();
                    break;
            }
        }

        if(this.isReward){
            this.rewardTimer += dt;
        }
        if(this.rewardTimer>this.rewardTime){
            this.isReward = false;
            this.rewardTimer = 0;
        }
    }

    /** 受撞扣血:hp>0 播受击动画,否则播死亡动画,并刷新生命 UI */
    takeHit(){
        this.hp -= 1;
        if(this.hp > 0){
            this.anim.play(this.animationHint);
        } else{
            this.anim.play(this.animationDie);
        }
        this.lifeCountUi.onLifeChange(this.hp);
    }

    /** 拾取奖励:去抖动期间不拾取也不销毁(保留原行为) */
    pickReward(r: reward){
        if (this.isReward) return;
        this.isReward = true;
        switch(r.rewardtype){
            case RewardType.TwoShoot:
                this.activateDoubleShoot();
                audiomgr.inst.playOneShot(this.getDoubleAudio);
                break;
            case RewardType.Bomb:
                gamemanager.getInstance().addBomb();
                audiomgr.inst.playOneShot(this.getBombAudio);
                break;
        }
        r.node.destroy();
    }

    activateDoubleShoot(){
        this.shootType = ShootType.TwoShoot;
        this.shootUpperTimer = 0;
    }

    oneShoot(){
        const bullet1 = instantiate(this.bullet1Prefab);
        this.bulletParent.addChild(bullet1);

        this.ensureSprite(bullet1);

        bullet1.setWorldPosition(this.bulletPosition1.worldPosition);
        audiomgr.inst.playOneShot(this.bulletAudio,0.1);
    }
    twoShoot(){
        const bullet1 = instantiate(this.bullet2Prefab);
        const bullet2 = instantiate(this.bullet2Prefab);
        this.bulletParent.addChild(bullet1);
        this.bulletParent.addChild(bullet2);

        this.ensureSprite(bullet1);
        this.ensureSprite(bullet2);

        bullet1.setWorldPosition(this.bulletPosition2.worldPosition);
        bullet2.setWorldPosition(this.bulletPosition3.worldPosition);
        audiomgr.inst.playOneShot(this.bulletAudio,0.1);
        audiomgr.inst.playOneShot(this.bulletAudio,0.1);
    }

    public setCanControl(canControl:boolean){
        this.canControl = canControl;
    }

    private ensureSprite(node: Node): void {
        if (!node || !node.isValid) return;
        if (!node.getComponent('cc.Sprite')) {
            node.addComponent('cc.Sprite');
        }
    }


}
