import * from './node.js'
import * from './math.js'


tge.camera = $extend(function (proto, _super) {


    proto.getDisplay = function () {
        var mod = new tge.model(tge.geometry.cube());
        mod.parent = this;
        this.update();
        mod.flags = tge.OBJECT_TYPES.MANIPULATORS;
        return (mod);

    };


    function camera() {
        _super.apply(this, arguments);
        this.frustumPlanes = [tge.vec4(), tge.vec4(), tge.vec4(), tge.vec4(), tge.vec4(), tge.vec4()];        
        this.fov = 0;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 50;
        this.matrixProjection = tge.mat4();
        this.matrixWorldInvserse = tge.mat4();
        this.matrixWorldProjection = tge.mat4();
        this.renderTarget = null;
        return (this);

    }

    proto.updateMatrixWorldInverse = function () {
        tge.mat4.invert(this.matrixWorldInvserse, this.matrixWorld);
        return (this);
    };

    proto.updateMatrixWorldProjection = function () {
        tge.mat4.multiply(this.matrixWorldProjection, this.matrixProjection, this.matrixWorldInvserse);
        this.updateFrustumPlanes(this.matrixWorldProjection);
        return (this);
    };

    var len = 0;
    proto.updateFrustumPlane = function (p, x, y, z, w) {
        len = x * x + y * y + z * z + w * w;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
        }
        this.frustumPlanes[p][0] = x * len;
        this.frustumPlanes[p][1] = y * len;
        this.frustumPlanes[p][2] = z * len;
        this.frustumPlanes[p][3] = w * len;
    };

    proto.updateFrustumPlanes = function (me) {

        this.updateFrustumPlane(0, me[3] - me[0], me[7] - me[4], me[11] - me[8], me[15] - me[12]);
        this.updateFrustumPlane(1, me[3] + me[0], me[7] + me[4], me[11] + me[8], me[15] + me[12]);
        this.updateFrustumPlane(2, me[3] + me[1], me[7] + me[5], me[11] + me[9], me[15] + me[13]);
        this.updateFrustumPlane(3, me[3] - me[1], me[7] - me[5], me[11] - me[9], me[15] - me[13]);
        this.updateFrustumPlane(4, me[3] - me[2], me[7] - me[6], me[11] - me[10], me[15] - me[14]);
        this.updateFrustumPlane(5, me[3] + me[2], me[7] + me[6], me[11] + me[10], me[15] + me[14]);


    };

    proto.distanceToFrustumPlane = function (p, x, y, z) {
        return this.frustumPlanes[p][0] * x + this.frustumPlanes[p][1] * y
            + this.frustumPlanes[p][2] * z + this.frustumPlanes[p][3];
    }
    var dist01, dist23, dist45
    proto.pointFrustumDistance = function (x, y, z) {
        dist01 = Math.min(this.distanceToFrustumPlane(0, x, y, z), this.distanceToFrustumPlane(1, x, y, z));
        dist23 = Math.min(this.distanceToFrustumPlane(2, x, y, z), this.distanceToFrustumPlane(3, x, y, z));
        dist45 = Math.min(this.distanceToFrustumPlane(4, x, y, z), this.distanceToFrustumPlane(5, x, y, z));

        return Math.min(Math.min(dist01, dist23), dist45);
    };
    proto.update = (function (super_update) {
        return (function () {
            if (super_update.apply(this)) {
                this.updateMatrixWorldInverse();
                this.updateMatrixWorldProjection();

                return (true);
            }
            return (false);
        });
    })(proto.update);

    return camera;

}, tge.transfrom_node);



tge.perspective_camera = $extend(function (proto, _super) {

    function perspective_camera(fov, aspect, near, far) {
        _super.apply(this, arguments);

        this.fov = (fov !== undefined ? fov : 50) * tge.DEGTORAD;

        this.near = near !== undefined ? near : 0.1;
        this.far = far !== undefined ? far : 50;

        this.aspect = aspect !== undefined ? aspect : 1;

        this.updateProjection();

        return (this);

    }

    proto.updateProjection = function () {
        tge.mat4.perspective(this.matrixProjection, this.fov, this.aspect, this.near, this.far);
        this.updateMatrixWorldProjection();
        this.version++;
    };

    return perspective_camera;

}, tge.camera);



tge.ortho_camera = $extend(function (proto, _super) {

    function ortho_camera(left, right, bottom, top, near, far) {
        _super.apply(this, arguments);

        this.left = left || -0.5;
        this.right = right || 0.5;
        this.bottom = bottom || -0.5;
        this.top = top || 0.5;
        this.near = near || 0.1;
        this.far = far || 20;

        this.aspect = Math.abs((this.right - this.left) / (this.top - this.bottom));

        this.updateProjection();

        return (this);

    }

    proto.updateProjection = function () {
        tge.mat4.ortho(this.matrixProjection, this.left, this.right, this.bottom, this.top, this.near, this.far);
        this.updateMatrixWorldProjection();
        this.version++;
    };

    return ortho_camera;

}, tge.camera);
