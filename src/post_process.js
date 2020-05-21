import * from './geometry.js'
import * from './material.js'

tge.post_process = $extend(function (proto) {


    function post_process(on_apply, shader) {
        this.uuid = $guidi();
        this.shader = shader || tge.post_process.shader;
        this.enabled = true;
        this.on_apply = on_apply || null;
    }

    post_process.shader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('defaultPostProcessShader')?>"));


    proto.resize = function (width, height) {

    }
    proto.bind_output = function (engine,output) {
        if (output === null) {
            engine.gl.bindFramebuffer(engine.gl.FRAMEBUFFER, null);
            engine.gl.viewport(0, 0, engine.gl.canvas.width, engine.gl.canvas.height);
        }
        else {
            output.bind();
        }
    }

    var on_apply_params = [null, null, null];
    proto.apply = function (engine, input, output) {        
        engine.useShader(this.shader);
        this.bind_output(engine,output);
        if (this.on_apply !== null) {
            on_apply_params[0] = engine;
            on_apply_params[1] = input;
            on_apply_params[2] = output;
            input = this.on_apply.apply(this, on_apply_params);

        }
        if (this.shader.setUniform("tge_u_texture_input", 0)) {
            engine.useTexture(input, 0);
        }
        
        engine.renderFullScreenQuad();
    }

    return post_process;

});


tge.post_process.fxaa = $extend(function (proto,_super) {
    function fxaa(fxaaSpanMax, fxaaReduceMin,fxaaReduceMul) {
        _super.apply(this);        
        this.shader = tge.post_process.shader.extend(tge.shader.$str("<?=chunk('post-process-fxaa')?>"));
        this.tge_u_fxaa_params = tge.vec3(
            fxaaSpanMax || 8,
            fxaaReduceMin || (1 / 256),
            fxaaReduceMul || (1 / 8)
        );


        this.tge_u_inverseFilterTextureSize = tge.vec3();
        this.on_apply = function (engine, input, output) {
            this.tge_u_inverseFilterTextureSize[0] = 1 / input.width;
            this.tge_u_inverseFilterTextureSize[1] = 1 / input.height;
            this.shader.setUniform("tge_u_inverseFilterTextureSize", this.tge_u_inverseFilterTextureSize);
            this.shader.setUniform("tge_u_fxaa_params", this.tge_u_fxaa_params);
            return input;
        };
    }
    return fxaa;

}, tge.post_process);


tge.post_process.picture_adjustment = $extend(function (proto, _super) {
    function picture_adjustment(gamma, contrast, saturation, brightness, red, green, blue, alpha) {
        _super.apply(this);
        this.shader = tge.post_process.shader.extend(tge.shader.$str("<?=chunk('post-process-pa')?>"));

        this.params = tge.mat3(
            gamma || 1,
            contrast || 1,
            saturation || 1,
            brightness || 1,
            red || 1,
            green || 1,
            blue || 1,
            alpha || 1
        );

        this.on_apply = function (engine, input, output) {
            this.shader.setUniform("tge_u_pa_params", this.params);
            return input;
        };
    }
    return picture_adjustment;

}, tge.post_process);

