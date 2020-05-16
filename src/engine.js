import * from './shader.js'
import * from './model.js'
import * from './camera.js'
import * from './light.js'

tge.engine = $extend(function (proto) {

 
    function setupGLState(gl) {
        gl.states = { depthMask: false, blendFunc0: -1, blendFunc1: -1, };


        // webgl state managerment
        gl.enable = (function (_super, gl) {
            return function (state) {
                if (gl.states[state] === true) return (false);
                gl.states[state] = true;
                _super.apply(gl, arguments);
                return (true);
            }
        })(gl.enable, gl);

        gl.disable = (function (_super, gl) {
            return function (state) {
                if (gl.states[state] === false) return (false);
                gl.states[state] = false;
                _super.apply(gl, arguments);
                return (true);
            }
        })(gl.disable, gl);

        gl.blendFunc = (function (_super, gl) {
            return function (func0, func1) {
                if (gl.states.blendFunc0 !== func0 || gl.states.blendFunc1 !== func1) {
                    gl.states.blendFunc0 = func0;
                    gl.states.blendFunc1 = func1;
                    _super.apply(gl, arguments);
                    return (true);
                }
                return (false);
            }
        })(gl.blendFunc, gl);

        gl.blendEquation = (function (_super, gl) {
            return function (param) {
                if (gl.states.blendEQuation !== param) {
                    gl.states.blendEQuation = param;
                    _super.apply(gl, arguments);
                }
            }
        })(gl.blendEquation, gl);

        gl.depthMask = (function (_super, gl) {
            return function (mask) {
                if (mask !== gl.states.depthMask) {
                    gl.states.depthMask = mask;
                    _super.apply(gl, arguments);
                }
            }
        })(gl.depthMask, gl);

        gl.depthFunc = (function (_super, gl) {
            return function (func) {
                if (func !== gl.states.depthFunc) {
                    gl.states.depthFunc = func;
                    _super.apply(gl, arguments);
                }
            }
        })(gl.depthFunc, gl);

        gl.cullFace = (function (_super, gl) {
            return function (param) {
                if (param !== gl.states.cullFace) {
                    gl.states.cullFace = param;
                    _super.apply(gl, arguments);
                }
            }
        })(gl.cullFace, gl);


    }

    function engine(parameters) {
        parameters = parameters || {};

        this.shaderParameters = {
            fws_lightsCount: parameters.fws_lightsCount || 4
        };

        var _canvas = parameters.canvas
        if (!_canvas) {
            _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
            _canvas.setAttribute("style", "position:absolute;width:100%;height:100%;left:0;top:0;box-sizing: border-box;");
        }

        var contextAttributes = {
            alpha: parameters.alpha !== undefined ? parameters.alpha : false,
            depth: parameters.depth !== undefined ? parameters.depth : true,
            stencil: parameters.stencil !== undefined ? parameters.stencil : true,
            antialias: parameters.antialias !== undefined ? parameters.antialias : false,
            premultipliedAlpha: parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : false,
            preserveDrawingBuffer: parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,
        };


        var gl = parameters.context || _canvas.getContext('webgl', contextAttributes);

        if (gl === null) {
            if (_canvas.getContext('webgl') !== null) {
                throw new Error('Error creating WebGL context with your selected attributes.');
            } else {
                throw new Error('Error creating WebGL context.');
            }
        }

        gl.pixelRatio = parameters.pixelRatio || window.devicePixelRatio;
      
        _canvas.addEventListener('webglcontextlost', function () {
            console.log('webglcontextlost', this);
        }, false);

        _canvas.addEventListener('webglcontextrestored', function () {
            console.log('webglcontextrestored', this);
        }, false);


        gl.OES_vertex_array_object = gl.getExtension("OES_vertex_array_object");
        gl.OES_standard_derivatives = gl.getExtension("OES_standard_derivatives");
        gl.WEBGL_depth_texture = gl.getExtension('WEBGL_depth_texture');
        gl.ANGLE_instanced_arrays = gl.getExtension('ANGLE_instanced_arrays');

        setupGLState(gl);

        this.gl = gl;

        
        this.lastShaderId = -1;
        this.textureSlots = [-1, -1, -1, -1, -1, -1];
        this.defaultTexture = new tge.texture();
        this.defaultTexture.update(gl);


        this.textureUpdates = new $smartarray();

        this.shadingLightsCount = this.shaderParameters.fws_lightsCount;
        this.shadingLights = [];
        for (var i = 0; i < this.shaderParameters.fws_lightsCount; i++) {
            this.shadingLights[i] = null;
        }
        this.frameTime = 0;
        this.frameTimeDelta = 0;



        this.defaultRenderTarget = new tge.rendertarget(gl, 10,10, true);
        this.defaultRenderTarget.clearBuffer = false;

        this.postProcessTarget = new tge.rendertarget(gl, 10, 10, true);
       // this.postProcessTarget.clearBuffer = false;


        this.postProcessPipeline = [];

        var pp1 = tge.engine.defaultPostProcessShader.extend(tge.shader.$str("<?=chunk('pp1')?>"));
        this.postProcessPipeline.push(function (engine) {           
            return pp1
        });

        var pp2 = tge.engine.defaultPostProcessShader.extend(tge.shader.$str("<?=chunk('pp2')?>"));
        this.postProcessPipeline.push(function (engine) {
            return pp2
        });


        this.tge_u_pipelineParams = tge.vec4();
        
        gl.enable(gl.DEPTH_TEST);
        gl.cullFace(gl.BACK);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0, 0, 0, 1);

       

    }

    engine.defaultPostProcessShader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('defaultPostProcessShader')?>"));

    engine.defaultPostProcessShader.process = function (engine) {
        return tge.engine.defaultPostProcessShader;
    };

    proto.setSize = function (width, height) {
        this.gl.canvas.width = width * this.gl.pixelRatio;
        this.gl.canvas.height = height * this.gl.pixelRatio;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        this.defaultRenderTarget.resize(this.gl.canvas.width, this.gl.canvas.height);
        this.postProcessTarget.resize(this.gl.canvas.width, this.gl.canvas.height);

    };


    proto.clearScreen = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        return (this);
    };

    proto.setDefaultViewport = function () {
        this.defaultRenderTarget.bind();
        //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        //this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.lastRenderTargetId = -1;
        return (this)
    };

    proto.useShader = function (shader) {
        if (this.lastShaderId != shader.uuid) {         
            if (!shader.compiled) {
                
                tge.shader.compile(this.gl, shader, this.shaderParameters);
            }
            this.gl.useProgram(shader.program);
            shader.setUniform("tge_u_pipelineParams", this.tge_u_pipelineParams);
            this.activeShader = shader;
            this.activeShader.cameraVersion = -1;
            this.lastShaderId = shader.uuid;
            return (true);
        }
        return (false);
    };

    proto.useMaterial = function (material, shader) {
        if (this.useShader(shader)) {
            material.useShader(shader, this);
            return (true);
        }      
        return (false);
    };

    proto.useGeometry = (function () {
        var id, returnValue,shader;

        function updateGeomertyAttribute(gl, location, att) {
            returnValue = 0;
            if (att === null) {
                gl.disableVertexAttribArray(location);
                returnValue = -1;
            }
            else {
                if (att.needsUpdate === true) {
                    if (att.dest === null) {
                        att.dest = gl.createBuffer();

                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, att.dest);
                    gl.bufferData(gl.ARRAY_BUFFER, att.data, att.bufferType);
                   
                    returnValue = 1;
                    att.needsUpdate = false;
                }
                else if (att.dest !== null) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, att.dest);


                }
                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location, att.itemSize, att.dataType, false, att.stride, att.offset);



            }

            return returnValue
        }

        return function (geo) {
            if (!geo.compiled) tge.geometry.compile(this.gl, geo);
            shader = this.activeShader;
            for (id in shader.attributes) {
                if (geo.attributes[id]) {
                    updateGeomertyAttribute(this.gl, shader.attributes[id].location, geo.attributes[id]);
                }
                else {
                    updateGeomertyAttribute(this.gl, shader.attributes[id].location, null);
                }
            }



            if (geo.indexData !== null) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geo.indexBuffer);
                if (geo.indexNeedsUpdate) {
                    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, geo.indexData, this.gl.DYNAMIC_DRAW);
                    geo.indexNeedsUpdate = false;
                }
            }
        }
    })();

    
    proto.useTexture = function (texture, slot) {
        if (texture === null) {
            this.useTexture(this.defaultTexture, slot);
            return;
        }
        else {
            if (texture.needsUpdate) {
                texture.needsUpdate = false;
                this.textureUpdates.push(texture);
            }
            if (texture.webglTexture === null) {
                this.useTexture(this.defaultTexture, slot);
                return;
            }

        }
        if (this.textureSlots[slot] !== texture.uuid) {
            this.textureSlots[slot] = texture.uuid;
            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
            this.gl.bindTexture(texture.textureTarget, texture.webglTexture);
        }

    };
    
    proto.updateTextures = (function () {
        var texture;
        return function () {
            texture = this.textureUpdates.pop();
            while (texture !== null) {
                tge.texture.update(texture, this.gl);
                texture = this.textureUpdates.pop();
            }
        }
    })();

    proto.enableFWRendering = function () {
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE);

        if (this.FWRenderingMode) return;
        this.gl.enable(this.gl.BLEND);

        this.gl.depthMask(false);
        this.gl.depthFunc(this.gl.EQUAL);
        this.FWRenderingMode = true;
    };

    proto.disableFWRendering = function () {
        this.gl.disable(this.gl.BLEND);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);
        this.FWRenderingMode = false;
    };      

    proto.updateCameraUniforms = function (camera) {
        if (this.activeShader.cameraVersion === camera.version) return false;
        this.activeShader.cameraVersion = camera.version;       
        this.activeShader.setUniform("tge_u_viewMatrix", camera.matrixWorld);
        this.activeShader.setUniform("tge_u_viewMatrixInv", camera.matrixWorldInvserse);
        this.activeShader.setUniform("tge_u_viewProjectionMatrix", camera.matrixWorldProjection);
        this.activeShader.setUniform("tge_u_projectionMatrix", camera.matrixProjection);
        return (true);
    };

    proto.updateModelUniforms = function (model) {
        
        this.activeShader.setUniform("tge_u_normalMatrix", model.normalMatrix);
        this.activeShader.setUniform("tge_u_modelMatrix", model.matrixWorld);
        
    };

    proto.updateModelViewMatrix = function (camera, model) {
        model.update();
        if (model.modelViewMatrixVersion !== camera.version) {
            model.modelViewMatrixVersion = camera.version;
            tge.mat4.multiply(model.modelViewMatrix, camera.matrixWorldInvserse, model.matrixWorld);
        }
    };      
    
    proto.updateShadingLights = (function () {
        var lightsEyePosition = tge.vec4();

        var dummyLight = new tge.light();
        dummyLight.setAmbient(0, 0, 0).setSpecular(0, 0, 0).setDiffuse(0, 0, 0).setIntensity(0);
        dummyLight.attenuation[3] = 1;

        var i2 = 0;
        return function (camera) {
            totalLights = 0;

            for (i2 = 0; i2 < this.lightsBatchSize; i2++) {
                light = this.shadingLights[i2];
                if (light != null) {
                    if (light.lightType === 0) {
                        tge.vec3.copy(lightsEyePosition, light.worldPosition);
                        tge.vec3.set(light.worldPosition, light.fwVector[0] * 200, light.fwVector[1] * 200, light.fwVector[2] * 200);
                        light.attenuation[3] = 1;
                    }
                    else {
                        light.attenuation[3] = 0;
                    }
                    this.activeShader.setUniform("tge_u_lightMaterial" + i2, light.internalData);
                    this.activeShader.setUniform("tge_u_lightMatrix" + i2, light.matrixWorld);
                    if (light.lightType === 0) tge.vec3.copy(light.worldPosition, lightsEyePosition);

                }

            }
            for (i2 = this.lightsBatchSize; i2 < this.shadingLightsCount; i2++) {
                this.activeShader.setUniform("tge_u_lightMaterial" + i2, dummyLight.internalData);
                this.activeShader.setUniform("tge_u_lightMatrix" + i2, dummyLight.matrixWorld);
            }

            lightsEyePosition[0] = camera.worldPosition[0];
            lightsEyePosition[1] = camera.worldPosition[1];
            lightsEyePosition[2] = camera.worldPosition[2];



            lightsEyePosition[3] = this.lightsBatchSize;
            this.activeShader.setUniform("tge_u_eyePosition", lightsEyePosition);
        }
    })();




    proto.renderList = (function () {
        

        var castShadowMeshes = [], receiveShadowMeshes = [];
        var castShadowLights = [];


        var updateShadingLights = false;

        var i1, i2, i3, i4;
        var light;



        proto.renderLighting = function (camera, lights, calback) {
            this.lightPassCount = 0;
            this.lightsBatchSize = 0;
            for (i1 = 0; i1 < lights.length; i1++) {
                light = lights[i1];
                if (light.castShadows) castShadowLights[castShadowLights.length] = light;
                this.shadingLights[this.lightsBatchSize++] = light;
                updateShadingLights = this.lightsBatchSize === this.shadingLightsCount || i1 === lights.length - 1;
                if (updateShadingLights) {
                    calback(updateShadingLights);
                    this.lightsBatchSize = 0;
                    this.lightPassCount++;
                    if (lights.length > this.shadingLightsCount) {
                        this.enableFWRendering();
                    }
                }
            }
        };
       

        proto.renderMesh = function (mesh) {
            this.useGeometry(mesh.geo);
            mesh.material.renderMesh(this, this.activeShader, mesh);
        };


        var transparentMeshes = [], opuqueMeshes = [], flatMeshes = [], _this = null;

        var currentCamera;
        function transparentMeshSortFunc(a, b) {
            return a.cameraDistance - b.cameraDistance;
        }

        function solidMeshSortFunc(a, b) {
            return b.cameraDistance - a.cameraDistance;
        }





        var allMeshes = {
            castShadowMeshes: null,
            receiveShadowMeshes: null,
            transparentMeshes: null,
            opuqueMeshes: null,
            flatMeshes: null,
        }



        var postProcessOutput;
        return function (camera, meshes, lights,cb) {

            
            if (this.isError) {
                return;
            }
            currentCamera = camera;

            castShadowLights.length = 0;

            time = performance.now();
            this.frameTimeDelta = this.frameTime - time;
            this.frameTime = time;
            this.lastShaderId = -1;


            this.tge_u_pipelineParams[0] = this.frameTime;
            this.tge_u_pipelineParams[1] = this.frameTimeDelta;

            _this = this;



            if (meshes.sorted !== true) {
                transparentMeshes.length = 0;
                opuqueMeshes.length = 0;
                flatMeshes.length = 0;
                castShadowMeshes.length = 0;
                receiveShadowMeshes.length = 0;



                for (i4 = 0; i4 < meshes.length; i4++) {
                    mesh = meshes[i4];

                    if ((mesh.material.flags & tge.SHADING.TRANSPARENT) !== 0) {
                        transparentMeshes[transparentMeshes.length] = mesh;
                    }
                    else if (mesh.material.flags & tge.SHADING.FLAT) {
                        flatMeshes[flatMeshes.length] = mesh;

                    }
                    else {
                        opuqueMeshes[opuqueMeshes.length] = mesh;
                    }

                    if (mesh.material.flags & tge.SHADING.CAST_SHADOW) {
                        castShadowMeshes[castShadowMeshes.length] = mesh;
                    }
                    if (mesh.material.flags & tge.SHADING.RECEIVE_SHADOW) {
                        receiveShadowMeshes[receiveShadowMeshes.length] = mesh;
                    }

                }




                if (transparentMeshes.length > 0) {
                    transparentMeshes = $mergesort(transparentMeshes, transparentMeshSortFunc);
                }
                if (opuqueMeshes.length > 0) {
                    opuqueMeshes = $mergesort(opuqueMeshes, solidMeshSortFunc);
                }

                if (flatMeshes.length > 0) {
                    flatMeshes = $mergesort(flatMeshes, solidMeshSortFunc);
                }
                
                meshes.sorted = true;

            }





            if (opuqueMeshes.length > 0) {
                _this.renderLighting(camera, lights, function (updateShadingLights) {
                    for (i4 = 0; i4 < opuqueMeshes.length; i4++) {
                        mesh = opuqueMeshes[i4];



                        if (_this.lightPassCount >= mesh.material.lightPassLimit) continue;
                        if (_this.useMaterial(mesh.material, mesh.material.shader) || updateShadingLights) {
                            updateShadingLights = false;
                            _this.updateCameraUniforms(camera);
                            _this.updateShadingLights(camera);
                        }
                        _this.updateModelViewMatrix(camera, mesh.model);
                        _this.renderMesh(mesh);
                    }

                });
            }


            _this.disableFWRendering();
            for (i4 = 0; i4 < flatMeshes.length; i4++) {
                mesh = flatMeshes[i4];

                if (_this.useMaterial(mesh.material, mesh.material.shader)) {
                     _this.updateCameraUniforms(camera);
                }
                _this.updateModelViewMatrix(camera, mesh.model);
                _this.renderMesh(mesh);
            }


            for (i4 = 0; i4 < transparentMeshes.length; i4++) {
                mesh = transparentMeshes[i4];
                if (mesh.material.flags & tge.SHADING.SHADED) {
                    if (_this.lightPassCount >= mesh.material.lightPassLimit) continue;
                    _this.renderLighting(camera, lights, function (updateShadingLights) {

                        if (_this.useMaterial(mesh.material,mesh.material.shader) || updateShadingLights) {
                            updateShadingLights = false;
                            _this.updateModelViewMatrix(camera, mesh.model);
                            _this.updateCameraUniforms(camera);
                            _this.updateShadingLights(camera);
                            if (_this.lightPassCount === 0) {
                                _this.gl.enable(_this.gl.BLEND);
                                _this.gl.blendFunc(_this.gl.SRC_ALPHA, _this.gl.ONE_MINUS_SRC_ALPHA);
                                _this.gl.cullFace(_this.gl.FRONT);
                                _this.renderMesh(mesh);
                                _this.gl.cullFace(_this.gl.BACK);
                                _this.renderMesh(mesh);
                            }
                            else {
                                _this.gl.blendFunc(_this.gl.ONE, _this.gl.ONE);
                                _this.renderMesh(mesh);
                            }
                        }


                    });
                    _this.disableFWRendering();
                }
                else {
                    if (_this.useMaterial(mesh.material, mesh.material.shader)) {
                        _this.updateCameraUniforms(camera);
                    }
                    _this.updateModelViewMatrix(camera, mesh.model);
                    _this.gl.enable(_this.gl.BLEND);
                    _this.gl.blendFunc(_this.gl.SRC_ALPHA, _this.gl.ONE_MINUS_SRC_ALPHA);
                    _this.renderMesh(mesh);

                }
            }
            _this.disableFWRendering();

            this.lastShaderId = -1;

            /*
            for (i1 = 0; i1 < lights.length; i1++) {
                light = lights[i1];
                if (light.castShadows) {
                    light.renderShadows(this, camera, castShadowMeshes, receiveShadowMeshes);
                }
            }
            */
            allMeshes.castShadowMeshes = castShadowMeshes;
            allMeshes.receiveShadowMeshes = receiveShadowMeshes;
            allMeshes.transparentMeshes = transparentMeshes;
            allMeshes.opuqueMeshes = opuqueMeshes;
            allMeshes.flatMeshes = flatMeshes;

            if (castShadowLights.length > 0) {
                tge.light.castShadows(castShadowLights, this, camera, allMeshes);
            }


           
            






            if (cb) {
              
                cb(this, camera, lights, allMeshes);

            }

            postProcessOutput = this.defaultRenderTarget.colorTexture;

            /*
            for (i1 = 0; i1 < this.postProcessPipeline.length; i1++) {
                if (i1 % 2 === 0) {
                    this.renderPostProcessQuad(this.postProcessPipeline[i1], this.postProcessTarget, postProcessOutput);
                    postProcessOutput = this.postProcessTarget.colorTexture;
                }
                else {
                    this.renderPostProcessQuad(this.postProcessPipeline[i1], this.defaultRenderTarget, postProcessOutput);
                    postProcessOutput = this.defaultRenderTarget.colorTexture;
                }
            }
            */
            

            this.renderPostProcessQuad(tge.engine.defaultPostProcessShader.process, null, postProcessOutput);



            _this.textureSlots[0] = -1;
            _this.updateTextures();


        }
    })();
    var fq = tge.geometry.quad2D();
    proto.renderPostProcessQuad = (function () {
        var shader;
        return function (process, target, texture_input) {

            if (target == null) {
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            }
            else {
                target.bind();
            }
            shader = process(this);

            if (this.lastShaderId !== shader.uuid) this.useShader(shader);
            this.useGeometry(fq);
            shader.setUniform("tge_u_texture_input", 0);
            this.useTexture(texture_input, 0);
            this.gl.drawArrays(4, 0, 6);
        }
    })();
    proto.renderFlatMeshes = function (camera, meshes) {


        for (i4 = 0; i4 < meshes.length; i4++) {
            mesh = meshes[i4];
            if (this.useShader(mesh.material.getShader())) {
                this.updateCameraUniforms(camera);
            }
            this.updateModelViewMatrix(camera, mesh.model);
            this.renderMesh(mesh);

        }

    };

    proto.renderSingleMesh = function (camera, mesh) {
        this.useMaterial(mesh.material, mesh.material.shader);
        this.updateCameraUniforms(camera);
        this.updateModelViewMatrix(camera, mesh.model);
        this.renderMesh(mesh);
    }

    proto.bindRenderTarget = function (target) {
        if (target.uuid !== this.lastRenderTargetId) {
            this.lastRenderTargetId = target.uuid;
            target.bind();

        }
    };


    return engine;

});
