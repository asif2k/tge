import * from './node.js'
import * from './mesh.js'
import * from './terrain.js'

tge.model = $extend(function (proto,_super) {
    $assign(proto, tge.flags.prototype);


    proto.update = (function (super_update) {
        return (function () {
            if (super_update.apply(this)) {
                this.modelViewMatrixVersion = -1;
                tge.mat3.normalFromMat4(this.normalMatrix, this.matrixWorld);
                this.boundingSphereSizeScaled = this.boundingSphereSize * this.scale[0];    
                tge.aabb.transformMat4x(this.aabb, this.size, this.matrixWorld);
                return (true);
            }
            return (false);
        });
    })(proto.update);


    proto.addMesh = function (mesh, callback) {
        this.meshes.push(mesh);
        mesh.model = this;
        this.calcBoundingSphereSize();
        if (callback) callback(mesh);
        return (mesh);
    };

    var i = 0, mesh = null


    proto.calcBoundingSphereSize = function () {
        this.boundingSphereSize = 0;
        tge.vec3.set(this.size, 0, 0, 0);
        for (i = 0; i < this.meshes.length; i++) {
            mesh = this.meshes[i];
            this.boundingSphereSize = mesh.geo.calcBoundingSphereSize(this.boundingSphereSize);
            tge.vec3.max(this.size, this.size, mesh.geo.size);

        }
        this.boundingSphereSizeScaled = this.boundingSphereSize * this.scale[0];

        this.size[0] *= this.scale[0];
        this.size[1] *= this.scale[1];
        this.size[2] *= this.scale[2];


        return (this.boundingSphereSize);
    }

    function model(geo_mesh, material) {
        _super.apply(this);
        tge.flags.apply(this, arguments);

        this.meshes = [];
        this.modelViewMatrix = tge.mat4();
        this.normalMatrix = tge.mat3();

        this.modelViewPosition = new Float32Array(this.modelViewMatrix.buffer, 12 * 4, 3);
        this.modelViewMatrixVersion = -1;
        this.boundingSphereSize = 0;
        this.size =tge.vec3();
        this.aabb = tge.aabb();


        this.enabled = true;
        this.enabling = true;

        this.flags = tge.OBJECT_TYPES.STATIC_MODEL;
        if (geo_mesh) {
            if (geo_mesh.geo) {
                this.addMesh(geo_mesh);
            }
            else {
                this.addMesh(new tge.mesh(geo_mesh, material));
            }
            
        }

        return (this);

    }


    return model;

}, tge.transfrom_node);
