
/*src/common.js*/


//constants 

window.performance = window.performance || {};
window.performance.now = (function () { return performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () { return new Date().getTime(); }; })();

var $guidi = (function () {
    var guidCounter = 0;
    return function () {
        return (Date.now() + guidCounter++);
    }
})();

var $assign = Object.assign;

$smartarray = function () {
    this.data = [];
    this.length = 0;
    this.index = 0;

    this.push = function (element) {
        this.data[this.length++] = element;
    }

    this.peek = function () {
        return this.data[this.length - 1];
    }

    this.pop = function () {
        if (this.length === 0) return null;
        return this.data[--this.length];
    }

    this.clear = function () {
        this.length = 0;
    }

    this.getNext = function () {
        return this.data[this.index++];
    };

    return (this);
};

var $merge = (function () {
    var key, type;
    var func = function (source, dest, mergeOnlyNotExist) {
        for (key in source) {
            type = Object.prototype.toString.call(source[key]).toLocaleLowerCase();
            if (type === '[object object]') {
                if (dest[key] !== undefined) func(source[key], dest[key], mergeOnlyNotExist);
                else if (mergeOnlyNotExist) {
                    dest[key] = {};
                    func(source[key], dest[key], mergeOnlyNotExist);
                }
            }
            else {
                if (mergeOnlyNotExist) {
                    if (dest[key] === undefined) {
                        dest[key] = source[key];
                    }
                }
                else {
                    dest[key] = source[key];
                }


            }
        }
        return dest;
    }
    return func;

})();

var $eventsystem = function () {
    return (function (name, params) {
        var self = this;

        if (!name) {
            for (var e in this.eventsListers) {
                this.eventsListers[e] = [];
            }
            this.eventsListers = {}
            return;
        }
        if (!this.eventsListers) this.eventsListers = {};



        if (params && typeof params == 'function') {
            if (!this.eventsListers[name]) this.eventsListers[name] = [];
            this.eventsListers[name].push(params);
        }
        else {
            if (this.eventsListers[name]) {
                for (var e = 0; e < this.eventsListers[name].length; e++)
                    if (this.eventsListers[name][e].apply(this, params) === false) {
                        return;
                    }

            }
        }

    });
};

