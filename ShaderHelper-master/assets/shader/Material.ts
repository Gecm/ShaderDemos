const shader = {
    name: 'test',
    defines: [],

    vert: 
`
uniform mat4 viewProj;
uniform mat4 model;
attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 v_texCoord;
void main () {
    mat4 mvp;
    mvp = viewProj * model;

    vec4 pos = mvp * vec4(a_position, 1);
    gl_Position = pos;
    v_texCoord = a_uv0;
}
`,
    frag:
`
uniform sampler2D iTexture;
uniform vec2 startPos;
uniform float curDis;
uniform float time;
uniform vec2 size;
varying vec2 v_texCoord;

void main()
{
    vec2 dv = startPos - v_texCoord;
    dv = dv * vec2(size.x/size.y, 1.0);
    float dis = sqrt(dv.x * dv.x + dv.y * dv.y);
    float disF = clamp(0.3 - abs(curDis - dis), 0.0, 1.0);
    vec2 offset = normalize(dv) * sin(dis * 100.0 + time * 10.0) * 0.1 * disF;
    vec2 uv = v_texCoord + offset;
    gl_FragColor = texture2D(iTexture, uv);
}
`,
};

const math = cc.vmath;
const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;
const gfx = renderEngine.gfx;
const Material = renderEngine.Material;

export default class ShaderMaterial extends Material {
    constructor () {
        super(false);
        // load the shader to program lib
        let rend = cc.renderer as any;
        rend._forward._programLib.define(shader.name, shader.vert, shader.frag, shader.defines);

        let pass = new renderer.Pass(shader.name);
        pass.setDepth(false, false);
        pass.setCullMode(gfx.CULL_NONE);
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
        );

        let mainTech = new renderer.Technique(
            ['transparent'],
            [
                { name: 'iTexture', type: renderer.PARAM_TEXTURE_2D },
                { name: 'size', type: renderer.PARAM_FLOAT2 },
                { name: 'time', type: renderer.PARAM_FLOAT },
                { name: 'startPos', type: renderer.PARAM_FLOAT2 },
                { name: 'curDis', type: renderer.PARAM_FLOAT },
            ],
            [pass]
        );

        this._texture = null;
        this._size = math.vec2.create();

        // need _effect to calculate hash
        this._effect = this.effect = new renderer.Effect(
            [mainTech],
            {
                'size': this._size
            },
            []
        );
        
        this._mainTech = mainTech;
    }

    getTexture () {
        return this._texture;
    }

    setTexture (val) {
        if (this._texture !== val) {
            this._texture = val;
            this._texture.update({
                // Adapt to shader
                flipY: false,
                // For load texture
                mipmap: false
            });
            this._effect.setProperty('iTexture', val.getImpl());
            this._texIds['iTexture'] = val.getId();
        }
    }

    setSize (width, height) {
        this._size.x = width;
        this._size.y = height;
    }

    setTime (time: number) {
        this._effect.setProperty('time', time);
    }

    setStartPos (x, y) {
        let startPos = math.vec2.create();
        startPos.x = x;
        startPos.y = y;
        this._effect.setProperty('startPos', startPos);
    }

    setCurDis (dis: number) {
        this._effect.setProperty('curDis', dis);
    }
}

