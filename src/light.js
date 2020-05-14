import * from './node.js'
import * from './mesh.js'

tge.light = $extend(function (proto, _super) {
    $assign(proto, tge.flags.prototype);
    $assign(proto, tge.material_base.prototype);




    

    proto.getDisplay = function () {
        var mod = new tge.model();

        var b = tge.geometry.line_geometry_builder;
        b.clear();
        b.add(0, 0, 0.1).add(0, 0, -3.5)
            .add(-0.3, 0, 0).add(0.3, 0, 0)
            .add(0, -0.2, 0).add(0, 0.2, 0)
            .add(0.3, 0, 0.1).add(0.3, 0, -0.5)
            .add(-0.3, 0, 0.1).add(-0.3, 0, -0.5)
            .add(0, 0.2, 0.1).add(0, 0.2, -0.5)
            .add(0, -0.2, 0.1).add(0, -0.2, -0.5)

        mod.addMesh(new tge.mesh(b.build(), tge.material.LinesSelected));
        mod.parent = this;
        this.update();
        mod.flags = tge.OBJECT_TYPES.MANIPULATORS;
        return (mod);

    };
    proto.setIntensity = function (v) {
        this.ambient[3] = v;
        return (this);
    };


    proto.validShadowCaster = function (node) {
        return true;
    };

    proto.validShadowReceiver = function (node) {
        return true;
    };

    proto.getShadowCamera = (function () {
        var d = 0;
        
        return function () {
            if (!this.camera) {
                d = -this.shadowCameraDistance * 2;
                this.camera = new tge.ortho_camera(-d, d, -d, d, -d * 0.45, d);
                this.camera.shadowLightVersion = -999;
                this.camera.shadowCameraVersion = -999;
            }
            return this.camera;
        }
    })();

    proto.getShadowReceiverShader = function (shader) {
        if (!shader.default_shadow_receiver) {
            shader.default_shadow_receiver = tge.pipleline_shader.parse(import('default_shadow_receiver.glsl'), shader, true);
            shader.default_shadow_receiver.shadowShader = true;
        }
        return shader.default_shadow_receiver;
    }

    proto.renderShadows = (function () {
        var light_camera;
        var shadow_maps = {}, shadow_map, i = 0, castCount,updateLightCameraMatrices=false;
        var tge_u_shadow_params = tge.vec4();
        return function (engine, camera, castShadowMeshes, receiveShadowMeshes) {
            shadow_map = shadow_maps[this.shadowMapSize];
            if (!shadow_map) {
                shadow_map = new tge.rendertarget(engine.gl, this.shadowMapSize, this.shadowMapSize, true);
                shadow_maps[this.shadowMapSize] = shadow_map;
                shadow_map.display = shadow_map.getColorDisplay(undefined, false);
                console.log("shadow_map", shadow_map);
                
            }
            light_camera = this.getShadowCamera();

            updateLightCameraMatrices = false;
            
            if (light_camera.shadowLightVersion !== this.version) {
                light_camera.shadowLightVersion = this.version;
                if (this.lightType === 1) { // point light only set position
                    tge.vec3.copy(light_camera.worldPosition, this.worldPosition);                   
                }
                else {
                    
                    tge.mat4.copy(light_camera.matrixWorld, this.matrixWorld);
                  //  console.log("updateLightCameraMatrices", this.matrixWorld);
                    
                }
                updateLightCameraMatrices = true;
            }


            if (this.lightType === 0) { 
                // directional light align with view camera position
                if (light_camera.shadowCameraVersion !== camera.version || updateLightCameraMatrices) {
                    light_camera.shadowCameraVersion = camera.version;
                    light_camera.worldPosition[0] = (camera.fwVector[0] * this.shadowCameraDistance) + camera.worldPosition[0];
                    light_camera.worldPosition[1] = (camera.fwVector[1] * this.shadowCameraDistance) + camera.worldPosition[1];
                    light_camera.worldPosition[2] = (camera.fwVector[2] * this.shadowCameraDistance) + camera.worldPosition[2];
                    updateLightCameraMatrices = true;
                }
            }

            if (updateLightCameraMatrices) {
              
                light_camera.updateMatrixWorldInverse().updateMatrixWorldProjection();
                light_camera.version = camera.version + this.version;
            }

            shadow_map.bind();
            castCount = 0;
            for (i = 0; i < castShadowMeshes.length; i++) {
                mesh = castShadowMeshes[i];             

                if (!this.validShadowCaster(mesh.model)) continue;
                castCount++;
                if (!mesh.material.shader.depthShader) {
                    mesh.material.shader.depthShader = tge.pipleline_shader.parse('void fragment(){gl_FragColor=vec4(1.0);}', mesh.material.shader, true);
                    mesh.material.shader.depthShader.shadowShader = true;
                }  
                engine.useMaterial(mesh.material, mesh.material.shader.depthShader);                
                engine.updateCameraUniforms(light_camera);
                engine.updateModelViewMatrix(light_camera, mesh.model);
                engine.gl.cullFace(engine.gl.FRONT);
                engine.renderMesh(mesh);

            }           
            engine.setDefaultViewport();

            // if any mesh was rendered in shadow map
            if (castCount > 0) {                
                engine.gl.cullFace(engine.gl.BACK);
                tge_u_shadow_params[0] = this.shadowBias;                
                tge_u_shadow_params[1] = this.shadowOpacity
                tge_u_shadow_params[2] = this.shadowMapSize;
                engine.enableFWRendering();
                engine.gl.blendEquation(engine.gl.FUNC_REVERSE_SUBTRACT);
                for (i = 0; i < receiveShadowMeshes.length; i++) {
                    mesh = receiveShadowMeshes[i];                    
                    if (engine.useMaterial(mesh.material, this.getShadowReceiverShader(mesh.material.shader))) {
                        engine.activeShader.setUniform("tge_u_shadow_params", tge_u_shadow_params);
                        engine.activeShader.setUniform("tge_u_shadowMap", 2);
                        engine.useTexture(shadow_map.depthTexture, 2);
                        engine.activeShader.setUniform("tge_u_lightCameraMatrix", light_camera.matrixWorldProjection);                        
                    };
                    
                    engine.updateCameraUniforms(camera);
                    engine.updateModelViewMatrix(camera, mesh.model);
                    engine.renderMesh(mesh);

                }
                engine.gl.blendEquation(engine.gl.FUNC_ADD);
                engine.disableFWRendering();                
            }
            


            // only for debug light camera
            if (!light_camera.display) {
                light_camera.display = light_camera.getDisplay();
            }
            light_camera.display.modelViewMatrixVersion = -1;
            engine.renderSingleMesh(camera, light_camera.display.meshes[0]);            

            // only for debug shadowmap
            /*
            shadow_map.display.setPosition(0, 0, -2);           
            shadow_map.display.parent = camera;
            shadow_map.display.update();
            engine.renderSingleMesh(camera, shadow_map.display.meshes[0]);
            */

        }
    })();



    function light(options) {
        options = options || {};
        _super.apply(this, arguments);
        tge.flags.apply(this, arguments);
        tge.material_base.apply(this, arguments);

        this.attenuation = new Float32Array(this.internalData.buffer, 12 * 4, 4);

        tge.vec4.copy(this.ambient, options.ambient || [0.3, 0.3, 0.3, 1.0]);
        tge.vec4.copy(this.diffuse, options.diffuse || [0.7, 0.7, 0.7, -1]);
        tge.vec4.copy(this.specular, options.specular || [0.5, 0.5, 0.5, -1]);
        tge.vec4.copy(this.attenuation, options.attenuation || [0, 0, 0, 0]);
        this.worldViewPosition = tge.vec4();
        this.viewMatrixVersion = 0;
        this.diffuse[3] = -1;
        this.specular[3] = -1;
        this.range = 2000;
        this.lightType = 0;
        this.shadowBias = 0.025;
        this.shadowOpacity = 0.25;
        this.shadowCameraDistance = -20;

        this.castShadows = false;

        this.flags = tge.OBJECT_TYPES.STATIC_LIGHT;
        this.shadowMapSize = 1024;

        return (this);

    }

    return light;

}, tge.transfrom_node);