function $str (str, arg1, arg2, arg3, arg4, arg5) {
    str = "var arr=[];arr.push('" + str
        .replace(/\n/g, "\\n")
        .replace(/[\r\t]/g, " ")
        .split("<?").join("\t")
        .replace(/((^|\?>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)\?>/g, "',$1,'")
        .split("\t").join("');")
        .split("?>").join("arr.push('")
        .split("\r").join("\\'")
        + "');return arr.join('');";
    return new Function(arg1, arg2, arg3, arg4, arg5, str);
}



var $extend = function (_creator, _super) {
    _super = _super || Object;
    var proto = {};
    Object.assign(proto, _super.prototype);
    var _class = _creator(proto, _super);
    _class.prototype = Object.create(_super.prototype);
    Object.assign(_class.prototype, proto);
    return (_class);
};


function $eachindex(callback, index) {    
    var func = function (index) {
        callback(index, func);
    };
    func(index || 0);
}

$mergesort = (function (array, comparefn) {
    var i, j, k
    function merge(arr, aux, lo, mid, hi, comparefn) {
        i = lo;
        j = mid + 1;
        k = lo;
        while (true) {
            if (comparefn(arr[i], arr[j]) <= 0) {
                aux[k++] = arr[i++];
                if (i > mid) {
                    do
                        aux[k++] = arr[j++];
                    while (j <= hi);
                    break;
                }
            } else {
                aux[k++] = arr[j++];
                if (j > hi) {
                    do
                        aux[k++] = arr[i++];
                    while (i <= mid);
                    break;
                }
            }
        }
    }

    function sortarrtoaux(arr, aux, lo, hi, comparefn) {
        if (hi < lo) return;
        if (hi == lo) {
            aux[lo] = arr[lo];
            return;
        }
        var mid = Math.floor(lo + (hi - lo) / 2);
        sortarrtoarr(arr, aux, lo, mid, comparefn);
        sortarrtoarr(arr, aux, mid + 1, hi, comparefn);
        merge(arr, aux, lo, mid, hi, comparefn);
    }

    function sortarrtoarr(arr, aux, lo, hi, comparefn) {
        if (hi <= lo) return;
        var mid = Math.floor(lo + (hi - lo) / 2);
        sortarrtoaux(arr, aux, lo, mid, comparefn);
        sortarrtoaux(arr, aux, mid + 1, hi, comparefn);
        merge(aux, arr, lo, mid, hi, comparefn);
    }


    var aux = [];
    function merge_sort(arr, comparefn) {
        aux.length = 0;
        for (i = 0; i < arr.length; i++)
            aux[i] = arr[i];

        sortarrtoarr(arr, aux, 0, arr.length - 1, comparefn);
        return arr;
    }



    return merge_sort;
})();

var tge = {};

$assign(tge, {
    ATTRIBUTES: {
        POSITION: 2,
        NORMALS: 4,
        UVS: 8,
        COLORS: 16,
        TANGENTS: 32
    },
    DRAW_TYPES: {
        TRIANGLES: 4,
        TRIANGLE_FAN: 6,
        TRIANGLE_STRIP: 5,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        POINTS: 0
    },
    BUFFER_DRAWTYPES: {
        STATIC_DRAW: 35044,
        DYNAMIC_DRAW: 35048
    },

    BUFFER_DATATYPES: {
        FLOAT: 5126,
        INT: 5124,
        UNSIGNED_BYTE: 5121,
        UNSIGNED_INT: 5125,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_SHORT_4_4_4_4: 32819,
        UNSIGNED_SHORT_5_5_5_1: 32820,
        UNSIGNED_SHORT_5_6_5: 33635,
    },
    BLEND_FUNC: {
        ZERO: 0,
        ONE: 1,
        SRC_COLOR: 768,
        ONE_MINUS_SRC_COLOR: 769,
        DST_COLOR: 774,
        ONE_MINUS_DST_COLOR: 775,
        SRC_ALPHA: 770,
        DST_ALPHA: 772,
        ONE_MINUS_DST_ALPHA: 773,
        CONSTANT_COLOR: 32769,
        ONE_MINUS_CONSTANT_COLOR: 32770,
        CONSTANT_ALPHA: 32771,
        ONE_MINUS_CONSTANT_ALPHA: 32772,
        SRC_ALPHA_SATURATE: 776,
        ONE_MINUS_SRC_ALPHA: 771
    },
    TEXTURE_PARAMETERS: {
        TEXTURE_2D: 3553,
        TEXTURE_BINDING_2D: 32873,
        TEXTURE_BINDING_CUBE_MAP: 34068,
        TEXTURE_CUBE_MAP: 34067,
        TEXTURE_CUBE_MAP_NEGATIVE_X: 34070,
        TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072,
        TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074,
        TEXTURE_CUBE_MAP_POSITIVE_X: 34069,
        TEXTURE_CUBE_MAP_POSITIVE_Y: 34071,
        TEXTURE_CUBE_MAP_POSITIVE_Z: 34073,
        TEXTURE_MAG_FILTER: 10240,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,

        LINEAR: 9729,
        NEAREST: 9728,
        NEAREST_MIPMAP_LINEAR: 9986,
        NEAREST_MIPMAP_NEAREST: 9984,
        CLAMP_TO_EDGE: 33071,
        LINEAR_MIPMAP_LINEAR: 9987,
        LINEAR_MIPMAP_NEAREST: 9985,
    },


    TEXTURE_FORMAT_TYPE: {
        ALPHA: 6406,
        RGB: 6407,
        RGB5_A1: 32855,
        RGB565: 36194,
        RGBA: 6408,
        RGBA4: 32854,
        LUMINANCE: 6409,
        LUMINANCE_ALPHA: 6410,
        DEPTH_COMPONENT: 6402,
        DEPTH_COMPONENT16: 33189,
        UNSIGNED_BYTE: 5121,
        UNSIGNED_INT: 5125,
        UNSIGNED_SHORT: 5123,
        UNSIGNED_SHORT_4_4_4_4: 32819,
        UNSIGNED_SHORT_5_5_5_1: 32820,
        UNSIGNED_SHORT_5_6_5: 33635,
        VALIDATE_STATUS: 35715,

        DEPTH_ATTACHMENT: 36096,
        COLOR_ATTACHMENT0: 36064,

        NEAREST: 9728,
        NEAREST_MIPMAP_LINEAR: 9986,
        NEAREST_MIPMAP_NEAREST: 9984,
        LINEAR: 9729,
        LINEAR_MIPMAP_LINEAR: 9987,
        LINEAR_MIPMAP_NEAREST: 9985,
    },
    SHADING: {
        FLAT: 2,
        SHADED: 4,
        CAST_SHADOW: 8,
        RECEIVE_SHADOW: 16,
        CAST_REFLECTION: 32,
        RECEIVE_REFLECTION: 64,
        TRANSPARENT: 128,
        OPUQUE: 256,
        DEPTH_TEST: 512,
        NO_DEPTH_TEST: 1024,
        ALPHA_TEXTURE: 2048,

    },
    OBJECT_TYPES: {
        STATIC_LIGHT: 2,
        STATIC_MODEL: 4,
        DYNAMIC_LIGHT: 8,
        DYNAMIC_MODEL: 16,
        MANIPULATORS: 32,
    }


});

tge.OBJECT_TYPES.LIGHTS = tge.OBJECT_TYPES.STATIC_LIGHT + tge.OBJECT_TYPES.DYNAMIC_LIGHT;
tge.OBJECT_TYPES.MODELS = tge.OBJECT_TYPES.STATIC_MODEL + tge.OBJECT_TYPES.DYNAMIC_MODEL + tge.OBJECT_TYPES.MANIPULATORS;

tge.flags = $extend(function (proto) {
    proto.setFlag = function (flag) {
        if (!(this.flags & flag)) {
            this.flags |= flag;
        }
        return (this);
    };


    proto.unsetFlag = function (flag) {
        if ((this.flags & flag) !== 0) {
            this.flags &= ~flag;
        }
        return (this);
    };
   
    return function () {
        this.flags = 0;
        
    };

});

console.log("tge", tge);

/*src/math.js*/



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
        invert: function (out, a) {
            a0 = a[0]; a1 = a[1]; a2 = a[2]; a3 = a[3];
            dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
            invDot = dot ? 1.0 / dot : 0;
            out[0] = -a0 * invDot;
            out[1] = -a1 * invDot;
            out[2] = -a2 * invDot;
            out[3] = a3 * invDot;
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



/*./geometry.js*/


tge.geometry = $extend(function (proto) {

    proto.addAttribute = function (name, attribute) {
        attribute.dest = null;
        attribute.itemSize = attribute.itemSize || 3;
        attribute.data = attribute.data || null;
        attribute.needsUpdate = attribute.needsUpdate || false;
        attribute.divisor = attribute.divisor || 0;
        attribute.array = attribute.array || null;
        this.attributes[name] = attribute;
        return (attribute);
    };
    proto.setIndices = function (indices) {
        this.indexData = new Uint16Array(indices);
        this.numItems = this.indexData.length;
    };
    proto.prepareVerticesList = function (vertexSize) {
        vertexSize = vertexSize || 3;
        this.vertices = [];
        for (var i = 0; i < this.attributes.tge_a_position.data.length / 3; i++) {
            this.vertices[i] = new Float32Array(this.attributes.tge_a_position.data.buffer, (i * vertexSize) * 4, vertexSize);
        }
        return (this.vertices);
    }

    var i = 0

    var pMin = tge.vec3();
    var pMax = tge.vec3();


    var pos;
    proto.calcBoundingSphereSize = function (size) {
        this.boundingSphereSize = size || 0;
        pos = this.attributes.tge_a_position.data;
        tge.vec3.set(pMin, 99999, 99999, 99999);
        tge.vec3.set(pMax, -99999, -99999, -99999);

        for (i = 0; i < pos.length; i += this.vertexSize) {
            this.boundingSphereSize = Math.max(this.boundingSphereSize, Math.abs(Math.hypot(pos[i], pos[i + 1], pos[i + 2])));
            pMin[0] = Math.min(pMin[0], pos[i]);
            pMin[1] = Math.min(pMin[1], pos[i + 1]);
            pMin[2] = Math.min(pMin[2], pos[i + 2]);

            pMax[0] = Math.max(pMax[0], pos[i]);
            pMax[1] = Math.max(pMax[1], pos[i + 1]);
            pMax[2] = Math.max(pMax[2], pos[i + 2]);
        }

        tge.vec3.set(this.size, pMax[0] - pMin[0], pMax[1] - pMin[1], pMax[2] - pMin[2]);
        tge.vec3.scale(this.size, this.size, 0.5);
        return (this.boundingSphereSize);
    };

    var tempvec3 = tge.vec3();
    proto.transform = function (mat4) {
        this.vertexSize = this.vertexSize || 3;
        for (var i = 0; i < this.attributes.tge_a_position.data.length; i += this.vertexSize) {
            tempvec3[0] = this.attributes.tge_a_position.data[i];
            tempvec3[1] = this.attributes.tge_a_position.data[i + 1];
            tempvec3[2] = this.attributes.tge_a_position.data[i + 2];
            Tge.vec3.transformMat4(tempvec3, tempvec3, mat4);

            this.attributes.tge_a_position.data[i] = tempvec3[0];
            this.attributes.tge_a_position.data[i + 1] = tempvec3[1];
            this.attributes.tge_a_position.data[i + 2] = tempvec3[2];
        }

        return (this);
    };
    var tempmat4 = tge.mat4();
    var tempquat = tge.quat();

    proto.scale = function (x, y, z) {

        return this.transform(tge.mat4.fromScaling(tempmat4, [x, y, z]));
    };


    proto.scalePositionRotation = function (sx, sy, sz, x, y, z, rx, ry, rz) {
        return this.transform(
            Tge.quat.toMatrixWithScale(tge.quat.rotateEular(tempquat, rx, ry, rz), tempmat4, [sx, sy, sz])

        );
    };

    proto.scaleAndPosition = function (x, y, z, sx, sy, sz) {
        return this.transform(tge.mat4.fromSacalingAndPosition(tempmat4, x, y, z, sx, sy, sz));
    };

    function geometry() {
        this.compiled = false;
        this.uuid = $guidi();
        this.attributes = {};
        this.indexBuffer = null;
        this.indexData = null;
        this.indexNeedsUpdate = false;
        this.version = 0;
        this.size = tge.vec3();
        return (this);

    }

    geometry.compile = (function () {



        function compileAttribute(gl, att) {
            if (att.dest !== null) att;
            att.stride = att.stride || 0;
            att.offset = att.offset || 0;
            att.needsUpdate = att.needsUpdate || false;
            att.array = att.array || null;
            att.dataType = att.dataType || tge.BUFFER_DATATYPES.FLOAT;
            att.bufferType = att.bufferType || tge.BUFFER_DRAWTYPES.STATIC_DRAW;

            if (att.data) {
                if (!att.dest) att.dest = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, att.dest);
                gl.bufferData(gl.ARRAY_BUFFER, att.data, att.bufferType);
            }
            return (att);
        }

        var id = null;




        geometry.tge_a_color = {
            dataType: tge.BUFFER_DATATYPES.FLOAT,
            itemSize: 4, stride: 0, offset: 0, divisor: 0, array: null,
            data: new Float32Array(60000)
        };
        geometry.tge_a_color.data.fill(1);

        return function (gl, geo) {

            if (!geometry.tge_a_color.dest) {
                compileAttribute(gl, geometry.tge_a_color);
            }



            for (id in geo.attributes) {
                compileAttribute(gl, geo.attributes[id]);
            }

            geo.attributes.tge_a_color = geo.attributes.tge_a_color || geometry.tge_a_color;

            if (geo.indexData) {
                if (!geo.indexBuffer) geo.indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geo.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indexData, gl.DYNAMIC_DRAW);
            }


            geo.compiled = true;
        }
    })();


    geometry.calculate_normals = (function () {
        var v1 = tge.vec3(), v2 = tge.vec3(), v3 = tge.vec3();
        var v1v2 = tge.vec3(), v1v3 = tge.vec3(), normal = tge.vec3();
        var v2v3Alias = tge.vec3(), v2v3Alias = tge.vec3();

        return function (geo) {

            var vertices = geo.attributes.tge_a_position.data;
            var normals = geo.attributes.tge_a_normal.data;
            var indices = geo.indexData;

            normals.fill(0);


            var i1, i2, i3;
            var weight1, weight2;
            for (var j = 0; j < indices.length; j += 3) {
                i1 = indices[j];
                i2 = indices[j + 1];
                i3 = indices[j + 2];


                tge.vec3.set(v1, vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]);
                tge.vec3.set(v2, vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]);
                tge.vec3.set(v3, vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]);




                tge.vec3.sub(v1v2, v2, v1);
                tge.vec3.sub(v1v3, v3, v1);
                tge.vec3.normalize(v1v2, v1v2);
                tge.vec3.normalize(v1v3, v1v3);
                tge.vec3.cross(normal, v1v2, v1v3);
                tge.vec3.normalize(normal, normal);

                weight1 = Math.acos(Math.max(-1, Math.min(1, tge.vec3.dot(v1v2, v1v3))));
                tge.vec3.sub(v2v3Alias, v3, v2);
                tge.vec3.normalize(v2v3Alias, v2v3Alias);
                weight2 = Math.PI - Math.acos(Math.max(-1, Math.min(1, tge.vec3.dot(v1v2, v2v3Alias))));


                i1 = i1 * 3;
                i2 = i2 * 3;
                i3 = i3 * 3;

                tge.vec3.scale(v1v2, normal, weight1);
                normals[i1 + 0] += v1v2[0];
                normals[i1 + 1] += v1v2[1];
                normals[i1 + 2] += v1v2[2];

                tge.vec3.scale(v1v2, normal, weight2);
                normals[i2 + 0] += v1v2[0];
                normals[i2 + 1] += v1v2[1];
                normals[i2 + 2] += v1v2[2];

                tge.vec3.scale(v1v2, normal, Math.PI - weight1 - weight2);
                normals[i3 + 0] += v1v2[0];
                normals[i3 + 1] += v1v2[1];
                normals[i3 + 2] += v1v2[2];

            }

            for (a = 0; a < normals.length; a += 3) {
                tge.vec3.set(v1v2, normals[a], normals[a + 1], normals[a + 2]);
                tge.vec3.normalize(normal, v1v2);
                normals[a] = normal[0];
                normals[a + 1] = normal[1];
                normals[a + 2] = normal[2];
            }
        }
    })();

    geometry.calculate_tangents = (function () {
        var n = tge.vec3();
        var t = tge.vec3();
        var tangent = tge.vec4();
        var tn1 = tge.vec3();
        var tn2 = tge.vec3();
        var sn = tge.vec3();
        var sdir = tge.vec3();
        var tdir = tge.vec3();
        return function (geo) {

            var vertices = geo.attributes.tge_a_position.data;
            var normals = geo.attributes.tge_a_normal.data;
            var tangents = geo.attributes.tge_a_tangent.data;
            var uvs = geo.attributes.tge_a_uv.data;
            var indices = geo.indexData;

            var tan1 = new Float32Array(vertices.length);
            tan1.fill(0);
            var tan2 = new Float32Array(vertices.length);
            tan2.fill(0);


            var i1, i2, i3;
            var v1, v2, v3;
          
            var x1, x2, y1, y2, z1, z2, w1, w2, w3, s1, s2, t1, t2, r;

            for (var j = 0; j < indices.length; j = j + 3) {
                i1 = indices[j];
                i2 = indices[j + 1];
                i3 = indices[j + 2];

                v1 = i1 * 3;
                v2 = i2 * 3;
                v3 = i3 * 3;

                x1 = vertices[v2] - vertices[v1];
                x2 = vertices[v3] - vertices[v1];
                y1 = vertices[v2 + 1] - vertices[v1 + 1];
                y2 = vertices[v3 + 1] - vertices[v1 + 1];
                z1 = vertices[v2 + 2] - vertices[v1 + 2];
                z2 = vertices[v3 + 2] - vertices[v1 + 2];

                w1 = i1 * 2; w2 = i2 * 2; w3 = i3 * 2;

                s1 = uvs[w2] - uvs[w1];
                s2 = uvs[w3] - uvs[w1];
                t1 = uvs[w2 + 1] - uvs[w1 + 1];
                t2 = uvs[w3 + 1] - uvs[w1 + 1];


                r = 1.0 / (s1 * t2 - s2 * t1);

                tge.vec3.set(sdir,
                    (t2 * x1 - t1 * x2) * r,
                    (t2 * y1 - t1 * y2) * r,
                    (t2 * z1 - t1 * z2) * r);
                tge.vec3.set(tdir,
                    (s1 * x2 - s2 * x1) * r,
                    (s1 * y2 - s2 * y1) * r,
                    (s1 * z2 - s2 * z1) * r);


                tan1[v1] += sdir[0]; tan1[v1 + 1] += sdir[1]; tan1[v1 + 2] += sdir[2];

                tan1[v2] += sdir[0]; tan1[v2 + 1] += sdir[1]; tan1[v2 + 2] += sdir[2];

                tan1[v3] += sdir[0]; tan1[v3 + 1] += sdir[1]; tan1[v3 + 2] += sdir[2];

                tan2[v1] += tdir[0]; tan2[v1 + 1] += tdir[1]; tan2[v1 + 2] += tdir[2];
                tan2[v2] += tdir[0]; tan2[v2 + 1] += tdir[1]; tan2[v2 + 2] += tdir[2];
                tan2[v3] += tdir[0]; tan2[v3 + 1] += tdir[1]; tan2[v3 + 2] += tdir[2];

            }

           
            var vi;
            for (var a = 0; a < vertices.length; a = a + 3) {

                vi = a / 3;
                tge.vec3.set(n, normals[a], normals[a + 1], normals[a + 2]);
                tge.vec3.set(t, tan1[a], tan1[a + 1], tan1[a + 2]);



                // Gram-Schmidt orthogonalize
                //tangent[a] = (t - n * Dot(n, t)).Normalize();

                tge.vec3.scale(sn, n, tge.vec3.dot(n, t));

                tge.vec3.subtract(tn2, t, sn);

                tge.vec3.normalize(tangent, tn2);

                tge.vec3.cross(tn1, n, t);
                tge.vec3.set(tn2, tan2[a], tan2[a + 1], tan2[a + 2]);

                tangent[3] = tge.vec3.dot(tn1, tn2) < 0 ? -1 : 1;

                tangents[vi * 4] = tangent[0];
                tangents[vi * 4 + 1] = tangent[1];
                tangents[vi * 4 + 2] = tangent[2];
                tangents[vi * 4 + 3] = tangent[3];

                //tangent[a] = (t - n * Dot(n, t)).Normalize();
                // Calculate handedness
                //tangent[a].w = (Dot(Cross(n, t), tan2[a]) < 0.0F) ? -1.0F : 1.0F;
            }


        }
    })();


    geometry.quad = function () {
        var g = new geometry();
        g.addAttribute("tge_a_position", {
            data: new Float32Array([
                -1, 1, 0, 0, 0, 1, 0, 1,
                -1, -1, 0, 0, 0, 1, 0, 0,
                1, -1, 0, 0, 0, 1, 1, 0,
                1, -1, 0, 0, 0, 1, 1, 0,
                1, 1, 0, 0, 0, 1, 1, 1,
                -1, 1, 0, 0, 0, 1, 0, 1,
            ]),
            itemSize: 3, offset: 0, stride: 8 * 4
        });
        g.numItems = 6;
        g.addAttribute("tge_a_normal", { itemSize: 3, offset: 3 * 4, stride: 8 * 4 });
        g.addAttribute("tge_a_uv", { itemSize: 2, offset: 6 * 4, stride: 8 * 4 });
        g.geoType = "quad";
        return (g);
    };

    geometry.cube = function (options) {
        options = options || {};


        options.size = options.size || 1;
        var width = options.width || options.size;
        var height = options.height || options.size;
        var depth = options.depth || options.size;
        var divs = options.divs || 1;

        var widthSegments = Math.floor(options.widthSegments) || divs;
        var heightSegments = Math.floor(options.heightSegments) || divs;
        var depthSegments = Math.floor(options.depthSegments) || divs;

        var vector = tge.vec3();
        var segmentWidth, segmentHeight, widthHalf, heightHalf, depthHalf;
        var gridX1, gridY1, vertexCounter, ix, iy, x, y;
        var indices = [];
        var vertices = [];
        var normals = [];
        var uvs = [];
        var numberOfVertices = 0;
        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {

            segmentWidth = width / gridX;
            segmentHeight = height / gridY;

            widthHalf = width / 2;
            heightHalf = height / 2;
            depthHalf = depth / 2;

            gridX1 = gridX + 1;
            gridY1 = gridY + 1;

            vertexCounter = 0;

            // generate vertices, normals and uvs

            for (iy = 0; iy < gridY1; iy++) {

                y = iy * segmentHeight - heightHalf;

                for (ix = 0; ix < gridX1; ix++) {

                    x = ix * segmentWidth - widthHalf;

                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    vertices.push(vector[0], vector[1], vector[2]);

                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : - 1;

                    normals.push(vector[0], vector[1], vector[2]);

                    // uvs

                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));

                    // counters

                    vertexCounter += 1;

                }

            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment

            for (iy = 0; iy < gridY; iy++) {

                for (ix = 0; ix < gridX; ix++) {

                    var a = numberOfVertices + ix + gridX1 * iy;
                    var b = numberOfVertices + ix + gridX1 * (iy + 1);
                    var c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    var d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);


                }

            }

            numberOfVertices += vertexCounter;

        }


        buildPlane(2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
        buildPlane(2, 1, 0, 1, - 1, depth, height, - width, depthSegments, heightSegments, 1); // nx
        buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
        buildPlane(0, 2, 1, 1, - 1, width, depth, - height, widthSegments, depthSegments, 3); // ny
        buildPlane(0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
        buildPlane(0, 1, 2, - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); // nz

        var g = new tge.geometry();

        g.addAttribute("tge_a_position", { data: new Float32Array(vertices) });
        g.addAttribute("tge_a_normal", { data: new Float32Array(normals) });
        g.addAttribute("tge_a_uv", { data: new Float32Array(uvs), itemSize: 2 });
        g.addAttribute("tge_a_tangent", { data: new Float32Array(((vertices.length / 3) * 4)), itemSize: 4 });


        g.setIndices(indices);
        g.geoType = "Cube";
        g.calcBoundingSphereSize();
        tge.geometry.calculate_tangents(g);

        return (g);
    };

    geometry.plane = function (options) {
        options = options || {};
        options.size = options.size || 1;

        width = options.width || options.size;
        height = options.height || options.size;
        options.divs = options.divs || 1;
        options.divsX = options.divsX || options.divs;
        options.divsY = options.divsY || options.divs;
        widthSegments = options.divsX;
        heightSegments = options.divsY;
        options.attributesSupport = options.attributesSupport || (tge.ATTRIBUTES.POSITION | tge.ATTRIBUTES.NORMALS | tge.ATTRIBUTES.UVS | tge.ATTRIBUTES.TANGENTS);

        var width_half = width / 2;
        var height_half = height / 2;

        var gridX = Math.floor(widthSegments);
        var gridY = Math.floor(heightSegments);

        var gridX1 = gridX + 1;
        var gridY1 = gridY + 1;

        var segment_width = width / gridX;
        var segment_height = height / gridY;

        var ix, iy;
        var vCount = (widthSegments + 1) * (heightSegments + 1);
        var g = new tge.geometry();

        g.geoType = "Plane";

        g.addAttribute("tge_a_position", { data: new Float32Array(vCount * 3), itemSize: 3 });
        var normals = null, uvs = null;
        if ((options.attributesSupport & tge.ATTRIBUTES.NORMALS)) {
            g.addAttribute("tge_a_normal", { data: new Float32Array(vCount * 3), itemSize: 3 });
            normals = g.attributes.tge_a_normal.data;
        }

        if ((options.attributesSupport & tge.ATTRIBUTES.UVS)) {
            g.addAttribute("tge_a_uv", { data: new Float32Array(vCount * 2), itemSize: 2 });
            uvs = g.attributes.tge_a_uv.data;
        }

        if ((options.attributesSupport & tge.ATTRIBUTES.TANGENTS)) {
            g.addAttribute("tge_a_tangent", { data: new Float32Array(vCount * 4), itemSize: 4 });
        }


        g.setIndices((gridX * gridY) * 6);
        var positions = g.attributes.tge_a_position.data;


        var indices = g.indexData;
        var ii = 0, vi = 0;


        for (iy = 0; iy < gridY1; iy++) {
            var y = iy * segment_height - height_half;
            for (ix = 0; ix < gridX1; ix++) {
                var x = ix * segment_width - width_half;

                positions[(vi * 3) + 0] = x;
                positions[(vi * 3) + 1] = -y;
                positions[(vi * 3) + 2] = 0;

                if (normals !== null) {

                    normals[(vi * 3) + 0] = 0;
                    normals[(vi * 3) + 1] = 0;
                    normals[(vi * 3) + 2] = 1;
                }

                if (uvs !== null) {
                    uvs[(vi * 2) + 0] = ix / gridX;
                    uvs[(vi * 2) + 1] = 1 - (iy / gridY);
                }


                vi++;
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
                indices[ii++] = a; indices[ii++] = b; indices[ii++] = d;
                indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
            }

        }
        g.calcBoundingSphereSize();
        tge.geometry.calculate_tangents(g);


        return (g);
    };

    geometry.sphere = (function () {
        var norm = tge.vec3();
        var vert = tge.vec3();
        return function (options) {
            options = options || {};
            options.rad = options.rad || 1;
            options.divs = options.divs || 8;
            options.divsX = options.divsX || options.divs;
            options.divsY = options.divsY || options.divs;
            options.attributesSupport = options.attributesSupport || (tge.ATTRIBUTES.POSITION | tge.ATTRIBUTES.NORMALS | tge.ATTRIBUTES.UVS);

            var radX = options.radX || options.rad;
            var radY = options.radY || options.rad;
            var radZ = options.radZ || options.rad;

            var widthSegments = Math.max(3, Math.floor(options.divsX));
            var heightSegments = Math.max(2, Math.floor(options.divsY));

            var phiStart = options.phiStart !== undefined ? options.phiStart : 0;
            var phiLength = options.phiLength !== undefined ? options.phiLength : Math.PI * 2;

            var thetaStart = options.thetaStart !== undefined ? options.thetaStart : 0;
            var thetaLength = options.thetaLength !== undefined ? options.thetaLength : Math.PI;

            var thetaEnd = thetaStart + thetaLength;

            var ix, iy;

            var index = 0;
            var grid = [];


            var vCount = (widthSegments + 1) * (heightSegments + 1);
            var g = new tge.geometry();

            g.geoType = "Sphere";

            g.addAttribute("tge_a_position", { data: new Float32Array(vCount * 3), itemSize: 3 });
            var normals = null, uvs = null;
            if ((options.attributesSupport & tge.ATTRIBUTES.NORMALS)) {
                g.addAttribute("tge_a_normal", { data: new Float32Array(vCount * 3), itemSize: 3 });
                normals = g.attributes.tge_a_normal.data;
                g.addAttribute("tge_a_tangent", { data: new Float32Array(vCount * 4), itemSize: 4 });

            }

            if ((options.attributesSupport & tge.ATTRIBUTES.UVS)) {
                g.addAttribute("tge_a_uv", { data: new Float32Array(vCount * 2), itemSize: 2 });
                uvs = g.attributes.tge_a_uv.data;
            }



            g.setIndices(vCount * 6);
            var positions = g.attributes.tge_a_position.data;


            var indices = g.indexData;
            var ii = 0, vi = 0;



            for (iy = 0; iy <= heightSegments; iy++) {

                var verticesRow = [];

                var v = iy / heightSegments;
                //
                // special case for the poles

                var uOffset = (iy == 0) ? 0.5 / widthSegments : ((iy == heightSegments) ? - 0.5 / widthSegments : 0);

                for (ix = 0; ix <= widthSegments; ix++) {

                    var u = ix / widthSegments;

                    vert[0] = - radX * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                    vert[1] = radY * Math.cos(thetaStart + v * thetaLength);
                    vert[2] = radZ * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);


                    positions[(vi * 3) + 0] = vert[0];
                    positions[(vi * 3) + 1] = vert[1];
                    positions[(vi * 3) + 2] = vert[2];

                    if (normals !== null) {
                        tge.vec3.normalize(norm, vert);
                        normals[(vi * 3) + 0] = norm[0];
                        normals[(vi * 3) + 1] = norm[1];
                        normals[(vi * 3) + 2] = norm[2];
                    }

                    if (uvs !== null) {
                        uvs[(vi * 2) + 0] = u + uOffset;
                        uvs[(vi * 2) + 1] = 1 - v;
                    }



                    vi++;

                    verticesRow.push(index++);

                }

                grid.push(verticesRow);

            }
            ii = 0;
            for (iy = 0; iy < heightSegments; iy++) {
                for (ix = 0; ix < widthSegments; ix++) {
                    var a = grid[iy][ix + 1];
                    var b = grid[iy][ix];
                    var c = grid[iy + 1][ix];
                    var d = grid[iy + 1][ix + 1];

                    if (iy !== 0 || thetaStart > 0) {
                        indices[ii++] = a; indices[ii++] = b; indices[ii++] = d;
                    }
                    if (iy !== heightSegments - 1 || thetaEnd < Math.PI) {
                        indices[ii++] = b; indices[ii++] = c; indices[ii++] = d;
                    }

                }

            }
            g.calcBoundingSphereSize();
            tge.geometry.calculate_tangents(g);
            return (g);

        }
    })();


    geometry.line_geometry_builder = new function () {

        this.vertices = [];

        this.clear = function () {
            this.vertices.length = 0;
        };

        this.add = function (x, y, z) {
            this.vertices.push(x, y, z);
            return (this);
        };

        this.build = function () {
            var g = new tge.geometry();

            g.addAttribute("tge_a_position", {
                data: new Float32Array(this.vertices),
                itemSize: 3
            });

            g.numItems = this.vertices.length / 3;
            this.clear();
            g.calcBoundingSphereSize();

            return (g);
        };

        return (this);
    }


    geometry.wavefront_obj = (function () {
        function wavefrontObjParser(resource) {
            var indices = [],
                vertices = [],
                texturecoords = [],
                normals = [];

            var v = [], vt = [], vn = []; // Buffers
            var FACE = function (F) {
                var face = F.split(' ').map(function (fv) {
                    var i = fv.split('/').map(function (i) {
                        return parseInt(i, 10) - 1;
                    });
                    return {
                        v: v[i[0]],
                        vt: vt[i[1]],
                        vn: vn[i[2]]
                    };
                });

                // Generate indices for triangle
                var len = vertices.length;
                indices.push(len);
                indices.push(len + 1);
                indices.push(len + 2);

                // Generate indices for 4 point polygon
                if (face.length === 4) {
                    indices.push(len);
                    indices.push(len + 2);
                    indices.push(len + 3);
                }

                // SAVE PARSED DATA:
                face.forEach(function (f) {
                    vertices.push(f.v);
                    texturecoords.push(f.vt);
                    normals.push(f.vn);
                });
            };
            var toFloatArr = function (s) {
                return s.split(' ').map(parseFloat);
            },
                lineParsers = {
                    'v ': function (S) {
                        v.push(toFloatArr(S.slice(2)));
                    },
                    'vt': function (S) {
                        var x = (function (v) {
                            v[1] = 1 - v[1];
                            return v;
                        }(toFloatArr(S.slice(3))));
                        vt.push(x);
                    },
                    'vn': function (S) {
                        vn.push(toFloatArr(S.slice(3)));
                    },
                    'f ': function (S) {
                        FACE(S.slice(2));
                    }
                };

            resource.split('\n').forEach(function (line) {
                if (line.length > 2) {
                    Object.keys(lineParsers).forEach(function (key) {
                        if (line.indexOf(key) === 0) {
                            lineParsers[key](line);
                        }
                    });
                }
            });

            return {
                indices: indices,
                vertices: vertices,
                texturecoords: texturecoords,
                normals: normals
            };
        };

        return function (data) {
            var obj = wavefrontObjParser(data);
            var vertices = [];
            obj.vertices.forEach(function (v) {
                if (v) {
                    vertices.push(v[0], v[1], v[2]);
                }
            });

            var uvsData = new Float32Array((vertices.length / 3) * 2);
            var normalsData = new Float32Array((vertices.length / 3) * 3);
            var i = 0;

            var computeNormals = false, computeUVS = false;
            if (obj.normals[0] == undefined) {
                computeNormals = true;
            }
            else {
                i = 0;
                obj.normals.forEach(function (v) {
                    if (v) {
                        normalsData[i++] = v[0];
                        normalsData[i++] = v[1];
                        normalsData[i++] = v[2];
                    }
                });
            }
            if (obj.texturecoords[0] == undefined) {
                computeUVS = true;
            }
            else {
                i = 0;
                obj.texturecoords.forEach(function (u) {
                    if (u) {
                        uvsData[i++] = v[0];
                        uvsData[i++] = v[1];
                    }
                });
            }

            var g = new tge.geometry();
            g.addAttribute("tge_a_position", { data: new Float32Array(vertices) });
            g.addAttribute("tge_a_normal", { data: new Float32Array(normalsData) });
            g.addAttribute("tge_a_uv", { data: new Float32Array(uvsData), itemSize: 2 });

            g.addAttribute("tge_a_tangent", { data: new Float32Array(((normalsData.length / 3) * 4)), itemSize: 4 });

            g.setIndices(obj.indices);
            g.geoType = "WaveFrontObj";
            if (computeNormals) tge.geometry.calculate_normals(g);

            tge.geometry.calculate_tangents(g);

            g.calcBoundingSphereSize();

            return (g);
        }
    })();

    geometry.wavefront_obj_url = (function () {
        var req = new XMLHttpRequest;
        return function (url, done) {
            if (done) {
                req.open("GET", url, !0);
                req.onload = function () {
                    done(geometry.wavefront_obj(this.response));
                };
                req.send();
            } 
        }
    })();

    return geometry;

});


