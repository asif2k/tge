
tge.node = $extend(function (proto) {



    function node() {
        this.uuid = $guidi();
        this.matrix = tge.mat4();

        this.rotation = tge.vec3();
        this.quat = tge.quat();
        this.matrixNeedUpdate = true;
        this.rotationNeedUpdate = false;

        this.version = 0;
        this.enabled = true;
        this.enabling = false;

        this.scale = tge.vec3();

        tge.vec3.set(this.scale, 1, 1, 1);

        this.position = new Float32Array(this.matrix.buffer,  (12 * 4), 3);
       return (this);


    }

    proto.update = function () {
        this.enabling = this.enabled;
        return this.updateMatrix()
    };

    proto.computeRotation = function () {
        tge.quat.rotateEular(this.quat, this.rotation[0], this.rotation[1], this.rotation[2]);
        this.rotationNeedUpdate = false;
        this.matrixNeedUpdate = true;
    }

    proto.updateMatrix = function () {
        if (this.rotationNeedUpdate === true) this.computeRotation();
        if (this.matrixNeedUpdate !== true) return;
        tge.quat.toMatrixWithScale(this.quat, this.matrix, this.scale);
        this.matrixNeedUpdate = false;
        return (true);

    }
    return node;

});


tge.transfrom_node = $extend(function (proto,_super) {

    proto.rotateX = function (x) {
        this.rotation[0] = x;
        this.rotationNeedUpdate = true;
    }
    proto.rotateXIn = function (x) {
        this.rotation[0] += x;
        this.rotationNeedUpdate = true;
    }
    proto.rotateY = function (y) {
        this.rotation[1] = y;
        this.rotationNeedUpdate = true;
    }
    proto.rotateYIn = function (y) {
        this.rotation[1] += y;
        this.rotationNeedUpdate = true;
    }
    proto.rotateZ = function (z) {
        this.rotation[2] = z;
        this.rotationNeedUpdate = true;
    }
    proto.rotateZIn = function (z) {
        this.rotation[2] += z;
        this.rotationNeedUpdate = true;
    }
    proto.yawPitch = function (dx, dy) {
        this.setRotation(this.rotation[0] + dx, this.rotation[1] + dy, this.rotation[2]);
    }
    proto.setRotation = function (x, y, z) {
        this.rotation[0] = x;
        this.rotation[1] = y;
        this.rotation[2] = z;
        this.rotationNeedUpdate = true;
    }
    proto.setScaling = function (x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
        this.matrixNeedUpdate = true;
    }
    proto.setScalingUnit = function (x) {
        this.scale[0] = x;
        this.scale[1] = x;
        this.scale[2] = x;
        this.matrixNeedUpdate = true;
    }
    proto.setPosition = function (x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.matrixNeedUpdate = true;
    }

    proto.moveFrontBack = function (sp) {
        this.matrix[12] += this.fwVector[0] * sp;
        this.matrix[13] += this.fwVector[1] * sp;
        this.matrix[14] += this.fwVector[2] * sp;
        this.matrixNeedUpdate = true;

    }

    proto.moveUpDown = function (sp) {
        this.matrix[12] += this.upVector[0] * sp;
        this.matrix[13] += this.upVector[1] * sp;
        this.matrix[14] += this.upVector[2] * sp;
        this.matrixNeedUpdate = true;

    }

    proto.moveLeftRight = function (sp) {
        this.matrix[12] += this.sdVector[0] * sp;
        this.matrix[13] += this.sdVector[1] * sp;
        this.matrix[14] += this.sdVector[2] * sp;
        this.matrixNeedUpdate = true;

    }

    function transfrom_node() {
        _super.apply(this, arguments);
        this.matrixWorld = tge.mat4();

        this.parent = null;
        this.parentVersion = -1;
        this.worldPosition = new Float32Array(this.matrixWorld.buffer, this.matrixWorld.byteOffset + (12 * 4), 3);


        this.upVector = new Float32Array(this.matrixWorld.buffer, (4 * 4), 3);
        this.fwVector = new Float32Array(this.matrixWorld.buffer, (8 * 4), 3);
        this.sdVector = new Float32Array(this.matrixWorld.buffer, 0, 3);

        return (this);


    }

    proto.update = (function () {
        var origVersion;
        return function () {
            if (this.version > 500000) this.version = 0;
            origVersion = this.version;
            this.enabling = this.enabled;
            if (this.updateMatrix()) {
                this.version++;
                if (this.parent === null) {
                    tge.mat4.copy(this.matrixWorld, this.matrix);
                    return (true);
                }

            }
            if (this.parent !== null) {
                this.enabling = this.enabled && this.parent.enabling;

                if (this.enabling) {
                    if (this.parent.version !== this.parentVersion || origVersion !== this.version) {
                        tge.mat4.multiply(this.matrixWorld, this.parent.matrixWorld, this.matrix);
                        this.parentVersion = this.parent.version;
                        this.version++;
                    }
                }

            } 
           
            return (origVersion !== this.version);

        }
    })();


    return transfrom_node;

},tge.node);