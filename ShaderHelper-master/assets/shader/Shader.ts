import ShaderMaterial from "./Material";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Shader extends cc.Component {

    @property(cc.Sprite)
    Target: cc.Sprite = null;

    private _material: ShaderMaterial = null;
    private _startTime: number = 0;
    private _time: number = 0;
    private _curDis: number = 2;
    private _startPos = { x: 0.5, y: 0.5};
    private _isPlayAni: boolean = false;

    onLoad () {
        // 关闭动态图集
        if (cc.dynamicAtlasManager) {
            cc.dynamicAtlasManager.enabled = false;
        }

        this._material = new ShaderMaterial();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    start () {
        if (this.Target) {
            let texture = this.Target.spriteFrame.getTexture();
            this._material.setTexture(texture);
            this._material.setSize(this.node.getContentSize().width, this.node.getContentSize().height);
            this._material.setTime(this._time);
            this._material.setStartPos(this._startPos.x, this._startPos.y);
            this._material.setCurDis(this._curDis);

            this._material.updateHash();
            let sp = this.Target as any;
            sp._material = this._material;
            sp._renderData._material = this._material;
        }
    }

    update (dt) {
        if (this._isPlayAni) {
            this._time = (Date.now() - this._startTime) / 1000;
            console.log(this._time);
            this._curDis = this._time * 0.2;
            if (this._curDis >= 2) {
                this._isPlayAni = false;
            }

            this._material.setTime(this._time);
            this._material.setStartPos(this._startPos.x, this._startPos.y);
            this._material.setCurDis(this._curDis);
        }
    }

    onTouchStart (event: cc.Touch) {
        this._isPlayAni = true;
        this._startTime = Date.now();

        let touchPos = event.getLocation();
        touchPos = this.node.convertToNodeSpace(touchPos);
        this._startPos.x = touchPos.x /this.node.width;
        this._startPos.y = (this.node.height-touchPos.y) / this.node.height;
    }
}