/*./shader.js*/



tge.shader = $extend(function (proto) {


    function shader(vs, fs) {

        this.vs = vs;
        this.fs = fs;
        this.compiled = false;
        this.uuid = $guidi();
        return (this);

    }

    proto.setUniform = (function () {
        var uni;
        return function (id, value) {
            uni = this.uniforms[id];
            if (uni) {

                uni.params[uni.params.length - 1] = value;
                uni.func.apply(this.gl, uni.params);
                return true;
            }
            return false;
        }
    })();


    shader.compile = (function () {


        function createShader(gl, src, type) {
            var shdr = gl.createShader(type);
            gl.shaderSource(shdr, src);
            var source = gl.getShaderSource(shdr);

            gl.compileShader(shdr);
            if (!gl.getShaderParameter(shdr, gl.COMPILE_STATUS)) {
                console.log('source', source);
                console.error("Error compiling shader : ", gl.getShaderInfoLog(shdr));
                console.log(src);
                gl.deleteShader(shdr);
                return null;
            }
            return shdr;
        }

        function createProgram(gl, vshdr, fshdr, doValidate) {


            let prog = gl.createProgram();
            gl.attachShader(prog, vshdr);
            gl.attachShader(prog, fshdr);

            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
            if (doValidate) {
                gl.validateProgram(prog);
                if (!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                    console.error("Error validating program", gl.getProgramInfoLog(prog));
                    gl.deleteProgram(prog); return null;
                }
            }
            gl.detachShader(prog, vshdr);
            gl.detachShader(prog, fshdr);
            gl.deleteShader(fshdr);
            gl.deleteShader(vshdr);

            return prog;
        }


        var collectUniformsAndAttributes = (function () {

            var uniformsWriteFunc = {
                5126: ['uniform1f', 2],//'float',
                35664: ['uniform2f', 3],// 'vec2',
                35665: ['uniform3fv', 2], //'vec3',
                35666: ['uniform4fv', 2], //'vec4',
                35678: ['uniform1i', 2], //'sampler2D',
                35675: ['uniformMatrix3fv', 3], //'mat3',
                35676: ['uniformMatrix4fv', 3],//'mat4'
            }

            function addUniformToShader(gl, shdr, name, type) {


                var location = gl.getUniformLocation(shdr.program, name);
                var func = uniformsWriteFunc[type];
                var uni = {};
                if (func[1] === 3)
                    uni.params = [location, false, 0];
                else if (func[1] === 2) {
                    uni.params = [location, 0];
                }
                uni.func = gl[func[0]];
                shdr.uniforms[name] = uni;
            }


            return function (gl, shdr) {
                var i = 0, a = 0, info;
                shdr.uniforms = {};
                for (i = 0; i < gl.getProgramParameter(shdr.program, gl.ACTIVE_UNIFORMS); i++) {
                    info = gl.getActiveUniform(shdr.program, i);
                   
                    if (info.size > 1) {
                        for (a = 0; a < info.size; s++) {
                            addUniformToShader(gl, shdr, info.name.replace('[0]', '[' + a + ']'), info.type);
                        }
                    }
                    else if (info.size === 1) {
                        addUniformToShader(gl, shdr, info.name, info.type);
                    }
                }

                shdr.attributes = {};
                for (i = 0; i < gl.getProgramParameter(shdr.program, gl.ACTIVE_ATTRIBUTES); i++) {
                    info = gl.getActiveAttrib(shdr.program, i);
                    shdr.attributes[info.name] = { name: info.name, location: gl.getAttribLocation(shdr.program, info.name) };
                }

                console.log("shdr.uniforms", shdr.uniforms);
            }

        })();

        return function (gl, shdr, _params) {

            if (shdr.compiled) return;
            var params = _params || {};
            $assign(params, shdr.params);
            function getChunk(key) {
                return $str(shader.chunks[key], 'params', 'chunk')(params, getChunk);
            }

            for (let p in params) {
                if (typeof params[p] === 'string') {
                    params[p] = $str(shdr.params[p], 'params', 'chunk')(params, getChunk);
                }
            }
            shdr.gl = gl;
            shdr.vs = $str(shdr.vs, 'params', 'chunk')(params, getChunk);
            shdr.fs = $str(shdr.fs, 'params', 'chunk')(params, getChunk);




            var vshdr, fshdr;
            vshdr = createShader(gl, shdr.vs, gl.VERTEX_SHADER);
            if (!vshdr) return false;
            fshdr = createShader(gl, shdr.fs, gl.FRAGMENT_SHADER);
            if (!fshdr) { gl.deleteShader(vshdr); return false; }
            shdr.program = createProgram(gl, vshdr, fshdr, true);

            gl.useProgram(shdr.program);
            collectUniformsAndAttributes(gl, shdr);

            gl.useProgram(null);
            shdr.compiled = true;
            return (true);

        }
    })();

    shader.chunks = {};
    shader.getChunk = function (key, params) {
        function _getChunk(key) {
            return shader.getChunk(key, params);
        }
        return $$(shader.chunks[key], 'params', 'chunk')(params, _getChunk);
    };
    shader.loadChunks = function (text) {
        var chunks = text.split('/*chunk-');
        chunks.forEach(function (chunk) {
            chunk = chunk.trim();
            if (chunk.length > 0) {
                var name = chunk.substr(0, chunk.indexOf('*/') + 2);
                chunk = chunk.replace(name, '');
                name = name.replace('*/', '');
                shader.chunks[name] = chunk;
            }

        });



    };

    shader.loadChunks(`/*chunk-precision*/
#extension GL_OES_standard_derivatives : enable 
#if GL_FRAGMENT_PRECISION_HIGH == 1 
precision highp float;
#else
precision mediump float;
#endif

/*chunk-common-varying*/
varying vec4 tge_v_unprojected_vertex;

/*chunk-pipelineParams*/
uniform vec4 tge_u_pipelineParams;
uniform vec4 tge_u_shadingParams;

float tge_u_frameTime;
float tge_u_frameTimeDelta;



void initPipelineParams() {
tge_u_frameTime = tge_u_pipelineParams.x;
tge_u_frameTimeDelta = tge_u_pipelineParams.y;
}


/*chunk-temp*/

const int MAX_BONES=10;
uniform vec4 tarray[MAX_BONES];
uniform float u_float;
uniform vec2 u_vec2;
uniform vec3 u_vec3;
uniform vec4 u_vec4;
uniform mat3 u_mat3;
uniform mat4 u_mat4;
uniform sampler2D u_sampler;
tge_u_frameTime=u_float;
tge_u_frameTime=u_vec3.x;
tge_u_frameTime=u_vec4.x;
tge_u_frameTime=u_mat3[0].x;
tge_u_frameTime=u_mat4[0].x;
vec4 v1= texture2D(u_sampler,u_vec2);


/*chunk-mesh-attributes-all*/
attribute vec3 tge_a_position;
attribute vec3 tge_a_normal;
attribute vec4 tge_a_tangent;
attribute vec2 tge_a_uv;


/*chunk-mesh-attributes-flat*/
attribute vec3 tge_a_position;
attribute vec4 tge_a_color;
attribute vec2 tge_a_uv;



/*chunk-camera-matrix-all*/
uniform mat4 tge_u_viewMatrix;
uniform mat4 tge_u_viewMatrixInv;
uniform mat4 tge_u_projectionMatrix;
uniform mat4 tge_u_viewProjectionMatrix;

/*chunk-model-matrix-all*/
uniform mat3 tge_u_normalMatrix;
uniform mat4 tge_u_modelMatrix;
uniform mat4 tge_u_modelViewMatrix;
uniform mat3 tge_u_textureMatrix;


/*chunk-lights-matrix-all*/
<?for(var i= 0;i<params.fws_lightsCount;i++) {?>
uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

/*chunk-lights-material-all*/
<?for(var i = 0;i < params.fws_lightsCount;i++){?>
uniform mat4 tge_u_lightMaterial<?=i?>;
<?}?>



/*chunk-forward-shading*/
<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
uniform mat4 tge_u_lightMaterial<?=i?>;
uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

float fws_distanceToLight;
float fws_lambertian;
float fws_specular;
float fws_attenuation;
float fws_intensity;
float fws_spotLightCalc;
float fws_spotTheta;
float fws_spotLightStatus;
vec3 fws_totalLight;
vec3 fws_directionToLight;
vec3 fws_lightValue;
vec3 directionToEye;
void applyLight(mat4 objectMaterial,mat4 lightMaterial, mat4 lightMatrix,vec3 vertexPosition,vec3 vertexNormal) {

fws_directionToLight = (lightMatrix[3].xyz - vertexPosition);
fws_distanceToLight = length(fws_directionToLight);
fws_directionToLight = normalize(fws_directionToLight);
fws_lambertian = max(dot(fws_directionToLight.xyz, vertexNormal), 0.0);
fws_intensity = lightMaterial[0].w;
fws_attenuation = (lightMaterial[3].x + lightMaterial[3].y * fws_distanceToLight
+ lightMaterial[3].z * (fws_distanceToLight * fws_distanceToLight)) + lightMaterial[3].w;


fws_spotLightStatus = step(0.000001, lightMaterial[1].w);
fws_spotTheta = dot(fws_directionToLight, normalize(lightMatrix[2].xyz));
fws_spotLightCalc = clamp((fws_spotTheta - lightMaterial[2].w) / (lightMaterial[1].w - lightMaterial[2].w), 0.0, 1.0);
fws_intensity *= (fws_spotLightStatus * (step(lightMaterial[1].w, fws_spotTheta) * fws_spotLightCalc))
+ abs(1.0 - fws_spotLightStatus);



fws_specular = pow(max(dot(normalize(fws_directionToLight.xyz + directionToEye), vertexNormal), 0.0), objectMaterial[2].w) * fws_lambertian;
fws_specular *= fws_intensity * step(0.0, fws_lambertian);


fws_lightValue = (lightMaterial[0].xyz * objectMaterial[0].xyz) +
(objectMaterial[1].xyz * fws_lambertian * lightMaterial[1].xyz * fws_intensity) +
(objectMaterial[2].xyz * fws_specular * lightMaterial[2].xyz);



fws_totalLight +=(fws_lightValue / fws_attenuation);


}



vec4 applyForwardShading(mat4 objectMaterial, vec4 eyePosition, vec3 vertexPosition, vec3 vertexNormal){

directionToEye = normalize((eyePosition.xyz - vertexPosition));

vertexNormal = normalize(vertexNormal);
<? for (var i = 0;i < params.fws_lightsCount;i++) {?>
applyLight(objectMaterial, tge_u_lightMaterial<?=i?>, tge_u_lightMatrix<?=i?>,vertexPosition,vertexNormal);
<?}?>

return vec4(fws_totalLight,objectMaterial[0].w);
}


/*chunk-fws_lighting*/

float fws_distanceToLight;
float fws_lambertian;
float fws_specular;
float fws_attenuation;
float fws_intensity;
float fws_spotLightCalc;
float fws_spotTheta;
float fws_spotLightStatus;

vec3 fws_totalLight;
vec3 fws_lightValue;

vec3 fws_lighting(mat4 fws_objectMaterial, mat4 fws_lightMaterial,
vec3 fws_vertexPosition, vec3 fws_vertexNormal,
vec3 fws_directionToEye,vec3 fws_directionToLight, vec3 fws_directionFromLight) {

fws_distanceToLight = length(fws_directionToLight);
fws_directionToLight = normalize(fws_directionToLight);
fws_lambertian = max(dot(fws_directionToLight, fws_vertexNormal), 0.0);
fws_intensity = fws_lightMaterial[0].w;
fws_attenuation = (fws_lightMaterial[3].x + fws_lightMaterial[3].y * fws_distanceToLight
+ fws_lightMaterial[3].z * (fws_distanceToLight * fws_distanceToLight)) + fws_lightMaterial[3].w;

fws_spotLightStatus = step(0.000001, fws_lightMaterial[1].w);
fws_spotTheta = dot(fws_directionToLight, fws_directionFromLight);
fws_spotLightCalc = clamp((fws_spotTheta - fws_lightMaterial[2].w) / (fws_lightMaterial[1].w - fws_lightMaterial[2].w), 0.0, 1.0);
fws_intensity *= (fws_spotLightStatus * (step(fws_lightMaterial[1].w, fws_spotTheta) * fws_spotLightCalc))
+ abs(1.0 - fws_spotLightStatus);


fws_specular = pow(max(dot(normalize(fws_directionToLight.xyz + fws_directionToEye), fws_vertexNormal), 0.0), fws_objectMaterial[2].w) * fws_lambertian;
fws_specular *= fws_intensity * step(0.0, fws_lambertian);


fws_lightValue = (fws_lightMaterial[0].xyz * fws_objectMaterial[0].xyz) +
(fws_objectMaterial[1].xyz * fws_lambertian * fws_lightMaterial[1].xyz * fws_intensity) +
(fws_objectMaterial[2].xyz * fws_specular * fws_lightMaterial[2].xyz);



return (fws_lightValue / fws_attenuation);


}


/*chunk-shadow-sampling*/

float SampleShadowMap(sampler2D shadowMap, vec2 coords, float compare)
{
return step(compare, texture2D(shadowMap, coords.xy).r);
}

float SampleShadowMapLinear(sampler2D shadowMap, vec2 coords, float compare, vec2 texelSize)
{
vec2 pixelPos = coords / texelSize + vec2(0.5);
vec2 fracPart = fract(pixelPos);
vec2 startTexel = (pixelPos - fracPart) * texelSize;

float blTexel = SampleShadowMap(shadowMap, startTexel, compare);
float brTexel = SampleShadowMap(shadowMap, startTexel + vec2(texelSize.x, 0.0), compare);
float tlTexel = SampleShadowMap(shadowMap, startTexel + vec2(0.0, texelSize.y), compare);
float trTexel = SampleShadowMap(shadowMap, startTexel + texelSize, compare);

float mixA = mix(blTexel, tlTexel, fracPart.y);
float mixB = mix(brTexel, trTexel, fracPart.y);

return mix(mixA, mixB, fracPart.x);
}

float SampleShadowMapPCF(sampler2D shadowMap, vec2 coords, float compare, vec2 texelSize)
{
const float NUM_SAMPLES = 3.0;
const float SAMPLES_START = (NUM_SAMPLES - 1.0) / 2.0;
const float NUM_SAMPLES_SQUARED = NUM_SAMPLES * NUM_SAMPLES;

float result = 0.0;
for (float y = -SAMPLES_START; y <= SAMPLES_START; y += 1.0)
{
for (float x = -SAMPLES_START; x <= SAMPLES_START; x += 1.0)
{
vec2 coordsOffset = vec2(x, y) * texelSize;
result += SampleShadowMapLinear(shadowMap, coords + coordsOffset, compare, texelSize);
}
}
return result / NUM_SAMPLES_SQUARED;
}

float linstep(float low, float high, float v)
{
return clamp((v - low) / (high - low), 0.0, 1.0);
}

float SampleVarianceShadowMap(sampler2D shadowMap, vec2 coords, float compare, float varianceMin, float lightBleedReductionAmount)
{
float depth = texture2D(shadowMap, coords.xy).r;


float dx = dFdx(depth);
float dy = dFdy(depth);
float moment2 = depth * depth + 0.25 * (dx * dx + dy * dy);
vec2 moments = vec2(depth, moment2);


float p = step(compare, moments.x);
float variance = max(moments.y - moments.x * moments.x, varianceMin);

float d = compare - moments.x;
float pMax = linstep(lightBleedReductionAmount, 1.0, variance / (variance + d * d));

return min(max(p, pMax), 1.0);
}
/*chunk-temp*/

float snoise(vec4 v)
{
const vec4C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);


vec4 i = floor(v + dot(v, vec4(F4)));
vec4 x0 = v - i + dot(i, C.xxxx);



vec4 i0;
vec3 isX = step(x0.yzw, x0.xxx);
vec3 isYZ = step(x0.zww, x0.yyz);

i0.x = isX.x + isX.y + isX.z;
i0.yzw = 1.0 - isX;

i0.y += isYZ.x + isYZ.y;
i0.zw += 1.0 - isYZ.xy;
i0.z += isYZ.z;
i0.w += 1.0 - isYZ.z;


vec4 i3 = clamp(i0, 0.0, 1.0);
vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);


vec4 x1 = x0 - i1 + C.xxxx;
vec4 x2 = x0 - i2 + C.yyyy;
vec4 x3 = x0 - i3 + C.zzzz;
vec4 x4 = x0 + C.wwww;


i = mod289(i);
float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
vec4 j1 = permute(permute(permute(permute(
i.w + vec4(i1.w, i2.w, i3.w, 1.0))
+ i.z + vec4(i1.z, i2.z, i3.z, 1.0))
+ i.y + vec4(i1.y, i2.y, i3.y, 1.0))
+ i.x + vec4(i1.x, i2.x, i3.x, 1.0));


vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

vec4 p0 = grad4(j0, ip);
vec4 p1 = grad4(j1.x, ip);
vec4 p2 = grad4(j1.y, ip);
vec4 p3 = grad4(j1.z, ip);
vec4 p4 = grad4(j1.w, ip);


vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;
p4 *= taylorInvSqrt(dot(p4, p4));


vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
m0 = m0 * m0;
m1 = m1 * m1;
return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
+ dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));

}

/*chunk-wireframe-feature*/




vec4 mod289(vec4 x) {
return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
 return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
 return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
{
const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
vec4 p,s;

p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
s = vec4(lessThan(p, vec4(0.0)));
p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

return p;
}

const float F4 = 0.309016994374947451;

const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);

float snoise(vec4 v)
{





vec4 i = floor(v + dot(v, vec4(F4)));
vec4 x0 = v - i + dot(i, C.xxxx);

vec4 i0;
vec3 isX = step(x0.yzw, x0.xxx);
vec3 isYZ = step(x0.zww, x0.yyz);

i0.x = isX.x + isX.y + isX.z;
i0.yzw = 1.0 - isX;

i0.y += isYZ.x + isYZ.y;
i0.zw += 1.0 - isYZ.xy;
i0.z += isYZ.z;
i0.w += 1.0 - isYZ.z;


vec4 i3 = clamp(i0, 0.0, 1.0);
vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);


vec4 x1 = x0 - i1 + C.xxxx;
vec4 x2 = x0 - i2 + C.yyyy;
vec4 x3 = x0 - i3 + C.zzzz;
vec4 x4 = x0 + C.wwww;


i = mod289(i);
float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
vec4 j1 = permute(permute(permute(permute(
i.w + vec4(i1.w, i2.w, i3.w, 1.0))
+ i.z + vec4(i1.z, i2.z, i3.z, 1.0))
+ i.y + vec4(i1.y, i2.y, i3.y, 1.0))
+ i.x + vec4(i1.x, i2.x, i3.x, 1.0));


vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

vec4 p0 = grad4(j0, ip);
vec4 p1 = grad4(j1.x, ip);
vec4 p2 = grad4(j1.y, ip);
vec4 p3 = grad4(j1.z, ip);
vec4 p4 = grad4(j1.w, ip);


vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
p0 *= norm.x;
p1 *= norm.y;
p2 *= norm.z;
p3 *= norm.w;
p4 *= taylorInvSqrt(dot(p4, p4));


vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
m0 = m0 * m0;
m1 = m1 * m1;
return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
+ dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));

}

const float PI = 3.14159265359;

float aastep (float threshold, float dist) {
float afwidth = fwidth(dist) * 0.5;
return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}



vec4 getStyledWireframe (vec3 barycentric,vec3 position) {
float d = min(min(barycentric.x, barycentric.y), barycentric.z);
float noiseOff = 0.0;



noiseOff = snoise(vec4(position.xyz * 1.0,0.35)) * 0.15;
noiseOff = noiseOff+ snoise(vec4(position.xyz * 80.0,0.5)) * 0.12;






d += noiseOff;

float positionAlong = max(barycentric.x, barycentric.y);
if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
positionAlong = 1.0 - positionAlong;
}

float computedThickness = 0.01;

// create the repeating dash pattern

float dashRepeats = 2.0;
float dashLength = 0.55;

float offset = 1.0 / dashRepeats * dashLength / 2.0;



float pattern = fract((positionAlong + offset) * dashRepeats);
computedThickness *= 1.0 - aastep(dashLength, pattern);

 
float edge = 1.0 - aastep(computedThickness, d);
vec4 outColor = vec4(0.0);
outColor.rgb=mix(vec3(1.0,0.0,0.0), vec3(1.0), vec3(edge));
outColor.a = 0.5;
return outColor;
}`);

    shader.parse = function (_source, params) {

        var source = _source.split('/*--fragment--*/');
        var shader = new tge.shader(source[0].toString().trim(), source[1].toString().trim());
        shader.source = _source;
        shader.params = params || {};
        return shader;
    };
    return shader;

});

