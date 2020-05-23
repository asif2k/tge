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


    proto.validShadowCaster = function (camera,node) {
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
        this.shadowBias = 0.000001;
        this.shadowOpacity = 0.85;
        this.shadowCameraDistance = 20;
        this.shadowFlipFaces = true;
        this.castShadows = false;
        this.coloredShadows = false;

        this.flags = tge.OBJECT_TYPES.STATIC_LIGHT;
        this.shadowMapSize = 1024;

        return (this);

    }

    proto.enableCascadeShadow = function (sizes, mapSize, camera) {
        this.castShadows = true;        
        var cameras = [];
        sizes.forEach(function (sz,i) {
            cameras[i] = new tge.ortho_camera(-sz, sz, -sz, sz, -sz*0.5 , sz*10);
            cameras[i].d = -sz*0.5;
        });

        this.cascadeShadow = { cameras: cameras, mapSize: mapSize,map:null};



    }

    proto.getShadowReceiverShader = function (shader) {
        if (this.coloredShadows) {
            if (!shader.colored_shadow_receiver) {
                shader.colored_shadow_receiver = tge.pipleline_shader.parse(tge.light.colored_shadows['receiver'], shader, true);
                shader.colored_shadow_receiver.shadowShader = true;
            }
            return shader.colored_shadow_receiver;
        }
        else {
            if (!shader.default_shadow_receiver) {
                shader.default_shadow_receiver = tge.pipleline_shader.parse(tge.light.default_shadows['receiver'], shader, true);
                shader.default_shadow_receiver.shadowShader = true;
            }
            return shader.default_shadow_receiver;
        }
    };

    proto.getShadowMapShader = function (shader) {
        if (this.coloredShadows) {
            if (!shader.colored_shadow_map) {
                shader.colored_shadow_map = tge.pipleline_shader.parse(tge.light.colored_shadows['map'], shader, true);
                shader.colored_shadow_map.shadowShader = true;
            }
            return shader.colored_shadow_map;
        }
        else {
            if (!shader.default_shadow_map) {
                shader.default_shadow_map = tge.pipleline_shader.parse(tge.light.default_shadows['map'], shader, true);
                shader.default_shadow_map.shadowShader = true;
            }
            return shader.default_shadow_map;
        }
    };

    proto.updateLightCamera = function (light_camera, camera) {
        light_camera.worldPosition[0] = (camera.fwVector[0] * (-this.shadowCameraDistance)) + camera.worldPosition[0];
        light_camera.worldPosition[1] = (camera.fwVector[1] * (-this.shadowCameraDistance)) + camera.worldPosition[1];
        light_camera.worldPosition[2] = (camera.fwVector[2] * (-this.shadowCameraDistance)) + camera.worldPosition[2];
    };
    proto.getLightCamera = function () {
        if (!this.camera) {
            var d = this.shadowCameraDistance * 2;
            this.camera = new tge.ortho_camera(-d, d, -d, d, -d * 0.5, d * 10);
        }
        return this.camera;
    };

    proto.getShadowLightPos = function (light_pos) {
        tge.vec3.set(light_pos, this.fwVector[0] * 200, this.fwVector[1] * 200, this.fwVector[2] * 200);

    };


    light.colored_shadows = tge.shader.createChunksLib(import('colored_shadows.glsl'));
    light.default_shadows = tge.shader.createChunksLib(import('default_shadows.glsl'));



    proto.renderShadows = (function () {
        var m = 0, light, d;
        var castCount, updateLightCameraMatrices, light_camera;
        var tge_u_shadow_params = tge.vec3(), tge_u_light_pos = tge.vec3();
        var tge_u_shadowColor = tge.vec4();
        var mapShader,receiverShader
        function renderShadowCasters(engine, light, light_camera, meshes) {
            castCount = 0;

            for (m = 0; m < meshes.length; m++) {
                mesh = meshes[m];
                if (mesh.material.flags & tge.SHADING.CAST_SHADOW) {
                    if (!light.validShadowCaster(light_camera, mesh.model)) continue;                                     
                    castCount++;                                     
                    if (engine.useMaterial(mesh.material, light.getShadowMapShader(mesh.material.shader))) {

                    }    
                    if (light.coloredShadows) {
                        if ((mesh.material.flags & tge.SHADING.TRANSPARENT) !== 0) {
                            tge.vec4.copy(tge_u_shadowColor, mesh.material.diffuse);
                        }
                        else {
                            tge.vec4.set(tge_u_shadowColor, 0.5, 0.5, 0.5, 0.5);
                        }

                        tge_u_shadowColor[3] = mesh.material.ambient[3];

                        engine.activeShader.setUniform("tge_u_shadowColor", tge_u_shadowColor);
                    }

               
                    engine.updateCameraUniforms(light_camera);
                    engine.updateModelViewMatrix(light_camera, mesh.model);                    
                    engine.renderMesh(mesh);
                }

            }
         
            return castCount;
        }

       
        function renderShadowReceivers(engine, light, light_camera, camera, meshes) {
           
            for (m = 0; m < meshes.length; m++) {
                mesh = meshes[m];
                if (mesh.material.flags & tge.SHADING.RECEIVE_SHADOW) {
                    if (engine.useMaterial(mesh.material, light.getShadowReceiverShader(mesh.material.shader))) {
                        engine.activeShader.setUniform("tge_u_shadow_map", 1);
                        engine.activeShader.setUniform("tge_u_shadow_map_color", 2);
                        engine.activeShader.setUniform("tge_u_light_camera_matrix", light_camera.matrixWorldProjection);
                        engine.activeShader.setUniform("tge_u_light_pos", tge_u_light_pos);
                        engine.activeShader.setUniform("tge_u_shadow_params", tge_u_shadow_params);
                    };
                    engine.updateCameraUniforms(camera);
                    engine.updateModelViewMatrix(camera, mesh.model);
                    engine.renderMesh(mesh);

                }


            }

        }

        var shadow_maps = {}, shadow_map, i = 0, castCount, updateLightCameraMatrices = false;

        function getShadowMap(gl, size) {
            shadow_map = shadow_maps[size];
            if (!shadow_map) {
                shadow_map = new tge.rendertarget(gl, size, size, true);
                shadow_maps[light.shadowMapSize] = shadow_map;
                shadow_map.display = shadow_map.getColorDisplay();
            }
            return shadow_map;
        }

      


        var totalShadowCasters = 0;
        return function (engine, camera, opuqueMeshes, transparentMeshes) {
            light = this;
            shadow_map = getShadowMap(engine.gl, light.shadowMapSize);                                    
            light_camera = light.getLightCamera();
            if (!light_camera.display) {
                light_camera.display = light_camera.getDisplay();


            }

            updateLightCameraMatrices = false;


            if (light_camera.shadowLightVersion !== light.version || updateLightCameraMatrices) {

                if (light.lightType === 1) { // point light only set position
                    tge.vec3.copy(light_camera.worldPosition, light.worldPosition);
                }
                else {
                    tge.mat4.copy(light_camera.matrixWorld, light.matrixWorld);
                }
                updateLightCameraMatrices = true;
            }

            if (light_camera.shadowCameraVersion !== camera.version || updateLightCameraMatrices) {
               light.updateLightCamera(light_camera, camera);             
                updateLightCameraMatrices = true;


            }
                        

            if (updateLightCameraMatrices) {
                light_camera.updateMatrixWorldInverse().updateMatrixWorldProjection();
                
                
            }
            light_camera.shadowCameraVersion = camera.version;
            light_camera.shadowLightVersion = light.version;
            light_camera.version = camera.version + light.version;


            shadow_map.bind();


            engine.gl.cullFace(GL_FRONT);
            totalShadowCasters=renderShadowCasters(engine, light, light_camera, opuqueMeshes);
            if (transparentMeshes.length > 0) {
                engine.gl.enable(GL_BLEND);
                engine.gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
                totalShadowCasters=+renderShadowCasters(engine, light, light_camera, transparentMeshes);
            }
            
            engine.gl.cullFace(GL_BACK);


            engine.setDefaultViewport();

            tge_u_shadow_params[0] = light.shadowOpacity*0.5;
            tge_u_shadow_params[1] = 1 / light.shadowMapSize;
            tge_u_shadow_params[2] = light.shadowBias;


            light.getShadowLightPos(tge_u_light_pos);

            if (totalShadowCasters > 0) {
                engine.enableFWRendering();
                engine.gl.blendEquation(GL_FUNC_REVERSE_SUBTRACT);
                engine.useTexture(shadow_map.depthTexture, 1);
                engine.useTexture(shadow_map.colorTexture, 2);
                renderShadowReceivers(engine, light, light_camera, camera, opuqueMeshes);
                if (transparentMeshes.length > 0) {
                    engine.gl.depthFunc(GL_LESS);
                    renderShadowReceivers(engine, light, light_camera, camera, transparentMeshes);
                }
                engine.gl.blendEquation(GL_FUNC_ADD);
                engine.disableFWRendering();
            }
            
            
            

            /*
            shadow_map.display.setPosition(0, 0, -2);
            shadow_map.display.parent = camera;
            shadow_map.display.update();
            engine.renderSingleMesh(camera, shadow_map.display.meshes[0]);


            light_camera.display.update();
            engine.renderSingleMesh(camera, light_camera.display.meshes[0]);
            */

        }
    })();





    





    return light;

}, tge.transfrom_node);


