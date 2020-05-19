import * from './node.js'
import * from './mesh.js'



tge.render_list = $extend(function (proto, _super) {

    var i1, i2, model, light, mesh;



    proto.updateModelViewMatrix = function (camera, model) {
        if (model.modelViewMatrixVersion !== camera.version) {
            model.modelViewMatrixVersion = camera.version;
            tge.mat4.multiply(model.modelViewMatrix, camera.matrixWorldInvserse, model.matrixWorld);
        }
    };

    proto.updateMeshes = function (camera, models, flags) {
        this.meshes.length = 0;
        this.transparentMeshes.length = 0;
        for (i1 = 0; i1 < models.length; i1++) {
            model = models[i1];
            if ((model.flags & flags) !== 0) {
                model.update();
               
                if (!model.enabling) continue;
               // console.log(model);
                this.updateModelViewMatrix(camera, model);
                if (camera.pointFrustumDistance(model.worldPosition[0], model.worldPosition[1], model.worldPosition[2]) + model.boundingSphereSizeScaled > 0) {
                    
                    for (i2 = 0; i2 < model.meshes.length; i2++) {
                        mesh = model.meshes[i2];
                        mesh.cameraDistance = model.modelViewPosition[2];

                        this.meshes[this.meshes.length] = mesh;
                    }
                }


            }
        }




        return (this);
    }



    function lightsSortFunc(a, b) {
        return a.cameraDistance - b.cameraDistance;
    }
    var tempMatrix = tge.mat4();
    var tempMatrixPosition = new Float32Array(tempMatrix.buffer, 12 * 4, 3);
    proto.updateLights = function (camera, lights, flags) {
        this.lights.length = 0;
        for (i1 = 0; i1 < lights.length; i1++) {
            light = lights[i1];
            if (light.enabled === false) continue;

            if (light.flags & flags) {
                light.update();
                if (light.lightType === 0) {
                    light.cameraDistance = 0;
                    this.lights[this.lights.length] = light;
                    continue;
                }
                if (camera.pointFrustumDistance(light.worldPosition[0], light.worldPosition[1], light.worldPosition[2]) + light.range > 0) {
                    if (light.cameraMatrixVersion !== camera.version) {
                        light.cameraMatrixVersion = camera.version;
                        tge.mat4.multiply(tempMatrix, camera.matrixWorldInvserse, light.matrixWorld);
                        light.cameraDistance = tge.vec3.getLength(tempMatrixPosition);
                    }
                    this.lights[this.lights.length] = light;
                }
            }
        }

        this.lights = $mergesort(this.lights, lightsSortFunc);

        return (this);
    };




    function render_list() {
        _super.apply(this);

        this.meshes = [];
        this.transparentMeshes = [];
        this.lights = [];
        return (this);


    }


    return render_list;

});




tge.scene = $extend(function (proto,_super) {
    
   
    proto.addModel = function (model, callback) {
        this.models.push(model);
        if (model.parent === null) model.parent = this;
        if (callback) callback(model, model.meshes[0]);
        return (model);
    };
    proto.addLight = function (light, callback) {
        this.lights.push(light);
        light.parent = this;
        if (callback) callback(light);
        return (light);
    };


    proto.updateRenderList = function (camera, modelFlags, lightFlags) {
        lightFlags = lightFlags || tge.OBJECT_TYPES.LIGHTS;
        modelFlags = modelFlags || tge.OBJECT_TYPES.MODELS;
        this.renderList.updateLights(camera, this.lights, lightFlags);
        this.renderList.updateMeshes(camera, this.models, modelFlags);
    };



    function scene() {
        _super.apply(this);

        this.models = [];
        this.lights = [];
        this.enabled = true;
        this.enabling = true;
        this.renderList = new tge.render_list();
        this.rootModel = this.addModel(new tge.model());

        this.rootModel.boundingSphereSizeScaled = 1000;
        this.rootModel.boundingSphereSize = 1000;
        this.rootModel.calcBoundingSphereSize = function () { };

        return (this);

    }


    return scene;

}, tge.transfrom_node);
