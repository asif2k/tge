
tge.post_process = $extend(function (proto) {


    function post_process(on_apply, shader) {
        this.uuid = $guidi();
        this.shader = shader || tge.post_process.shader;
        this.enabled = true;
        this.on_apply = on_apply || null;
    }

    


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



tge.post_process.shader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('post_process_flat')?>"));
tge.post_process.flat = function (engine, input, output) {
    engine.useShader(tge.post_process.shader);
    if (output === null) {
        engine.gl.bindFramebuffer(engine.gl.FRAMEBUFFER, null);
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


tge.post_process.kawase_blur = $extend(function (proto, _super) {

    function kawase_blur() {
        _super.apply(this);
      
        this.quality = 3;
        this.kernels = [0, 1, 2, 2, 3];
        this.mb = new tge.post_process.motion_blur();
    }

    proto.set_kernels = function () {

    }

    proto.apply = function (engine, input, output) {
        if (!this.targets) {
            this.targets = [new tge.rendertarget(engine.gl,
                input.width * 0.5, input.height * 0.5),
                new tge.rendertarget(engine.gl,
                    input.width * 0.5, input.height * 0.5)
            ];

            this.blur_offset = tge.vec2();

        }
        engine.gl.disable(engine.gl.DEPTH_TEST);        
        tge.post_process.flat(engine, input, this.targets[0]);
      
        var t = 0, off;
        var uvX = 1 / input.width;
        var uvY = 1 / input.height;
              

        engine.useShader(tge.post_process.kawase_blur.shader);
        for (var i = 1; i < this.kernels.length; i++) {
            t = i % 2;
            this.targets[t].bind();
            engine.useTexture(this.targets[(t === 0 ? 1 : 0)].colorTexture, 0);
            off = this.kernels[i] + 0.5;
            this.blur_offset[0] = off * uvX;
            this.blur_offset[1] = off * uvY;
            engine.activeShader.setUniform("tge_u_offset", this.blur_offset);
            
            engine.renderFullScreenQuad();
        }

        tge.post_process.flat(engine, this.targets[t].colorTexture, output);

        engine.gl.enable(engine.gl.DEPTH_TEST);


    };

    kawase_blur.shader = tge.post_process.shader.extend(import('post_process_kawase_blur.glsl'));

    console.log("kawase_blur.shader", kawase_blur.shader);

    return kawase_blur;
   
}, tge.post_process);




tge.post_process.glow = $extend(function (proto, _super) {



    function glow() {
        _super.apply(this);
        

        this.blur = new tge.post_process.kawase_blur();

    }

    var chunks = tge.shader.createChunksLib(import('post_process_glow.glsl'))
    console.log("chunks", chunks);


    glow.emission_shader = tge.post_process.shader.extend(chunks["emission-filter"]);
    glow.merge_shader = tge.post_process.shader.extend(chunks["merge"]);
    glow.blur_shader = tge.post_process.shader.extend(chunks["blur"]);

    proto.resize = function (width, height) {
        this.emission_map.resize(width, height);
    }



    proto.apply = function (engine, input, output) {

        if (!this.targets) {
            var sz = 0.5;
            this.targets = [new tge.rendertarget(engine.gl,
                input.width * sz, input.height * sz),
            new tge.rendertarget(engine.gl,
                input.width * sz, input.height * sz)];

            this.tge_u_offset = tge.vec2();
            this.tge_u_blur = tge.vec3(5.0 / 16.0, 6 / 16.0, 5 / 16.0);
            tge.vec3.set(this.tge_u_blur, 5 / 16, 6 / 16, 5 / 16);
        }
        engine.gl.disable(engine.gl.DEPTH_TEST);
        engine.useShader(tge.post_process.glow.emission_shader);
        this.targets[0].bind();        
        engine.useTexture(input, 0);
        engine.renderFullScreenQuad();


        engine.useShader(tge.post_process.glow.blur_shader);
        engine.activeShader.setUniform("tge_u_blur", this.tge_u_blur);
        var t=0;
        for (var i = 1; i < 8; i++) {
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
        engine.activeShader.setUniform("tge_u_glow_emission", 1)
        engine.useTexture(this.targets[t].colorTexture, 1);

        engine.renderFullScreenQuad();


        engine.gl.enable(engine.gl.DEPTH_TEST);
    }

    proto.apply2 = function (engine, input, output) {

        if (!this.emission_map) {
           this.emission_map=new tge.rendertarget(engine.gl,
               engine.gl.canvas.width * 1, engine.gl.canvas.height * 1)


        }
        engine.gl.disable(engine.gl.DEPTH_TEST);
        engine.useShader(tge.post_process.glow.emission_shader);
        this.emission_map.bind();        
        engine.useTexture(input, 0);
        engine.renderFullScreenQuad();


        this.blur.apply(engine, this.emission_map.colorTexture, this.emission_map);

        this.bind_output(engine, output);
        engine.useShader(tge.post_process.glow.merge_shader);
        engine.activeShader.setUniform("tge_u_glow_emission", 1)
        engine.useTexture(input, 0);
        engine.useTexture(this.emission_map.colorTexture, 1);

        engine.renderFullScreenQuad();


        engine.gl.enable(engine.gl.DEPTH_TEST);
    }


    return glow;

}, tge.post_process);