tge.pipleline_shader = $extend(function (proto, _super) {
    var functions = ['vertex', 'fragment']
    function parseShaderSource(source) {
        source = source.replace(/\\n/g, '\n');
        var list = [];
        functions.forEach(function (f) {
            list.push({ f: f, i: source.indexOf(f) });
        });
        list.sort(function (a, b) { return a.i - b.i });

        var chars = source.split('');

        function traceBrackets(i) {
            var bc = 1;
            while (bc !== 0 && i < chars.length) {
                if (chars[i] === '{') bc++;
                else if (chars[i] === '}') bc--;
                i++;
            }
            return i;
        }
        function parseBlock(m, i1) {
            return source.substr(i1, traceBrackets(source.indexOf(m) + m.length) - i1);
        }

        var i = 0;
        var params = {};
        list.forEach(function (f) {
            var regx = new RegExp('void ' + f.f + '[\\s\\S]*?{', 'ig');

            var m = source.match(regx);
            if (m !== null && m.length > 0) {
                params[f.f] = parseBlock(m[0], i);
                i += params[f.f].length;
            }


        });
        return (params);
    }

    proto.collectFunctionsDefinition = function (name, arr) {
        if (this.parent !== null) this.parent.collectFunctionsDefinition(name, arr);
        if (this.functionsDefinitions[name]) arr.push(this.functionsDefinitions[name]);
    }
    proto.collectParts = function (vertex, fragment) {
        if (this.parent !== null) this.parent.collectParts(vertex, fragment);
        if (this.parts.vertex) vertex.push(this.parts.vertex);
        if (this.parts.fragment) fragment.push(this.parts.fragment);
    }

    proto.extend = function (source) {
        return tge.pipleline_shader.parse(source, this);
    }
    function pipleline_shader() {
        _super.apply(this, arguments);
        this.parent = null;
        this.parts = null;
        this.functionsDefinitions = {};
        return (this);
    }


    pipleline_shader.parse = function (source, parent, ignoreFragment, ignoreVertex) {
        var shader = new tge.pipleline_shader();


        shader.parts = parseShaderSource(source);
        shader.source = source;
        var vertex = [], fragment = [];
        if (parent) parent.collectParts(vertex, fragment);
        var vs = [];
        var fs = [];


        if (!ignoreVertex) {
            var l = vertex.length - 1;
            vertex.forEach(function (vertex, i) {

                if (i == l) {
                    vertex = vertex.replace('super_vertex', 'super_vertex' + (i));
                    vertex = vertex.replace('void vertex', 'void super_vertex');
                }
                else {
                    vertex = vertex.replace('void vertex', 'void super_vertex' + (l - i));
                }
                vs.push(vertex);
            });
        }


        if (!ignoreFragment) {
            l = fragment.length - 1;
            fragment.forEach(function (fragment, i) {
                if (i == l) {
                    fragment = fragment.replace('super_fragment', 'super_fragment' + (i));
                    fragment = fragment.replace('void fragment', 'void super_fragment');
                }
                else {
                    fragment = fragment.replace('void fragment', 'void super_fragment' + (l - i));
                }
                fs.push(fragment);
            });
        }



        vs.push(shader.parts.vertex || 'void vertex(){super_vertex();}');
        fs.push(shader.parts.fragment || 'void fragment(){super_fragment();}');
        shader.vs = vs.join('') + 'void main(){vertex();}';
        shader.fs = fs.join('') + 'void main(){fragment();}';


        shader.parent = parent || null;
        return (shader);

    }


    return (pipleline_shader);

},tge.shader);


