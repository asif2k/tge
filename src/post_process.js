
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
        this.shader = tge.post_process.shader.extend(import('post_process_fxaa.glsl'));
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
        this.shader = tge.post_process.shader.extend(import('post_process_pa.glsl'));

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



tge.post_process.radial_blur = $extend(function (proto, _super) {

   

    function radial_blur(centerX,centerY,angle,radius,kernelSize) {
        _super.apply(this);
        this.shader = tge.post_process.shader.extend(import('post_process_radial_blur.glsl'));


        this.centerX =centerX || 0.5;
        this.centerY = centerY || 0.5;
        this.angle = angle || 3;
        this.radius = radius || -1;
        this.kernelSize = kernelSize || 10;

        this.params = tge.mat3();                     

        this.on_apply = function (engine, input, output) {
            this.params[0] = input.width;
            this.params[1] = input.height;
            this.params[4] = this.centerX * input.width;
            this.params[5] = this.centerY * input.height;
            this.params[6] = this.angle * tge.DEGTORAD;
            this.params[7] = this.radius;
            this.params[8] = this.kernelSize;

            this.shader.setUniform("tge_u_blur_params", this.params);
            return input;
        };
    }
    return radial_blur;

}, tge.post_process);



tge.post_process.motion_blur = $extend(function (proto, _super) {



    function motion_blur(velX, velY, offset, kernelSize) {
        _super.apply(this);
        this.shader = tge.post_process.shader.extend(import('post_process_motion_blur.glsl'));


        this.velX = velX || 14;
        this.velY = velY || 14;
        
        this.offset = offset || 0;
        this.kernelSize = kernelSize || 50;

        this.params = tge.mat3();

        this.on_apply = function (engine, input, output) {
            this.params[0] = input.width;
            this.params[1] = input.height;
            this.params[4] = this.velX;
            this.params[5] = this.velY;
         
            this.params[7] = this.offset;
            this.params[8] = this.kernelSize;

            this.shader.setUniform("tge_u_blur_params", this.params);
            return input;
        };
    }
    return motion_blur;

}, tge.post_process);

