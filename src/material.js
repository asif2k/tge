import * from './texture.js'

tge.material_base = $extend(function (proto) {

    proto.setDiffuse = function (r, g, b) {
        tge.vec3.set(this.diffuse, r, g, b);
        return (this);
    };

    proto.setAmbient = function (r, g, b) {
        tge.vec3.set(this.ambient, r, g, b);
        return (this);
    };

    proto.setSpecular = function (r, g, b) {
        tge.vec3.set(this.specular, r, g, b);
        return (this);
    };

    proto.setDiffuseRandom = function () {
        tge.vec3.set(this.diffuse, Math.random(), Math.random(), Math.random());
        return (this);
    }

    proto.setAmbientRandom = function () {
        tge.vec3.set(this.ambient, Math.random(), Math.random(), Math.random());
        return (this);
    }
    proto.setSpecularRandom = function () {
        tge.vec3.set(this.specular, Math.random(), Math.random(), Math.random());
        return (this);
    }

    function material_base(options) {
        options = options || {};
        this.internalData = new Float32Array(16);
        this.ambient = new Float32Array(this.internalData.buffer, 0, 4);
        this.diffuse = new Float32Array(this.internalData.buffer, 4 * 4, 4);
        this.specular = new Float32Array(this.internalData.buffer, 8 * 4, 4);


        tge.vec3.copy(this.ambient, options.ambient || [0.5, 0.5, 0.5]);
        tge.vec3.copy(this.diffuse, options.diffuse || [0.5, 0.5, 0.5]);
        tge.vec3.copy(this.specular, options.specular || [0.3, 0.3, 0.3]);
        return (this);

    }

    return material_base;

});