/*./node.js*/


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

/*./texture.js*/


tge.texture = $extend(function (proto) {


    proto.P = function (name, value) {
        this.parameters[name] = value;
        return (this);
    };

    proto.update = function (gl) {
        tge.texture.update(this, gl);
    };
    function texture(source, format, formatType, generateMipmap, width, height) {
        this.uuid = $guidi();
        this.webglTexture = null;

        this.source = source;

        if (source === undefined) {
            this.source = new Uint8Array([255, 255, 255, 255]);
        }
        this.width = width || 1;
        this.height = height || 1;
        this.needsUpdate = false;
        this.generateMipmap = generateMipmap || false;

        if (this.generateMipmap) {
            this.parameters = {
                TEXTURE_MAG_FILTER: tge.TEXTURE_FORMAT_TYPE.LINEAR,
                TEXTURE_MIN_FILTER: tge.TEXTURE_FORMAT_TYPE.LINEAR_MIPMAP_LINEAR,
            };
        }
        else {
            this.parameters = {
                TEXTURE_MAG_FILTER: tge.TEXTURE_FORMAT_TYPE.NEAREST,
                TEXTURE_MIN_FILTER: tge.TEXTURE_FORMAT_TYPE.NEAREST,
                TEXTURE_WRAP_S: tge.TEXTURE_PARAMETERS.CLAMP_TO_EDGE,
                TEXTURE_WRAP_T: tge.TEXTURE_PARAMETERS.CLAMP_TO_EDGE,
            };
        }
        this.format = format || tge.TEXTURE_FORMAT_TYPE.RGBA;
        this.formatType = formatType || tge.TEXTURE_FORMAT_TYPE.UNSIGNED_BYTE;
        this.textureTarget = tge.TEXTURE_PARAMETERS.TEXTURE_2D;
        if (this.source) this.needsUpdate = true;


        return (this);


    }

    texture.free_images = new $smartarray();

    texture.free_images.fetch = function () {
        var image = this.pop();
        if (image === null) {
            image = new Image();
        }
        return (image);
    };

    var p;
    texture.url_texture_cache = {};
    texture.from_url = function (url, noMipmap) {

        if (tge.texture.url_texture_cache[url]) {
            return (tge.texture.url_texture_cache[url]);
        }

        var image = tge.texture.free_images.fetch();


        image.texture = new tge.texture(false, false, false, !noMipmap);
        image.onload = function () {
            this.texture.imageQueue = this;
            this.texture.needsUpdate = true;
            this.onload = undefined;
            this.texture = undefined
        };
        image.src = url;
        tge.texture.url_texture_cache[url] = image.texture;
        return (image.texture);
    };

    texture.update = function (texture, gl) {


        var source = texture.source;
        if (texture.imageQueue) {
            source = texture.imageQueue;
            tge.texture.free_images.push(texture.imageQueue);
            console.log('free', texture.imageQueue);
            texture.imageQueue = undefined;
        }

        if (texture.webglTexture === null) {
            texture.webglTexture = gl.createTexture();
        }



        gl.bindTexture(texture.textureTarget, texture.webglTexture);


        if (texture.textureTarget === gl.TEXTURE_CUBE_MAP) {
            for (var i = 0; i < texture.source.length; i++) {
                gl.texImage2D(cubeMapTextureSequence[i], 0, texture.format, texture.format, texture.formatType, texture.source[i]);
            }
        }
        else {

            if (source !== null && source.src) {
                gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, texture.formatType, source);
            }

            else {
                gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture.formatType, source);
            }
        }




        for (p in texture.parameters) {
            gl.texParameteri(texture.textureTarget, tge.TEXTURE_PARAMETERS[p], texture.parameters[p]);
        }
        if (texture.generateMipmap) {
            gl.generateMipmap(texture.textureTarget);
        }
        gl.bindTexture(texture.textureTarget, null);
        texture.needsUpdate = false;
    };


    return texture;

});