tge.point_light = $extend(function (proto, _super) {

    proto.updateLightCamera = function (light_camera, camera) {
        
    };
    proto.getLightCamera = function () {
        if (!this.camera) {
            this.camera = new tge.perspective_camera(160, 1, 0.1, 200);
            this.camera.setRotation(-90 * tge.DEGTORAD, 0, 0);
            this.camera.update();
        }
        return this.camera;
    }

    proto.validShadowCaster = function (model) {


       
        if (tge.vec3.distance(this.worldPosition, model.worldPosition) > this.range) return false;
        return true;
        if (this.camera.pointFrustumDistance(model.worldPosition[0], model.worldPosition[1], model.worldPosition[2]) + model.boundingSphereSizeScaled > 0) {
            return true;
        }        
        return false;

    };


    proto.setAttenuation = function (a, b, c) {
        tge.vec3.set(this.attenuation, a, b, c);
        return (this);
    };


    proto.setAttenuationByDistance = (function () {
        var values = [[7, 1.0, 0.7, 1.8],
        [13, 1.0, 0.35, 0.44],
        [20, 1.0, 0.22, 0.20],
        [32, 1.0, 0.14, 0.07],
        [50, 1.0, 0.09, 0.032],
        [65, 1.0, 0.07, 0.017],
        [100, 1.0, 0.045, 0.0075],
        [160, 1.0, 0.027, 0.0028],
        [200, 1.0, 0.022, 0.0019],
        [325, 1.0, 0.014, 0.0007],
        [600, 1.0, 0.007, 0.0002],
        [3250, 1.0, 0.0014, 0.000007]];



        var v1, v2, i,f;
        return function (d) {
            for (i = 0; i < values.length; i++) {
                if (d < values[i][0]) {
                    v2 = i;
                    break;
                }
            }

            if (v2 === 0) {
                return this.setAttenuation.apply(this, values[0]);
            }
            v1 = v2 - 1;
            f = values[v2][0] - values[v1][0];
            f = (d - values[v1][0]) / f;

            this.attenuation[0] = values[v1][1] + (values[v2][1] - values[v1][1]) * f;
            this.attenuation[1] = values[v1][2] + (values[v2][2] - values[v1][2]) * f;
            this.attenuation[2] = values[v1][3] + (values[v2][3] - values[v1][3]) * f;

        //    console.log(v1 + "-" + v2, this.attenuation.join(" ") );
            



            return (this);
        }
    })();


    proto.getShadowLightPos = function (light_pos) {
        tge.vec3.copy(light_pos, this.worldPosition);

    };


    function point_light(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.range = options.range || 30;

        if (options.attenuation) {
            this.setAttenuation(this.attenuation[0], this.attenuation[1], this.attenuation[2]);
        }
        else {
            this.setAttenuationByDistance(40);
        }
        

        this.specular[3] = 0;
        this.diffuse[3] = 0;
        this.lightType = 1;
        this.shadowMapSize = 1024;
        return (this);

    }


    return point_light;

}, tge.light);



tge.spot_light = $extend(function (proto, _super) {


    proto.getLightCamera = function () {
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
        this.specular[3] = Math.cos(angle )/2;
        return (this);
    }


    function spot_light(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.viewAngle = 0
        if (options.attenuation) {
            this.setAttenuation(this.attenuation[0], this.attenuation[1], this.attenuation[2]);
        }
        else {
            this.setAttenuationByDistance(60);
        }
        this.setOuterAngle(options.outer || tge.DEGTORAD * 50).setInnerAngle(options.inner || tge.DEGTORAD * 50);
        this.lightType = 2;
        this.shadowMapSize =512;
        this.range = options.range || 20;
        return (this);

    }


    return spot_light;

}, tge.point_light);
