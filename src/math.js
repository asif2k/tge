

tge.createFloat32 = (function (len, creator) {
    creator = creator || function (out) {
        return out;
    }
    let x = 0;
    return function () {
        let out = new Float32Array(len);
        if (arguments.length === 1 && arguments[0].length > len - 1) {
            for (x = 0; x < arguments[0].length; x++)
                if (x < len) out[x] = arguments[0][x];
        }
        else {
            for (x = 0; x < arguments.length; x++)
                if (x < len) out[x] = arguments[x];
        }
        return creator(out);
    }
});






(function () {

    let a00, a10, a20, a30, a01, a11, a21, a31, a02, a12, a22, a32, a03, a13, a23, a33;
    let b0, b1, b2, b3;
    let x, y, z, w, len, f, nf, lr, bt;
    let A, B, C, D, E, F, G, H, I, J;
    var b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, det;
    var _sx, _cx, _sy, _cy, _sz, _cz, _q, _pi, _yw, _ro;
    var _x, _y, _z, _w, _x2, _y2, _z2, _xx, _xy, _xz, _yx, _yy, _yz, _wx, _wy, _wz;


    tge.DEGTORAD = 0.017453292519943295;
    tge.RADTODEG = 57.295779513082323;
    tge.Epsilon = 1.192092896e-012;
    tge.ZeroEpsilonSq = tge.Epsilon * tge.Epsilon;

    tge.vec2 = tge.createFloat32(2);
    $assign(tge.vec2, {
        clone: function (a) {
            return tge.vec2(a);
        },
        getLength: function (a) {
            x = a[0];
            y = a[1];           
            return Math.hypot(x, y);
        },
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];           
            return out;
        },

        set: function (out, x, y) {
            out[0] = x;
            out[1] = y;
           
            return out;
        },
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            
            return out;
        },
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
           
            return out;
        },
        multiply: function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            
            return out;
        },
        divide: function (out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            
            return out;
        },
        min: function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
           
            return out;
        },
        max: function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            
            return out;
        },
        scale: function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            
            return out;
        },
        scaleAndAdd: function (out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            
            return out;
        },
        distance: function (a, b) {
            x = b[0] - a[0];
            y = b[1] - a[1];
           
            return Math.hypot(x, y);
        },
        squaredDistance: function (a, b) {
            x = b[0] - a[0];
            y = b[1] - a[1];
           
            return x * x + y * y;
        },

        squaredLength: function (a) {
            return a[0] * a[0] + a[1] * a[1] ;
        },
        inverse: function (out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            
            return out;
        },
        normalize: function (out, a) {
            x = a[0];
            y = a[1];
           
            len = x * x + y * y ;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
            }
            out[0] = x * len;
            out[1] = y * len;
           
            return out;
        },
        dot: function (a, b) {
            return a[0] * b[0] + a[1] * b[1] ;
        },
        zero: function (out) {
            out[0] = 0.0;
            out[1] = 0.0;        
            return out;
        }

    });


    tge.vec3 = tge.createFloat32(3);
    $assign(tge.vec3, {
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        },
        set: function (out, x, y, z) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        },
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        },
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        },
        multiply: function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            return out;
        },
        scale: function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            return out;
        },
        min: function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            return out;
        },
        max: function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            return out;
        },
        dot: function (a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        },
        normalize: function (out, a) {
            x = a[0];
            y = a[1];
            z = a[2];
            len = x * x + y * y + z * z;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
            }
            out[0] = a[0] * len;
            out[1] = a[1] * len;
            out[2] = a[2] * len;
            return out;
        },
        cross: function (out, a, b) {
            ax = a[0]; ay = a[1]; az = a[2];
            bx = b[0]; by = b[1]; bz = b[2];

            out[0] = ay * bz - az * by;
            out[1] = az * bx - ax * bz;
            out[2] = ax * by - ay * bx;
            return out;
        },
        getLength: function (a) {
            return Math.hypot(a[0], a[1], a[2]);
        },
        distance: function (a, b) {
            return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        },
    });

    tge.vec4 = tge.createFloat32(4);
    $assign(tge.vec4, {        
        clone: function (a) {
            return tge.vec4(a);            
        },
        getLength: function (a) {
            x = a[0];
            y = a[1];
            z = a[2];
            return Math.hypot(x, y, z);
        },
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        },

        set: function (out, x, y, z, w) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        },
        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            return out;
        },
        subtract: function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            return out;
        },
        multiply: function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            out[3] = a[3] * b[3];
            return out;
        },
        divide: function (out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            out[2] = a[2] / b[2];
            out[3] = a[3] / b[3];
            return out;
        },
        min: function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            out[3] = Math.min(a[3], b[3]);
            return out;
        },
        max: function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            out[3] = Math.max(a[3], b[3]);
            return out;
        },
        scale: function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            return out;
        },
        scaleAndAdd: function (out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            out[3] = a[3] + (b[3] * scale);
            return out;
        },
        distance: function (a, b) {
            x = b[0] - a[0];
            y = b[1] - a[1];
            z = b[2] - a[2];
            w = b[3] - a[3];
            return Math.hypot(x, y, z, w);
        },
        squaredDistance: function (a, b) {
            x = b[0] - a[0];
            y = b[1] - a[1];
            z = b[2] - a[2];
            w = b[3] - a[3];
            return x * x + y * y + z * z + w * w;
        },
       
        squaredLength: function (a) {
            return a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
        },
        inverse: function (out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            out[2] = 1.0 / a[2];
            out[3] = 1.0 / a[3];
            return out;
        },
        normalize: function (out, a) {
            x = a[0];
            y = a[1];
            z = a[2];
            w = a[3];
            len = x * x + y * y + z * z + w * w;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
            }
            out[0] = x * len;
            out[1] = y * len;
            out[2] = z * len;
            out[3] = w * len;
            return out;
        },
        dot: function (a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        },
        cross: function (out, u, v, w) {
            A = (v[0] * w[1]) - (v[1] * w[0]);
            B = (v[0] * w[2]) - (v[2] * w[0]);
            C = (v[0] * w[3]) - (v[3] * w[0]);
            D = (v[1] * w[2]) - (v[2] * w[1]);
            E = (v[1] * w[3]) - (v[3] * w[1]);
            F = (v[2] * w[3]) - (v[3] * w[2]);
            G = u[0];
            H = u[1];
            I = u[2];
            J = u[3];

            out[0] = (H * F) - (I * E) + (J * D);
            out[1] = -(G * F) + (I * C) - (J * B);
            out[2] = (G * E) - (H * C) + (J * A);
            out[3] = -(G * D) + (H * B) - (I * A);

            return out;
        },
        transformMat4: function (out, a, m) {
            x = a[0]; y = a[1]; z = a[2]; w = a[3];
            out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
            return out;
        },
        zero: function (out) {
            out[0] = 0.0;
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 0.0;
            return out;
        }

    });


    tge.bb3 = tge.createFloat32(6);
    $assign(tge.bb3, {
        points: [
            0, 4, 2,
            3, 4, 2,
            0, 1, 2,
            3, 1, 2,
            0, 4, 5,
            3, 4, 5,
            0, 1, 5,
            3, 1, 5],       
        reset: function (out) {
            out[0] = 99999;
            out[1] = 99999;
            out[2] = 99999;
            out[3] = -99999;
            out[4] = -99999;
            out[5] = -99999;
            return (out);
        },
        expand: function () {

        },
        transformMat4: function (out, bb3, mat) {
            this.reset(out);
            for (I = 0; I < 24; I += 3) {
                tge.vec3.transformMat4v(vert, bb3[this.points[I]], bb3[this.points[I + 1]], bb3[this.points[I + 2]], mat);
                tge.bb3.setMin(out, vert[0], vert[1], vert[2]);
                tge.bb3.setMax(out, vert[0], vert[1], vert[2]);
            }

            return out;
        },
        transformMat4x: (function () {
            var i, j, e, k, ii;
            return function (out, bb3, mat) {
                for (i = 0; i < 3; i++) {
                    out[i] = mat[12 + i];
                    out[3 + i] = out[i];
                    for (j = 0; j < 3; j++) {
                        ii = i * 4 + j;
                        e = mat[ii] * bb3[j];
                        f = mat[ii] * bb3[3 + j];
                        if (e < f) {
                            out[i] += e;
                            out[3 + i] += f;
                        } else {
                            out[i] += f;
                            out[3 + i] += e;
                        }
                    }

                }
                return out;
            }
        })(),
        setMin: function (out, x, y, z) {
            out[0] = Math.min(out[0], x);
            out[1] = Math.min(out[1], y);
            out[2] = Math.min(out[2], z);
            return (out);
        },
        setMax: function (out, x, y, z) {
            out[3] = Math.max(out[3], x);
            out[4] = Math.max(out[4], y);
            out[5] = Math.max(out[5], z);

            return (out);
        },
        include: function (out, bb) {
            tge.bb3.setMin(out, bb[0], bb[1], bb[2]);
            tge.bb3.setMax(out, bb[3], bb[4], bb[5]);
        },
        includePoint: function (out, x, y, z) {
            tge.bb3.setMin(out, x, y, z);
            tge.bb3.setMax(out, x, y, z);
        }

    });




    tge.aabb = tge.createFloat32(6);
    $assign(tge.aabb, {
        set: function (out, x, y, z, w, h, d) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            out[4] = h;
            out[5] = d;
            return (out);
        },        
        transformMat4: function (out, bb3, mat) {
            this.reset(out);
            for (I = 0; I < 24; I += 3) {
                tge.vec3.transformMat4v(vert, bb3[this.points[I]], bb3[this.points[I + 1]], bb3[this.points[I + 2]], mat);
                tge.bb3.setMin(out, vert[0], vert[1], vert[2]);
                tge.bb3.setMax(out, vert[0], vert[1], vert[2]);
            }

            return out;
        },
        transformMat4x: (function () {
            var i, j, ii;
            return function (out, size, mat) {
                for (i = 0; i < 3; i++) {
                    out[i] = mat[12 + i];
                    out[3 + i] = 0;
                    for (j = 0; j < 3; j++) {
                        ii = i * 4 + j;
                        out[3 + i] += Math.abs(mat[ii]) * size[j];
                    }
                }
                return out;
            }
        })(),
        transformMat3: (function () {
            var i, j, ii;
            return function (out, a, mat) {
                for (i = 0; i < 3; i++) {
                    out[3 + i] = 0;
                    for (j = 0; j < 3; j++) {
                        ii = i * 3 + j;
                        out[3 + i] += Math.abs(mat[ii]) * a[j + 3];
                    }
                }
                return out;
            }
        })()

    });








    tge.quat = tge.createFloat32(4);
    $assign(tge.quat, {
        clone: function (a) {
            return tge.quat(a);
        },
        create: function () {

            var out = new Float32Array(4);
            out.fill(0);
            out[3] = 1;
            if (arguments.length === 1 && arguments[0].length > 3) {
                for (x = 0; x < arguments[0].length; x++)
                    out[x] = Math.round(arguments[0][x]);
            }
            else {
                for (x = 0; x < arguments.length; x++)
                    out[x] = arguments[x];
            }


            return out;

        },
        set: tge.vec4.set,
        add: tge.vec4.add,
        copy: tge.vec4.copy,
        scaleAndAdd: tge.vec4.scaleAndAdd,
        squaredLength: tge.vec4.squaredLength,
        normalize: tge.vec4.normalize,
        rotateEular: function (q, x, y, z) {
            _pi = x * 0.5;
            _yw = y * 0.5;
            _ro = z * 0.5;

            _sx = Math.sin(_pi);
            _cx = Math.cos(_pi);
            _sy = Math.sin(_yw);
            _cy = Math.cos(_yw);
            _sz = Math.sin(_ro);
            _cz = Math.cos(_ro);
            q[0] = _sx * _cy * _cz - _cx * _sy * _sz;
            q[1] = _cx * _sy * _cz + _sx * _cy * _sz;
            q[2] = _cx * _cy * _sz - _sx * _sy * _cz;
            q[3] = _cx * _cy * _cz + _sx * _sy * _sz;

            return q;
        },
        toMatrix: function (q, mat) {
            _x = q[0]; _y = q[1]; _z = q[2]; _w = q[3];
            _x2 = _x + _x; _y2 = _y + _y; _z2 = _z + _z;

            _xx = _x * _x2;
            _xy = _x * _y2;
            _xz = _x * _z2;
            _yy = _y * _y2;
            _yz = _y * _z2;
            _zz = _z * _z2;
            _wx = _w * _x2;
            _wy = _w * _y2;
            _wz = _w * _z2;


            mat[0] = (1 - (_yy + _zz));
            mat[1] = (_xy + _wz);
            mat[2] = (_xz - _wy);
            mat[3] = 0;
            mat[4] = (_xy - _wz);
            mat[5] = (1 - (_xx + _zz));
            mat[6] = (_yz + _wx);
            mat[7] = 0;
            mat[8] = (_xz + _wy);
            mat[9] = (_yz - _wx);
            mat[10] = (1 - (_xx + _yy));
            mat[11] = 0;
            return mat;
        },
        toMatrixWithScale: function (q, mat, scale) {
            tge.quat.toMatrix(q, mat);
            mat[0] *= scale[0];
            mat[1] *= scale[0];
            mat[2] *= scale[0];

            mat[4] *= scale[1];
            mat[5] *= scale[1];
            mat[6] *= scale[1];


            mat[8] *= scale[2];
            mat[9] *= scale[2];
            mat[10] *= scale[2];
            return mat;
        },

    });

    tge.mat3 = tge.createFloat32(9, function (out) {
        out[0] = 1;
        out[4] = 1;
        out[8] = 1;
        return out;
    });
    $assign(tge.mat3, {
        identity: function (out) {
            out.fill(0);
            out[0] = 1;
            out[4] = 1;
            out[8] = 1;
            return out;
        },
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        },

        add: function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            out[6] = a[6] + b[6];
            out[7] = a[7] + b[7];
            out[8] = a[8] + b[8];
            return out;
        },
        translateRotateScale: function (out, x, y, sx, sy, rad) {

            B = Math.sin(rad);
            C = Math.cos(rad);

            out[0] = (C * 1 + B * 0) * sx;
            out[1] = (C * 0 + B * 1) * sx;
            out[2] = (C * 0 + B * 0) * sx;

            out[3] = (C * 0 - B * 1) * sy;
            out[4] = (C * 1 - B * 0) * sy;
            out[5] = (C * 0 - B * 0) * sy;

            out[6] = x * out[0] + y * out[3];
            out[7] = x * out[1] + y * out[4];
            out[8] = x * out[2] + y * out[5];
            return out;

        },
        transformVec2: function (out, a, m) {
            x = a[0]; y = a[1];
            out[0] = m[0] * x + m[3] * y + m[6];
            out[1] = m[1] * x + m[4] * y + m[7];
            return out;
        },
        multiply: function (out, a, b) {
            a00 = a[0]; a01 = a[1]; a02 = a[2];
            a10 = a[3]; a11 = a[4]; a12 = a[5];
            a20 = a[6]; a21 = a[7]; a22 = a[8];

            b00 = b[0]; b01 = b[1]; b02 = b[2];
            b10 = b[3]; b11 = b[4]; b12 = b[5];
            b20 = b[6]; b21 = b[7]; b22 = b[8];

            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b00 * a02 + b01 * a12 + b02 * a22;

            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b10 * a02 + b11 * a12 + b12 * a22;

            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return out;
        },
        multiplyScaler: function (out, a, s) {
            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;
            out[3] = a[3] * s;
            out[4] = a[4] * s;
            out[5] = a[5] * s;
            out[6] = a[6] * s;
            out[7] = a[7] * s;
            out[8] = a[8] * s;
            return out;
        },
        normalFromMat4: function (out, a) {
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
            a30 = a[12]; a31 = a[13]; a32 = a[14]; a33 = a[15];

            b00 = a00 * a11 - a01 * a10;
            b01 = a00 * a12 - a02 * a10;
            b02 = a00 * a13 - a03 * a10;
            b03 = a01 * a12 - a02 * a11;
            b04 = a01 * a13 - a03 * a11;
            b05 = a02 * a13 - a03 * a12;
            b06 = a20 * a31 - a21 * a30;
            b07 = a20 * a32 - a22 * a30;
            b08 = a20 * a33 - a23 * a30;
            b09 = a21 * a32 - a22 * a31;
            b10 = a21 * a33 - a23 * a31;
            b11 = a22 * a33 - a23 * a32;

            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

            return out;
        },
        transform: function (out, a, m) {
            x = a[0]; y = a[1]; z = a[2];

            out[0] = x * m[0] + y * m[1] + y * m[2];
            out[1] = x * m[3] + y * m[4] + y * m[5];
            out[2] = x * m[6] + y * m[7] + y * m[8];


            return out;
        },
    });


    tge.mat4 = tge.createFloat32(16, function (out) {
        out[0] = 1;
        out[5] = 1;
        out[10] = 1;
        out[15] = 1;
        return out;
    });
    $assign(tge.mat4, {
        identity: function (out) {
            out.fill(0);
            out[0] = 1;
            out[5] = 1;
            out[10] = 1;
            out[15] = 1;
            return out;
        },
        copy: function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        },
        multiply: function (out, a, b) {
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
            a30 = a[12]; a31 = a[13]; a32 = a[14]; a33 = a[15];


            b0 = b[0]; b1 = b[1]; b2 = b[2]; b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            return out;
        },
        fromScaling: function (out, v) {
            out[0] = v[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = v[1];
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = v[2];
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        },
        perspective: function (out, fovy, aspect, near, far) {
            f = 1.0 / Math.tan(fovy / 2); nf;
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[15] = 0;
            if (far != null && far !== Infinity) {
                nf = 1 / (near - far);
                out[10] = (far + near) * nf;
                out[14] = (2 * far * near) * nf;
            } else {
                out[10] = -1;
                out[14] = -2 * near;
            }
            return out;
        },
        ortho: function (out, left, right, bottom, top, near, far) {
            lr = 1 / (left - right);
            bt = 1 / (bottom - top);
            nf = 1 / (near - far);
            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (far + near) * nf;
            out[15] = 1;
            return out;
        },
        invert: function (out, a) {
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
            a30 = a[12]; a31 = a[13]; a32 = a[14]; a33 = a[15];

            b00 = a00 * a11 - a01 * a10;
            b01 = a00 * a12 - a02 * a10;
            b02 = a00 * a13 - a03 * a10;
            b03 = a01 * a12 - a02 * a11;
            b04 = a01 * a13 - a03 * a11;
            b05 = a02 * a13 - a03 * a12;
            b06 = a20 * a31 - a21 * a30;
            b07 = a20 * a32 - a22 * a30;
            b08 = a20 * a33 - a23 * a30;
            b09 = a21 * a32 - a22 * a31;
            b10 = a21 * a33 - a23 * a31;
            b11 = a22 * a33 - a23 * a32;


            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return out;
        },
        fromSacalingAndPosition: function (out, x, y, z, sx, sy, sz) {

            out[0] = sx;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = sy;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = sz;
            out[12] = x;
            out[13] = y;
            out[14] = z;
            out[15] = 1;


            return (out);

        },
        transpose: function (out, a) {
            a01 = a[1]; a02 = a[2]; a03 = a[3];
            a12 = a[6]; a13 = a[7]; a23 = a[11];

            out[1] = a[4];
            out[2] = a[8];
            out[3] = a[12];
            out[4] = a01;
            out[6] = a[9];
            out[7] = a[13];
            out[8] = a02;
            out[9] = a12;
            out[11] = a[14];
            out[12] = a03;
            out[13] = a13;
            out[14] = a23;

            return out;
        }


    });

})();