tge.framebuffer = $extend(function (proto) {


    proto.bindTexture = function (texture, attachment) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        if (texture.webglTexture === null) texture.update(this.gl);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.webglTexture);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, texture.webglTexture, 0);

        var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
            console.error("frame buffer status:" + status.toString());
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        return (texture);
    };

    proto.unbindTexture = function (attachment) {
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, this.gl.TEXTURE_2D, null, 0);
    };

    proto.bind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);

    }

    proto.unbind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    function framebuffer(gl) {


        this.uuid = $guidi();
        this.buffer = gl.createFramebuffer();
        this.gl = gl;

        return (this);

    }


    return framebuffer;

});

tge.rendertarget = $extend(function (proto,_super) {



    proto.getColorDisplay = function (callback, depth) {
        var display = new tge.model(tge.geometry.plane({ width: 1, height: this.colorTexture.height / this.colorTexture.width, divs: 1 }));
        display.meshes[0].material.ambientTexture = this.colorTexture;

        if (depth) display.meshes[0].material.ambientTexture = this.depthTexture;
        if (callback) callback(display, display.meshes[0]);
        return (display);
    }
    proto.resize = function (width, height) {
        this.colorTexture.width = width;
        this.colorTexture.height = height;
        this.colorTexture.update(this.gl);
        if (this.depthTexture && this.depthTexture.targetId === this.uuid) {
            this.depthTexture.width = width;
            this.depthTexture.height = height;
            this.depthTexture.update(this.gl);
        }
    }

    proto.setDepthTexture = function (depthTexture) {
        this.depthTexture = this.bindTexture(depthTexture, this.gl.DEPTH_ATTACHMENT);
    }

    proto.setViewportPer = function (left, top, right, bottom) {
        this.vpLeft = this.colorTexture.width * left;
        this.vpTop = this.colorTexture.height * top;
        this.vpRight = this.colorTexture.width * right;
        this.vpBottom = this.colorTexture.height * bottom;
        return (this)
    };
    proto.setViewport = function (left, top, right, bottom) {
        this.vpLeft = left;
        this.vpTop = top;
        this.vpRight = right;
        this.vpBottom = bottom;
    };


    proto.setDefaultViewport = function () {
        this.setViewportPer(0, 0, 1, 1);
        return (this)
    };
    proto.bind = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.applyViewport();
        if (this.clearBuffer) this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        return (this)
    };

    proto.applyViewport = function () {
        this.gl.viewport(this.vpLeft, this.vpTop, this.vpRight - this.vpLeft, this.vpBottom - this.vpTop);
        return (this)
    };
    proto.bindOnly = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
        this.gl.viewport(this.vpLeft, this.vpTop, this.vpRight - this.vpLeft, this.vpBottom - this.vpTop);
        return (this)
    };

    proto.clear = function () {
        if (this.clearBuffer) this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    }
    function rendertarget(gl, width, height, withDepth) {
        _super.apply(this, arguments);
        this.colorTexture = this.bindTexture(new tge.texture(null, false, false, false, width, height), gl.COLOR_ATTACHMENT0);

        if (withDepth) {
            this.depthTexture = this.bindTexture(new tge.texture(null, gl.DEPTH_COMPONENT, tge.TEXTURE_FORMAT_TYPE.UNSIGNED_SHORT, false, width, height), gl.DEPTH_ATTACHMENT);
            this.depthTexture.targetId = this.uuid;
        }
        this.vpLeft = 0;
        this.vpTop = 0;
        this.width = width;
        this.height = height;
        this.vpBottom = height;
        this.vpRight = width;
        this.clearBuffer = true;       
        this.setDefaultViewport();
        
        return (this);



    }


    return rendertarget;

}, tge.framebuffer);



/*./material.js*/