tge.point_light = $extend(function (proto, _super) {


    proto.getShadowCamera = function () {
        if (!this.camera) {
            this.camera = new tge.perspective_camera(160, 1, 0.1, 200);
            this.camera.setRotation(-90 * tge.DEGTORAD, 0, 0);
            this.camera.update();
        }
        return this.camera;
    }

    proto.validShadowCaster = function (model) {
        if (tge.vec3.distance(this.worldPosition, model.worldPosition) > this.range) return false;

        if (this.camera.pointFrustumDistance(model.worldPosition[0], model.worldPosition[1], model.worldPosition[2]) + model.boundingSphereSize > 0) {
            return true;

        }
        return false;

    };


    proto.setAttenuation = function (a, b, c) {
        tge.vec3.set(this.attenuation, a, b, c);
        return (this);
    };


    proto.renderShadows2 = (function () {
        var light_camera;
        var shadow_maps = {}, shadow_map, i = 0, castCount,p;
        var tge_u_shadow_params = tge.vec4();
        return function (engine, camera, castShadowMeshes, receiveShadowMeshes) {
            shadow_map = shadow_maps[this.shadowMapSize];
            if (!shadow_map) {
                shadow_map = new tge.rendertarget(engine.gl, this.shadowMapSize, this.shadowMapSize*2, true);
                shadow_maps[this.shadowMapSize] = shadow_map;
                shadow_map.display = shadow_map.getColorDisplay(undefined, false);
                console.log("shadow_map", shadow_map);

            }
            light_camera = this.getShadowCamera();
            if (this.lightType === 0) {
                light_camera.position[0] = (camera.fwVector[0]) + (this.fwVector[0]) + camera.worldPosition[0];
                light_camera.position[1] = (camera.fwVector[1]) + (this.fwVector[1]) + camera.worldPosition[1];
                light_camera.position[2] = (camera.fwVector[2]) + (this.fwVector[2]) + camera.worldPosition[2];
              //  light_camera.rotation[0] = this.rotation[0];
            //    light_camera.rotation[1] = this.rotation[1];
              //  light_camera.rotation[2] = this.rotation[2];
                light_camera.rotationNeedUpdate = true;
            }
            else {
                light_camera.parentVersion = -1;
                light_camera.rotation[0] = 0;
                light_camera.rotationNeedUpdate = true;
                light_camera.parent = this;
            }

            light_camera.update();


           
            castCount = 0;
            shadow_map.bind();
            for (p = 0; p < 2; p++) {                
                engine.gl.viewport(0, this.shadowMapSize * p, this.shadowMapSize, this.shadowMapSize);
                if (p === 1) {
                    light_camera.rotation[0] = -180 * tge.DEGTORAD;
                    
                    light_camera.rotationNeedUpdate = true;
                     light_camera.update();
                }
                for (i = 0; i < castShadowMeshes.length; i++) {
                    mesh = castShadowMeshes[i];

                    if (!this.validShadowCaster(mesh.model)) continue;
                    castCount++;
                    if (!mesh.material.shader.depthShader) {
                        mesh.material.shader.depthShader = tge.pipleline_shader.parse('void fragment(){gl_FragColor=vec4(1.0);}', mesh.material.shader, true);
                        mesh.material.shader.depthShader.shadowShader = true;
                    }
                    engine.useMaterial(mesh.material, mesh.material.shader.depthShader);
                    engine.updateCameraUniforms(light_camera);
                    engine.updateModelViewMatrix(light_camera, mesh.model);
                    engine.gl.cullFace(engine.gl.FRONT);
                    engine.renderMesh(mesh);

                }
            }
            engine.gl.cullFace(engine.gl.BACK);

            //    console.log("castCount", castCount);
            engine.setDefaultViewport();


            if (castCount > 99990) {
              

                tge_u_shadow_params[0] = this.shadowBias;
                tge_u_shadow_params[1] = this.shadowOpacity
                tge_u_shadow_params[2] = this.shadowMapSize;


                engine.enableFWRendering();
                engine.gl.blendEquation(engine.gl.FUNC_REVERSE_SUBTRACT);
                for (i = 0; i < receiveShadowMeshes.length; i++) {
                    mesh = receiveShadowMeshes[i];
                    if (!this.validShadowReceiver(mesh.model)) continue;
                    if (engine.useMaterial(mesh.material, this.getShadowReceiverShader(mesh.material.shader))) {
                        engine.activeShader.setUniform("tge_u_shadow_params", tge_u_shadow_params);
                        engine.activeShader.setUniform("tge_u_shadowMap", 2);
                        engine.useTexture(shadow_map.depthTexture, 2);
                        engine.activeShader.setUniform("tge_u_lightCameraMatrix", light_camera.matrixWorldProjection);
                    };
                    engine.updateCameraUniforms(camera);
                    engine.updateModelViewMatrix(camera, mesh.model);
                    engine.renderMesh(mesh);

                }
                engine.gl.blendEquation(engine.gl.FUNC_ADD);
                engine.disableFWRendering();
            }


            
            engine.useMaterial(shadow_map.display.meshes[0].material,shadow_map.display.meshes[0].material.shader);
            engine.updateCameraUniforms(camera);
            shadow_map.display.setPosition(0, 0, -2);           
            shadow_map.display.parent = camera;
            shadow_map.display.update();
            engine.updateModelViewMatrix(camera, shadow_map.display);
            engine.renderMesh(shadow_map.display.meshes[0]);
            

        }
    })();


    function point_light(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.range = options.range || 30;

        this.setAttenuation(this.attenuation[0], this.attenuation[1], this.attenuation[2]);

        this.specular[3] = 0;
        this.diffuse[3] = 0;
        this.lightType = 1;
        this.shadowMapSize = 1024;
        return (this);

    }


    return point_light;

}, tge.light);



tge.spot_light = $extend(function (proto, _super) {


    proto.getShadowCamera = function () {
        if (!this.camera) {
            this.camera = new tge.perspective_camera(this.viewAngle * tge.RADTODEG, 1, 0.1, this.range);
        }
        return this.camera;
    }
    

  
    proto.setOuterAngle = function (angle) {
        this.viewAngle = angle;
        this.diffuse[3] = Math.cos(angle / 2);
        return (this);
    }

    proto.setInnerAngle = function (angle) {
        this.specular[3] = Math.cos(angle / 2);
        return (this);
    }


    function spot_light(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.viewAngle = 0
      //  this.setAttenuation(1.0, 0.045, 0.0075);
        this.setOuterAngle(options.outer || tge.DEGTORAD * 50).setInnerAngle(options.inner || tge.DEGTORAD * 50);
        this.lightType = 2;
        this.shadowMapSize =512;
        this.range = options.range || 30;
        return (this);

    }


    return spot_light;

}, tge.point_light);