tge.material = $extend(function (proto,_super) {
    $assign(proto, tge.flags.prototype);

    proto.setTansparency = function (v) {
        if (v > 1) v = 1;
        this.ambient[3] = v;
        if (v < 1) this.setFlag(tge.SHADING.TRANSPARENT);
        else this.unsetFlag(tge.SHADING.TRANSPARENT);
        return (this);
    };
    proto.setShinness = function (shin) {
        this.specular[3] = shin;
        return (this);
    };

    proto.setDepthTest = function (on) {
        if (on)
            this.unsetFlag(tge.SHADING.NO_DEPTH_TEST);
        else
            this.setFlag(tge.SHADING.NO_DEPTH_TEST);

        return (this)

    }


    proto.renderMesh = function (engine, shader, mesh) {

        if (!shader.shadowShader) {
            if (shader.setUniform("tge_u_objectMaterial", this.internalData)) {
                engine.useTexture(this.ambientTexture, 0);
                if (shader.setUniform("tge_u_normalMap", 1)) {
                    engine.useTexture(this.normalMap, 1);
                }
                shader.setUniform("tge_u_textureMatrix", this.textureMatrix);
            }
        }
        

        engine.updateModelUniforms(mesh.model);
        mesh.drawCount = mesh.geo.numItems;

        if (mesh.geo.indexData) {
            engine.gl.drawElements(this.drawType, mesh.drawCount, engine.gl.UNSIGNED_SHORT, mesh.drawOffset);
        }
        else {
            engine.gl.drawArrays(this.drawType, mesh.drawOffset, mesh.drawCount);
        }

    }
    proto.useShader = function (shader,engine) {
        if ((this.flags & tge.SHADING.NO_DEPTH_TEST) !== 0) {
            engine.gl.disable(engine.gl.DEPTH_TEST);
        }
        else {
            engine.gl.enable(engine.gl.DEPTH_TEST);
        }
    };
    proto.clone = function () {
        var mat = new tge.material();
        tge.mat4.copy(mat.internalData, this.internalData);
        mat.ambientTexture = this.ambientTexture;
        mat.diffuseTexture = this.diffuseTexture;
        mat.specularTexture = this.specularTexture;
        mat.normalMap = this.normalMap;
        mat.shader = this.shader;
        mat.flags = this.flags;
        mat.drawType = this.drawType;

        return (mat);
    };


   
    function material(options) {
        options = options || {};
        _super.apply(this, arguments);
        tge.flags.apply(this, arguments);

        this.uuid = $guidi();
        this.ambient[3] = 1;

        this.textureMatrix = tge.mat3();

        this.shader = tge.material.shader;

        this.ambientTexture = null;
        this.normalMap = null;
        this.envMap = null;
        this.dispMap = null;
        this.flags = tge.SHADING.FLAT | tge.SHADING.DEPTH_TEST;
        this.drawType = tge.DRAW_TYPES.TRIANGLES;
        this.setShinness(options.shinness || 100);

        return (this);

    }
    material.shader = tge.pipleline_shader.parse(import('flat_material.glsl'));

    material.init = function () {
        tge.material.Brass = new tge.material({ ambient: [0.329412, 0.223529, 0.027451], diffuse: [0.780392, 0.568627, 0.113725], specular: [0.992157, 0.941176, 0.807843], shinness: 27.8974 });
        tge.material.Polished_Bronze = new tge.material({ ambient: [0.25, 0.148, 0.06475], diffuse: [0.4, 0.2368, 0.1036], specular: [0.774597, 0.458561, 0.200621], shinness: 76.8 });
        tge.material.Chrome = new tge.material({ ambient: [0.25, 0.25, 0.25], diffuse: [0.4, 0.4, 0.4], specular: [0.774597, 0.774597, 0.774597], shinness: 76.8 });
        tge.material.Copper = new tge.material({ ambient: [0.19125, 0.0735, 0.0225], diffuse: [0.7038, 0.27048, 0.0828], specular: [0.256777, 0.137622, 0.086014], shinness: 12.8 });
        tge.material.Polished_Copper = new tge.material({ ambient: [0.2295, 0.08825, 0.0275], diffuse: [0.5508, 0.2118, 0.066], specular: [0.580594, 0.223257, 0.0695701], shinness: 51.2 });
        tge.material.Gold = new tge.material({ ambient: [0.24725, 0.1995, 0.0745], diffuse: [0.75164, 0.60648, 0.22648], specular: [0.628281, 0.555802, 0.366065], shinness: 51.2 });
        tge.material.Polished_Gold = new tge.material({ ambient: [0.24725, 0.2245, 0.0645], diffuse: [0.34615, 0.3143, 0.0903], specular: [0.797357, 0.723991, 0.208006], shinness: 83.2 });
        tge.material.Pewter = new tge.material({ ambient: [0.105882, 0.058824, 0.113725], diffuse: [0.427451, 0.470588, 0.541176], specular: [0.333333, 0.333333, 0.521569], shinness: 9.84615 });
        tge.material.Silver = new tge.material({ ambient: [0.19225, 0.19225, 0.19225], diffuse: [0.50754, 0.50754, 0.50754], specular: [0.508273, 0.508273, 0.508273], shinness: 51.2 });
        tge.material.Polished_Silver = new tge.material({ ambient: [0.23125, 0.23125, 0.23125], diffuse: [0.2775, 0.2775, 0.2775], specular: [0.773911, 0.773911, 0.773911], shinness: 89.6 });
        tge.material.Emerald = new tge.material({ ambient: [0.0215, 0.1745, 0.0215], diffuse: [0.07568, 0.61424, 0.07568], specular: [0.633, 0.727811, 0.633], shinness: 76.8 });
        tge.material.Jade = new tge.material({ ambient: [0.135, 0.2225, 0.1575], diffuse: [0.54, 0.89, 0.63], specular: [0.316228, 0.316228, 0.316228], shinness: 12.8 });
        tge.material.Obsidian = new tge.material({ ambient: [0.05375, 0.05, 0.06625], diffuse: [0.18275, 0.17, 0.22525], specular: [0.332741, 0.328634, 0.346435], shinness: 38.4 });
        tge.material.Pearl = new tge.material({ ambient: [0.25, 0.20725, 0.20725], diffuse: [1.0, 0.829, 0.829], specular: [0.296648, 0.296648, 0.296648], shinness: 11.264 });
        tge.material.Ruby = new tge.material({ ambient: [0.1745, 0.01175, 0.01175], diffuse: [0.61424, 0.04136, 0.04136], specular: [0.727811, 0.626959, 0.626959], shinness: 76.8 });
        tge.material.Turquoise = new tge.material({ ambient: [0.1, 0.18725, 0.1745], diffuse: [0.396, 0.74151, 0.69102], specular: [0.297254, 0.30829, 0.306678], shinness: 12.8 });
        tge.material.Black_Plastic = new tge.material({ ambient: [0.0, 0.0, 0.0], diffuse: [0.01, 0.01, 0.01], specular: [0.50, 0.50, 0.50], shinness: 32 });
        tge.material.Black_Rubber = new tge.material({ ambient: [0.02, 0.02, 0.02], diffuse: [0.01, 0.01, 0.01], specular: [0.4, 0.4, 0.4], shinness: 10 });


        tge.material.Lines = tge.material.Black_Rubber.clone();
        tge.material.Lines.drawType = tge.DRAW_TYPES.LINES;



        tge.material.Lines.setFlag(tge.SHADING.NO_DEPTH_TEST);

        tge.material.Lines.setAmbient(0.2528, 0.2528, 0.2528);

        tge.material.LinesSelected = tge.material.Lines.clone();
        tge.material.LinesSelected.setAmbient(1, 1, 1);

        tge.material.Points = tge.material.LinesSelected.clone();
        tge.material.Lines.drawType = tge.DRAW_TYPES.POINT;

        tge.material.LinesRed = tge.material.Lines.clone();
        tge.material.LinesRed.setAmbient(1, 0, 0);
        tge.material.LinesGreen = tge.material.Lines.clone();
        tge.material.LinesGreen.setAmbient(0, 1, 0);
    }
    return material;

}, tge.material_base); tge.material.init();


tge.phong_material = $extend(function (proto, _super) {
   
    function phong_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.phong_material.shader;
        this.flags = tge.SHADING.SHADED;
        return (this);

    }

   
    phong_material.shader = tge.pipleline_shader.parse(import('phong_material.glsl'));

    return phong_material;

}, tge.material);



tge.parallax_material = $extend(function (proto, _super) {

    function parallax_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.parallax_material.shader;
        this.dispMapScale = 0.3;
        this.dispMapOffset = -1;
        $merge(options, this);
        return (this);
    }
    proto.useShader = (function (super_useShader) {
        var dispParams = tge.vec4();
        return function (shader,engine) {
            super_useShader.apply(this, [shader, engine]);



            dispParams[0] = this.dispMapScale;
            dispParams[1] = this.dispMapOffset;
            shader.setUniform("tge_u_dispParams", dispParams);
        }
    })(proto.useShader);
    
    parallax_material.shader = tge.phong_material.shader.extend(import('parallax_material.glsl'));

    return parallax_material;

}, tge.phong_material);