tge.material_base = $extend(function (proto) {

    proto.setDiffuse = function (r, g, b) {
        tge.vec3.set(this.diffuse, r, g, b);
        return (this);
    };

    proto.setAmbient = function (r, g, b) {
        tge.vec3.set(this.ambient, r, g, b);
        return (this);
    };

    proto.setSpecular = function (r, g, b) {
        tge.vec3.set(this.specular, r, g, b);
        return (this);
    };

    proto.setDiffuseRandom = function () {
        tge.vec3.set(this.diffuse, Math.random(), Math.random(), Math.random());
        return (this);
    }

    proto.setAmbientRandom = function () {
        tge.vec3.set(this.ambient, Math.random(), Math.random(), Math.random());
        return (this);
    }
    proto.setSpecularRandom = function () {
        tge.vec3.set(this.specular, Math.random(), Math.random(), Math.random());
        return (this);
    }

    function material_base(options) {
        options = options || {};
        this.internalData = new Float32Array(16);
        this.ambient = new Float32Array(this.internalData.buffer, 0, 4);
        this.diffuse = new Float32Array(this.internalData.buffer, 4 * 4, 4);
        this.specular = new Float32Array(this.internalData.buffer, 8 * 4, 4);


        tge.vec3.copy(this.ambient, options.ambient || [0.5, 0.5, 0.5]);
        tge.vec3.copy(this.diffuse, options.diffuse || [0.5, 0.5, 0.5]);
        tge.vec3.copy(this.specular, options.specular || [0.3, 0.3, 0.3]);
        return (this);

    }

    return material_base;

});


tge.material = $extend(function (proto,_super) {
    $assign(proto, tge.flags.prototype);

    proto.setTansparency = function (v) {
        if (v > 1) v = 1;
        this.ambient[3] = v;
        if (v < 1) this.setFlag(tge.SHADING.TRANSPARENT);
        else this.unsetFlag(tge.SHADING.TRANSPARENT);
        return (this);
    };
    proto.setShinness = function (shin) {
        this.specular[3] = shin;
        return (this);
    };

    proto.setDepthTest = function (on) {
        if (on)
            this.unsetFlag(tge.SHADING.NO_DEPTH_TEST);
        else
            this.setFlag(tge.SHADING.NO_DEPTH_TEST);

        return (this)

    }


    proto.renderMesh = function (engine, shader, mesh) {

        if (!shader.shadowShader) {
            if (shader.setUniform("tge_u_objectMaterial", this.internalData)) {
                engine.useTexture(this.ambientTexture, 0);
                if (shader.setUniform("tge_u_normalMap", 1)) {
                    engine.useTexture(this.normalMap, 1);
                }
                shader.setUniform("tge_u_textureMatrix", this.textureMatrix);
            }
        }
        

        engine.updateModelUniforms(mesh.model);
        mesh.drawCount = mesh.geo.numItems;

        if (mesh.geo.indexData) {
            engine.gl.drawElements(this.drawType, mesh.drawCount, engine.gl.UNSIGNED_SHORT, mesh.drawOffset);
        }
        else {
            engine.gl.drawArrays(this.drawType, mesh.drawOffset, mesh.drawCount);
        }

    }
    proto.useShader = function (shader,engine) {
        if ((this.flags & tge.SHADING.NO_DEPTH_TEST) !== 0) {
            engine.gl.disable(engine.gl.DEPTH_TEST);
        }
        else {
            engine.gl.enable(engine.gl.DEPTH_TEST);
        }
    };
    proto.clone = function () {
        var mat = new tge.material();
        tge.mat4.copy(mat.internalData, this.internalData);
        mat.ambientTexture = this.ambientTexture;
        mat.diffuseTexture = this.diffuseTexture;
        mat.specularTexture = this.specularTexture;
        mat.normalMap = this.normalMap;
        mat.shader = this.shader;
        mat.flags = this.flags;
        mat.drawType = this.drawType;

        return (mat);
    };


   
    function material(options) {
        options = options || {};
        _super.apply(this, arguments);
        tge.flags.apply(this, arguments);

        this.uuid = $guidi();
        this.ambient[3] = 1;

        this.textureMatrix = tge.mat3();

        this.shader = tge.material.shader;

        this.ambientTexture = null;
        this.normalMap = null;
        this.envMap = null;
        this.dispMap = null;
        this.flags = tge.SHADING.FLAT | tge.SHADING.DEPTH_TEST;
        this.drawType = tge.DRAW_TYPES.TRIANGLES;
        this.setShinness(options.shinness || 100);

        return (this);

    }
    material.shader = tge.pipleline_shader.parse(`<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('mesh-attributes-flat')?>

uniform mat4 tge_u_viewProjectionMatrix;
uniform mat4 tge_u_modelMatrix;

varying vec4 tge_v_shadow_vertex;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;

void vertex(){
initPipelineParams();
tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
gl_Position = tge_u_viewProjectionMatrix* tge_v_shadow_vertex;
tge_v_color= tge_a_color;
tge_v_uv= tge_a_uv;

}


<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
uniform mat4 tge_u_objectMaterial;
uniform sampler2D tge_u_ambientTexture;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;
varying vec4 tge_v_shadow_vertex;
void fragment(void) {
initPipelineParams();
gl_FragColor = texture2D(tge_u_ambientTexture, tge_v_uv) * tge_v_color * tge_u_objectMaterial[0];
}`);

    material.init = function () {
        tge.material.Brass = new tge.material({ ambient: [0.329412, 0.223529, 0.027451], diffuse: [0.780392, 0.568627, 0.113725], specular: [0.992157, 0.941176, 0.807843], shinness: 27.8974 });
        tge.material.Polished_Bronze = new tge.material({ ambient: [0.25, 0.148, 0.06475], diffuse: [0.4, 0.2368, 0.1036], specular: [0.774597, 0.458561, 0.200621], shinness: 76.8 });
        tge.material.Chrome = new tge.material({ ambient: [0.25, 0.25, 0.25], diffuse: [0.4, 0.4, 0.4], specular: [0.774597, 0.774597, 0.774597], shinness: 76.8 });
        tge.material.Copper = new tge.material({ ambient: [0.19125, 0.0735, 0.0225], diffuse: [0.7038, 0.27048, 0.0828], specular: [0.256777, 0.137622, 0.086014], shinness: 12.8 });
        tge.material.Polished_Copper = new tge.material({ ambient: [0.2295, 0.08825, 0.0275], diffuse: [0.5508, 0.2118, 0.066], specular: [0.580594, 0.223257, 0.0695701], shinness: 51.2 });
        tge.material.Gold = new tge.material({ ambient: [0.24725, 0.1995, 0.0745], diffuse: [0.75164, 0.60648, 0.22648], specular: [0.628281, 0.555802, 0.366065], shinness: 51.2 });
        tge.material.Polished_Gold = new tge.material({ ambient: [0.24725, 0.2245, 0.0645], diffuse: [0.34615, 0.3143, 0.0903], specular: [0.797357, 0.723991, 0.208006], shinness: 83.2 });
        tge.material.Pewter = new tge.material({ ambient: [0.105882, 0.058824, 0.113725], diffuse: [0.427451, 0.470588, 0.541176], specular: [0.333333, 0.333333, 0.521569], shinness: 9.84615 });
        tge.material.Silver = new tge.material({ ambient: [0.19225, 0.19225, 0.19225], diffuse: [0.50754, 0.50754, 0.50754], specular: [0.508273, 0.508273, 0.508273], shinness: 51.2 });
        tge.material.Polished_Silver = new tge.material({ ambient: [0.23125, 0.23125, 0.23125], diffuse: [0.2775, 0.2775, 0.2775], specular: [0.773911, 0.773911, 0.773911], shinness: 89.6 });
        tge.material.Emerald = new tge.material({ ambient: [0.0215, 0.1745, 0.0215], diffuse: [0.07568, 0.61424, 0.07568], specular: [0.633, 0.727811, 0.633], shinness: 76.8 });
        tge.material.Jade = new tge.material({ ambient: [0.135, 0.2225, 0.1575], diffuse: [0.54, 0.89, 0.63], specular: [0.316228, 0.316228, 0.316228], shinness: 12.8 });
        tge.material.Obsidian = new tge.material({ ambient: [0.05375, 0.05, 0.06625], diffuse: [0.18275, 0.17, 0.22525], specular: [0.332741, 0.328634, 0.346435], shinness: 38.4 });
        tge.material.Pearl = new tge.material({ ambient: [0.25, 0.20725, 0.20725], diffuse: [1.0, 0.829, 0.829], specular: [0.296648, 0.296648, 0.296648], shinness: 11.264 });
        tge.material.Ruby = new tge.material({ ambient: [0.1745, 0.01175, 0.01175], diffuse: [0.61424, 0.04136, 0.04136], specular: [0.727811, 0.626959, 0.626959], shinness: 76.8 });
        tge.material.Turquoise = new tge.material({ ambient: [0.1, 0.18725, 0.1745], diffuse: [0.396, 0.74151, 0.69102], specular: [0.297254, 0.30829, 0.306678], shinness: 12.8 });
        tge.material.Black_Plastic = new tge.material({ ambient: [0.0, 0.0, 0.0], diffuse: [0.01, 0.01, 0.01], specular: [0.50, 0.50, 0.50], shinness: 32 });
        tge.material.Black_Rubber = new tge.material({ ambient: [0.02, 0.02, 0.02], diffuse: [0.01, 0.01, 0.01], specular: [0.4, 0.4, 0.4], shinness: 10 });


        tge.material.Lines = tge.material.Black_Rubber.clone();
        tge.material.Lines.drawType = tge.DRAW_TYPES.LINES;



        tge.material.Lines.setFlag(tge.SHADING.NO_DEPTH_TEST);

        tge.material.Lines.setAmbient(0.2528, 0.2528, 0.2528);

        tge.material.LinesSelected = tge.material.Lines.clone();
        tge.material.LinesSelected.setAmbient(1, 1, 1);

        tge.material.Points = tge.material.LinesSelected.clone();
        tge.material.Lines.drawType = tge.DRAW_TYPES.POINT;

        tge.material.LinesRed = tge.material.Lines.clone();
        tge.material.LinesRed.setAmbient(1, 0, 0);
        tge.material.LinesGreen = tge.material.Lines.clone();
        tge.material.LinesGreen.setAmbient(0, 1, 0);
    }
    return material;

}, tge.material_base); tge.material.init();


tge.phong_material = $extend(function (proto, _super) {
   
    function phong_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.phong_material.shader;
        this.flags = tge.SHADING.SHADED;
        return (this);

    }

   
    phong_material.shader = tge.pipleline_shader.parse(`<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('mesh-attributes-all')?>
<?=chunk('camera-matrix-all')?>
<?=chunk('model-matrix-all')?>


varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;


void vertex(){
initPipelineParams();
tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
gl_Position = tge_u_modelMatrix * vec4(tge_a_position, 1.0);
tge_v_normal = normalize(tge_u_modelMatrix * vec4(tge_a_normal,0.0)).xyz;
tge_v_uv = (tge_u_textureMatrix * vec3(tge_a_uv, 1.0)).xy;
gl_Position = tge_u_viewProjectionMatrix * tge_v_shadow_vertex;
}

<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('lights-material-all')?>
<?=chunk('lights-matrix-all')?>

uniform mat4 tge_u_objectMaterial;
uniform vec4 tge_u_eyePosition;
uniform sampler2D tge_u_ambientTexture;

varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;

<?=chunk('fws_lighting')?>


void fragment(void) {
initPipelineParams();
vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);
<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
fws_totalLight += fws_lighting(
tge_u_objectMaterial,
tge_u_lightMaterial<?=i?>,
tge_v_shadow_vertex.xyz, normalize(tge_v_normal), fws_directionToEye,
tge_u_lightMatrix<?=i?>[3].xyz - tge_v_shadow_vertex.xyz,
tge_u_lightMatrix<?=i?>[2].xyz);
<?}?>
gl_FragColor = vec4(fws_totalLight, tge_u_objectMaterial[0].w) * texture2D(tge_u_ambientTexture, tge_v_uv);
gl_FragColor.w *= tge_u_objectMaterial[0].w;
}

`);

    return phong_material;

}, tge.material);



