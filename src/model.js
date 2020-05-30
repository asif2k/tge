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


tge.planet = $extend(function (proto, _super) {

    var theta = Math.PI / 2;
    var phi = Math.PI / 2;
    var vec2 = tge.vec2;
    var vec3 = tge.vec3;

    var toPoint = function (o, r, lat, lon) {
        o[0] = r * Math.cos(lat) * Math.sin(lon);
        o[1] = r * Math.sin(lat);
        o[2] = r * Math.cos(lat) * Math.cos(lon);
        return o;

        o[0] = r * Math.cos(lon) * Math.sin(lat)
        o[2] = r * Math.sin(lon) * Math.sin(lat)
        o[1] = r * Math.cos(lat);
        return o;
        
    };


    var toLatLon = (function () {
        var r;
        return function (o, x, y, z) {
            r = Math.sqrt(x * x + y * y + z * z);
            o[0] = Math.asin(y / r);
            o[1] = Math.asin(x / r / Math.cos(o[0]));
            return o;
        }
    })();



    var OctaTerrain = tge.planet = $extend(function (proto) {




        proto.getChunkCenter = function (o, p1, p2, p3) {
            o[0] = (p1[0] + p2[0] + p3[0]) / 3;
            o[1] = (p1[1] + p2[1] + p3[1]) / 3;
            o[2] = (p1[2] + p2[2] + p3[2]) / 3;
            return o;
        };

        proto.boundingRadius = function (c, p1, p2, p3) {
            return Math.max(vec3.distance(c, p1), Math.max(vec3.distance(c, p2), vec3.distance(c, p3)));
        };

        proto.needDivide = (function () {
            var center = vec3(), boundRadius;
            return function (cameraPos, p1, p2, p3, z) {
                this.getChunkCenter(center, p1, p2, p3);
                boundRadius = this.boundingRadius(center, p1, p2, p3);

                return vec3.distance(cameraPos, center) < boundRadius * this.detail;
            }
        })();

        proto.existChunk = function (id) {
            return this.chunks[id] !== undefined;

        };
        proto.addChunk = (function () {
            var p1 = vec3(), p2 = vec3(), p3 = vec3();
            var p12 = vec3(), p23 = vec3(), p31 = vec3();
            var temp = vec3();
            return function (v1, v2, v3, id, divide, positiveOriented) {

                vec3.scale(p1, v1, 1 / vec3.getLength(v1) * this.radius);
                vec3.scale(p2, v2, 1 / vec3.getLength(v2) * this.radius);
                vec3.scale(p3, v3, 1 / vec3.getLength(v3) * this.radius);

                if (divide) {
                    var z = this.getIdLevel(id);
                    if (z < this.maxZ && this.needDivide(this.cameraPos, p1, p2, p3, z)) {
                        var continueDivide = !(this.progressive && this.existChunk(id));
                        // Align the longitude of the right side along the edge for the upper
                        // triangles

                        vec3.scale(p12, vec3.add(temp, p1, p2), 0.5);
                        vec3.scale(p23, vec3.add(temp, p2, p3), 0.5);
                        vec3.scale(p31, vec3.add(temp, p3, p1), 0.5);
                        id = this.increaseIdLevel(id);
                        console.log(id);
                        if (positiveOriented) {
                            this.addChunk(p1, p12, p31, this.setIdIndex(id, 0), continueDivide, true);
                            this.addChunk(p12, p23, p31, this.setIdIndex(id, 1), continueDivide, false);
                            this.addChunk(p12, p2, p23, this.setIdIndex(id, 2), continueDivide, true);
                            this.addChunk(p31, p23, p3, this.setIdIndex(id, 3), continueDivide, true);
                        } else {
                            this.addChunk(p1, p12, p31, this.setIdIndex(id, 0), continueDivide, false);
                            this.addChunk(p31, p23, p3, this.setIdIndex(id, 2), continueDivide, false);
                            this.addChunk(p31, p12, p23, this.setIdIndex(id, 1), continueDivide, true);
                            this.addChunk(p12, p2, p23, this.setIdIndex(id, 3), continueDivide, false);
                        }

                    }
                }
                else {
                    if (!this.existChunk(id)) {
                        this.chunks[id] = true;
                        if (this.getIdSide(id) >= 4) {
                            //    std:: swap(b, c);
                            this.vertices.push(p1[0], p1[1], p1[2]);
                            this.vertices.push(p3[0], p3[1], p3[2]);
                            this.vertices.push(p2[0], p2[1], p2[2]);
                        }
                        else {
                            this.vertices.push(p1[0], p1[1], p1[2]);
                            this.vertices.push(p2[0], p2[1], p2[2]);
                            this.vertices.push(p3[0], p3[1], p3[2]);
                        }

                    }
                }
            }
        })();


        proto.setIdSide = function (side) {
            return side << (6 * 8);
        };

        proto.getIdSide = function (id) {
            return (id >> 6 * 8) & 0xff;
        };

        proto.decreaseIdLevel = function (id) {
            return id - (0x1 << 7 * 8);
        };

        proto.increaseIdLevel = function (id) {
            return id + (0x1 << 7 * 8);
        };

        proto.getIdLevel = function (id) {
            return id >> 7 * 8;
        };


        proto.setIdIndex = function (id, index) {

            return id | (index << this.getIdLevel(id) * 2);
        };

        proto.addSide = (function () {
            var v1 = vec3(), v2 = vec3(), v3 = vec3();
            var latScalar, lonScalar;

            return function (id) {
                latScalar = (id > 3 ? -1 : 1);
                lonScalar = id % 4;


                toPoint(v1, this.radius, latScalar * theta, lonScalar * phi);
                toPoint(v2, this.radius, 0.0, lonScalar * phi);
                toPoint(v3, this.radius, 0.0, (lonScalar + 1) * phi);

                this.addChunk(v1, v2, v3, this.setIdSide(id), true, true);

            }
        })();





        proto.generate = function (cameraPos, cameraView) {
            this.vertices.length = 0;
            this.cameraPos = cameraPos;
            this.cameraView = cameraView;

            for (var i = 0; i < 8; i++)
                this.addSide(i);

        };



        function OctaTerrain(radius, maxZ, detail) {
            if (maxZ <= 0 || maxZ > 24)
                maxZ = maxZ <= 0 ? 0 : 24;

            this.radius = radius;
            this.maxZ = maxZ;
            this.detail = detail;
            this.chunks = {};
            this.vertices = [];
            this.progressive = false;

        }

        return OctaTerrain;
    });
    var Delatin = (function () {
        function orient(ax, ay, bx, by, cx, cy) {
            return (bx - cx) * (ay - cy) - (by - cy) * (ax - cx);
        }

        function inCircle(ax, ay, bx, by, cx, cy, px, py) {
            var dx = ax - px;
            var dy = ay - py;
            var ex = bx - px;
            var ey = by - py;
            var fx = cx - px;
            var fy = cy - py;
            var ap = dx * dx + dy * dy;
            var bp = ex * ex + ey * ey;
            var cp = fx * fx + fy * fy;
            return dx * (ey * cp - bp * fy) - dy * (ex * cp - bp * fx) + ap * (ex * fy - ey * fx) < 0;
        }
        function Delatin(data, width, height) {
            if (height === void 0) {
                height = width;
            }

            this.data = data; // height data

            this.width = width;
            this.height = height;
            this.coords = []; // vertex coordinates (x, y)

            this.triangles = []; // mesh triangle indices
            // additional triangle data

            this._halfedges = [];
            this._candidates = [];
            this._queueIndices = [];
            this._queue = []; // queue of added triangles

            this._errors = [];
            this._rms = [];
            this._pending = []; // triangles pending addition to queue

            this._pendingLen = 0;
            this._rmsSum = 0;
            var x1 = width - 1;
            var y1 = height - 1;

            var p0 = this._addPoint(0, 0);

            var p1 = this._addPoint(x1, 0);

            var p2 = this._addPoint(0, y1);

            var p3 = this._addPoint(x1, y1); // add initial two triangles


            var t0 = this._addTriangle(p3, p0, p2, -1, -1, -1);

            this._addTriangle(p0, p3, p1, t0, -1, -1);

            this._flush();
        }

        // refine the mesh until its maximum error gets below the given one


        var _proto = Delatin.prototype;

        _proto.run = function run(maxError) {
            if (maxError === void 0) {
                maxError = 1;
            }

            while (this.getMaxError() > maxError) {
                this.refine();
            }
        } // refine the mesh with a single point


        _proto.refine = function refine() {
            this._step();

            this._flush();
        } // max error of the current mesh

        _proto.getMaxError = function getMaxError() {
            return this._errors[0];
        } // root-mean-square deviation of the current mesh

        _proto.getRMSD = function getRMSD() {
            return this._rmsSum > 0 ? Math.sqrt(this._rmsSum / (this.width * this.height)) : 0;
        } // height value at a given position

        _proto.heightAt = function heightAt(x, y) {
            return this.data[this.width * y + x];
        } // rasterize and queue all triangles that got added or updated in _step

        _proto._flush = function _flush() {
            var coords = this.coords;

            for (var i = 0; i < this._pendingLen; i++) {
                var t = this._pending[i]; // rasterize triangle to find maximum pixel error

                var a = 2 * this.triangles[t * 3 + 0];
                var b = 2 * this.triangles[t * 3 + 1];
                var c = 2 * this.triangles[t * 3 + 2];

                this._findCandidate(coords[a], coords[a + 1], coords[b], coords[b + 1], coords[c], coords[c + 1], t);
            }

            this._pendingLen = 0;
        } // rasterize a triangle, find its max error, and queue it for processing

        _proto._findCandidate = function _findCandidate(p0x, p0y, p1x, p1y, p2x, p2y, t) {
            // triangle bounding box
            var minX = Math.min(p0x, p1x, p2x);
            var minY = Math.min(p0y, p1y, p2y);
            var maxX = Math.max(p0x, p1x, p2x);
            var maxY = Math.max(p0y, p1y, p2y); // forward differencing variables

            var w00 = orient(p1x, p1y, p2x, p2y, minX, minY);
            var w01 = orient(p2x, p2y, p0x, p0y, minX, minY);
            var w02 = orient(p0x, p0y, p1x, p1y, minX, minY);
            var a01 = p1y - p0y;
            var b01 = p0x - p1x;
            var a12 = p2y - p1y;
            var b12 = p1x - p2x;
            var a20 = p0y - p2y;
            var b20 = p2x - p0x; // pre-multiplied z values at vertices

            var a = orient(p0x, p0y, p1x, p1y, p2x, p2y);
            var z0 = this.heightAt(p0x, p0y) / a;
            var z1 = this.heightAt(p1x, p1y) / a;
            var z2 = this.heightAt(p2x, p2y) / a; // iterate over pixels in bounding box

            var maxError = 0;
            var mx = 0;
            var my = 0;
            var rms = 0;

            for (var y = minY; y <= maxY; y++) {
                // compute starting offset
                var dx = 0;

                if (w00 < 0 && a12 !== 0) {
                    dx = Math.max(dx, Math.floor(-w00 / a12));
                }

                if (w01 < 0 && a20 !== 0) {
                    dx = Math.max(dx, Math.floor(-w01 / a20));
                }

                if (w02 < 0 && a01 !== 0) {
                    dx = Math.max(dx, Math.floor(-w02 / a01));
                }

                var w0 = w00 + a12 * dx;
                var w1 = w01 + a20 * dx;
                var w2 = w02 + a01 * dx;
                var wasInside = false;

                for (var x = minX + dx; x <= maxX; x++) {
                    // check if inside triangle
                    if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                        wasInside = true; // compute z using barycentric coordinates

                        var z = z0 * w0 + z1 * w1 + z2 * w2;
                        var dz = Math.abs(z - this.heightAt(x, y));
                        rms += dz * dz;

                        if (dz > maxError) {
                            maxError = dz;
                            mx = x;
                            my = y;
                        }
                    } else if (wasInside) {
                        break;
                    }

                    w0 += a12;
                    w1 += a20;
                    w2 += a01;
                }

                w00 += b12;
                w01 += b20;
                w02 += b01;
            }

            if (mx === p0x && my === p0y || mx === p1x && my === p1y || mx === p2x && my === p2y) {
                maxError = 0;
            } // update triangle metadata


            this._candidates[2 * t] = mx;
            this._candidates[2 * t + 1] = my;
            this._rms[t] = rms; // add triangle to priority queue

            this._queuePush(t, maxError, rms);
        } // process the next triangle in the queue, splitting it with a new point

        _proto._step = function _step() {
            // pop triangle with highest error from priority queue
            var t = this._queuePop();

            var e0 = t * 3 + 0;
            var e1 = t * 3 + 1;
            var e2 = t * 3 + 2;
            var p0 = this.triangles[e0];
            var p1 = this.triangles[e1];
            var p2 = this.triangles[e2];
            var ax = this.coords[2 * p0];
            var ay = this.coords[2 * p0 + 1];
            var bx = this.coords[2 * p1];
            var by = this.coords[2 * p1 + 1];
            var cx = this.coords[2 * p2];
            var cy = this.coords[2 * p2 + 1];
            var px = this._candidates[2 * t];
            var py = this._candidates[2 * t + 1];

            var pn = this._addPoint(px, py);

            if (orient(ax, ay, bx, by, px, py) === 0) {
                this._handleCollinear(pn, e0);
            } else if (orient(bx, by, cx, cy, px, py) === 0) {
                this._handleCollinear(pn, e1);
            } else if (orient(cx, cy, ax, ay, px, py) === 0) {
                this._handleCollinear(pn, e2);
            } else {
                var h0 = this._halfedges[e0];
                var h1 = this._halfedges[e1];
                var h2 = this._halfedges[e2];

                var t0 = this._addTriangle(p0, p1, pn, h0, -1, -1, e0);

                var t1 = this._addTriangle(p1, p2, pn, h1, -1, t0 + 1);

                var t2 = this._addTriangle(p2, p0, pn, h2, t0 + 2, t1 + 1);

                this._legalize(t0);

                this._legalize(t1);

                this._legalize(t2);
            }
        } // add coordinates for a new vertex

        _proto._addPoint = function _addPoint(x, y) {
            var i = this.coords.length >> 1;
            this.coords.push(x, y);
            return i;
        } // add or update a triangle in the mesh

        _proto._addTriangle = function _addTriangle(a, b, c, ab, bc, ca, e) {
            if (e === void 0) {
                e = this.triangles.length;
            }

            var t = e / 3; // new triangle index
            // add triangle vertices

            this.triangles[e + 0] = a;
            this.triangles[e + 1] = b;
            this.triangles[e + 2] = c; // add triangle halfedges

            this._halfedges[e + 0] = ab;
            this._halfedges[e + 1] = bc;
            this._halfedges[e + 2] = ca; // link neighboring halfedges

            if (ab >= 0) {
                this._halfedges[ab] = e + 0;
            }

            if (bc >= 0) {
                this._halfedges[bc] = e + 1;
            }

            if (ca >= 0) {
                this._halfedges[ca] = e + 2;
            } // init triangle metadata


            this._candidates[2 * t + 0] = 0;
            this._candidates[2 * t + 1] = 0;
            this._queueIndices[t] = -1;
            this._rms[t] = 0; // add triangle to pending queue for later rasterization

            this._pending[this._pendingLen++] = t; // return first halfedge index

            return e;
        };

        _proto._legalize = function _legalize(a) {
            // if the pair of triangles doesn't satisfy the Delaunay condition
            // (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
            // then do the same check/flip recursively for the new pair of triangles
            //
            //           pl                    pl
            //          /||\                  /  \
            //       al/ || \bl            al/    \a
            //        /  ||  \              /      \
            //       /  a||b  \    flip    /___ar___\
            //     p0\   ||   /p1   =>   p0\---bl---/p1
            //        \  ||  /              \      /
            //       ar\ || /br             b\    /br
            //          \||/                  \  /
            //           pr                    pr
            var b = this._halfedges[a];

            if (b < 0) {
                return;
            }

            var a0 = a - a % 3;
            var b0 = b - b % 3;
            var al = a0 + (a + 1) % 3;
            var ar = a0 + (a + 2) % 3;
            var bl = b0 + (b + 2) % 3;
            var br = b0 + (b + 1) % 3;
            var p0 = this.triangles[ar];
            var pr = this.triangles[a];
            var pl = this.triangles[al];
            var p1 = this.triangles[bl];
            var coords = this.coords;

            if (!inCircle(coords[2 * p0], coords[2 * p0 + 1], coords[2 * pr], coords[2 * pr + 1], coords[2 * pl], coords[2 * pl + 1], coords[2 * p1], coords[2 * p1 + 1])) {
                return;
            }

            var hal = this._halfedges[al];
            var har = this._halfedges[ar];
            var hbl = this._halfedges[bl];
            var hbr = this._halfedges[br];

            this._queueRemove(a0 / 3);

            this._queueRemove(b0 / 3);

            var t0 = this._addTriangle(p0, p1, pl, -1, hbl, hal, a0);

            var t1 = this._addTriangle(p1, p0, pr, t0, har, hbr, b0);

            this._legalize(t0 + 1);

            this._legalize(t1 + 2);
        } // handle a case where new vertex is on the edge of a triangle

        _proto._handleCollinear = function _handleCollinear(pn, a) {
            var a0 = a - a % 3;
            var al = a0 + (a + 1) % 3;
            var ar = a0 + (a + 2) % 3;
            var p0 = this.triangles[ar];
            var pr = this.triangles[a];
            var pl = this.triangles[al];
            var hal = this._halfedges[al];
            var har = this._halfedges[ar];
            var b = this._halfedges[a];

            if (b < 0) {
                var _t = this._addTriangle(pn, p0, pr, -1, har, -1, a0);

                var _t2 = this._addTriangle(p0, pn, pl, _t, -1, hal);

                this._legalize(_t + 1);

                this._legalize(_t2 + 2);

                return;
            }

            var b0 = b - b % 3;
            var bl = b0 + (b + 2) % 3;
            var br = b0 + (b + 1) % 3;
            var p1 = this.triangles[bl];
            var hbl = this._halfedges[bl];
            var hbr = this._halfedges[br];

            this._queueRemove(b0 / 3);

            var t0 = this._addTriangle(p0, pr, pn, har, -1, -1, a0);

            var t1 = this._addTriangle(pr, p1, pn, hbr, -1, t0 + 1, b0);

            var t2 = this._addTriangle(p1, pl, pn, hbl, -1, t1 + 1);

            var t3 = this._addTriangle(pl, p0, pn, hal, t0 + 2, t2 + 1);

            this._legalize(t0);

            this._legalize(t1);

            this._legalize(t2);

            this._legalize(t3);
        } // priority queue methods

        _proto._queuePush = function _queuePush(t, error, rms) {
            var i = this._queue.length;
            this._queueIndices[t] = i;

            this._queue.push(t);

            this._errors.push(error);

            this._rmsSum += rms;

            this._queueUp(i);
        };

        _proto._queuePop = function _queuePop() {
            var n = this._queue.length - 1;

            this._queueSwap(0, n);

            this._queueDown(0, n);

            return this._queuePopBack();
        };

        _proto._queuePopBack = function _queuePopBack() {
            var t = this._queue.pop();

            this._errors.pop();

            this._rmsSum -= this._rms[t];
            this._queueIndices[t] = -1;
            return t;
        };

        _proto._queueRemove = function _queueRemove(t) {
            var i = this._queueIndices[t];

            if (i < 0) {
                var it = this._pending.indexOf(t);

                if (it !== -1) {
                    this._pending[it] = this._pending[--this._pendingLen];
                } else {
                    throw new Error('Broken triangulation (something went wrong).');
                }

                return;
            }

            var n = this._queue.length - 1;

            if (n !== i) {
                this._queueSwap(i, n);

                if (!this._queueDown(i, n)) {
                    this._queueUp(i);
                }
            }

            this._queuePopBack();
        };

        _proto._queueLess = function _queueLess(i, j) {
            return this._errors[i] > this._errors[j];
        };

        _proto._queueSwap = function _queueSwap(i, j) {
            var pi = this._queue[i];
            var pj = this._queue[j];
            this._queue[i] = pj;
            this._queue[j] = pi;
            this._queueIndices[pi] = j;
            this._queueIndices[pj] = i;
            var e = this._errors[i];
            this._errors[i] = this._errors[j];
            this._errors[j] = e;
        };

        _proto._queueUp = function _queueUp(j0) {
            var j = j0;

            while (true) {
                var i = j - 1 >> 1;

                if (i === j || !this._queueLess(j, i)) {
                    break;
                }

                this._queueSwap(i, j);

                j = i;
            }
        };

        _proto._queueDown = function _queueDown(i0, n) {
            var i = i0;

            while (true) {
                var j1 = 2 * i + 1;

                if (j1 >= n || j1 < 0) {
                    break;
                }

                var j2 = j1 + 1;
                var j = j1;

                if (j2 < n && this._queueLess(j2, j1)) {
                    j = j2;
                }

                if (!this._queueLess(j, i)) {
                    break;
                }

                this._queueSwap(i, j);

                i = j;
            }

            return i > i0;
        };

        return Delatin;



    })();



    proto.update = (function (super_update) {
        return (function () {
            if (super_update.apply(this)) {

                return (true);
            }
            return (false);
        });
    })(proto.update);

    var Planet = $extend(function (proto) {




        proto.generate = function () {
            widthSegments = 360 / 30;
            heightSegments = 360 / 30;
            var vCount = (widthSegments + 1) * (heightSegments + 1);
            var gridX = Math.floor(widthSegments);
            var gridY = Math.floor(heightSegments);

            var width = this.rad * 1;
            var height = this.rad * 1;
            var segment_width = width / gridX;
            var segment_height = height / gridY;
            var width_half = width / 2;
            var height_half = height / 2;

            var gridX1 = gridX + 1;
            var gridY1 = gridY + 1;
            var ix, iy;

            this.indices.length = 0;
            this.vertices.length = 0;
            var ii = 0, vi = 0;
            var v = tge.vec3();
            for (iy = 0; iy < gridY1; iy++) {
                var y = iy * segment_height //- height_half;
                for (ix = 0; ix < gridX1; ix++) {
                    var x = ix * segment_width //- width_half;
                    //this.vertices.push(x, -y, 0);
                    //console.log((x / width)*360, (y / height)*360);
                    toPoint(v, this.rad, (x / width) * 360, (y / height) * 180);
                    this.vertices.push(v[0], v[1], v[2]);



                }

            }

            ii = 0;
            for (iy = 0; iy < gridY; iy++) {
                for (ix = 0; ix < gridX; ix++) {
                    var a = ix + gridX1 * iy;
                    var b = ix + gridX1 * (iy + 1);
                    var c = (ix + 1) + gridX1 * (iy + 1);
                    var d = (ix + 1) + gridX1 * iy;
                    // faces
                    this.indices[ii++] = a;
                    this.indices[ii++] = b;
                    this.indices[ii++] = d;
                    this.indices[ii++] = b;
                    this.indices[ii++] = c;
                    this.indices[ii++] = d;
                }

            }


        }

        proto.generate = function () {

            this.vertices.length = 0;
            var v = tge.vec3(0, 0, 0);
            for (var lat = -90; lat < 90; lat += 15) {
                for (var lon = -180; lon < 180; lon += 30) {
                    this.vertices.push(v[0], v[1], v[2]);
                    toPoint(v, this.rad, lat, lon);
                    this.vertices.push(v[0], v[1], v[2]);

                }
            }

        };

        proto.generate = (function () {

            var tris = [];
            function findArea(a, b, c) {
                var s = (a + b + c) / 2;
                return Math.sqrt(s * (s - a) *
                    (s - b) * (s - c));
            }

            function addTri(px1, py1, px2, py2, px3, py3) {
                var a = findArea(
                    Math.hypot(px2 - px1, py2 - py1),
                    Math.hypot(px3 - px2, py3 - py2),
                    Math.hypot(px3 - px1, py3 - py1));
                console.log("a", a);
                if (a > 15) {

                    var cx = px2 + (px3 - px2) * 0.5;
                    var cy = py2 + (py3 - py2) * 0.5;

                    addTri(px1, py1, cx, cy, px3, py3);
                    addTri(px2, py2, cx, cy, px1, py1);

                }
                else {

                    tris.push([[px1, py1], [px2, py2], [px3, py3]]);
                }


            }

            return function (lat1, lon1, lat2, lon2) {

                tris.length = 0;
                this.vertices.length = 0;
                var r = this.rad;
                var ver = this.vertices;
                var v = tge.vec3(0, 0, 0);

                addTri(lat1, lon1, lat1, lon2, lat2, lon2);

                addTri(lat2, lon2, lat2, lon1, lat1, lon1);

                tris.forEach(function (t) {

                    toPoint(v, r, t[0][0], t[0][1]);
                    ver.push(v[0], v[1], v[2]);

                    toPoint(v, r, t[1][0], t[1][1]);
                    ver.push(v[0], v[1], v[2]);

                    toPoint(v, r, t[2][0], t[2][1]);
                    ver.push(v[0], v[1], v[2]);


                });






            }
        })();

        proto.generate = (function () {

            var tris = [];
            function findArea(a, b, c) {
                var s = (a + b + c) / 2;
                return Math.sqrt(s * (s - a) *
                    (s - b) * (s - c));
            }

            var verts;

            function draw_recursive(p1, p2, p3, center, size) {
                var ratio_size = size * 1;
                var minsize = 0.03;

                var edge_center = [vec3(), vec3(), vec3()];
                var temp = vec3();
                vec3.scale(edge_center[0], vec3.add(temp, p1, p2), 0.5);
                vec3.scale(edge_center[1], vec3.add(temp, p2, p3), 0.5);
                vec3.scale(edge_center[2], vec3.add(temp, p3, p1), 0.5);

                var edge_test = [false, false, false];
                var angle = [0, 0, 0];

                for (var i = 0; i < 3; i++) {

                    vec3.add(temp, center, edge_center[i]);
                    edge_test[i] = vec3.getLength(temp) > ratio_size;
                    var dot = vec3.dot(edge_center[i], vec3.normalize(temp, temp));
                    angle[i] = Math.acos(Math.clamp(dot, -1, 1));
                }


                // culling
                // if (Math.max(angle[0], Math.max(angle[1], angle[2])) < Math.PI / 2 - 0.2) return;

                // draw
                if ((edge_test[0] && edge_test[1] && edge_test[2]) || size < minsize) {
                    verts.push(p1[0], p1[1], p1[2]);
                    verts.push(p2[0], p2[1], p2[2]);
                    verts.push(p3[0], p3[1], p3[2]);


                    return;
                }



                // Recurse
                var p = [p1, p2, p3, edge_center[0], edge_center[1], edge_center[2]];

                var idx = [0, 3, 5, 5, 3, 4, 3, 1, 4, 5, 4, 2];
                var valid = [true, true, true, true];

                if (edge_test[0]) { p[3] = p1; valid[0] = false; } // skip triangle 0 ?
                if (edge_test[1]) { p[4] = p2; valid[2] = false; } // skip triangle 2 ?
                if (edge_test[2]) { p[5] = p3; valid[3] = false; } // skip triangle 3 ?


                for (var i = 0; i < 3; i++) {

                    var i1 = idx[3 * i + 0],
                        i2 = idx[3 * i + 1],
                        i3 = idx[3 * i + 2];
                    draw_recursive(
                        vec3.normalize(p[i1], p[i1]),
                        vec3.normalize(p[i2], p[i2]),
                        vec3.normalize(p[i3], p[i3]),
                        center, size / 2);
                }

            };

            return function () {


                this.vertices.length = 0;
                verts = this.vertices;
                // create icosahedron
                var t = (1.0 + Math.sqrt(5.0)) / 2.0;


                var p = [
                    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
                    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
                    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];

                var idx = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
                    1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 10, 7, 6, 7, 1, 8,
                    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
                    4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];


                var center = vec3();
                for (var i = 0; i < idx.length / 3; i++) {



                    draw_recursive(

                        vec3.normalize(p[idx[i * 3 + 0]], p[idx[i * 3 + 0]]),
                        vec3.normalize(p[idx[i * 3 + 1]], p[idx[i * 3 + 1]]),
                        vec3.normalize(p[idx[i * 3 + 2]], p[idx[i * 3 + 2]])
                        , center, 12
                    );

                }










            }
        })();


        function Planet(rad) {
            this.rad = rad;
            this.vertices = [];
            this.indices = [];
        }


        return Planet;

    });

    function planet2(data) {
        _super.apply(this);

        //this.ot = new Planet(30,30,2);

        //this.ot.generate(70,70,90,80);

        var tileSize = 256;

        var terrain = new Float32Array(tileSize * tileSize);
        for (let y = 0; y < tileSize; y++) {
            for (let x = 0; x < tileSize; x++) {
                const k = (y * tileSize + x) * 4;
                const r = data[k + 0];
                const g = data[k + 1];
                const b = data[k + 2];
                terrain[y * tileSize + x] = r / 3;

            }
        }



        this.del = new Delatin(terrain, 256, 256);

        this.del.run(0.1);



        //var m = this.addMesh(new tge.mesh(tge.geometry.sphere({}), new tge.material()));

        var verts = new Float32Array((this.del.coords.length / 2) * 3);
        var x, z;
        for (var i = 0; i < verts.length / 3; i++) {
            x = this.del.coords[i * 2];
            z = this.del.coords[i * 2 + 1];
            verts[i * 3] = ((x) - 128) * 4;
            verts[i * 3 + 2] = ((z) - 128) * 4;
            verts[i * 3 + 1] = terrain[z * 256 + x];

        }

        var g = new tge.geometry();
        g.addAttribute("tge_a_position", {
            data: verts, // new Float32Array(this.del.coords),
            itemSize: 3, offset: 0
        });

        g.addAttribute("tge_a_normal", {
            data: new Float32Array(verts.length),
            itemSize: 3, offset: 0
        });
        //g.numItems = this.ot.vertices.length / 3;
        g.setIndices(this.del.triangles);

        var m;
        tge.geometry.calculate_normals(g);



        m = this.addMesh(new tge.mesh(g, new tge.phong_material()));
        m.material.setAmbient(0, 0, 0);
        m.material.wireframe = true;

        m = this.addMesh(new tge.mesh(g, new tge.phong_material()));
        //m.material.setFlag(tge.SHADING.DOUBLE_SIDES);
        m.material.setFlag(tge.SHADING.RECEIVE_SHADOW);
        // m.material.wireframe = true; // 
        // m.material.setTansparency(0.99);
        // m.material.drawType = GL_LINES;



        return (this);

    }


    function planet3(data) {
        _super.apply(this);


        var g = tge.geometry.cube({ size: 50, divs: 4 });

        m = this.addMesh(new tge.mesh(g, new tge.phong_material()));
        m.material.wireframe = true;

        var vv = g.attributes.tge_a_position.data;
        var nn = g.attributes.tge_a_normal.data;
        var x, y, z;
        var v = vec3();
        for (var i = 0; i < vv.length; i += 3) {
            x = vv[i];
            y = vv[i + 1];
            z = vv[i + 2];
            vec3.set(v, x, y, z);
            vec3.normalize(v, v);

            nn[i] = v[0];
            nn[i + 1] = v[1];
            nn[i + 2] = v[2];

            vec3.scale(v, v, 10);



            vv[i] = v[0];
            vv[i + 1] = v[1];
            vv[i + 2] = v[2];




        }



        return (this);

    }



    var gg = tge.geometry.cube({ divs: 8, sphereRadius:30});
    function planet4(data) {
        _super.apply(this);





        var g = tge.geometry.indexed_to_flat(gg);
        m = this.addMesh(new tge.mesh(g, new tge.phong_material()));

        
       // m.material.wireframe = true;
       // m.material.setFlag(tge.SHADING.DOUBLE_SIDES);

        var vv = g.attributes.tge_a_position.data;        
        var x, y, z;
        var v = vec3();
        for (var i = 0; i < vv.length; i += 3) {
            x = vv[i];
            y = vv[i + 1];
            z = vv[i + 2];
            vec3.set(v, x, y, z);
            vec3.normalize(v, v);
            vec3.scale(v, v,130);

            vv[i] = v[0];
            vv[i + 1] = v[1];
            vv[i + 2] = v[2];




        }

        tge.geometry.calculate_normals(m.geo, true);

        var lines = tge.geometry.line_geometry_builder;
        lines.clear();


        
        var normals = m.geo.attributes.tge_a_normal.data;
        var vertices = m.geo.attributes.tge_a_position.data;
        for (var i = 0; i < normals.length ; i += 9) {
            
            vec3.set(v,
                (vertices[i + 0] + vertices[i + 3] + vertices[i + 6])/3,
                (vertices[i + 1] + vertices[i + 4] + vertices[i + 7])/3,
                (vertices[i + 2] + vertices[i + 5] + vertices[i + 8])/3,
            );
            
           // vec3.set(vv, vertices[i + 0], vertices[i + 1], vertices[i + 2]);

            lines.add(v[0], v[1], v[2]);

            v[0] += normals[i] * 2;
            v[1] += normals[i + 1] * 2;
            v[2] += normals[i + 2] * 2;

            lines.add(v[0], v[1], v[2]);

        }
        /*
        lines.clear();
        for (var lat = -90; lat < 90; lat+=1) {
            for (var lon = -180; lon < 180; lon+=5) {
                toPoint(v, 50, lat, lon);
                lines.add(v[0], v[1], v[2]);
            }
        }
        */
        //tge.material.LinesSelected
       // m = this.addMesh(new tge.mesh(lines.build(), new tge.phong_material()));
       // m.material.drawType = GL_LINES;

        function vec(index) {
            return new Float32Array(vertices.buffer, (index*3) * 4, 3);
        }

        var verts = [];
        function pushVertex(v) {
            verts.push(v[0], v[1], v[2]);
        }

        function subdivideFace(a, b, c, detail) {

            var cols = Math.pow(2, detail);            
            var v = [];
            var i, j;
            console.log(a);
            console.log(b);
            console.log(c);
            var aj = vec3(), bj = vec3(), cj = vec3();
            for (i = 0; i <= cols; i++) {
                v[i] = [];

                vec3.lerp(aj, a, c, i / cols);
                vec3.lerp(bj, b, c, i / cols);


                var rows = cols - i;

                for (j = 0; j <= rows; j++) {

                    if (j === 0 && i === cols) {

                        v[i][j] = [aj[0], aj[1], aj[2]];

                    } else {
                        vec3.lerp(cj, aj, bj, j / rows);

                        v[i][j] = [cj[0], cj[1], cj[2]];

                    }

                }

            }




            // construct all of the faces

            for (i = 0; i < cols; i++) {

                for (j = 0; j < 2 * (cols - i) - 1; j++) {

                    var k = Math.floor(j / 2);

                    if (j % 2 === 0) {

                        pushVertex(v[i][k + 1]);
                        pushVertex(v[i + 1][k]);
                        pushVertex(v[i][k]);

                    } else {

                        pushVertex(v[i][k + 1]);
                        pushVertex(v[i + 1][k + 1]);
                        pushVertex(v[i + 1][k]);

                    }

                }

            }

            console.log(verts);

        }

        


        subdivideFace(vec(0), vec(1), vec(2), 2);
        subdivideFace(vec(3), vec(4), vec(5), 2);

        for (var i = 0; i < verts.length; i += 3) {
            vec3.set(v, verts[i], verts[i + 1], verts[i + 2]);
            vec3.normalize(v, v);
            vec3.scale(v, v, 130);
            verts[i] = v[0];
            verts[i + 1] = v[1];
            verts[i + 2] = v[2];
        }


        m = this.addMesh(new tge.mesh(tge.geometry.create(new Float32Array(verts)), new tge.phong_material()));
         m.material.wireframe = true;
        m.material.setAmbient(0, 1, 0);
       // m.material.drawType = GL_POINTS;
        console.log("mesh", m);
        return (this);

    }


    function planet5(data) {
        _super.apply(this);


        var m;


        var v = vec3();
        
        var verts = [];
        function pushVertex(v) {
            verts.push(v[0], v[1], v[2]);
        }

        function subdivideFace(a, b, c, detail) {


            var cols = Math.pow(2, detail);
            var v = [];
            var i, j;            
            var aj = vec3(), bj = vec3(), cj = vec3();
            for (i = 0; i <= cols; i++) {
                v[i] = [];

                vec3.lerp(aj, a, c, i / cols);
                vec3.lerp(bj, b, c, i / cols);


                var rows = cols - i;

                for (j = 0; j <= rows; j++) {

                    if (j === 0 && i === cols) {

                        v[i][j] = [aj[0], aj[1], aj[2]];

                    } else {
                        vec3.lerp(cj, aj, bj, j / rows);

                        v[i][j] = [cj[0], cj[1], cj[2]];

                    }

                }

            }




            // construct all of the faces

            for (i = 0; i < cols; i++) {

                for (j = 0; j < 2 * (cols - i) - 1; j++) {

                    var k = Math.floor(j / 2);

                    if (j % 2 === 0) {

                        pushVertex(v[i][k + 1]);
                        pushVertex(v[i + 1][k]);
                        pushVertex(v[i][k]);

                    } else {

                        pushVertex(v[i][k + 1]);
                        pushVertex(v[i + 1][k + 1]);
                        pushVertex(v[i + 1][k]);

                    }

                }

            }


        }




        subdivideFace(vec3(-1, 1, 1), vec3(1, 1, 1), vec3(-1, -1,1), 5);

        subdivideFace(vec3(-1, -1, 1), vec3(1, 1, 1), vec3(1, -1, 1), 5);




        for (var i = 0; i < verts.length; i += 3) {
            vec3.set(v, verts[i], verts[i + 1], verts[i + 2]);
            vec3.normalize(v, v);
            vec3.scale(v, v,50);
            verts[i] = v[0] ;
            verts[i + 1] = v[1];
            verts[i + 2] = v[2];
        }


        m = this.addMesh(new tge.mesh(tge.geometry.create(new Float32Array(verts)), new tge.phong_material()));
        m.material.wireframe = true;
        //m.material.setAmbient(0, 1, 0);
        // m.material.drawType = GL_POINTS;
        console.log("mesh", m);

        this.setPosition(0, 0, -100);
        return (this);

    }

    var v1 = vec3(), v2 = vec3(), v3 = vec3();
    var v1v2 = vec3(), v1v3 = vec3(), normal = vec3();

    function planet6(data) {
        _super.apply(this);



        var verts = [], triangles = [];
        var pverts = [];

        var axisA = vec3(), axisB = vec3(),vv=vec3();
        var xp, yp;
        var vx, vy, vz;
        var triIndex = 0, i = 0,rad=30;
        function addPlane(res, localUp) {
            res = 3;
            vec3.set(axisA, localUp[1], localUp[2], localUp[0]);
            vec3.cross(axisB, localUp, axisA);


            for (var y = 0; y < res; y++) {
                for (var x = 0; x < res; x++) {

                    xp = x / (res - 1);
                    yp = y / (res - 1);

                    vx = localUp[0] + (xp - 0.5) * 2 * axisA[0] + (yp - 0.5) * 2 * axisB[0];
                    vy = localUp[1] + (xp - 0.5) * 2 * axisA[1] + (yp - 0.5) * 2 * axisB[1];
                    vz = localUp[2] + (xp - 0.5) * 2 * axisA[2] + (yp - 0.5) * 2 * axisB[2];


                    vec3.set(vv, vx, vy, vz);
                    vec3.normalize(vv, vv);
                    vec3.scale(vv, vv, rad);

                    verts.push(vv[0], vv[1], vv[2]);

                   // pverts.push(vv[0], vv[1], vv[2]);

                    i = x + y * res;
                    i = (verts.length / 3)-1;

                    if (x !== res - 1 && y !== res - 1) {
                        triangles[triIndex] = i;
                        triangles[triIndex + 1] = i + res + 1;
                        triangles[triIndex + 2] = i + res;


                        triangles[triIndex + 3] = i;
                        triangles[triIndex + 4] = i + 1;
                        triangles[triIndex + 5] = i + res + 1;

                        triIndex += 6;
                    }


                }
            }

        }


      //  addPlane(4, vec3(0, 1, 0));
      //  addPlane(4, vec3(0, -1, 0));
      //  addPlane(4, vec3(-1, 0, 0));
       /// addPlane(4, vec3(1, 0, 0));
       // addPlane(4, vec3(0, 0, -1));
        addPlane(8, vec3(0, 0, 1));
        addPlane(8, vec3(0, 0, -1));

        addPlane(8, vec3(0, 1, 0));
        addPlane(8, vec3(0, -1, 0));


        addPlane(8, vec3(-1, 0, 0));
        addPlane(8, vec3(1, 0, 0));

        this.faces = [];

        
        var vi;
        this.triangles = triangles;
        this.verts = verts;
        var cent = vec3(),dist=0;
        for (var t = 0; t < triangles.length; t += 3) {
            vi = (triangles[t]) * 3;
            vec3.set(v1, verts[vi], verts[vi + 1], verts[vi + 2]);
            vi = (triangles[t+1]) * 3;
            vec3.set(v2, verts[vi], verts[vi + 1], verts[vi + 2]);
            vi = (triangles[t+2]) * 3;
            vec3.set(v3, verts[vi], verts[vi + 1], verts[vi + 2]);

            vec3.subtract(v1v2, v3, v2);
            vec3.subtract(v1v3, v1, v2);

            vec3.cross(normal, v1v2, v1v3);
            vec3.normalize(normal, normal);

            vec3.set(cent,
                (v1[0] + v2[0] + v3[0]) / 3,
                (v1[1] + v2[1] + v3[1]) / 3,
                (v1[2] + v2[2] + v3[2]) / 3
            );

            
            dist = Math.max(vec3.distance(cent, v1), Math.max(vec3.distance(cent, v2), vec3.distance(cent, v3)));
            this.faces.push([
                [normal[0], normal[1], normal[2]],
                [cent[0], cent[1], cent[2],dist],
            [v1[0], v1[1], v1[2]],
            [v2[0], v2[1], v2[2]],
            [v3[0], v3[1], v3[2]]
            ]);

           
//            pverts.push(v2[0], v2[1], v2[2]);
            //pverts.push(v3[0], v3[1], v3[2]);
            
          

            pverts.push(cent[0], cent[1], cent[2]);
            pverts.push(cent[0] + normal[0] * 3, cent[1] + normal[1] * 3, cent[2] + normal[2] * 3);


        }


        
       // g = tge.geometry.indexed_to_flat(g);

       // tge.geometry.calculate_normals(g,true);

        var m = this.addMesh(new tge.mesh(tge.geometry.create(new Float32Array(pverts)), tge.material.LinesSelected));

      


        this.pGeo = tge.geometry.indexed_to_flat(tge.geometry.sphere({ size: 10 }));

        this.pGeo.indexData = null;

        m = this.addMesh(new tge.mesh(this.pGeo, new tge.material()));
        m.material.setAmbient(0, 1, 0);
        m.material.wireframe = true;


        var g = tge.geometry.create(new Float32Array(verts));
        g.setIndices(triangles);
         m = this.addMesh(new tge.mesh(g, new tge.phong_material()));
       m.material.setAmbient(1,1, 1);
        m.material.wireframe = true;
        m.material.setTansparency(0.7);

        return (this);

    }

    var t = 0, i = 0, vi, ang, verts = [];
    var dec = vec3(),cpos=vec3();
    proto.update_planet = function (camera) {


        verts.length = 0;
        for (i = 0; i < this.faces.length; i++) {


            vec3.multiply(cpos, camera.worldPosition, camera.fwVector);
            vi = this.faces[i][1];
            vec3.subtract(dec, cpos, vi);
            vec3.normalize(dec, dec);

           // dec[0] += camera.fwVector[0];
         //   dec[1] += camera.fwVector[1];
          //  dec[2] += camera.fwVector[2];

            vec3.normalize(dec, dec);

            vec3.set(v1,
                this.faces[i][0][0] + camera.fwVector[0],
                this.faces[i][0][1] + camera.fwVector[1],
                this.faces[i][0][2] + camera.fwVector[2]
            )
            vec3.normalize(v1, v1);

            vec3.copy(v1, this.faces[i][1]);
            
            ang = (-vec3.dot(v1, dec)) ;

            ang = 1;
            if (camera.pointFrustumDistance(vi[0], vi[1], vi[2]) > 0.4) {
                ang = 0.2;
            }

            if (ang ===0.2) {
                vi = this.faces[i][2];
                verts.push(vi[0], vi[1], vi[2]);
                vi = this.faces[i][3];
                verts.push(vi[0], vi[1], vi[2]);
                vi = this.faces[i][4];
                verts.push(vi[0], vi[1], vi[2]);
            }
            

        }

        //console.log(verts.length);
        this.pGeo.attributes.tge_a_position.data = new Float32Array(verts);
        this.pGeo.attributes.tge_a_position.needsUpdate = true;
        this.pGeo.numItems = verts.length / 3;

    };




    function Tri(a, b, c,parent,level) {

    }


    function planet() {
        _super.apply(this);

        var m = this.addMesh(new tge.mesh(tge.geometry.icosahedron(50), new tge.phong_material()));

        var vertices = $maptypedarray(m.geo.attributes.tge_a_position.data, 3);
        var traingles = $maptypedarray(m.geo.indexData, 3);

        console.log(vertices, traingles);

       // m.material.wireframe = true;
        return (this);

    }

    proto.update_planet = function (camera) {

    };

    return planet;

}, tge.model);
