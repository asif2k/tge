
tge.post_process = $extend(function (proto) {


    function post_process(on_apply, shader) {
        this.uuid = $guidi();
        this.shader = shader || tge.post_process.shader;
        this.enabled = true;
       
    }
      
    proto.resize = function (width, height) {

    }
    proto.bind_output = function (engine,output) {
        if (output === null) {
            engine.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
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





tge.post_process.shader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('post_process_flat')?>"));
tge.post_process.flat = function (engine, input, output) {
    engine.useShader(tge.post_process.shader);
    if (output === null) {
        engine.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
        engine.gl.viewport(0, 0, engine.gl.canvas.width, engine.gl.canvas.height);
    }
    else {
        output.bind();
    }    
    if (tge.post_process.shader.setUniform("tge_u_texture_input", 0)) {
        engine.useTexture(input, 0);
    }

    engine.renderFullScreenQuad();
}


tge.post_process.fxaa = $extend(function (proto, _super) {
    function fxaa(params) {
        _super.apply(this);



        this.spanMax = 8;
        this.reduceMin = (1 / 256);
        this.reduceMul = (1 / 8);

        $merge(params || {}, this);

        this.shader = tge.post_process.fxaa.shader;


    }

    var tge_u_inverseFilterTextureSize = tge.vec3();
    var tge_u_fxaa_params = tge.vec3();
    proto.on_apply = function (engine, input, output) {
        tge_u_inverseFilterTextureSize[0] = 1 / input.width;
        tge_u_inverseFilterTextureSize[1] = 1 / input.height;
        this.shader.setUniform("tge_u_inverseFilterTextureSize", tge_u_inverseFilterTextureSize);

        tge_u_fxaa_params[0] = this.spanMax;
        tge_u_fxaa_params[1] = this.reduceMin;
        tge_u_fxaa_params[2] = this.reduceMul;


        this.shader.setUniform("tge_u_fxaa_params", tge_u_fxaa_params);
        return input;
    };

    fxaa.shader = tge.post_process.shader.extend(import('post_process_fxaa.glsl'));


    return fxaa;

}, tge.post_process);


tge.post_process.picture_adjustment = $extend(function (proto, _super) {
    function picture_adjustment(params) {
        params = params || {};
        _super.apply(this);
        this.shader = tge.post_process.picture_adjustment.shader;      
        this.gamma=1;
        this.contrast= 1;
        this.saturation= 1;
        this.brightness= 1;
        this.red= 1;
        this.green= 1;
        this.blue =1;
        this.alpha = 1;
        $merge(params, this);

    }
    picture_adjustment.shader = tge.post_process.shader.extend(import('post_process_pa.glsl'));

    var tge_u_pa_params = tge.mat3();
    proto.on_apply = function (engine, input, output) {
        tge_u_pa_params[0] = this.gamma;
        tge_u_pa_params[1] = this.contrast;
        tge_u_pa_params[2] = this.saturation;
        tge_u_pa_params[3] = this.brightness;
        tge_u_pa_params[4] = this.red;
        tge_u_pa_params[5] = this.green;
        tge_u_pa_params[6] = this.blue;
        tge_u_pa_params[7] = this.alpha;
        this.shader.setUniform("tge_u_pa_params", tge_u_pa_params);
        return input;
    };

    return picture_adjustment;

}, tge.post_process);



tge.post_process.glow = $extend(function (proto, _super) {



    function glow(params) {
        _super.apply(this);
        params = params || {};

        this.resolution = params.resolution || 0.5;
        this.resolution_last = this.resolution;
        this.blurQuality = params.blurQuality || 10;                
        this.brightThreshold = tge.vec4(params.brightThreshold || [0.2627, 0.6780, 0.0593, -0.5]);
        this.blendExposure = params.blendExposure || 1;
        this.blendGamma = params.blendGamma || 1;
        this.blendFactor = params.blendFactor || 3.0;
        this.tge_u_offset = tge.vec2();
        this.blurKernel = tge.vec3([5.0 / 16.0, 6 / 16.0, 5 / 16.0]);

        if (params.enabled !== undefined) this.enabled = params.enabled;

        
    }

    var chunks = tge.shader.createChunksLib(import('post_process_glow.glsl'))


    glow.emission_shader = tge.post_process.shader.extend(chunks["emission-filter"]);
    glow.merge_shader = tge.post_process.shader.extend(chunks["merge"]);
    glow.blur_shader = tge.post_process.shader.extend(chunks["blur"]);


    proto.resize = function () {
        this.resolution_last = -1;
    };



    var i = 0, t = 0;
    var tge_u_glow_params = tge.vec3();
    proto.apply = function (engine, input, output) {

        if (!this.targets) {
            
            this.targets = [new tge.rendertarget(engine.gl,
                input.width * this.resolution, input.height * this.resolution),
            new tge.rendertarget(engine.gl,
                input.width * this.resolution, input.height * this.resolution)];

            this.targets[0].colorTexture.P("TEXTURE_MAG_FILTER", GL_LINEAR)
                .P("TEXTURE_MIN_FILTER", GL_LINEAR);

            this.targets[1].colorTexture.P("TEXTURE_MAG_FILTER", GL_LINEAR)
                .P("TEXTURE_MIN_FILTER", GL_LINEAR);

        }

        else {

            if (this.resolution_last !== this.resolution) {
                this.targets[0].resize(input.width * this.resolution, input.height * this.resolution);
                this.targets[1].resize(input.width * this.resolution, input.height * this.resolution);
                
            }


        }
        this.resolution_last = this.resolution;
        

        engine.useShader(tge.post_process.glow.emission_shader);
        engine.activeShader.setUniform("tge_u_brightThreshold", this.brightThreshold);
        this.targets[0].bind();        
        engine.useTexture(input, 0);
        engine.renderFullScreenQuad();


        engine.useShader(tge.post_process.glow.blur_shader);
        engine.activeShader.setUniform("tge_u_blurKernel", this.blurKernel);
      
        t=0;
        for (i = 1; i < this.blurQuality; i++) {
            t = i % 2;
            this.targets[t].bind();
            engine.useTexture(this.targets[(t === 0 ? 1 : 0)].colorTexture, 0);
            if (t === 0)
                tge.vec2.set(this.tge_u_offset, (1 / (input.width/i)), 0);
            else
                tge.vec2.set(this.tge_u_offset, 0, (1 / (input.height/i)));


            engine.activeShader.setUniform("tge_u_offset", this.tge_u_offset);
            engine.renderFullScreenQuad();
        }

                
        this.bind_output(engine, output);
        engine.useTexture(input, 0);
        engine.useShader(tge.post_process.glow.merge_shader);
        tge_u_glow_params[0] = this.blendExposure;
        tge_u_glow_params[1] = this.blendGamma;
        tge_u_glow_params[2] = this.blendFactor;
        engine.activeShader.setUniform("tge_u_glow_params", tge_u_glow_params);
        engine.activeShader.setUniform("tge_u_glow_emission", 1)
        engine.useTexture(this.targets[t].colorTexture, 1);
        engine.renderFullScreenQuad();

    }




    return glow;

}, tge.post_process);