tge.parallax_material = $extend(function (proto, _super) {

    function parallax_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.parallax_material.shader;
        this.dispMapScale = 0.4;
        this.dispMapOffset = -1;
        $merge(options, this);
        return (this);
    }
    proto.useShader = (function (super_useShader) {
        var dispParams = tge.vec4();
        return function (shader,engine) {
            super_useShader.apply(this, [shader, engine]);



            dispParams[0] = this.dispMapScale;
            dispParams[1] = this.dispMapOffset;
            shader.setUniform("tge_u_dispParams", dispParams);
        }
    })(proto.useShader);
    
    parallax_material.shader = tge.phong_material.shader.extend(`varying mat3 tge_v_tbnMatrix;

void vertex(){
super_vertex();
vec3 t = normalize((tge_u_modelMatrix * tge_a_tangent).xyz);
t = normalize(t - dot(t, tge_v_normal) * tge_v_normal);
tge_v_tbnMatrix = mat3(t, cross(tge_v_normal, t), tge_v_normal);
}

varying mat3 tge_v_tbnMatrix;
uniform sampler2D tge_u_normalMap;
uniform sampler2D tge_u_dispMap;


uniform vec4 tge_u_dispParams;
void fragment(){
 initPipelineParams();

vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);

float baseBias = tge_u_dispParams.x/2.0;
float bias =-baseBias + baseBias * tge_u_dispParams.y;

vec2 uv=tge_v_uv+(fws_directionToEye*tge_v_tbnMatrix).xy* (texture2D(tge_u_dispMap, tge_v_uv).r * tge_u_dispParams.x + bias);;

vec3 normal = normalize(tge_v_tbnMatrix * (2.0 * texture2D(tge_u_normalMap, uv).xyz - 1.0));

vec4 amb=texture2D(tge_u_ambientTexture, uv);
<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
fws_totalLight += fws_lighting(
tge_u_objectMaterial,
tge_u_lightMaterial<?=i?>,
tge_v_shadow_vertex.xyz, normal, fws_directionToEye,
tge_u_lightMatrix<?=i?>[3].xyz - tge_v_shadow_vertex.xyz,
tge_u_lightMatrix<?=i?>[2].xyz);
<?}?>
gl_FragColor = vec4(fws_totalLight, tge_u_objectMaterial[0].w) * amb;
gl_FragColor.w *= tge_u_objectMaterial[0].w;


}












`);

    return parallax_material;

}, tge.phong_material);



/*./mesh.js*/




tge.mesh = $extend(function (proto) {


    var defaultModel = null;
    function mesh(geo,material) {
        this.uuid = $guidi();
        this.geo = geo;
        this.drawOffset = 0;        
        this.material = material || new tge.material();  
        if (defaultModel === null && tge.model) {
            defaultModel = new tge.model();
        }

        this.model = defaultModel;
    }


    return mesh;

});


/*./model.js*/




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

    function model(geo, material) {
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
        if (geo) {
            this.addMesh(new tge.mesh(geo, material));
        }

        return (this);

    }


    return model;

}, tge.transfrom_node);


/*./camera.js*/





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


/*./light.js*/




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
            shader.default_shadow_receiver = tge.pipleline_shader.parse(`
<?=chunk('precision')?>
uniform sampler2D tge_u_shadowMap;
uniform sampler2D ambientTexture;
uniform mat4 tge_u_viewMatrixInv;
varying vec4 tge_v_shadow_vertex;
uniform mat4 tge_u_lightCameraMatrix;

uniform vec4 tge_u_shadow_params;

<?=chunk('shadow-sampling')?>

float getShadowSampleVariance( mat4 lightMatrix) {

float shadowmap_size=tge_u_shadow_params.z;
float shadow_bias=tge_u_shadow_params.x;
vec4 projCoords = lightMatrix * tge_v_shadow_vertex;
projCoords.xyz = projCoords.xyz / projCoords.w;
projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
if (projCoords.y > 1.0 || projCoords.x > 1.0 || projCoords.z > 1.0) return (0.0);
if (projCoords.y < 0.0 || projCoords.x < 0.0 || projCoords.z < 0.0) return (0.0);
float bias = projCoords.z - (1.0/shadowmap_size) * shadow_bias;
return 0.5 - SampleVarianceShadowMap(tge_u_shadowMap, projCoords.xy, bias, 0.0000001,0.0);

}


void fragment(){
float shadowOpacity=tge_u_shadow_params.y;
gl_FragColor = vec4(shadowOpacity)* getShadowSampleVariance(tge_u_lightCameraMatrix) ;
}`, shader, true);
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


/*src/engine.js*/






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




        gl.enable(gl.DEPTH_TEST);
        gl.cullFace(gl.BACK);
        gl.enable(gl.CULL_FACE);
        gl.clearColor(0, 0, 0, 1);

       

    }


    proto.setSize = function (width, height) {
        this.gl.canvas.width = width * this.gl.pixelRatio;
        this.gl.canvas.height = height * this.gl.pixelRatio;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    };


    proto.clearScreen = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        return (this);
    };

    proto.setDefaultViewport = function () {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.lastRenderTargetId = -1;
        return (this)
    };

    proto.useShader = function (shader) {
        if (this.lastShaderId != shader.uuid) {         
            if (!shader.compiled) tge.shader.compile(this.gl, shader, this.shaderParameters);
            this.gl.useProgram(shader.program);
            this.activeShader = shader;
            this.activeShader.cameraVersion = -1;
            this.lastShaderId = shader.uuid;
            return (true);
        }
        return (false);
    };

    proto.useMaterial = function (material , shader) {
        if (this.lastShaderId != shader.uuid) {
            if (!shader.compiled) tge.shader.compile(this.gl, shader, this.shaderParameters);
            this.gl.useProgram(shader.program);
            this.activeShader = shader;
            this.activeShader.cameraVersion = -1;
            this.lastShaderId = shader.uuid;
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





       

        return function (camera, meshes, lights) {
           


            if (this.isError) {
                return;
            }

            time = performance.now();
            this.frameTimeDelta = this.frameTime - time;
            this.frameTime = time;
            this.lastShaderId = -1;

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
            for (i1 = 0; i1 < lights.length; i1++) {
                light = lights[i1];
                if (light.castShadows) {
                    light.renderShadows(this, camera, castShadowMeshes, receiveShadowMeshes);
                }
            }



            _this.textureSlots[0] = -1;
            _this.updateTextures();
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


/*./scene.js*/






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
                        mesh.camZ = model.modelViewPosition[2];
                        if (mesh.modelMatrix) {
                            tge.mat4.mul(tempMatrix, camera.matrixWorldInvserse, mesh.modelMatrix);
                            mesh.camZ = tempMatrix[14];
                        }
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


/*src/app.js*/





tge.app = $extend(function (proto) {

    proto.mouseDrage = function () {
        this.events('mouseDrage', arguments);
    };
    proto.mouseDrage2 = function () {
        this.events('mouseDrage2', arguments);
    };
    proto.mouseWheel = function () {
        this.events('mouseWheel', arguments);
    };

    var app;
    proto.enableMouseControl = function () {
        app = this;
        document.addEventListener('contextmenu', event => event.preventDefault());
        app.element.addEventListener((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel", function (e) {
            var sp = e.detail ? e.detail * (-120) : e.wheelDelta;
            app.mouseWheel(sp, e);
        }, false);
        app.element.addEventListener('pointerdown', function (e) {
            app.mouseDownX = e.x;
            app.mouseDownY = e.y;
        });
        app.element.addEventListener('pointermove', function (e) {
            app.mouseButtons = e.buttons;
            app.mouseX = e.x;
            app.mouseY = e.y;

            if (e.buttons == 1) {
                app.mouseDX = (e.x - app.mouseDownX);
                app.mouseDY = (e.y - app.mouseDownY);
                app.mouseDrage(app.mouseDX, app.mouseDY, e);
                app.mouseDownX = e.x;
                app.mouseDownY = e.y;
            }

            if (e.buttons == 2) {
                app.mouseDX = (e.x - app.mouseDownX);
                app.mouseDY = (e.y - app.mouseDownY);
                app.mouseDrage2(app.mouseDX, app.mouseDY, e);
                app.mouseDownX = e.x;
                app.mouseDownY = e.y;
            }


        });
    };
   
    proto.playLoop = function (loopCallback, delay) {
        delay = delay || 0;
        app = this;

        app.fpsCounter = 0;
        app.fpsTimer = 0;
        app.fps = 0;
        app.currentTimer = 0;
        app.currentTimer = performance.now();
        app.loopCallbackTime = app.currentTimer - delay;
        app.loopCallbackDelay = delay;
        var args = [0, 0, 0];
        app.onError = false;
        app._callback = function () {
            app.currentTimer = performance.now();
            args[0] = app.currentTimer - app.loopCallbackTime;
            args[1] = app.currentTimer;
            if (app.currentTimer - app.loopCallbackTime > delay) {
                app.loopCallbackTime = app.currentTimer;
                app.countFPS();
                loopCallback.apply(app.engine, args);
            }
            if (!app.onError) requestAnimationFrame(app._callback);
        }
        app._callback();
    };

    proto.countFPS = function () {
        if (this.currentTimer - this.fpsTimer > 1000) {
            this.fps = this.fpsCounter;
            this.fpsTimer = this.currentTimer;
            this.fpsCounter = 0;
        }
        else {
            this.fpsCounter++;
        }
    };
    function app(parameters) {

        this.engine = new tge.engine(parameters);

        this.element = this.engine.gl.canvas;
        this.events = new $eventsystem();
        return (this);
    }


    return app;

});

tge.demo = function (parameters, cb) {
    var app = new tge.app(parameters);


    app.engine.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.element);
    console.log(app);

    var scene = new tge.scene();
    

    scene.createRandomModelsGrid = function (range, step, onModel, material) {
        var geos = [];
        geos.push(tge.geometry.cube({ size: 2 }));
        geos.push(tge.geometry.sphere());
        material = material || tge.phong_material;
        for (var x = -range; x <= range; x += step) {
            for (var z = -range; z <= range; z += step) {
                scene.addModel(new tge.model(geos[Math.floor(Math.random() * geos.length)], new material()), function (md, mesh) {
                    md.setPosition(x, 0, z);
                    mesh.material.setAmbientRandom();
                    onModel(md);
                });
            }
        }
    }

    console.log(scene);



    var camera = new tge.perspective_camera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    console.log(camera);
    app.mouseDrage = function (dx, dy, e) {
        camera.moveLeftRight(-dx * 0.1);
        camera.moveUpDown(dy * 0.1);
    };

    app.mouseDrage2 = function (dx, dy, e) {
        camera.yawPitch(-dy * 0.005, -dx * 0.005);
    };
    app.mouseWheel = function (sp, e) {
        if (e.shiftKey) {
            camera.moveFrontBack(-0.0005 * sp);
        }
        else camera.moveFrontBack(-0.01 * sp);
    };
    app.enableMouseControl();
    app.fpsDisplay = document.createElement('h3');
    app.fpsDisplay.setAttribute('style', 'position:absolute;left:5px;top:-5px;color:white');
    document.body.appendChild(app.fpsDisplay);

    app.infoDisplay = document.createElement('h4');
    app.infoDisplay.setAttribute('style', 'position:absolute;left:5px;bottom:0px;color:white');
    document.body.appendChild(app.infoDisplay);

    app.info = "";
    app.playLoop = (function (superFunc) {
        return (function (renderCallback, tm) {
            var lastFpsDisplayTime = 0;
            superFunc.apply(app, [function (delta, time) {

                if (app.currentTimer - lastFpsDisplayTime > 200) {
                    app.fpsDisplay.innerHTML = app.fps;
                    lastFpsDisplayTime = app.currentTimer;
                    app.infoDisplay.innerHTML = app.info;
                }

                renderCallback(delta);
            }, tm]);
        });
    })(app.playLoop);    
    tge.demoApp = app;
    if (cb) cb(app, app.engine,scene,camera);
};

/*src/main.js*/








