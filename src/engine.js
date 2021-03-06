import * from './gl_constants.js'
import * from './shader.js'
import * from './model.js'
import * from './camera.js'
import * from './light.js'
import * from './post_process.js'

tge.engine = $extend(function (proto) {

 
    function setupGLState(gl) {
        gl.states = { depthMask: false, blendFunc0: -1, blendFunc1: -1, };


        // webgl state managerment
        var pm1 = [null];
        var pm2 = [null,null];
        gl.enable = (function (_super, gl) {
            
            return function (state) {
                if (gl.states[state] === true) return (false);
                gl.states[state] = true;
                pm1[0] = state;
                _super.apply(gl, pm1);
                return (true);
            }
        })(gl.enable, gl);

        gl.disable = (function (_super, gl) {
            return function (state) {
                if (gl.states[state] === false) return (false);
                gl.states[state] = false;
                pm1[0] = state;
                _super.apply(gl, pm1);
                return (true);
            }
        })(gl.disable, gl);

        gl.blendFunc = (function (_super, gl) {
            return function (func0, func1) {
                if (gl.states.blendFunc0 !== func0 || gl.states.blendFunc1 !== func1) {
                    gl.states.blendFunc0 = func0;
                    gl.states.blendFunc1 = func1;
                    pm2[0] = func0;
                    pm2[1] = func1;
                    _super.apply(gl, pm2);
                    return (true);
                }
                return (false);
            }
        })(gl.blendFunc, gl);

        gl.blendEquation = (function (_super, gl) {
            return function (param) {
                if (gl.states.blendEQuation !== param) {
                    gl.states.blendEQuation = param;
                    pm1[0] = param;
                    _super.apply(gl, pm1);
                }
            }
        })(gl.blendEquation, gl);

        gl.depthMask = (function (_super, gl) {
            return function (mask) {
                if (mask !== gl.states.depthMask) {
                    gl.states.depthMask = mask;
                    pm1[0] = mask;
                    _super.apply(gl, pm1);
                }
            }
        })(gl.depthMask, gl);

        gl.depthFunc = (function (_super, gl) {
            return function (func) {
                if (func !== gl.states.depthFunc) {
                    gl.states.depthFunc = func;
                    pm1[0] = func;
                    _super.apply(gl, pm1);
                }
            }
        })(gl.depthFunc, gl);

        gl.cullFace = (function (_super, gl) {
            return function (param) {
                if (param !== gl.states.cullFace) {
                    gl.states.cullFace = param;
                    pm1[0] = param;
                    _super.apply(gl, pm1);
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
        gl.OES_element_index_uint = gl.getExtension('OES_element_index_uint');
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
     
        this._defaultRenderTarget = new tge.rendertarget(gl, 10,10, true);
        this._defaultRenderTarget.clearBuffer = false;

        this.defaultRenderTarget = this._defaultRenderTarget;
        this.postProcessTarget = new tge.rendertarget(gl, 10, 10, true);


        this.postProcessTarget.display = this.postProcessTarget.getColorDisplay();

        this.post_processes = [];

                
        gl.enable(GL_DEPTH_TEST);
        gl.cullFace(GL_BACK);
        gl.enable(GL_CULL_FACE);
        gl.clearColor(0, 0, 0, 1);



      

    }




    proto.setSize = function (width, height) {
        this.gl.canvas.width = width * this.gl.pixelRatio;
        this.gl.canvas.height = height * this.gl.pixelRatio;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        this.defaultRenderTarget.resize(this.gl.canvas.width, this.gl.canvas.height);
        this.postProcessTarget.resize(this.gl.canvas.width, this.gl.canvas.height);
        for (var i = 0; i < this.post_processes.length; i++) {
            this.post_processes[i].resize(this.gl.canvas.width, this.gl.canvas.height);
        }

    };


    proto.clearScreen = function () {
        this.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        return (this);
    };

    proto.setDefaultViewport = function () {
        this.defaultRenderTarget.bind();
        return (this)
    };

    proto.useShader = function (shader) {
        if (this.lastShaderId != shader.uuid) {         
            if (!shader.compiled) {
                
                tge.shader.compile(this.gl, shader, this.shaderParameters);
            }
            this.gl.useProgram(shader.program);            
            this.activeShader = shader;
            this.activeShader.cameraVersion = -1;
            this.lastShaderId = shader.uuid;
            this.activeShader.used_geo_id = -1;
            return (true);
        }
        return (false);
    };

    proto.useMaterial = function (material, shader) {

        shader = material.getShader(shader);
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
                    gl.bindBuffer(GL_ARRAY_BUFFER, att.dest);
                    gl.bufferData(GL_ARRAY_BUFFER, att.data, att.bufferType);                   
                    returnValue = 1;
                    att.version++;
                    att.needsUpdate = false;
                }
                else if (att.dest !== null) {
                    gl.bindBuffer(GL_ARRAY_BUFFER, att.dest);


                }
                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location, att.itemSize, att.dataType, false, att.stride, att.offset);



            }

            return returnValue
        }

        return function (geo) {
            if (!geo.compiled) tge.geometry.compile(this.gl, geo);

            shader = this.activeShader;
            if (shader.used_geo_id === geo.uuid) return;
            shader.used_geo_id = geo.uuid;
           
            for (id in shader.attributes) {
                if (geo.attributes[id]) {
                    updateGeomertyAttribute(this.gl, shader.attributes[id].location, geo.attributes[id]);
                }
                else {
                    updateGeomertyAttribute(this.gl, shader.attributes[id].location, null);
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
            this.gl.activeTexture(GL_TEXTURE0 + slot);
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
        this.gl.blendFunc(GL_ONE, GL_ONE);

        if (this.FWRenderingMode) return;
       
        this.gl.enable(GL_BLEND);

        this.gl.depthMask(false);
        this.gl.depthFunc(GL_EQUAL);
        this.FWRenderingMode = true;
    };

    proto.disableFWRendering = function () {
        this.gl.disable(GL_BLEND);
        this.gl.depthFunc(GL_LESS);
        this.gl.depthMask(true);
        this.FWRenderingMode = false;
    };      

    proto.updateCameraUniforms = function (camera) {
        if (this.activeShader.cameraVersion === camera.version) return false;
        this.activeShader.cameraVersion = camera.version;       
        this.activeShader.setUniform("tge_u_viewProjectionMatrix", camera.matrixWorldProjection);
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
        dummyLight.attenuation[3] = 0.5;

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
        

        var updateShadingLights = false;

        var i1, i2, i3, i4;
        var light;


        proto.renderLighting = function (camera, lights, calback) {
            this.lightPassCount = 0;
            this.lightsBatchSize = 0;
            for (i1 = 0; i1 < lights.length; i1++) {
                light = lights[i1];
                
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

        function transparentMeshSortFunc(a, b) {
            return a.cameraDistance - b.cameraDistance;
        }

        function solidMeshSortFunc(a, b) {
            return b.cameraDistance - a.cameraDistance;
        }

        var postProcessOutput, post_process, post_process_input, post_process_output;
        return function (camera, meshes, lights) {

            this.setDefaultViewport().clearScreen();
            if (this.isError) {
                return;
            }
            this.currentCamera = camera;


            _this = this;

            if (meshes.sorted !== true) {
                transparentMeshes.length = 0;
                opuqueMeshes.length = 0;
                flatMeshes.length = 0;


                for (i4 = 0; i4 < meshes.length; i4++) {
                    mesh = meshes[i4];

                    if ((mesh.material.flags & tge.SHADING.TRANSPARENT) !== 0) {
                        transparentMeshes[transparentMeshes.length] = mesh;
                    }
                    else {
                        if (mesh.material.flags & tge.SHADING.FLAT) {
                            flatMeshes[flatMeshes.length] = mesh;
                        }
                        else {
                            opuqueMeshes[opuqueMeshes.length] = mesh;
                        }
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
              



            //post_process_input = _this._defaultRenderTarget.colorTexture;
            //i1 = 0;
            //for (i4 = 0; i4 < _this.post_processes.length; i4++) {
            //    post_process = _this.post_processes[i4];
            //    if (post_process.enabled && post_process.drawLastFrame) {
            //        if (i1 % 2 === 0) {
            //            post_process.drawLastFrame(_this, post_process_input, _this.postProcessTarget);
            //            post_process_input = _this.postProcessTarget.colorTexture;
            //            post_process_output = _this._defaultRenderTarget;
            //        }

            //        else {
            //            post_process.drawLastFrame(_this, post_process_input, _this._defaultRenderTarget);
            //            post_process_input = _this._defaultRenderTarget.colorTexture;
            //            post_process_output = _this.postProcessTarget;
            //        }
            //        i1++;
            //    }
            //}


          //  tge.post_process.flat(_this, post_process_input, post_process_output);

           
            for (i4 = 0; i4 < lights.length; i4++) {
                light = lights[i4];                
                if (light.castShadows)
                    light.renderShadows(_this, camera, opuqueMeshes, transparentMeshes);

            }
            _this.disableFWRendering();

            






           
        
            for (i4 = 0; i4 < transparentMeshes.length; i4++) {
                mesh = transparentMeshes[i4];

                if (mesh.material.flags & tge.SHADING.SHADED) {
                    if (_this.lightPassCount >= mesh.material.lightPassLimit) continue;
                    _this.renderLighting(camera, lights, function (updateShadingLights) {

                        if (_this.useMaterial(mesh.material, mesh.material.shader) || updateShadingLights) {
                            updateShadingLights = false;
                            _this.updateModelViewMatrix(camera, mesh.model);
                            _this.updateCameraUniforms(camera);
                            _this.updateShadingLights(camera);
                            if (_this.lightPassCount === 0) {
                                _this.gl.enable(GL_BLEND);
                                _this.gl.blendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);
                                _this.gl.cullFace(GL_FRONT);
                                _this.renderMesh(mesh);
                                _this.gl.cullFace(GL_BACK);
                                _this.renderMesh(mesh);
                            }
                            else {

                                _this.gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
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
                    _this.gl.enable(GL_BLEND);
                    _this.gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
                    _this.renderMesh(mesh);

                }
            }
            _this.disableFWRendering();




            post_process_input = _this._defaultRenderTarget.colorTexture;
            i1 = 0;
            _this.gl.disable(GL_DEPTH_TEST);
            for (i4 = 0; i4 < _this.post_processes.length; i4++) {
                post_process = _this.post_processes[i4];
                if (post_process.enabled) {
                    if (i1 % 2 === 0) {
                        post_process.apply(_this, post_process_input, _this.postProcessTarget);
                        post_process_input = _this.postProcessTarget.colorTexture;
                    }

                    else {                        
                        post_process.apply(_this, post_process_input, _this._defaultRenderTarget);
                        post_process_input = _this._defaultRenderTarget.colorTexture;
                    }
                    i1++;
                }
            }
            _this.gl.enable(GL_DEPTH_TEST);
                        
            tge.post_process.flat(_this, post_process_input, null);
            _this.textureSlots[0] = -1;
            _this.updateTextures();


        }




    })();
    var fq = tge.geometry.quad2D();

    proto.renderFullScreenQuad = function () {

        this.useGeometry(fq);        
        this.gl.drawArrays(4, 0, 6);

    };





    proto.renderSingleMesh = function (camera, mesh) {
        this.useMaterial(mesh.material, mesh.material.shader);
        this.updateCameraUniforms(camera);
        this.updateModelViewMatrix(camera, mesh.model);
        this.renderMesh(mesh);
    }




    return engine;

});
