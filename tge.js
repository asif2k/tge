
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


var $maptypedarray = (function () {
    var item_size, total_groups, i,contructor;
    var contructors = {};

    function setContructor(c) {
        contructors['[object ' + c.name.toLowerCase()+']'] = c;
    }
    setContructor(Float32Array);
    setContructor(Int32Array);
    setContructor(Int16Array);
    setContructor(Uint32Array);
    setContructor(Uint16Array);
    setContructor(Uint8Array);

    console.log("contructors", contructors);

    return function (arr,group_size) {
        var groups = [];

        
        contructor = contructors[Object.prototype.toString.call(arr).toLowerCase()];

        if (!contructor) {
            console.error('invalid contructor', Object.prototype.toString.call(arr));
        }
        total_groups = arr.length / group_size;
        item_size = arr.byteLength / arr.length;


        for (i = 0; i < total_groups; i++) {
            groups[i] = new contructor(arr.buffer, ((i * group_size) * item_size), group_size);
        }

        return groups;


    }
})();

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

var $mergesort = (function (array, comparefn) {
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

var $load_image_data = (function () {
    var canv = $create_canvas(1, 1);
    var img = new Image();
    return function (url, cb,w,h) {
        img.onload = function () {
            canv.setSize(w || this.width, h || this.height);
            canv.ctx.drawImage(this, 0, 0, canv.width, canv.height);
            if (cb) cb(canv._getImageData().data);
            canv._putImageData();
        }
        img.src = url;
    }

})();


function $create_canvas(w, h) {
    var temp_canvas = document.createElement('canvas');
    temp_canvas.ctx = temp_canvas.getContext('2d');
    temp_canvas.width = w;
    temp_canvas.height = h;
    temp_canvas.setSize = function (ww, hh) {
        this.width = ww;
        this.height = hh;
    };
    temp_canvas._getImageData = function () {
        this.imd = this.ctx.getImageData(0, 0, this.width, this.height);
        return this.imd;
    };

    temp_canvas._putImageData = function () {
        this.ctx.putImageData(this.imd, 0, 0);
    };

    return (temp_canvas);
}

var tge = {};



$assign(tge, {
    ATTRIBUTES: {
        POSITION: 2,
        NORMALS: 4,
        UVS: 8,
        COLORS: 16,
        TANGENTS: 32
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
    SHADING: {
        FLAT: 2,
        SHADED: 4,
        CAST_SHADOW: 8,
        RECEIVE_SHADOW: 16,
        WIREFRAME: 32,
        RECEIVE_REFLECTION: 64,
        TRANSPARENT: 128,
        OPUQUE: 256,
        DEPTH_TEST: 512,
        NO_DEPTH_TEST: 1024,
        DOUBLE_SIDES: 2048,
        SHADOW_DOUBLE_SIDES: 4096,

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


    Math.clamp = Math.clamp || function (v, l, h) {
        return Math.max(Math.min(v, h), l);
    };

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
        scaleAndAdd: function (out, a, b, scale) {
            out[0] = a[0] + (b[0] * scale);
            out[1] = a[1] + (b[1] * scale);
            out[2] = a[2] + (b[2] * scale);
            return out;
        },
        transformMat4: function (out, a, m) {
            x = a[0]; y = a[1]; z = a[2];
            out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]);
            out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]);
            out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]);

            return out;
        },
        lerp: function (out, a, b, l) {
            out[0] = a[0] + (b[0] - a[0]) * l;
            out[1] = a[1] + (b[1] - a[1]) * l;
            out[2] = a[2] + (b[2] - a[2]) * l;



            return out;
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


    tge.perlin_noise = (function () {

        var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10,
            23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87,
            174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
            133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
            89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
            202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119,
            248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
            178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249,
            14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205,
            93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

        for (var i = 0; i < 256; i++) {

            p[256 + i] = p[i];

        }

        function fade(t) {

            return t * t * t * (t * (t * 6 - 15) + 10);

        }

        function lerp(t, a, b) {

            return a + t * (b - a);

        }

        function grad(hash, x, y, z) {

            var h = hash & 15;
            var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
            return ((h & 1) == 0 ? u : - u) + ((h & 2) == 0 ? v : - v);

        }

        return function (x, y, z) {

            var floorX = Math.floor(x), floorY = Math.floor(y), floorZ = Math.floor(z);

            var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;

            x -= floorX;
            y -= floorY;
            z -= floorZ;

            var xMinus1 = x - 1, yMinus1 = y - 1, zMinus1 = z - 1;

            var u = fade(x), v = fade(y), w = fade(z);

            var A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

            return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                grad(p[BA], xMinus1, y, z)),
                lerp(u, grad(p[AB], x, yMinus1, z),
                    grad(p[BB], xMinus1, yMinus1, z))),
                lerp(v, lerp(u, grad(p[AA + 1], x, y, zMinus1),
                    grad(p[BA + 1], xMinus1, y, z - 1)),
                    lerp(u, grad(p[AB + 1], x, yMinus1, zMinus1),
                        grad(p[BB + 1], xMinus1, yMinus1, zMinus1))));

        }

    })();

})();



/*./gl_constants.js*/

GL_ACTIVE_ATTRIBUTES = 35721;
GL_ACTIVE_TEXTURE = 34016;
GL_ACTIVE_UNIFORMS = 35718;
GL_ALIASED_LINE_WIDTH_RANGE = 33902;
GL_ALIASED_POINT_SIZE_RANGE = 33901;
GL_ALPHA = 6406;
GL_ALPHA_BITS = 3413;
GL_ALWAYS = 519;
GL_ARRAY_BUFFER = 34962;
GL_ARRAY_BUFFER_BINDING = 34964;
GL_ATTACHED_SHADERS = 35717;
GL_BACK = 1029;
GL_BLEND = 3042;
GL_BLEND_COLOR = 32773;
GL_BLEND_DST_ALPHA = 32970;
GL_BLEND_DST_RGB = 32968;
GL_BLEND_EQUATION = 32777;
GL_BLEND_EQUATION_ALPHA = 34877;
GL_BLEND_EQUATION_RGB = 32777;
GL_BLEND_SRC_ALPHA = 32971;
GL_BLEND_SRC_RGB = 32969;
GL_BLUE_BITS = 3412;
GL_BOOL = 35670;
GL_BOOL_VEC2 = 35671;
GL_BOOL_VEC3 = 35672;
GL_BOOL_VEC4 = 35673;
GL_BROWSER_DEFAULT_WEBGL = 37444;
GL_BUFFER_SIZE = 34660;
GL_BUFFER_USAGE = 34661;
GL_BYTE = 5120;
GL_CCW = 2305;
GL_CLAMP_TO_EDGE = 33071;
GL_COLOR_ATTACHMENT0 = 36064;
GL_COLOR_BUFFER_BIT = 16384;
GL_COLOR_CLEAR_VALUE = 3106;
GL_COLOR_WRITEMASK = 3107;
GL_COMPILE_STATUS = 35713;
GL_COMPRESSED_TEXTURE_FORMATS = 34467;
GL_CONSTANT_ALPHA = 32771;
GL_CONSTANT_COLOR = 32769;
GL_CONTEXT_LOST_WEBGL = 37442;
GL_CULL_FACE = 2884;
GL_CULL_FACE_MODE = 2885;
GL_CURRENT_PROGRAM = 35725;
GL_CURRENT_VERTEX_ATTRIB = 34342;
GL_CW = 2304;
GL_DECR = 7683;
GL_DECR_WRAP = 34056;
GL_DELETE_STATUS = 35712;
GL_DEPTH_ATTACHMENT = 36096;
GL_DEPTH_BITS = 3414;
GL_DEPTH_BUFFER_BIT = 256;
GL_DEPTH_CLEAR_VALUE = 2931;
GL_DEPTH_COMPONENT = 6402;
GL_DEPTH_COMPONENT16 = 33189;
GL_DEPTH_FUNC = 2932;
GL_DEPTH_RANGE = 2928;
GL_DEPTH_STENCIL = 34041;
GL_DEPTH_STENCIL_ATTACHMENT = 33306;
GL_DEPTH_TEST = 2929;
GL_DEPTH_WRITEMASK = 2930;
GL_DITHER = 3024;
GL_DONT_CARE = 4352;
GL_DST_ALPHA = 772;
GL_DST_COLOR = 774;
GL_DYNAMIC_DRAW = 35048;
GL_ELEMENT_ARRAY_BUFFER = 34963;
GL_ELEMENT_ARRAY_BUFFER_BINDING = 34965;
GL_EQUAL = 514;
GL_FASTEST = 4353;
GL_FLOAT = 5126;
GL_FLOAT_MAT2 = 35674;
GL_FLOAT_MAT3 = 35675;
GL_FLOAT_MAT4 = 35676;
GL_FLOAT_VEC2 = 35664;
GL_FLOAT_VEC3 = 35665;
GL_FLOAT_VEC4 = 35666;
GL_FRAGMENT_SHADER = 35632;
GL_FRAMEBUFFER = 36160;
GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049;
GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048;
GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051;
GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050;
GL_FRAMEBUFFER_BINDING = 36006;
GL_FRAMEBUFFER_COMPLETE = 36053;
GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
GL_FRAMEBUFFER_UNSUPPORTED = 36061;
GL_FRONT = 1028;
GL_FRONT_AND_BACK = 1032;
GL_FRONT_FACE = 2886;
GL_FUNC_ADD = 32774;
GL_FUNC_REVERSE_SUBTRACT = 32779;
GL_FUNC_SUBTRACT = 32778;
GL_GENERATE_MIPMAP_HINT = 33170;
GL_GEQUAL = 518;
GL_GREATER = 516;
GL_GREEN_BITS = 3411;
GL_HIGH_FLOAT = 36338;
GL_HIGH_INT = 36341;
GL_IMPLEMENTATION_COLOR_READ_FORMAT = 35739;
GL_IMPLEMENTATION_COLOR_READ_TYPE = 35738;
GL_INCR = 7682;
GL_INCR_WRAP = 34055;
GL_INT = 5124;
GL_INT_VEC2 = 35667;
GL_INT_VEC3 = 35668;
GL_INT_VEC4 = 35669;
GL_INVALID_ENUM = 1280;
GL_INVALID_FRAMEBUFFER_OPERATION = 1286;
GL_INVALID_OPERATION = 1282;
GL_INVALID_VALUE = 1281;
GL_INVERT = 5386;
GL_KEEP = 7680;
GL_LEQUAL = 515;
GL_LESS = 513;
GL_LINEAR = 9729;
GL_LINEAR_MIPMAP_LINEAR = 9987;
GL_LINEAR_MIPMAP_NEAREST = 9985;
GL_LINES = 1;
GL_LINE_LOOP = 2;
GL_LINE_STRIP = 3;
GL_LINE_WIDTH = 2849;
GL_LINK_STATUS = 35714;
GL_LOW_FLOAT = 36336;
GL_LOW_INT = 36339;
GL_LUMINANCE = 6409;
GL_LUMINANCE_ALPHA = 6410;
GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
GL_MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
GL_MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
GL_MAX_RENDERBUFFER_SIZE = 34024;
GL_MAX_TEXTURE_IMAGE_UNITS = 34930;
GL_MAX_TEXTURE_SIZE = 3379;
GL_MAX_VARYING_VECTORS = 36348;
GL_MAX_VERTEX_ATTRIBS = 34921;
GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
GL_MAX_VERTEX_UNIFORM_VECTORS = 36347;
GL_MAX_VIEWPORT_DIMS = 3386;
GL_MEDIUM_FLOAT = 36337;
GL_MEDIUM_INT = 36340;
GL_MIRRORED_REPEAT = 33648;
GL_NEAREST = 9728;
GL_NEAREST_MIPMAP_LINEAR = 9986;
GL_NEAREST_MIPMAP_NEAREST = 9984;
GL_NEVER = 512;
GL_NICEST = 4354;
GL_NONE = 0;
GL_NOTEQUAL = 517;
GL_NO_ERROR = 0;
GL_ONE = 1;
GL_ONE_MINUS_CONSTANT_ALPHA = 32772;
GL_ONE_MINUS_CONSTANT_COLOR = 32770;
GL_ONE_MINUS_DST_ALPHA = 773;
GL_ONE_MINUS_DST_COLOR = 775;
GL_ONE_MINUS_SRC_ALPHA = 771;
GL_ONE_MINUS_SRC_COLOR = 769;
GL_OUT_OF_MEMORY = 1285;
GL_PACK_ALIGNMENT = 3333;
GL_POINTS = 0;
GL_POLYGON_OFFSET_FACTOR = 32824;
GL_POLYGON_OFFSET_FILL = 32823;
GL_POLYGON_OFFSET_UNITS = 10752;
GL_RED_BITS = 3410;
GL_RENDERBUFFER = 36161;
GL_RENDERBUFFER_ALPHA_SIZE = 36179;
GL_RENDERBUFFER_BINDING = 36007;
GL_RENDERBUFFER_BLUE_SIZE = 36178;
GL_RENDERBUFFER_DEPTH_SIZE = 36180;
GL_RENDERBUFFER_GREEN_SIZE = 36177;
GL_RENDERBUFFER_HEIGHT = 36163;
GL_RENDERBUFFER_INTERNAL_FORMAT = 36164;
GL_RENDERBUFFER_RED_SIZE = 36176;
GL_RENDERBUFFER_STENCIL_SIZE = 36181;
GL_RENDERBUFFER_WIDTH = 36162;
GL_RENDERER = 7937;
GL_REPEAT = 10497;
GL_REPLACE = 7681;
GL_RGB = 6407;
GL_RGB5_A1 = 32855;
GL_RGB565 = 36194;
GL_RGBA = 6408;
GL_RGBA4 = 32854;
GL_SAMPLER_2D = 35678;
GL_SAMPLER_CUBE = 35680;
GL_SAMPLES = 32937;
GL_SAMPLE_ALPHA_TO_COVERAGE = 32926;
GL_SAMPLE_BUFFERS = 32936;
GL_SAMPLE_COVERAGE = 32928;
GL_SAMPLE_COVERAGE_INVERT = 32939;
GL_SAMPLE_COVERAGE_VALUE = 32938;
GL_SCISSOR_BOX = 3088;
GL_SCISSOR_TEST = 3089;
GL_SHADER_TYPE = 35663;
GL_SHADING_LANGUAGE_VERSION = 35724;
GL_SHORT = 5122;
GL_SRC_ALPHA = 770;
GL_SRC_ALPHA_SATURATE = 776;
GL_SRC_COLOR = 768;
GL_STATIC_DRAW = 35044;
GL_STENCIL_ATTACHMENT = 36128;
GL_STENCIL_BACK_FAIL = 34817;
GL_STENCIL_BACK_FUNC = 34816;
GL_STENCIL_BACK_PASS_DEPTH_FAIL = 34818;
GL_STENCIL_BACK_PASS_DEPTH_PASS = 34819;
GL_STENCIL_BACK_REF = 36003;
GL_STENCIL_BACK_VALUE_MASK = 36004;
GL_STENCIL_BACK_WRITEMASK = 36005;
GL_STENCIL_BITS = 3415;
GL_STENCIL_BUFFER_BIT = 1024;
GL_STENCIL_CLEAR_VALUE = 2961;
GL_STENCIL_FAIL = 2964;
GL_STENCIL_FUNC = 2962;
GL_STENCIL_INDEX8 = 36168;
GL_STENCIL_PASS_DEPTH_FAIL = 2965;
GL_STENCIL_PASS_DEPTH_PASS = 2966;
GL_STENCIL_REF = 2967;
GL_STENCIL_TEST = 2960;
GL_STENCIL_VALUE_MASK = 2963;
GL_STENCIL_WRITEMASK = 2968;
GL_STREAM_DRAW = 35040;
GL_SUBPIXEL_BITS = 3408;
GL_TEXTURE = 5890;
GL_TEXTURE0 = 33984;
GL_TEXTURE1 = 33985;
GL_TEXTURE2 = 33986;
GL_TEXTURE3 = 33987;
GL_TEXTURE4 = 33988;
GL_TEXTURE5 = 33989;
GL_TEXTURE6 = 33990;
GL_TEXTURE7 = 33991;
GL_TEXTURE8 = 33992;
GL_TEXTURE9 = 33993;
GL_TEXTURE10 = 33994;
GL_TEXTURE11 = 33995;
GL_TEXTURE12 = 33996;
GL_TEXTURE13 = 33997;
GL_TEXTURE14 = 33998;
GL_TEXTURE15 = 33999;
GL_TEXTURE16 = 34000;
GL_TEXTURE17 = 34001;
GL_TEXTURE18 = 34002;
GL_TEXTURE19 = 34003;
GL_TEXTURE20 = 34004;
GL_TEXTURE21 = 34005;
GL_TEXTURE22 = 34006;
GL_TEXTURE23 = 34007;
GL_TEXTURE24 = 34008;
GL_TEXTURE25 = 34009;
GL_TEXTURE26 = 34010;
GL_TEXTURE27 = 34011;
GL_TEXTURE28 = 34012;
GL_TEXTURE29 = 34013;
GL_TEXTURE30 = 34014;
GL_TEXTURE31 = 34015;
GL_TEXTURE_2D = 3553;
GL_TEXTURE_BINDING_2D = 32873;
GL_TEXTURE_BINDING_CUBE_MAP = 34068;
GL_TEXTURE_CUBE_MAP = 34067;
GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
GL_TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
GL_TEXTURE_MAG_FILTER = 10240;
GL_TEXTURE_MIN_FILTER = 10241;
GL_TEXTURE_WRAP_S = 10242;
GL_TEXTURE_WRAP_T = 10243;
GL_TRIANGLES = 4;
GL_TRIANGLE_FAN = 6;
GL_TRIANGLE_STRIP = 5;
GL_UNPACK_ALIGNMENT = 3317;
GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
GL_UNPACK_FLIP_Y_WEBGL = 37440;
GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
GL_UNSIGNED_BYTE = 5121;
GL_UNSIGNED_INT = 5125;
GL_UNSIGNED_SHORT = 5123;
GL_UNSIGNED_SHORT_4_4_4_4 = 32819;
GL_UNSIGNED_SHORT_5_5_5_1 = 32820;
GL_UNSIGNED_SHORT_5_6_5 = 33635;
GL_VALIDATE_STATUS = 35715;
GL_VENDOR = 7936;
GL_VERSION = 7938;
GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975;
GL_VERTEX_ATTRIB_ARRAY_ENABLED = 34338;
GL_VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922;
GL_VERTEX_ATTRIB_ARRAY_POINTER = 34373;
GL_VERTEX_ATTRIB_ARRAY_SIZE = 34339;
GL_VERTEX_ATTRIB_ARRAY_STRIDE = 34340;
GL_VERTEX_ATTRIB_ARRAY_TYPE = 34341;
GL_VERTEX_SHADER = 35633;
GL_VIEWPORT = 2978;
GL_ZERO = 0;


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
        this.indexData = new Uint32Array(indices);
        this.numItems = this.indexData.length;
        this.indexNeedsUpdate = true;
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
            tge.vec3.transformMat4(tempvec3, tempvec3, mat4);

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
            tge.quat.toMatrixWithScale(tge.quat.rotateEular(tempquat, rx, ry, rz), tempmat4, [sx, sy, sz])

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
        this.wireframe_index_data = null;
        this.wireframe_index_buffer = null;
        this.indexNeedsUpdate = false;
        this.version = 0;
        this.size = tge.vec3();
        return (this);

    }

    

    geometry.activate_index = (function () {


        var a, b, c, i, ii;
        function update_wireframe_indices(geo) {
            if (geo.wireframe_index_data === null) {
                geo.wireframe_index_data = new Uint32Array(geo.indexData.length * 2);
            } else if (geo.wireframe_index_data.length < geo.indexData.length * 2) {
                geo.wireframe_index_data = new Uint32Array(geo.indexData.length * 2);
            }

            ii = 0;
            for (i = 0; i < geo.indexData.length; i += 3) {
                a = geo.indexData[i + 0];
                b = geo.indexData[i + 1];
                c = geo.indexData[i + 2];

                geo.wireframe_index_data[ii] = a;
                geo.wireframe_index_data[ii + 1] = b;
                geo.wireframe_index_data[ii + 2] = b;
                geo.wireframe_index_data[ii + 3] = c;
                geo.wireframe_index_data[ii + 4] = c;
                geo.wireframe_index_data[ii + 5] = a;
                ii += 6;

            }

        }
        var indices=[];
        function update_wireframe_positions(geo) {            
            indices.length = 0;
            for (i = 0; i < (geo.attributes.tge_a_position.data.length / 3) - 1; i += 3) {
                a = i + 0;
                b = i + 1;
                c = i + 2;

                ii = indices.length;                
                indices[ii] = a;
                indices[ii + 1] = b;
                indices[ii + 2] = b;
                indices[ii + 3] = c;
                indices[ii + 4] = c;
                indices[ii + 5] = a;                



            }

            geo.wireframe_index_data = new Uint32Array(indices);
            geo.wireframe_index_version = geo.attributes.tge_a_position.version;



        }

        return function (gl, geo,is_wireframe) {

            if (geo.indexData !== null) {

                if (is_wireframe) {
                    if (geo.wireframe_index_buffer === null) {
                        geo.wireframe_index_buffer = gl.createBuffer();
                    }


                    if (geo.indexNeedsUpdate) {
                        gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.indexBuffer);
                        gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.indexData, GL_DYNAMIC_DRAW);

                        update_wireframe_indices(geo);

                        gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_buffer);
                        gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_data, GL_DYNAMIC_DRAW);


                        geo.indexNeedsUpdate = false;
                    }
                    else {
                        gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_buffer);
                        if (geo.wireframe_index_data === null) {
                            update_wireframe_indices(geo);
                            gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_data, GL_DYNAMIC_DRAW);
                        }
                    }
                }
                else {

                    if (geo.indexNeedsUpdate) {
                        gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.indexBuffer);
                        gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.indexData, GL_DYNAMIC_DRAW);

                        geo.indexNeedsUpdate = false;
                    }
                    else gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.indexBuffer);



                }




            }
            else {
                if (is_wireframe) {
                    if (geo.wireframe_index_buffer === null) {
                        geo.wireframe_index_buffer = gl.createBuffer();
                        update_wireframe_positions(geo);                        
                        gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_buffer);
                        gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_data, GL_DYNAMIC_DRAW);

                    }
                    else {
                        
                        if (geo.wireframe_index_version !== geo.attributes.tge_a_position.version) {
                            update_wireframe_positions(geo);
                            gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_buffer);
                            gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_data, GL_DYNAMIC_DRAW);
                        }
                        else   gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.wireframe_index_buffer);
                        
                    }

                }




            }






        }
    })();


    geometry.compile = (function () {



        function compileAttribute(gl, att) {
            if (att.dest !== null) att;
            att.stride = att.stride || 0;
            att.offset = att.offset || 0;
            att.needsUpdate = att.needsUpdate || false;
            att.array = att.array || null;
            att.dataType = att.dataType || GL_FLOAT;
            att.bufferType = att.bufferType || GL_STATIC_DRAW;
            att.version = att.version || 1;
            if (att.data) {
                if (!att.dest) att.dest = gl.createBuffer();
                gl.bindBuffer(GL_ARRAY_BUFFER, att.dest);
                gl.bufferData(GL_ARRAY_BUFFER, att.data, att.bufferType);
            }
            return (att);
        }

        var id = null;

        /*
        var vv = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
        var centers = new Float32Array(1000 * 3);
        var ii = 0;
        for (var i = 0; i < 1000; i++) {
            ii = i % 3;
            centers[i * 3 + 0] = vv[ii][0];
            centers[i * 3 + 1] = vv[ii][1];
            centers[i * 3 + 2] = vv[ii][2];
        }

        geometry.tge_a_center = {
            dataType: GL_FLOAT,
            itemSize: 3, data: centers, needsUpdate: true
        };
        */


        /* default color buffer */
        geometry.tge_a_color = {
            dataType: GL_FLOAT,
            itemSize: 4, stride: 0, offset: 0, divisor: 0, array: null,
            data: new Float32Array(90000)
        };
        geometry.tge_a_color.data.fill(1);

        return function (gl, geo) {

            if (!tge.geometry.tge_a_color.dest) {
                compileAttribute(gl, tge.geometry.tge_a_color);
               // compileAttribute(gl, tge.geometry.tge_a_center);
            }




            for (id in geo.attributes) {
                compileAttribute(gl, geo.attributes[id]);
            }

            geo.attributes.tge_a_color = geo.attributes.tge_a_color || tge.geometry.tge_a_color;
            geo.attributes.tge_a_center = geo.attributes.tge_a_center || tge.geometry.tge_a_center;

            if (geo.indexData) {
                if (!geo.indexBuffer) geo.indexBuffer = gl.createBuffer();
                gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, geo.indexBuffer);
                gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, geo.indexData, GL_DYNAMIC_DRAW);
            }


            geo.compiled = true;
        }
    })();


    geometry.calculate_normals = (function () {
        var v1 = tge.vec3(), v2 = tge.vec3(), v3 = tge.vec3();
        var v1v2 = tge.vec3(), v1v3 = tge.vec3(), normal = tge.vec3();
        var v2v3Alias = tge.vec3(), v2v3Alias = tge.vec3();

        return function (geo, flateFaces) {

            var vertices = geo.attributes.tge_a_position.data;
            var normals
            if (!geo.attributes.tge_a_normal) {
                geo.addAttribute('tge_a_normal', {
                    data: new Float32Array(vertices.length)
                });
            }

            normals = geo.attributes.tge_a_normal.data;
            var indices = geo.indexData;

            normals.fill(0);


            var i1, i2, i3;
            var weight1, weight2;
            var total = vertices.length;
            var step = 9;
            if (indices !== null) {
                total = indices.length;
                step = 3;
            }
            for (var j = 0; j < total; j += step) {
                if (indices !== null) {
                    i1 = indices[j];
                    i2 = indices[j + 1];
                    i3 = indices[j + 2];
                    tge.vec3.set(v1, vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]);
                    tge.vec3.set(v2, vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]);
                    tge.vec3.set(v3, vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]);
                }
                else {
                    tge.vec3.set(v1, vertices[j + 0], vertices[j + 1], vertices[j + 2]);
                    tge.vec3.set(v2, vertices[j + 3], vertices[j + 4], vertices[j + 5]);
                    tge.vec3.set(v3, vertices[j + 6], vertices[j + 7], vertices[j + 8]);
                }
                
                


                tge.vec3.subtract(v1v2, v3, v2);
                tge.vec3.subtract(v1v3, v1, v2);
                
                

                

                if (indices !== null) {
                    i1 = i1 * 3;
                    i2 = i2 * 3;
                    i3 = i3 * 3;                    
                }
                else {
                    i1 = j;
                    i2 = j + 3;
                    i3 = j + 6;
                }

                if (flateFaces) {
                    tge.vec3.cross(normal, v1v2, v1v3);
                    tge.vec3.normalize(v1v2, normal);
                    normals[i1 + 0] += v1v2[0];
                    normals[i1 + 1] += v1v2[1];
                    normals[i1 + 2] += v1v2[2];
                    
                    normals[i2 + 0] += v1v2[0];
                    normals[i2 + 1] += v1v2[1];
                    normals[i2 + 2] += v1v2[2];
                    
                    normals[i3 + 0] += v1v2[0];
                    normals[i3 + 1] += v1v2[1];
                    normals[i3 + 2] += v1v2[2];
                }
                else {

                    //tge.vec3.normalize(v1v2, v1v2);
                    //tge.vec3.normalize(v1v3, v1v3);
                    tge.vec3.cross(normal, v1v2, v1v3);
                    //tge.vec3.normalize(normal, normal);
                    tge.vec3.copy(v1v2, normal);


                    //tge.vec3.subtract(v2v3Alias, v3, v2);
                    //tge.vec3.normalize(v2v3Alias, v2v3Alias);

                    //weight1 = Math.acos(Math.max(-1, Math.min(1, tge.vec3.dot(v1v2, v1v3))));
                   // weight2 = Math.PI - Math.acos(Math.max(-1, Math.min(1, tge.vec3.dot(v1v2, v2v3Alias))));
                   // tge.vec3.scale(v1v2, normal, weight1);
                    normals[i1 + 0] += v1v2[0];
                    normals[i1 + 1] += v1v2[1];
                    normals[i1 + 2] += v1v2[2];
                   // tge.vec3.scale(v1v2, normal, weight2);
                    normals[i2 + 0] += v1v2[0];
                    normals[i2 + 1] += v1v2[1];
                    normals[i2 + 2] += v1v2[2];
                  //  tge.vec3.scale(v1v2, normal, Math.PI - weight1 - weight2);
                    normals[i3 + 0] += v1v2[0];
                    normals[i3 + 1] += v1v2[1];
                    normals[i3 + 2] += v1v2[2];
                }
                
                


            }

            if (!flateFaces) {
                
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


    geometry.indexed_to_flat = (function () {
        var v1 = tge.vec3(), v2 = tge.vec3(), v3 = tge.vec3();        
        var i1, i2, i3,j,vi;

        var indices, vertices1, vertices2, normals1, normals2;
        return function (geo) {
            vertices1 = geo.attributes.tge_a_position.data;

            indices = geo.indexData;
            var g = new tge.geometry();
            g.addAttribute("tge_a_position", {
                data: new Float32Array(indices.length * 3)
            });
            vertices2 = g.attributes.tge_a_position.data;
            g.numItems = vertices2.length / 3;
            vi = 0;            
            for (j = 0; j < indices.length; j += 3) {
                i1 = indices[j];
                i2 = indices[j + 1];
                i3 = indices[j + 2];


                vertices2[vi + 0] = vertices1[i1 * 3];
                vertices2[vi + 1] = vertices1[i1 * 3 + 1];
                vertices2[vi + 2] = vertices1[i1 * 3 + 2];

                vertices2[vi + 3] = vertices1[i2 * 3];
                vertices2[vi + 4] = vertices1[i2 * 3 + 1];
                vertices2[vi + 5] = vertices1[i2 * 3 + 2];

                vertices2[vi + 6] = vertices1[i3 * 3];
                vertices2[vi + 7] = vertices1[i3 * 3 + 1];
                vertices2[vi + 8] = vertices1[i3 * 3 + 2];               

                vi += 9;



            }

            return g;

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


    geometry.quad2D = function () {
        var g = new tge.geometry();
        g.addAttribute("tge_a_position", {
            data: new Float32Array([
                -1, -1,
                1, -1,
               1, 1,

                -1, -1,
                1, 1,
                -1, 1,
               
            ]),
            itemSize: 2, offset: 0
        });
        g.numItems =4;        
        g.geoType = "quad2D";
        return (g);
    };

    geometry.skybox = function () {
        var g = new tge.geometry();
        g.addAttribute("tge_a_position", {
            data: new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1,

            ]),
            itemSize: 2, offset: 0
        });
        g.numItems = g.attributes['tge_a_position'].data.length/2;
        g.geoType = "skybox";
        return (g);
    };


    geometry.quad3D = function () {
        var g = new tge.geometry();
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
        g.geoType = "quad3D";
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
                    uvs.push((iy / gridY));

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



        
        if (options.sphereRadius) {
            for (ix = 0; ix < vertices.length; ix += 3) {
                tge.vec3.set(tempvec3, vertices[ix], vertices[ix + 1], vertices[ix + 2]);
                tge.vec3.normalize(tempvec3, tempvec3);
                tge.vec3.scale(tempvec3, tempvec3, options.sphereRadius);
                vertices[ix] = tempvec3[0];
                vertices[ix + 1] = tempvec3[1];
                vertices[ix + 2] = tempvec3[2];

            }
        
        }

        var g = new tge.geometry();

        g.addAttribute("tge_a_position", { data: new Float32Array(vertices) });
        g.addAttribute("tge_a_normal", { data: new Float32Array(normals) });
        g.addAttribute("tge_a_uv", { data: new Float32Array(uvs), itemSize: 2 });
        g.addAttribute("tge_a_tangent", { data: new Float32Array(((vertices.length / 3) * 4)), itemSize: 4 });

        if (options.sphereRadius) {
            tge.geometry.calculate_normals(g,true);
        }
     


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


        //g.setIndices((gridX * gridY) * 6);
        g.indexData = new Uint32Array((gridX * gridY) * 6);
        g.indexNeedsUpdate = true;
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

    geometry.icosahedron = (function () {
        var arr = [],ratio,scale;
        return function (size) {
            var g = new tge.geometry();

            var t = (1 + Math.sqrt(5)) / 2;

            arr.length = 0;
            arr.push(- 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t, 0,
                0, - 1, t, 0, 1, t, 0, - 1, - t, 0, 1, - t,
                t, 0, - 1, t, 0, 1, - t, 0, - 1, - t, 0, 1);

            g.addAttribute("tge_a_position", { data: new Float32Array(arr) });

            g.geoType = "icosahedron";

            arr.length = 0;

            arr.push(0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
                1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
                3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
                4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1);



            g.setIndices(arr);

            return (g);


            scale = size / Math.hypot(ratio, 1);

                                  

            //X plane
            arr.push(ratio, 0, -scale);	//rf 0
            arr.push(-ratio, 0, -scale);	//lf 1
            arr.push(ratio, 0, scale);	//rb 2
            arr.push(-ratio, 0, scale);	//lb 3 

            //Y plane
            arr.push(0, -scale, ratio);	//db 4
            arr.push(0, -scale, -ratio);	//df 5
            arr.push(0, scale, ratio);	//ub 6
            arr.push(0, scale, -ratio);	//uf 7

            //Z plane													 
            arr.push(-scale, ratio, 0);	//lu 8
            arr.push(-scale, -ratio, 0);	//ld 9
            arr.push(scale, ratio, 0);	//ru 10
            arr.push(scale, -ratio, 0);	//rd 11


            g.addAttribute("tge_a_position", { data: new Float32Array(arr) });

            g.geoType = "icosahedron";

            arr.length = 0;

            arr.push(1, 3, 8,
                1, 3, 9,
                0, 2, 10,
                0, 2, 11,

                5, 7, 0,
                5, 7, 1,
                4, 6, 2,
                4, 6, 3,

                9, 11, 4,
                9, 11, 5,
                8, 10, 6,
                8, 10, 7,

                1, 7, 8,
                1, 5, 9,
                0, 7, 10,
                0, 5, 11,

                3, 6, 8,
                3, 4, 9,
                2, 6, 10,
                2, 4, 11);


            g.setIndices(arr);

            return (g);
        }
    })();





    geometry.line_geometry_builder = new function () {

        this.vertices = [];

        this.clear = function () {
            this.vertices.length = 0;
        };

        var xx, yy, zz;
        var xs, ys, zs;
        this.add = function (x, y, z) {
            xx = x; yy = y; zz = z;
            this.vertices.push(x, y, z);
            return (this);
        };
        this.addTo = function (x, y, z) {
            this.add(xx, yy, zz);
            this.add(x, y, z);
            return (this);
        };

        this.moveTo = function (x, y, z) {
            xx = x; yy = y; zz = z;
            xs = x; ys = y; zs = z;
            return (this);
        };

        this.closePath = function () {
            this.add(xx, yy, zz);
            this.vertices.push(xs, ys, zs);
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
        
        return function (url, done) {
            var req = new XMLHttpRequest;
            if (done) {
                req.open("GET", url, !0);
                req.onload = function () {
                    done(geometry.wavefront_obj(this.response));
                };
                req.send();
            } 
        }
    })();

    geometry.create = function (vertices, normals, uvs) {

        var g = new tge.geometry();

        if (vertices) {
            g.addAttribute("tge_a_position", { data: vertices });
            g.numItems = vertices.length / 3;
        }

        if (normals) {
            g.addAttribute("tge_a_normal", { data: normals });
        }
       
        return g;
    }

    return geometry;

});


/*./shader.js*/



tge.shader = $extend(function (proto) {

    
    function shader(vs, fs) {

        this.vs = vs;
        this.fs = fs;
        this.compiled = false;
        this.uuid = $guidi();
        this.params = {};
        return (this);

    }

    
    shader.context_param;
    shader.$str=function(s,nestedChunks) {
        return $str(s, "chunk", "param")(nestedChunks ? tge.shader.nestedGetChunk : tge.shader.getChunk,
            tge.shader.getParam);
    }
    shader.nestedGetChunk=function (key) {
        return tge.shader.$str(tge.shader.chunks[key],true);
    }
    shader.getChunk = function (key) {
        return tge.shader.chunks[key];
    }

    shader.getParam=function(p) {
        if (tge.shader.context_param && tge.shader.context_param[p] !== undefined) return tge.shader.context_param[p];
        return "";
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
            if (!gl.getShaderParameter(shdr, GL_COMPILE_STATUS)) {
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
            if (!gl.getProgramParameter(prog, GL_LINK_STATUS)) {
                console.error("Error creating shader program.", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
            if (doValidate) {
                gl.validateProgram(prog);
                if (!gl.getProgramParameter(prog, GL_VALIDATE_STATUS)) {
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
                35664: ['uniform2fv', 2],// 'vec2',                
                35665: ['uniform3fv', 2], //'vec3',
                35666: ['uniform4fv', 2], //'vec4',
                35678: ['uniform1i', 2], //'sampler2D',
                35680: ['uniform1i', 2], //'samplerCube',
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
                for (i = 0; i < gl.getProgramParameter(shdr.program, GL_ACTIVE_UNIFORMS); i++) {
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
                for (i = 0; i < gl.getProgramParameter(shdr.program, GL_ACTIVE_ATTRIBUTES); i++) {
                    info = gl.getActiveAttrib(shdr.program, i);
                    shdr.attributes[info.name] = { name: info.name, location: gl.getAttribLocation(shdr.program, info.name) };
                }

                console.log("shdr.uniforms", shdr.uniforms);
            }

        })();

        return function (gl, shdr, _params) {

            if (shdr.compiled) return;
            tge.shader.context_param = {}

            
            $assign(tge.shader.context_param, _params);

            $assign(tge.shader.context_param, shdr.params);

            shdr.vs =tge.shader.$str(shdr.vs,true);
            shdr.fs = tge.shader.$str(shdr.fs,true);
            shdr.gl = gl;


            var vshdr, fshdr;
            vshdr = createShader(gl, shdr.vs, GL_VERTEX_SHADER);
            if (!vshdr) return false;
            fshdr = createShader(gl, shdr.fs, GL_FRAGMENT_SHADER);
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

    shader.createChunksLib = function (text) {
        var lib = {}, name;
        text.split('/*chunk-').forEach(function (chunk) {
            chunk = chunk.trim();
            if (chunk.length > 0) {
                name = chunk.substr(0, chunk.indexOf('*/') + 2);
                chunk = chunk.replace(name, '');
                name = name.replace('*/', '');
                lib[name] = chunk;
            }
        });
        return lib;
    }

    shader.loadChunks(`/*chunk-precision*/
#extension GL_OES_standard_derivatives : enable 
#if GL_FRAGMENT_PRECISION_HIGH == 1 
  precision highp float;
#else
  precision mediump float;
#endif


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
<?for(var i= 0;i<param('fws_lightsCount');i++) {?>
uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

/*chunk-lights-material-all*/
<?for(var i = 0;i < param('fws_lightsCount');i++){?>
uniform mat4 tge_u_lightMaterial<?=i?>;
<?}?>



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



/*chunk-post_process_flat*/
<?=chunk('precision')?>

const vec2 madd=vec2(0.5,0.5);
varying vec2 tge_v_uv;
attribute vec2 tge_a_position;


void vertex(){
gl_Position = vec4(tge_a_position.xy,0.0,1.0);
tge_v_uv = tge_a_position.xy*madd+madd;  
}

<?=chunk('precision')?>

uniform sampler2D tge_u_texture_input;
varying vec2 tge_v_uv;


void fragment(void) {
gl_FragColor = texture2D(tge_u_texture_input, tge_v_uv) ;
}





`);
    
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
        return tge.pipleline_shader.parse(source,  this);
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

        this.position = new Float32Array(this.matrix.buffer, (12 * 4), 3);

        this.upVector = new Float32Array(this.matrix.buffer, (4 * 4), 3);
        this.fwVector = new Float32Array(this.matrix.buffer, (8 * 4), 3);
        this.sdVector = new Float32Array(this.matrix.buffer, 0, 3);

       return (this);


    }
    proto.setRotation = function (x, y, z) {
        this.rotation[0] = x;
        this.rotation[1] = y;
        this.rotation[2] = z;
        this.rotationNeedUpdate = true;
        return this;
    }
    proto.setScaling = function (x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
        this.matrixNeedUpdate = true;
        return this;
    }
    proto.setScalingUnit = function (x) {
        this.scale[0] = x;
        this.scale[1] = x;
        this.scale[2] = x;
        this.matrixNeedUpdate = true;
        return this;
    }
    proto.setPosition = function (x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.matrixNeedUpdate = true;
        return this;
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
                TEXTURE_MAG_FILTER: GL_LINEAR,
                TEXTURE_MIN_FILTER: GL_LINEAR_MIPMAP_LINEAR,
            };
        }
        else {
            this.parameters = {
                TEXTURE_MAG_FILTER: GL_NEAREST,
                TEXTURE_MIN_FILTER: GL_NEAREST,
                TEXTURE_WRAP_S: GL_CLAMP_TO_EDGE,
                TEXTURE_WRAP_T: GL_CLAMP_TO_EDGE,
            };
        }
        this.format = format || GL_RGBA;
        this.formatType = formatType || GL_UNSIGNED_BYTE;
        this.textureTarget = GL_TEXTURE_2D;
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

    var p,i;
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

    texture.tempCanvas = $create_canvas(1, 1);
    texture.cube_map_from_url = function (url, noMipmap) {
        var image = tge.texture.free_images.fetch();
        image.texture = new tge.texture(false, false, false, !noMipmap);
        image.texture.textureTarget = GL_TEXTURE_CUBE_MAP;
        image.texture.source = [];
        image.onload = function () {
            var boxSize = this.height / 3;
            var boxFixed = 512;
            var boxes = [[0, 1], [2, 1], [1, 2], [1, 0], [3, 1], [1, 1]];
            texture.tempCanvas.setSize(boxFixed, boxFixed);
            texture.tempCanvas.ctx.imageSmoothingEnabled = false;
            boxes.forEach(function (box) {
                texture.tempCanvas.ctx.drawImage(image, box[0] * boxSize, box[1] * boxSize, boxSize, boxSize, 0, 0, boxFixed, boxFixed);
                texture.tempCanvas.ctx.fillText(box[0] + 'x' + box[1], 130, 130);
                image.texture.source.push(texture.tempCanvas.ctx.getImageData(0, 0, boxFixed, boxFixed));
            });
            this.texture.needsUpdate = true;
            this.onload = null;
            delete this.texture;
            tge.texture.free_images.push(this);
        }

        image.src = url;
        return (image.texture);
    };

    texture.dummy_cube_map = function () {
        var texture = new tge.texture(false, false, false, false);
        texture.textureTarget = GL_TEXTURE_CUBE_MAP;
        texture.source = [];
        tge.texture.tempCanvas.setSize(1, 1);
        tge.texture.tempCanvas.ctx.fillStyle = "#ffffff";
        tge.texture.tempCanvas.ctx.fillRect(0, 0, 1, 1);

        for (var i = 0; i < 6; i++)
            texture.source.push(tge.texture.tempCanvas.ctx.getImageData(0, 0, 1, 1));


        texture.needsUpdate = true;
        return (texture);
    };

    var cubeMapTextureSequence = [
        GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
        GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
        GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    ];
    texture.update = function (texture, gl) {


        var source = texture.source;
        if (texture.imageQueue) {
            source = texture.imageQueue;
            tge.texture.free_images.push(texture.imageQueue);
            texture.width = texture.imageQueue.width;
            texture.height = texture.imageQueue.height;
            console.log('free', texture.imageQueue);
            texture.imageQueue = undefined;
        }

        if (texture.webglTexture === null) {
            texture.webglTexture = gl.createTexture();
        }



        gl.bindTexture(texture.textureTarget, texture.webglTexture);


        if (texture.textureTarget === GL_TEXTURE_CUBE_MAP) {
            for (i = 0; i < texture.source.length; i++) {
                gl.texImage2D(cubeMapTextureSequence[i], 0, texture.format, texture.format, texture.formatType, texture.source[i]);
            }
        }
        else {

            if (source !== null && source.src) {
                gl.texImage2D(GL_TEXTURE_2D, 0, texture.format, texture.format, texture.formatType, source);
            }

            else {
                gl.texImage2D(GL_TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture.formatType, source);
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
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
        if (texture.webglTexture === null) texture.update(this.gl);
        this.gl.bindTexture(GL_TEXTURE_2D, texture.webglTexture);
        this.gl.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, texture.webglTexture, 0);

        var status = this.gl.checkFramebufferStatus(GL_FRAMEBUFFER);
        if (status !== GL_FRAMEBUFFER_COMPLETE) {
            console.error("frame buffer status:" + status.toString());
        }

        this.gl.bindTexture(GL_TEXTURE_2D, null);
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, null);

        return (texture);
    };

    proto.unbindTexture = function (attachment) {
        this.gl.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, null, 0);
    };

    proto.bind = function () {
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);

    }

    proto.unbind = function () {
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
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



    proto.getColorDisplay = function (depth, callback) {
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
        this.vpBottom = height;
        this.vpRight = width;
    }

    proto.setDepthTexture = function (depthTexture) {
        this.depthTexture = this.bindTexture(depthTexture, GL_DEPTH_ATTACHMENT);
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
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
        this.applyViewport();
        if (this.clearBuffer) this.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        return (this)
    };

    proto.applyViewport = function () {
        this.gl.viewport(this.vpLeft, this.vpTop, this.vpRight - this.vpLeft, this.vpBottom - this.vpTop);
        return (this)
    };
    proto.bindOnly = function () {
        this.gl.bindFramebuffer(GL_FRAMEBUFFER, this.buffer);
        this.gl.viewport(this.vpLeft, this.vpTop, this.vpRight - this.vpLeft, this.vpBottom - this.vpTop);
        return (this)
    };

    proto.clear = function () {
        if (this.clearBuffer) this.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    }

    proto.addTexture = function (width, height) {
        width = width || this.width;
        height = height || this.height;
        this.colorTexture = this.bindTexture(new tge.texture(null, false, false, false, width, height), this.gl.COLOR_ATTACHMENT0);
        this.textures[this.textures.length] = this.colorTexture;
        return this.colorTexture;
    };

    proto.activateTexture = function (i) {
        if (i < this.textures.length) {
            this.colorTexture = this.textures[i];
            this.gl.bindTexture(GL_TEXTURE_2D, this.colorTexture.webglTexture);
            this.gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this.colorTexture.webglTexture, 0);

        }
        return this.colorTexture;
    }
    function rendertarget(gl, width, height, withDepth) {
        _super.apply(this, arguments);
        this.colorTexture = this.bindTexture(new tge.texture(null, false, false, false, width, height), GL_COLOR_ATTACHMENT0);

        if (withDepth) {
            this.depthTexture = this.bindTexture(new tge.texture(null, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, false, width, height), GL_DEPTH_ATTACHMENT);
            this.depthTexture.targetId = this.uuid;

            this.depthTexture.P("TEXTURE_WRAP_S", GL_CLAMP_TO_EDGE);
            this.depthTexture.P("TEXTURE_WRAP_T", GL_CLAMP_TO_EDGE);

        }
        this.textures = [this.colorTexture];
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
        if (v >= 1) v = 0.5;
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


    proto.getShader = function (shader) {
        return shader;
        if (this.wireframe) {
            if (!shader.wireframe_shader) {
                shader.wireframe_shader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('wireframe_material')?>"), shader, true);                
            }
            return shader.wireframe_shader;
        }

        return shader;
    }

    proto.renderMesh = function (engine, shader, mesh) {

        if (shader.setUniform("tge_u_objectMaterial", this.internalData)) {
            engine.useTexture(this.ambientTexture, 0);
            if (shader.setUniform("tge_u_normalMap", 1)) {
                engine.useTexture(this.normalMap, 1);
            }
            if (shader.setUniform("tge_u_dispMap", 2)) {
                engine.useTexture(this.dispMap, 2);
            }
            shader.setUniform("tge_u_textureMatrix", this.textureMatrix);
        }
        else {
            engine.useTexture(this.ambientTexture, 0);
            shader.setUniform("tge_u_textureMatrix", this.textureMatrix);
        }


        if (shader.shadowShader) {
            if ((this.flags & tge.SHADING.SHADOW_DOUBLE_SIDES) !== 0) {
                engine.gl.disable(GL_CULL_FACE);
            }
            else {
                engine.gl.enable(GL_CULL_FACE);
            }
        }
        else {
            if ((this.flags & tge.SHADING.DOUBLE_SIDES) !== 0) {
                engine.gl.disable(GL_CULL_FACE);
            }
            else {
                engine.gl.enable(GL_CULL_FACE);
            }
        }

      

        engine.updateModelUniforms(mesh.model);
        mesh.drawCount = mesh.geo.numItems;

        tge.geometry.activate_index(engine.gl, mesh.geo, this.wireframe);
        if (mesh.geo.indexData !== null) {            
            if (this.wireframe) {
                engine.gl.drawElements(GL_LINES, mesh.geo.indexData.length * 2, GL_UNSIGNED_INT, mesh.drawOffset * 2);
            }
            else {
                engine.gl.drawElements(this.drawType, mesh.drawCount, GL_UNSIGNED_INT, mesh.drawOffset);
            }
        }
        else {
            if (this.wireframe) {
                //engine.gl.drawArrays(GL_LINES, mesh.drawOffset, mesh.drawCount);
                engine.gl.drawElements(GL_LINES, mesh.geo.wireframe_index_data.length, GL_UNSIGNED_INT, mesh.drawOffset*2);
            }
            else {
                engine.gl.drawArrays(this.drawType, mesh.drawOffset, mesh.drawCount);
            }
        }

    }
    proto.useShader = function (shader,engine) {
        if ((this.noDepthTest)) {
            engine.gl.disable(GL_DEPTH_TEST);
        }
        else {
            engine.gl.enable(GL_DEPTH_TEST);
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

        
        this.textureMatrix = tge.mat3();

        this.shader = tge.material.shader;

        this.ambientTexture = null;
        this.normalMap = null;
        this.envMap = null;
        this.dispMap = null;
        this.setFlag(tge.SHADING.FLAT);
        this.drawType = GL_TRIANGLES;
        this.setShinness(options.shinness || 100);
        this.ambient[3] = 0.1;
        this.wireframe = false;
        this.noDepthTest = false;
        return (this);

    }
    material.shader = tge.pipleline_shader.parse(`<?=chunk('precision')?>

attribute vec3 tge_a_position;
attribute vec4 tge_a_color;
attribute vec2 tge_a_uv;

uniform mat4 tge_u_viewProjectionMatrix;
uniform mat4 tge_u_modelMatrix;
uniform mat3 tge_u_textureMatrix;
varying vec4 tge_v_shadow_vertex;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;

void vertex(){
tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
  gl_Position = tge_u_viewProjectionMatrix* tge_v_shadow_vertex;
tge_v_color= tge_a_color;
tge_v_uv = (tge_u_textureMatrix * vec3(tge_a_uv, 1.0)).xy;
gl_PointSize=10.0;
}


<?=chunk('precision')?>

uniform mat4 tge_u_objectMaterial;
uniform sampler2D tge_u_ambientTexture;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;
varying vec4 tge_v_shadow_vertex;
void fragment(void) {
gl_FragColor = texture2D(tge_u_ambientTexture, tge_v_uv) * tge_v_color * tge_u_objectMaterial[0];
gl_FragColor.w*=tge_u_objectMaterial[0].w;
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
        tge.material.Lines.drawType = GL_LINES;



        tge.material.Lines.setFlag(tge.SHADING.NO_DEPTH_TEST);

        tge.material.Lines.setAmbient(0.2528, 0.2528, 0.2528);

        tge.material.LinesSelected = tge.material.Lines.clone();
        tge.material.LinesSelected.setAmbient(1, 1, 1);

        tge.material.Points = tge.material.LinesSelected.clone();
        tge.material.Points.drawType = GL_POINTS;

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
<?=chunk('mesh-attributes-all')?>
<?=chunk('camera-matrix-all')?>
<?=chunk('model-matrix-all')?>


varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;


void vertex(){
tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
gl_Position = tge_u_modelMatrix * vec4(tge_a_position, 1.0);
tge_v_normal = normalize(tge_u_modelMatrix * vec4(tge_a_normal,0.0)).xyz;
tge_v_uv = (tge_u_textureMatrix * vec3(tge_a_uv, 1.0)).xy;
gl_Position = tge_u_viewProjectionMatrix * tge_v_shadow_vertex;
gl_PointSize=10.0;
}

<?=chunk('precision')?>
<?=chunk('lights-material-all')?>
<?=chunk('lights-matrix-all')?>

uniform mat4 tge_u_objectMaterial;
uniform vec4 tge_u_eyePosition;
uniform sampler2D tge_u_ambientTexture;
uniform sampler2D tge_u_lightMap;

varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;

<?=chunk('fws_lighting')?>


void fragment(void) {
vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);
<?for (var i = 0;i < param('fws_lightsCount');i++) {?>
fws_totalLight += fws_lighting(
tge_u_objectMaterial,
tge_u_lightMaterial<?=i?>,
tge_v_shadow_vertex.xyz, normalize(tge_v_normal), fws_directionToEye,
tge_u_lightMatrix<?=i?>[3].xyz - tge_v_shadow_vertex.xyz,
tge_u_lightMatrix<?=i?>[2].xyz);
<?}?>


gl_FragColor = vec4(fws_totalLight, tge_u_objectMaterial[0].w) * texture2D(tge_u_ambientTexture, tge_v_uv);
gl_FragColor.w*=tge_u_objectMaterial[0].w;




}

`);

    return phong_material;

}, tge.material);



tge.parallax_material = $extend(function (proto, _super) {

    function parallax_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.parallax_material.shader;
        this.dispMapScale = 0.2;
        this.dispMapOffset = -1;
        this.normalMapMatrix = tge.mat3();
        $merge(options, this);
        return (this);
    }
    proto.useShader = (function (super_useShader) {
        var dispParams = tge.vec4();
        return function (shader,engine) {
            super_useShader.apply(this, [shader, engine]);


            dispParams[0] = this.dispMapScale;
            dispParams[1] = this.dispMapOffset;
            shader.setUniform("tge_u_normalMapMatrix", this.normalMapMatrix);
            shader.setUniform("tge_u_dispParams", dispParams);
        }
    })(proto.useShader);
    
    parallax_material.shader = tge.phong_material.shader.extend(`varying mat3 tge_v_tbnMatrix;

uniform mat3 tge_u_normalMapMatrix;

varying vec2 tge_v_nm_uv;

void vertex(){
super_vertex();
  vec3 t = normalize((tge_u_modelMatrix * tge_a_tangent).xyz);
  t = normalize(t - dot(t, tge_v_normal) * tge_v_normal);  
  tge_v_tbnMatrix = mat3(t, cross(tge_v_normal, t), tge_v_normal);

tge_v_nm_uv = (tge_u_normalMapMatrix * vec3(tge_a_uv, 1.0)).xy;

}

varying mat3 tge_v_tbnMatrix;
uniform sampler2D tge_u_normalMap;
uniform sampler2D tge_u_dispMap;
varying vec2 tge_v_nm_uv;

uniform vec4 tge_u_dispParams;
void fragment(){
vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);

float baseBias = tge_u_dispParams.x*0.5;
float bias =-baseBias + baseBias * tge_u_dispParams.y;

vec2 uv=tge_v_nm_uv+(fws_directionToEye*tge_v_tbnMatrix).xy*
(texture2D(tge_u_dispMap, tge_v_nm_uv).r * tge_u_dispParams.x + bias);

vec3 normal = normalize(tge_v_tbnMatrix * (2.0 * texture2D(tge_u_normalMap, uv).xyz - 1.0));

vec4 amb=texture2D(tge_u_ambientTexture, tge_v_uv);
<?for (var i = 0;i < param('fws_lightsCount');i++) {?>
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



tge.skybox_material = $extend(function (proto, _super) {

    function skybox_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.skybox_material.shader;
        this.ambientTexture = tge.skybox_material.dummy;
        this.skytop_color = tge.vec4(0.0, 0.0, 1.0, 1.0);
        this.skyhorizon_color = tge.vec4(0.3294, 0.92157, 1.0, 1.0);
        return (this);

    }
    skybox_material.dummy = tge.texture.dummy_cube_map();
    var viewDirectionProjectionMatrix = tge.mat4();
    var viewDirectionProjectionInverseMatrix  = tge.mat4();
    proto.renderMesh = function (engine, shader, mesh) {


        
        if (mesh.skyboxCameraVersion !== engine.currentCamera.version) {
            engine.currentCamera.matrixWorldInvserse[12] = 0;
            engine.currentCamera.matrixWorldInvserse[13] = 0;
            engine.currentCamera.matrixWorldInvserse[14] = 0;

            tge.mat4.multiply(viewDirectionProjectionMatrix, engine.currentCamera.matrixProjection,
                engine.currentCamera.matrixWorldInvserse
            );

            tge.mat4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);
            mesh.skyboxCameraVersion = engine.currentCamera.version;
            
        }

        
        shader.setUniform("tge_u_viewProjectionMatrix", viewDirectionProjectionInverseMatrix);
        shader.setUniform("tge_u_skytop_color", this.skytop_color);
        shader.setUniform("tge_u_skyhorizon_color", this.skyhorizon_color);
        engine.useTexture(this.ambientTexture, 0);
        engine.gl.depthFunc(GL_LEQUAL);


        engine.gl.drawArrays(this.drawType, 0, mesh.geo.numItems);
    };
    skybox_material.shader = tge.pipleline_shader.parse(`<?=chunk('precision')?>
attribute vec4 tge_a_position;
varying vec4 tge_v_uv;

void vertex(){


 tge_v_uv = tge_a_position;
 gl_Position = tge_a_position;
 gl_Position.z = 1.0;

}


<?=chunk('precision')?>

uniform samplerCube tge_u_ambientTexture;
uniform mat4 tge_u_viewProjectionMatrix;
uniform vec4 tge_u_skytop_color;
uniform vec4 tge_u_skyhorizon_color;

varying vec4 tge_v_uv;

void fragment(void) {
  
vec4 t = tge_u_viewProjectionMatrix * tge_v_uv;
  gl_FragColor = textureCube(tge_u_ambientTexture, normalize(t.xyz / t.w));
  

  gl_FragColor *= mix(tge_u_skyhorizon_color, tge_u_skytop_color, t.y);

  

}`);

    return skybox_material;

}, tge.material);




tge.dynamic_skybox_material = $extend(function (proto, _super) {

    function dynamic_skybox_material(options) {
        options = options || {};
        _super.apply(this, arguments);
        this.shader = tge.dynamic_skybox_material.shader;
        this.sunPosition = tge.vec4(0.0, 1.0, 0.0);
        this.sunAngularDiameterCos = 0.99991;
        
        return (this);

    }

    var viewDirectionProjectionMatrix = tge.mat4();
    var viewDirectionProjectionInverseMatrix = tge.mat4();
    proto.renderMesh = function (engine, shader, mesh) {


        if (mesh.skyboxCameraVersion !== engine.currentCamera.version) {
            engine.currentCamera.matrixWorldInvserse[12] = 0;
            engine.currentCamera.matrixWorldInvserse[13] = 0;
            engine.currentCamera.matrixWorldInvserse[14] = 0;

            tge.mat4.multiply(viewDirectionProjectionMatrix, engine.currentCamera.matrixProjection,
                engine.currentCamera.matrixWorldInvserse
            );

            tge.mat4.invert(viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix);
            mesh.skyboxCameraVersion = engine.currentCamera.version;
        }

        this.sunPosition[3] = this.sunAngularDiameterCos;

        shader.setUniform("tge_u_viewProjectionMatrix", viewDirectionProjectionInverseMatrix);
        shader.setUniform("sun_params", this.sunPosition);
        engine.gl.depthFunc(GL_LEQUAL);
        engine.gl.drawArrays(this.drawType, 0, mesh.geo.numItems);

    };
    dynamic_skybox_material.shader = tge.pipleline_shader.parse(`<?=chunk('precision')?>
attribute vec4 tge_a_position;
varying vec4 tge_v_uv;

void vertex(){


 tge_v_uv = tge_a_position;
 gl_Position = tge_a_position;
 gl_Position.z = 1.0;

}


<?=chunk('precision')?>

uniform mat4 tge_u_viewProjectionMatrix;
uniform vec4 sun_params;


varying vec4 tge_v_uv;

vec3 fragPosition;

const float turbidity = 10.0;
const float reileigh = 2.0;
const float mieCoefficient = 0.005;
const float mieDirectionalG = 0.8;

const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003;// refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at

const float pn = 0.035;
// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;

float sunAngularDiameterCos =sun_params.w; // 0.999956;

const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

vec3 simplifiedRayleigh() {
return 0.0005 / vec3(94, 40, 18);
}

float rayleighPhase(float cosTheta) {
return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T) {
float c = (0.2 * T ) * 10E-18;
return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g) {
return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos) {
return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x) {
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

void fragment(void) {

  fragPosition=(tge_u_viewProjectionMatrix * tge_v_uv).xyz;
vec3 sunPosition=sun_params.xyz;
float sunfade = 1.0 - clamp(1.0 - exp(sunPosition.y), 0.0, 1.0);
float reileighCoefficient = reileigh - (1.0 * (1.0-sunfade));
vec3 sunDirection = normalize(sunPosition);
float sunE = sunIntensity(dot(sunDirection, up));
vec3 betaR = simplifiedRayleigh() * reileighCoefficient;

// mie coefficients
vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

// optical length
// cutoff angle at 90 to avoid singularity in next formula.
float zenithAngle = acos(max(0.0, dot(up, normalize(fragPosition))));
float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));

// combined extinction factor
vec3 Fex = exp(-(betaR * sR + betaM * sM));

// in scattering
float cosTheta = dot(normalize(fragPosition), sunDirection);

float rPhase = rayleighPhase(cosTheta * 0.5+0.5);
vec3 betaRTheta = betaR * rPhase;

float mPhase = hgPhase(cosTheta, mieDirectionalG);
vec3 betaMTheta = betaM * mPhase;

vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));

//nightsky
vec3 direction = normalize(fragPosition);
float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]
float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]
vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
vec3 L0 = vec3(0.1) * Fex;

// composition + solar disc
float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);
L0 += (sunE * 19000.0 * Fex)*sundisk;

vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));

vec3 texColor = (Lin+L0);
texColor *= 0.04 ;
texColor += vec3(0.0,0.001,0.0025)*0.3;

vec3 curr = Uncharted2Tonemap(texColor);
vec3 color = curr*whiteScale;

vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));

gl_FragColor = vec4(retColor, 1.0);
}`);

    return dynamic_skybox_material;

}, tge.material);

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


/*./terrain.js*/





tge.terrain_rtin = function (gridSize) {
    this.gridSize = gridSize;
    var tileSize = gridSize - 1;
    if (tileSize & (tileSize - 1)) throw new Error(
        `Expected grid size to be 2^n+1, got ${gridSize}.`);

    this.numTriangles = tileSize * tileSize * 2 - 2;
    this.numParentTriangles = this.numTriangles - tileSize * tileSize;
    this.tileSize = tileSize;
    this.indices = new Uint32Array(this.gridSize * this.gridSize);

    // coordinates for all possible triangles in an RTIN tile
    this.coords = new Uint16Array(this.numTriangles * 4);

    // get triangle coordinates from its index in an implicit binary tree
    var id, ax, ay, bx, by, cx, cy, mx, my, k;
    for (var i = 0; i < this.numTriangles; i++) {
        id = i + 2;
        ax = 0; ay = 0; bx = 0; by = 0; cx = 0; cy = 0;
        if (id & 1) {
            bx = by = cx = tileSize; // bottom-left triangle
        } else {
            ax = ay = cy = tileSize; // top-right triangle
        }
        while ((id >>= 1) > 1) {
            mx = (ax + bx) >> 1;
            my = (ay + by) >> 1;

            if (id & 1) { // left half
                bx = ax; by = ay;
                ax = cx; ay = cy;
            } else { // right half
                ax = bx; ay = by;
                bx = cx; by = cy;
            }
            cx = mx; cy = my;
        }
        k = i * 4;
        this.coords[k + 0] = ax;
        this.coords[k + 1] = ay;
        this.coords[k + 2] = bx;
        this.coords[k + 3] = by;
    }
}

tge.terrain_mesh = $extend(function (proto,_super) {

    function generateHeight(width, height) {

        var size = width * height, data = new Float32Array(size),
            quality = 12, z = Math.random() *150;

        for (var j = 0; j < 4; j++) {

            for (var i = 0; i < size; i++) {

                var x = i % width, y = ~ ~(i / width);
                data[i] += Math.abs(tge.perlin_noise(x / quality, y / quality, z) * quality * 1.75);

            }

            quality *= 5;

        }

        return data;

    }


    function terrain_mesh(gridSize, data) {
        _super.apply(this, [undefined, new tge.phong_material()]);
        gridSize = gridSize || 65;
        this.rtin = new tge.terrain_rtin(gridSize);
        var tileSize = this.rtin.tileSize;
        //  this.terrain = generateHeight( gridSize, gridSize);
        this.terrain = new Float32Array(gridSize*gridSize);
        this.errors = new Float32Array(this.terrain.length);

        console.log("data", data);
        for (let y = 0; y < tileSize; y++) {
            for (let x = 0; x < tileSize; x++) {
                const k = (y * tileSize + x) * 4;
                const r = data[k + 0];
                const g = data[k + 1];
                const b = data[k + 2];
                this.terrain[y * gridSize + x] = (r * 256 * 256 + g * 256.0 + b) / 10 - 10000.0;
            }
        }


       
        var terrainExaggeration = 1.5;
        var metersPerPixel = 114.73948277849482;

        
        const vertices = new Float32Array(gridSize * gridSize * 3);
        const indices = new Uint32Array(tileSize * tileSize * 3);
        let index = 0;

        for (let y = 0; y <= tileSize; y++) {
            for (let x = 0; x <= tileSize; x++) {
                const i = y * gridSize + x;
                vertices[3 * i + 0] = ((y/ tileSize)-0.5)*3;
                vertices[3 * i + 2] = -((x / tileSize) - 0.1) * 3
                vertices[3 * i + 1] = this.terrain[i]/  metersPerPixel / tileSize * terrainExaggeration;

                
                indices[index++] = i + 1;
                indices[index++] = i;
                indices[index++] = i + gridSize;
              // indices[index++] = i + 1;
               // indices[index++] = i + gridSize;
               // indices[index++] = i + gridSize + 1;
            }
        }




        var g = new tge.geometry();
        g.addAttribute("tge_a_position", {
            data: vertices,
            itemSize: 3, offset: 0
        });
        g.addAttribute("tge_a_normal", { itemSize: 3, data: new Float32Array(vertices.length) });
        g.indexData = indices;
        g.numItems = g.indexData.length;
       

        g.geoType = "terrain";

        this.geo = g;


        tge.geometry.calculate_normals(this.geo);

        this.update_terrain();
        this.update_mesh(15);
       // this.material.drawType = GL_LINE_LOOP;

        /*
        
        */
       // this.update_terrain();
      //  this.update_mesh(55);
        
        return this;
    }
    proto.update_terrain = function () {
        var gridSize = this.rtin.gridSize;
        var errors = this.errors;
        var tileSize = this.rtin.tileSize;
        var terrain = this.terrain;
        const numSmallestTriangles = tileSize * tileSize;
        const numTriangles = numSmallestTriangles * 2 - 2; // 2 + 4 + 8 + ... 2^k = 2 * 2^k - 2
        const lastLevelIndex = numTriangles - numSmallestTriangles;

        // iterate over all possible triangles, starting from the smallest level
        for (let i = numTriangles - 1; i >= 0; i--) {

            // get triangle coordinates from its index in an implicit binary tree
            let id = i + 2;
            let ax = 0, ay = 0, bx = 0, by = 0, cx = 0, cy = 0;
            if (id & 1) {
                bx = by = cx = tileSize; // bottom-left triangle
            } else {
                ax = ay = cy = tileSize; // top-right triangle
            }
            while ((id >>= 1) > 1) {
                const mx = (ax + bx) >> 1;
                const my = (ay + by) >> 1;

                if (id & 1) { // left half
                    bx = ax; by = ay;
                    ax = cx; ay = cy;
                } else { // right half
                    ax = bx; ay = by;
                    bx = cx; by = cy;
                }
                cx = mx; cy = my;
            }

            // calculate error in the middle of the long edge of the triangle
            const interpolatedHeight = (terrain[ay * gridSize + ax] + terrain[by * gridSize + bx]) / 2;
            const middleIndex = ((ay + by) >> 1) * gridSize + ((ax + bx) >> 1);
            const middleError = Math.abs(interpolatedHeight - terrain[middleIndex]);

            if (i >= lastLevelIndex) { // smallest triangles
                errors[middleIndex] = middleError;

            } else { // bigger triangles; accumulate error with children
                const leftChildError = errors[((ay + cy) >> 1) * gridSize + ((ax + cx) >> 1)];
                const rightChildError = errors[((by + cy) >> 1) * gridSize + ((bx + cx) >> 1)];
                errors[middleIndex] = Math.max(errors[middleIndex], middleError, leftChildError, rightChildError);
            }
        }
    }
    proto.update_mesh = function (maxError) {
        let i = 0;
        var indices =[];
        var gridSize = this.rtin.gridSize;
        var errors = this.errors;
        function processTriangle(ax, ay, bx, by, cx, cy) {
            // middle of the long edge
            const mx = (ax + bx) >> 1;
            const my = (ay + by) >> 1;

            if (Math.abs(ax - cx) + Math.abs(ay - cy) > 1 && errors[my * gridSize + mx] > maxError) {
                // triangle doesn't approximate the surface well enough; split it into two
                processTriangle(cx, cy, ax, ay, mx, my);
                processTriangle(bx, by, cx, cy, mx, my);

            } else {
                // add a triangle to the final mesh
                indices[i++] = ay * gridSize + ax;
                indices[i++] = by * gridSize + bx;
                indices[i++] = cy * gridSize + cx;
            }
        }

        processTriangle(0, 0, this.rtin.tileSize, this.rtin.tileSize, this.rtin.tileSize, 0);
        processTriangle(this.rtin.tileSize, this.rtin.tileSize, 0, 0, 0, this.rtin.tileSize);

        this.geo.setIndices(indices);
        tge.geometry.calculate_normals(this.geo);
    }
    proto.update_mesh1 = function (maxError) {
        maxError = maxError || 0;
        var size = this.rtin.gridSize;
        var indices = this.rtin.indices;
        var errors = this.errors;
        let numVertices = 0;
        let numTriangles = 0;
        const max = size - 1;

        // use an index grid to keep track of vertices that were already used to avoid duplication
        indices.fill(0);

        // retrieve mesh in two stages that both traverse the error map:
        // - countElements: find used vertices (and assign each an index), and count triangles (for minimum allocation)
        // - processTriangle: fill the allocated vertices & triangles typed arrays

        function countElements(ax, ay, bx, by, cx, cy) {
            const mx = (ax + bx) >> 1;
            const my = (ay + by) >> 1;

            var err = errors[my * size + mx];
            if (Math.abs(ax - cx) + Math.abs(ay - cy) > 1 && err > maxError) {
                countElements(cx, cy, ax, ay, mx, my);
                countElements(bx, by, cx, cy, mx, my);
            } else {
                indices[ay * size + ax] = indices[ay * size + ax] || ++numVertices;
                indices[by * size + bx] = indices[by * size + bx] || ++numVertices;
                indices[cy * size + cx] = indices[cy * size + cx] || ++numVertices;
                numTriangles++;
            }
        }
        countElements(0, 0, max, max, max, 0);
        countElements(max, max, 0, 0, 0, max);

        const vertices = new Float32Array(numVertices * 2);
        const triangles = new Uint16Array(numTriangles * 3);
        let triIndex = 0;

        function processTriangle(ax, ay, bx, by, cx, cy) {
            const mx = (ax + bx) >> 1;
            const my = (ay + by) >> 1;

            if (Math.abs(ax - cx) + Math.abs(ay - cy) > 1 && errors[my * size + mx] > maxError) {
                // triangle doesn't approximate the surface well enough; drill down further
                processTriangle(cx, cy, ax, ay, mx, my);
                processTriangle(bx, by, cx, cy, mx, my);

            } else {
                // add a triangle
                const a = indices[ay * size + ax] - 1;
                const b = indices[by * size + bx] - 1;
                const c = indices[cy * size + cx] - 1;

                vertices[2 * a] = ax;
                vertices[2 * a + 1] = ay;

                vertices[2 * b] = bx;
                vertices[2 * b + 1] = by;

                vertices[2 * c] = cx;
                vertices[2 * c + 1] = cy;

                triangles[triIndex++] = a;
                triangles[triIndex++] = b;
                triangles[triIndex++] = c;
            }
        }
        processTriangle(0, 0, max, max, max, 0);
        processTriangle(max, max, 0, 0, 0, max);


        





        

    };
    proto.update_terrain2 = function () {
        var size = this.rtin.gridSize;
        for (let i = this.rtin.numTriangles - 1; i >= 0; i--) {
            const k = i * 4;
            const ax = this.rtin.coords[k + 0];
            const ay = this.rtin.coords[k + 1];
            const bx = this.rtin.coords[k + 2];
            const by = this.rtin.coords[k + 3];
            const mx = (ax + bx) >> 1;
            const my = (ay + by) >> 1;
            const cx = mx + my - ay;
            const cy = my + ax - mx;

            // calculate error in the middle of the long edge of the triangle
            const interpolatedHeight = (this.terrain[ay * size + ax] + this.terrain[by * size + bx]) / 2;
            const middleIndex = my * size + mx;
            const middleError = Math.abs(interpolatedHeight - this.terrain[middleIndex]);

            this.errors[middleIndex] = Math.max(this.errors[middleIndex], middleError);

            if (i < this.rtin.numParentTriangles) { // bigger triangles; accumulate error with children
                const leftChildIndex = ((ay + cy) >> 1) * size + ((ax + cx) >> 1);
                const rightChildIndex = ((by + cy) >> 1) * size + ((bx + cx) >> 1);
                this.errors[middleIndex] = Math.max(this.errors[middleIndex], this.errors[leftChildIndex], this.errors[rightChildIndex]);
            }
            if (isNaN(this.errors[middleIndex])) {
               // console.log(this.terrain)
            }
        }
    }


    return terrain_mesh;

},tge.mesh);


tge.terrain_mesh = $extend(function (proto, _super) {

    function generateHeight(width, height) {

        var size = width * height, data = new Float32Array(size),
            quality = 12, z = Math.random() * 150;

        for (var j = 0; j < 4; j++) {

            for (var i = 0; i < size; i++) {

                var x = i % width, y = ~ ~(i / width);
                data[i] += Math.abs(tge.perlin_noise(x / quality, y / quality, z) * quality * 1.75);

            }

            quality *= 5;

        }

        return data;

    }

    var gPatchSize = 64;
    var gFrameVariance = 15;
    var gGridSpacing = 1;
    function TriTreeNode() {
        this.LeftChild=null;
        this.RightChild=null;
        this.BaseNeighbor=null;
        this.LeftNeighbor=null;
        this.RightNeighbor=null;
    }

    TriTreeNode.mem = [];
    var tri;
    TriTreeNode.alloc = function () {
        if (this.mem.length > 0)
            tri = this.mem.pop();
        else 
            tri = new TriTreeNode();
        tri.LeftChild = tri.RightChild = null;

        return tri;
    }



    function Patch(heightX, heightY) {
        // Clear all the relationships
        // Left base triangle tree node
        this.baseLeft = new TriTreeNode();
        // Right base triangle tree node
        this.baseRight = new TriTreeNode();


        this.baseLeft.RightNeighbor = this.baseLeft.LeftNeighbor =
            this.baseRight.RightNeighbor = this.baseRight.LeftNeighbor =
        this.baseLeft.LeftChild = this.baseLeft.RightChild =
        this.baseRight.LeftChild = this.baseLeft.LeftChild = null;

        // Attach the two m_Base triangles together
        this.baseLeft.BaseNeighbor = this.baseRight;
        this.baseRight.BaseNeighbor = this.baseLeft;
        
        // Store index to first element of the height data for this patch.
        this.offsetX = heightX;
        this.offsetY = heightY;

        // Initialize flags
        this.varianceDirty = true;
        this.isVisible = false;
        this.isDirty = false;


        // Depth of variance tree: should be near SQRT(gPatchSize) + 1
		this.VARIANCE_DEPTH = Math.sqrt(gPatchSize) + 1;

		// Left variance tree
		this.varianceLeft = [];

		// Right variance tree
		this.varianceRight =[];

		// Which varience tree we are currently using [Only valid during the
		// tessellate() and computeVariance() passes].
		this.currentVariance=[];

		//	View position in grid coordinates used during tessellation.
        this.viewPosX = 0;
        this.viewPosY=0;



		


        
    }

    Patch.prototype.reset = function () {

        // Assume patch is not visible.
        this.isVisible = false;

        // Reset the important relationships
        this.baseLeft.LeftChild = this.baseLeft.RightChild =
            this.baseRight.LeftChild = this.baseLeft.LeftChild = null;

        // Attach the two m_Base triangles together
        this.baseLeft.BaseNeighbor = this.baseRight;
        this.baseRight.BaseNeighbor = this.baseLeft;

        // Clear the other relationships.
        this.baseLeft.RightNeighbor = this.baseLeft.LeftNeighbor =
            this.baseRight.RightNeighbor = this.baseRight.LeftNeighbor = null;
    };

    Patch.prototype.computeVariance = (function () {
        Patch.prototype.recursComputeVariance = function (leftX, leftY, leftZ, rightX, rightY, rightZ, apexX, apexY, apexZ, node) {
            var centerX = (leftX + rightX) >> 1;	// Compute X coordinate of center of Hypotenuse
            var centerY = (leftY + rightY) >> 1;	// Compute Y coord...

            // Get the height value at the middle of the Hypotenuse
            var centerZ = this.O.hei(this.offsetX + centerX, this.offsetY + centerY);

            // Variance of this triangle is the actual height at it's hypotenuse midpoint
            // minus the interpolated height.
            // Use values passed on the stack instead of re-accessing the Height Field.
            var myVariance = Math.abs(centerZ - ((leftZ + rightZ) >> 1));

            // Since we're after speed and not perfect representations,
            //    only calculate variance down to an 8x8 block
            if (Math.abs(leftX - rightX) >= 8 || Math.abs(leftY - rightY) >= 8) {
                // Final Variance for this node is the max of it's variance and that of it's children.
                myVariance = Math.max(myVariance,
                    this.recursComputeVariance(apexX, apexY, apexZ, leftX, leftY, leftZ,
                        centerX, centerY, centerZ, node << 1));
                myVariance = Math.max(myVariance,
                    this.recursComputeVariance(rightX, rightY, rightZ, apexX, apexY, apexZ,
                        centerX, centerY, centerZ, 1 + (node << 1)));
            }

            if (node < (1 << this.VARIANCE_DEPTH))
                this.currentVariance[node] = (1 + myVariance) * 1024 * 2;

            return myVariance;
        };
        return function () {
            //	Compute variance on each of the base triangles...

            //	Start with the left triangle.
            var offYpPSize = this.offsetY + gPatchSize;
            var offXpPSize = this.offsetX + gPatchSize;
            var leftZ = this.O.hei(this.offsetX, offYpPSize);
            var rightZ = this.O.hei(offXpPSize, this.offsetY);
            var apexZ = this.O.hei(this.offsetX, this.offsetY);
            this.currentVariance = this.varianceLeft;
            this.recursComputeVariance(0, gPatchSize, leftZ,
                gPatchSize, 0, rightZ,
                0, 0, apexZ,
                1);

            //	Now do the right triangle.
            apexZ = leftZ;
            leftZ = rightZ;
            rightZ = apexZ;
            apexZ = this.O.hei(offXpPSize, offYpPSize);
            this.currentVariance = this.varianceRight;
            this.recursComputeVariance(gPatchSize, 0, leftZ,
                0, gPatchSize, rightZ,
                gPatchSize, gPatchSize, apexZ,
                1);

            // Clear the dirty flag for this patch
            this.varianceDirty = false;
        }
    })();
    Patch.prototype.split = function (tri) {
        // We are already split, no need to do it again.
        if (tri.LeftChild != null)
            return;

        // If this triangle is not in a proper diamond, force split our base neighbor
        if (tri.BaseNeighbor != null && (tri.BaseNeighbor.BaseNeighbor != tri))
            this.split(tri.BaseNeighbor);

        // Create children and link into mesh
        tri.LeftChild = TriTreeNode.alloc();
        tri.RightChild = TriTreeNode.alloc();

        // If creation failed, just exit.
        if (tri.LeftChild == null || tri.RightChild == null) {
            tri.LeftChild = null;
            tri.RightChild = null;
            return;
        }

        // Fill in the information we can get from the parent (neighbor pointers)
        tri.LeftChild.BaseNeighbor = tri.LeftNeighbor;
        tri.LeftChild.LeftNeighbor = tri.RightChild;

        tri.RightChild.BaseNeighbor = tri.RightNeighbor;
        tri.RightChild.RightNeighbor = tri.LeftChild;

        // Link our Left Neighbor to the new children
        if (tri.LeftNeighbor != null) {
            if (tri.LeftNeighbor.BaseNeighbor == tri)
                tri.LeftNeighbor.BaseNeighbor = tri.LeftChild;
            else if (tri.LeftNeighbor.LeftNeighbor == tri)
                tri.LeftNeighbor.LeftNeighbor = tri.LeftChild;
            else if (tri.LeftNeighbor.RightNeighbor == tri)
                tri.LeftNeighbor.RightNeighbor = tri.LeftChild;
            //				else
            //					;// Illegal Left Neighbor!
        }

        // Link our Right Neighbor to the new children
        if (tri.RightNeighbor != null) {
            if (tri.RightNeighbor.BaseNeighbor == tri)
                tri.RightNeighbor.BaseNeighbor = tri.RightChild;
            else if (tri.RightNeighbor.RightNeighbor == tri)
                tri.RightNeighbor.RightNeighbor = tri.RightChild;
            else if (tri.RightNeighbor.LeftNeighbor == tri)
                tri.RightNeighbor.LeftNeighbor = tri.RightChild;
            //				else
            //					;// Illegal Right Neighbor!
        }

        // Link our Base Neighbor to the new children
        if (tri.BaseNeighbor != null) {
            if (tri.BaseNeighbor.LeftChild != null) {
                tri.BaseNeighbor.LeftChild.RightNeighbor = tri.RightChild;
                tri.BaseNeighbor.RightChild.LeftNeighbor = tri.LeftChild;
                tri.LeftChild.RightNeighbor = tri.BaseNeighbor.RightChild;
                tri.RightChild.LeftNeighbor = tri.BaseNeighbor.LeftChild;

            } else
                // Base Neighbor (in a diamond with us) was not split yet, so do that now.
                this.split(tri.BaseNeighbor);

        } else {
            // An edge triangle, trivial case.
            tri.LeftChild.RightNeighbor = null;
            tri.RightChild.LeftNeighbor = null;
        }

    };

    Patch.prototype.tessellate = (function () {
        Patch.prototype.recursTessellate = function (tri,leftX,leftY,rightX,rightY,apexX, apexY,node) {
            var triVariance = 0;
            var centerX = (leftX + rightX) >> 1; // Compute X coordinate of center of Hypotenuse
            var centerY = (leftY + rightY) >> 1; // Compute Y coord...

            if (node < (1 << this.VARIANCE_DEPTH)) {
                //	Calculate approximate distance from view position to center of triangle.
                var dx = centerX - this.viewPosX;
                var dy = centerY - this.viewPosY;
                var distance = 1 + Math.sqrt(dx, dy);

                // Egads!  A division?  What's this world coming to!
                // This should be replaced with a faster operation.
                // Take both distance and variance into consideration
                triVariance = this.currentVariance[node] / distance;
            }

            // IF we do not have variance info for this node, then we must have gotten
            //    here by splitting, so continue down to the lowest level.
            // OR if we are not below the variance tree, test for variance.
            if ((node >= (1 << this.VARIANCE_DEPTH)) || (triVariance > gFrameVariance)) {

                // Split this triangle.
                this.split(tri);

                // If this triangle was split, try to split it's children as well.
                // Tessellate all the way down to one vertex per height field entry
                if (tri.LeftChild != null && node < this.recurseDepth) {
                    this.recursTessellate(tri.LeftChild, apexX, apexY, leftX, leftY,
                        centerX, centerY, node << 1);
                    this.recursTessellate(tri.RightChild, rightX, rightY, apexX, apexY,
                        centerX, centerY, 1 + (node << 1));
                }
            }

        };
        return function (viewPosX, viewPosY) {
            this.viewPosX = viewPosX;
            this.viewPosY = viewPosY;

            // Split each of the base triangles
            this.currentVariance = this.varianceLeft;
            var pSize = gPatchSize;
           var  oXpPSize = this.offsetX + pSize;
             var oYpPSize = this.offsetY + pSize;
            this.recursTessellate(this.baseLeft,
                this.offsetX, oYpPSize,
                oXpPSize, this.offsetY,
                this.offsetX, this.offsetY,
                1);

            this.currentVariance = this.varianceRight;
            this.recursTessellate(this.baseRight,
                oXpPSize, this.offsetY,
                this.offsetX, oYpPSize,
                oXpPSize, oYpPSize,
                1);

        }
    })();

    Patch.prototype.setVisibility = (function () {
        Patch.prototype.orientation = function (pX, pY, qX, qY, rX, rY) {
            var aX = qX - pX;
            var aY = qY - pY;

            var bX = rX - pX;
            var bY = rY - pY;

            var d = aX * bY - aY * bX;
            return (d <= 0);
        };
        Patch.prototype.cornerVisible = function (eyeX, eyeY, rightX, rightY) {
            if (this.orientation(eyeX, eyeY, rightX, rightY, this.offsetX, this.offsetY))
                return true;

            var oYpPS = this.offsetY + gPatchSize;
            if (this.orientation(eyeX, eyeY, rightX, rightY, this.offsetX, oYpPS))
                return true;

            var oXpPS = this.offsetX + gPatchSize;
            if (this.orientation(eyeX, eyeY, rightX, rightY, oXpPS, oYpPS))
                return true;

            if (this.orientation(eyeX, eyeY, rightX, rightY, oXpPS, this.offsetY))
                return true;

            return false;
        }
        return function (eyeX, eyeY, leftX, leftY, rightX, rightY) {

            this.isVisible = this.cornerVisible(eyeX, eyeY, rightX, rightY) &&
                this.cornerVisible(leftX, leftY, eyeX, eyeY);

            this.isVisible = true;

        }
    })();


    Patch.prototype.render = (function () {


        Patch.prototype.recursRender = function (tri,leftX,leftY,rightX, rightY, apexX, apexY) {
            if (tri.LeftChild != null) {
                // Compute X coordinate of center of Hypotenuse
                var centerX = (leftX + rightX) >> 1;
                // Compute Y coord...
                var centerY = (leftY + rightY) >> 1;

                this.recursRender(tri.LeftChild, apexX, apexY, leftX, leftY, centerX, centerY);
                this.recursRender(tri.RightChild, rightX, rightY, apexX, apexY, centerX, centerY);
            }
            else {
                //	Get altitude data.
                var leftZ = this.O.hei(this.offsetX + leftX, this.offsetY + leftY);
                var rightZ = this.O.hei(this.offsetX + rightX, this.offsetY + rightY);
                var apexZ = this.O.hei(this.offsetX + apexX, this.offsetY + apexY);

                this.O.vert(leftX, leftZ, leftY);                
                this.O.vert(rightX, rightZ, rightY);

                this.O.vert(rightX, rightZ, rightY);
                this.O.vert(apexX, apexZ, apexY);

                this.O.vert(apexX, apexZ, apexY);
                this.O.vert(leftX, leftZ, leftY);
                
            }

        }

        return function () {
            this.recursRender(this.baseLeft,
                0, gPatchSize,
                gPatchSize, 0,
                0, 0);

            this.recursRender(this.baseRight,
                gPatchSize, 0,
                0, gPatchSize,
                gPatchSize, gPatchSize);
        }
    })();

    function terrain_mesh(gridSize, data) {
        _super.apply(this, [undefined, new tge.material()]);        
        this.terrain = new Float32Array(gridSize * gridSize);        
        this.tileSize = gridSize - 1;
        for (let y = 0; y < this.tileSize; y++) {
            for (let x = 0; x < this.tileSize; x++) {
                const k = (y * this.tileSize + x) * 4;
                const r = data[k + 0];
                const g = data[k + 1];
                const b = data[k + 2];
                this.terrain[y * gridSize + x] = (r * 256 * 256 + g * 256.0 + b) / 10008 ;
            }
        }


        this.gMapDiagSize = Math.floor(Math.sqrt(this.tileSize * this.tileSize + this.tileSize * this.tileSize));
        this.gNumPatchesPerXSide = this.tileSize / gPatchSize;
        this.gNumPatchesPerYSide = this.tileSize / gPatchSize;


        this.gPatches = [];
        //	The recursion depth used when tessellating.  Don't go past the grid resulution.
        //	(2*log2(patchSize)-1) is the # of spits between the top patch and the grid resolution.
        this.recurseDepth = 1 << (2 * Math.log2(gPatchSize) - 1);

        this.gGridSpacing =1;

        this.hei = function (h, v) {
            return this.terrain[v * gridSize + h];
        };

        this.vertices = [];
        this.vert = function (x, y, z) {
            this.vertices.push(x, y, z);
        };

        for (var Y = 0; Y < this.gNumPatchesPerYSide; Y++) {
            this.gPatches[Y] = this.gPatches[Y] || [];
            for (var X = 0; X < this.gNumPatchesPerXSide; X++) {
                var patch = new Patch( X * gPatchSize, Y * gPatchSize);
                patch.O = this;
                patch.computeVariance();
                this.gPatches[Y][X] = patch;
            }
        }

        this.geo = tge.geometry.plane({ divs: 32, size: 50 });

        this.update_terrain(tge.DEGTORAD * 60, [0, 0], tge.DEGTORAD * 60);

        this.render_terrain();
        return this;
    }


    proto.render_terrain = function () {
        //	Render each patch in this landscape.
        this.vertices.length = 0;
        for (var i = 0; i < this.gNumPatchesPerYSide; ++i) {
            for (var j = 0; j < this.gNumPatchesPerXSide; ++j) {
                var patch = this.gPatches[i][j];
                if (patch.isVisible)
                    patch.render();
            }

        }
        
        this.geo.attributes.tge_a_position.data = new Float32Array(this.vertices);
        this.geo.attributes.tge_a_position.needsUpdate = true;
        this.geo.numItems = this.vertices.length ;
        this.geo.indexData = null;

    }
    proto.update_terrain = function (fovX, viewPosition, clipAngle) {
        /* Perform simple visibility culling on entire patches.
			- Define a triangle set back from the camera by 1/4 patch size, following
				the angle of the frustum.
			- A patch is visible if it's center point is included in
				the angle: Left,Eye,Right
			- This visibility test is only accurate if the camera cannot
				look up or down significantly.
		*/
        var  FOV_DIV_2 = Math.round(fovX / 2);
        var iClip =Math.round(clipAngle);

        //	Calculate grid corrdinates closest to the eye model location - 1/4 patch size.
        var eyeX = Math.floor(viewPosition[0] / gGridSpacing) - Math.floor(gPatchSize / 4 * Math.sin(iClip));
        var eyeY = Math.floor(viewPosition[2] / gGridSpacing) + Math.floor(gPatchSize / 4 * Math.cos(iClip));

        var patch2 = gPatchSize * 2;
        var angle =iClip - FOV_DIV_2;
        var leftX = eyeX + Math.floor(patch2 * Math.sin(angle));
        var leftY = eyeY - Math.floor(patch2 * Math.cos(angle));

        angle = iClip + FOV_DIV_2;
        var rightX = eyeX + Math.floor(patch2 *  Math.sin(angle));
        var rightY = eyeY - Math.floor(patch2 *  Math.cos(angle));


        // Set the next free triangle pointer back to the beginning
        this.gNextTriNode = 0;

        // Reset rendered triangle count.
        this.gNumTrisRendered = 0;

		// Go through the patches performing resets, computing variances, and linking.
        // Go through the patches performing resets, computing variances, and linking.
        for (var Y = 0; Y < this.gNumPatchesPerYSide; Y++) {
            for (var X = 0; X < this.gNumPatchesPerXSide; X++) {
                var patch = this.gPatches[Y][X];

                // Reset the patch
                patch.reset();
                patch.setVisibility(eyeX, eyeY, leftX, leftY, rightX, rightY);

                // Check to see if this patch has been deformed since last frame.
                // If so, recompute the varience tree for it.
                if (patch.varianceDirty)
                    patch.computeVariance();

                if (patch.isVisible) {
                    // Link all the patches together.
                    if (X > 0)
                        patch.baseLeft.LeftNeighbor = this.gPatches[Y][X - 1].baseRight
                    else
                        // Link to bordering Landscape here..
                        patch.baseLeft.LeftNeighbor = null;

                    if (X < this.gNumPatchesPerXSide - 1)
                        patch.baseRight.LeftNeighbor = this.gPatches[Y][X + 1].baseLeft;
                    else
                        // Link to bordering Landscape here..
                        patch.baseRight.LeftNeighbor = null;

                    if (Y > 0)
                        patch.baseLeft.RightNeighbor = this.gPatches[Y - 1][X].baseRight;
                    else
                        // Link to bordering Landscape here..
                        patch.baseLeft.RightNeighbor = null;

                    if (Y < this.gNumPatchesPerYSide - 1)
                        patch.baseRight.RightNeighbor = this.gPatches[Y + 1][X].baseLeft;
                    else
                        // Link to bordering Landscape here..
                        patch.baseRight.RightNeighbor = null;
                }
            }
        }


        this.tessellate(viewPosition);


    };


    proto.tessellate = function (viewPosition) {
        var viewPosX = Math.floor(viewPosition[0] / gGridSpacing);
        var viewPosY = Math.floor(viewPosition[1] / gGridSpacing);

        // Perform Tessellation
        for (var i = 0; i < this.gNumPatchesPerYSide; ++i) {
            for (var j = 0; j < this.gNumPatchesPerXSide; ++j) {
                var patch = this.gPatches[i][j];
                if (patch.isVisible)
                    patch.tessellate(viewPosX, viewPosY);
            }
        }



    }
    return terrain_mesh;

}, tge.mesh);





tge.terrain_mesh = $extend(function (proto, _super) {


    var MAP_SIZE = 256;
    var NUM_PATCHES_PER_SIDE = 8;
    var MULT_SCALE = 0.5;
    var PATCH_SIZE = MAP_SIZE / NUM_PATCHES_PER_SIDE;
    var VARIANCE_DEPTH = 9;
    var gFovX = 120.0;
    var gViewPosition = [21, 4], gFrameVariance = 50, gNumTrisRendered = 11110;
    var gClipAngle = 0;
    var vertices = [];

    var SQR = function (v) { return v * v; };
    var F$ = function (v) {
        return Math.floor(v);
    }

    console.log("PATCH_SIZE", PATCH_SIZE);

    function TriTreeNode() {
        this.LeftChild = undefined;
        this.RightChild = undefined;
        this.BaseNeighbor = undefined;
        this.LeftNeighbor = undefined;
        this.RightNeighbor = undefined;
        this.id = $guidi();
    }
    var Landscape;
    var Patch = $extend(function (proto) {

        proto.Reset = function () {
            // Assume patch is not visible.
            this.m_isVisible = false;

            // Reset the important relationships
            this.m_BaseLeft.LeftChild = this.m_BaseLeft.RightChild = this.m_BaseRight.LeftChild = this.m_BaseLeft.LeftChild = undefined;

            // Attach the two m_Base triangles together
            this.m_BaseLeft.BaseNeighbor = this.m_BaseRight;
            this.m_BaseRight.BaseNeighbor = this.m_BaseLeft;

            // Clear the other relationships.
            this.m_BaseLeft.RightNeighbor = this.m_BaseLeft.LeftNeighbor = this.m_BaseRight.RightNeighbor = this.m_BaseRight.LeftNeighbor = undefined;
        };

        proto.Init = function (heightX, heightY, worldX, worldY) {
            // Clear all the relationships
            this.m_BaseLeft.RightNeighbor = this.m_BaseLeft.LeftNeighbor = this.m_BaseRight.RightNeighbor = this.m_BaseRight.LeftNeighbor =
                this.m_BaseLeft.LeftChild = this.m_BaseLeft.RightChild = this.m_BaseRight.LeftChild = this.m_BaseLeft.LeftChild = undefined;

            // Attach the two m_Base triangles together
            this.m_BaseLeft.BaseNeighbor = this.m_BaseRight;
            this.m_BaseRight.BaseNeighbor = this.m_BaseLeft;

            // Store Patch offsets for the world and heightmap.
            this.m_WorldX = worldX;
            this.m_WorldY = worldY;


            // Initialize flags
            this.m_VarianceDirty = true;
            this.m_isVisible = false;
        }


        proto.RecursComputeVariance = function (leftX, leftY, leftZ, rightX, rightY, rightZ, apexX, apexY, apexZ, node) {
            var centerX = (leftX + rightX) >> 1;		// Compute X coordinate of center of Hypotenuse
            var centerY = (leftY + rightY) >> 1;		// Compute Y coord...
            var myVariance = 0;

            // Get the height value at the middle of the Hypotenuse
            var centerZ = this.L.H((centerY * MAP_SIZE) + centerX);
            // Variance of this triangle is the actual height at it's hypotenuse midpoint minus the interpolated height.
            // Use values passed on the stack instead of re-accessing the Height Field.

            myVariance = Math.abs(F$(centerZ) - ((F$(leftZ) + F$(rightZ)) >> 1));
            // Since we're after speed and not perfect representations,
            //    only calculate variance down to an 8x8 block
            if ((Math.abs(leftX - rightX) >= 8) || (Math.abs(leftY - rightY) >= 8)) {
                // Final Variance for this node is the max of it's own variance and that of it's children.
                myVariance = Math.max(myVariance, this.RecursComputeVariance(apexX, apexY, apexZ, leftX, leftY, leftZ, centerX, centerY, centerZ, node << 1));
                myVariance = Math.max(myVariance, this.RecursComputeVariance(rightX, rightY, rightZ, apexX, apexY, apexZ, centerX, centerY, centerZ, 1 + (node << 1)));
            }

            // Store the final variance for this node.  Note Variance is never zero.
            if (node < (1 << VARIANCE_DEPTH))
                this.m_CurrentVariance[node] = 1 + myVariance;

            return myVariance;
        };
        proto.ComputeVariance = function () {
            // Compute variance on each of the base triangles...

            this.m_CurrentVariance = this.m_VarianceLeft;
            this.RecursComputeVariance(0, PATCH_SIZE,this.L.H(PATCH_SIZE * MAP_SIZE),
                PATCH_SIZE, 0, this.L.H(PATCH_SIZE),
                0, 0, this.L.H(0),
                1);

            this.m_CurrentVariance = this.m_VarianceRight;
            this.RecursComputeVariance(PATCH_SIZE, 0, this.L.H(PATCH_SIZE),
                0, PATCH_SIZE, this.L.H(PATCH_SIZE * MAP_SIZE),
                PATCH_SIZE, PATCH_SIZE, this.L.H((PATCH_SIZE * MAP_SIZE) + PATCH_SIZE),
                1);

            // Clear the dirty flag for this patch
            this.m_VarianceDirty = false;
        };


        proto.Split = function (tri) {
            // We are already split, no need to do it again.
            if (tri.LeftChild)
                return;

            // If this triangle is not in a proper diamond, force split our base neighbor
            if (tri.BaseNeighbor && (tri.BaseNeighbor.BaseNeighbor && tri.BaseNeighbor.BaseNeighbor.id !== tri.id))
                this.Split(tri.BaseNeighbor);

            // Create children and link into mesh
            tri.LeftChild = Landscape.AllocateTri();
            tri.RightChild = Landscape.AllocateTri();

            // If creation failed, just exit.
            if (!tri.LeftChild)
                return;

            // Fill in the information we can get from the parent (neighbor pointers)
            tri.LeftChild.BaseNeighbor  = tri.LeftNeighbor;
            tri.LeftChild.LeftNeighbor  = tri.RightChild;

            tri.RightChild.BaseNeighbor = tri.RightNeighbor;
            tri.RightChild.RightNeighbor = tri.LeftChild;


            // Link our Left Neighbor to the new children
            if (tri.LeftNeighbor) {
                if (tri.LeftNeighbor.BaseNeighbor && tri.LeftNeighbor.BaseNeighbor.id === tri.id)
                    tri.LeftNeighbor.BaseNeighbor = tri.LeftChild;
                else if (tri.LeftNeighbor.LeftNeighbor && tri.LeftNeighbor.LeftNeighbor.id === tri.id)
                    tri.LeftNeighbor.LeftNeighbor = tri.LeftChild;
                else if (tri.LeftNeighbor.RightNeighbor && tri.LeftNeighbor.RightNeighbor.id === tri.id)
                    tri.LeftNeighbor.RightNeighbor = tri.LeftChild;
            }
            // Link our Right Neighbor to the new children
            if (tri.RightNeighbor) {
                if (tri.RightNeighbor.BaseNeighbor && tri.RightNeighbor.BaseNeighbor.id === tri.id)
                    tri.RightNeighbor.BaseNeighbor = tri.RightChild;
                else if (tri.RightNeighbor.RightNeighbor && tri.RightNeighbor.RightNeighbor.id === tri.id)
                    tri.RightNeighbor.RightNeighbor = tri.RightChild;
                else if (tri.RightNeighbor.LeftNeighbor && tri.RightNeighbor.LeftNeighbor.id === tri.id)
                    tri.RightNeighbor.LeftNeighbor = tri.RightChild;
            }

            // Link our Base Neighbor to the new children
            if (tri.BaseNeighbor) {
                if (tri.BaseNeighbor.LeftChild) {
                    tri.BaseNeighbor.LeftChild.RightNeighbor = tri.RightChild;
                    tri.BaseNeighbor.RightChild.LeftNeighbor = tri.LeftChild;
                    tri.LeftChild.RightNeighbor = tri.BaseNeighbor.RightChild;
                    tri.RightChild.LeftNeighbor = tri.BaseNeighbor.LeftChild;
                }
                else
                    this.Split(tri.BaseNeighbor);  // Base Neighbor (in a diamond with us) was not split yet, so do that now.
            }

            else {

                // An edge triangle, trivial case.
                tri.LeftChild.RightNeighbor = undefined;
                tri.RightChild.LeftNeighbor = undefined;
            }

        };

        proto.RecursTessellate = function (tri, leftX, leftY, rightX, rightY, apexX, apexY, node) {
            var TriVariance=0;
            var centerX = (leftX + rightX) >> 1; // Compute X coordinate of center of Hypotenuse
            var centerY = (leftY + rightY) >> 1; // Compute Y coord...

            if (node < (1 << VARIANCE_DEPTH)) {
                // Extremely slow distance metric (sqrt is used).
                // Replace this with a faster one!
                var distance = 1.0 + Math.sqrt(SQR(centerX - gViewPosition[0]) +
                    SQR(centerY - gViewPosition[1]));

                // Egads!  A division too?  What's this world coming to!
                // This should also be replaced with a faster operation.
                TriVariance = (this.m_CurrentVariance[node] * MAP_SIZE * 2) / distance;	// Take both distance and variance into consideration
            }

            // OR if we are not below the variance tree, test for variance.
            if ((node >= (1 << VARIANCE_DEPTH)) || (TriVariance > gFrameVariance))	// IF we do not have variance info for this node, then we must have gotten here by splitting, so continue down to the lowest level.                	
            {
                this.Split(tri);														// Split this triangle.

                if (tri.LeftChild &&											// If this triangle was split, try to split it's children as well.
                    ((Math.abs(leftX - rightX) >= 3) || (Math.abs(leftY - rightY) >= 3)))	// Tessellate all the way down to one vertex per height field entry
                {
                    this.RecursTessellate(tri.LeftChild, apexX, apexY, leftX, leftY, centerX, centerY, node << 1);
                    this.RecursTessellate(tri.RightChild, rightX, rightY, apexX, apexY, centerX, centerY, 1 + (node << 1));
                }
            }




        };
        proto.Tessellate = function () {
            // Split each of the base triangles
            this.m_CurrentVariance = this.m_VarianceLeft;
            this.RecursTessellate(this.m_BaseLeft,
                this.m_WorldX, this.m_WorldY + PATCH_SIZE,
                this.m_WorldX + PATCH_SIZE, this.m_WorldY,
                this.m_WorldX, this.m_WorldY,
                1);

            this.m_CurrentVariance = this.m_VarianceRight;
            this.RecursTessellate(this.m_BaseRight,
                this.m_WorldX + PATCH_SIZE, this.m_WorldY,
                this.m_WorldX, this.m_WorldY + PATCH_SIZE,
                this.m_WorldX + PATCH_SIZE, this.m_WorldY + PATCH_SIZE,
                1);
        };


        proto.RecursRender = function (tri, leftX, leftY, rightX, rightY, apexX, apexY) {
            if (tri.LeftChild)					// All non-leaf nodes have both children, so just check for one
            {
                var centerX = (leftX + rightX) >> 1;	// Compute X coordinate of center of Hypotenuse
                var centerY = (leftY + rightY) >> 1;	// Compute Y coord...

                this.RecursRender(tri.LeftChild, apexX, apexY, leftX, leftY, centerX, centerY);
                this.RecursRender(tri.RightChild, rightX, rightY, apexX, apexY, centerX, centerY);
            }
            else {
                // Actual number of rendered triangles...
                gNumTrisRendered++;

                var leftZ = this.L.H((leftY * MAP_SIZE) + leftX);
                var rightZ = this.L.H((rightY * MAP_SIZE) + rightX);
                var apexZ = this.L.H((apexY * MAP_SIZE) + apexX);

                // Output the LEFT VERTEX for the triangle
             //   glVertex3f(leftX, leftZ, leftY);
                // Output the RIGHT VERTEX for the triangle
               // glVertex3f(rightX, rightZ, rightY);
                // Output the APEX VERTEX for the triangle
               // glVertex3f(apexX, apexZ, apexY);

                vertices.push(leftX, leftY, -leftZ);
                vertices.push(rightX, rightY, -rightZ);
                vertices.push(apexX, apexY, -apexZ);


            }
        };

        proto.Render = function () {
            this.RecursRender(this.m_BaseLeft,
                0, PATCH_SIZE,
                PATCH_SIZE, 0,
                0, 0);

            this.RecursRender(this.m_BaseRight,
                PATCH_SIZE, 0,
                0, PATCH_SIZE,
                PATCH_SIZE, PATCH_SIZE);
        };

        proto.SetVisibility = (function () {
            function orientation( pX, pY,  qX,  qY,  rX,  rY) {
                var aX, aY, bX, bY;
                var d;

                aX = qX - pX;
                aY = qY - pY;

                bX = rX - pX;
                bY = rY - pY;

                d = aX * bY - aY * bX;
                return (d < 0) ? (-1) : (d > 0);
            }

            return function (eyeX, eyeY, leftX, leftY, rightX, rightY) {

                // Get patch's center point
                var patchCenterX = this.m_WorldX + PATCH_SIZE / 2;
                var patchCenterY = this.m_WorldY + PATCH_SIZE / 2;

                // Set visibility flag (orientation of both triangles must be counter clockwise)
                this.m_isVisible = (orientation(eyeX, eyeY, rightX, rightY, patchCenterX, patchCenterY) < 0) &&
                    (orientation(leftX, leftY, eyeX, eyeY, patchCenterX, patchCenterY) < 0);

               // this.m_isVisible = true;
            }
        })();


        function Patch() {

            
            this.m_WorldX = 0;
            this.m_WorldY=0;

            this.m_VarianceLeft=[];
            this.m_VarianceRight=[];

            this.m_CurrentVariance=0;
            this.m_VarianceDirty=true;
            this.m_isVisible=false;

            this.m_BaseLeft = new TriTreeNode();
            this.m_BaseRight = new TriTreeNode();

            this.GetBaseLeft = function () { return this.m_BaseLeft; };
            this.GetBaseRight = function () { return this.m_BaseRight; };
        }

        

        return Patch;
    });
    Landscape = $extend(function (proto) {

        proto.Reset = function () {
            //
            // Perform simple visibility culling on entire patches.
            //   - Define a triangle set back from the camera by one patch size, following
            //     the angle of the frustum.
            //   - A patch is visible if it's center point is included in the angle: Left,Eye,Right
            //   - This visibility test is only accurate if the camera cannot look up or down significantly.
            //
            var PI_DIV_180 = 3.14565 / 180.0;
            var FOV_DIV_2 = gFovX / 2;

            var eyeX = F$(gViewPosition[0] - PATCH_SIZE * Math.sin(gClipAngle * PI_DIV_180));
            var eyeY = F$(gViewPosition[1] + PATCH_SIZE * Math.cos(gClipAngle * PI_DIV_180));

            var leftX = F$(eyeX + 100.0 * Math.sin((gClipAngle - FOV_DIV_2) * PI_DIV_180));
            var leftY = F$(eyeY - 100.0 * Math.cos((gClipAngle - FOV_DIV_2) * PI_DIV_180));

            var rightX = F$(eyeX + 100.0 * Math.sin((gClipAngle + FOV_DIV_2) * PI_DIV_180));
            var rightY = F$(eyeY - 100.0 * Math.cos((gClipAngle + FOV_DIV_2) * PI_DIV_180));

            var X, Y;
            var patch;




            // Reset rendered triangle count.
            gNumTrisRendered = 0;

            // Go through the patches performing resets, compute variances, and linking.
            for (Y = 0; Y < NUM_PATCHES_PER_SIDE; Y++) {
                for (X = 0; X < NUM_PATCHES_PER_SIDE; X++) {
                    patch = this.m_Patches[Y][X];

                    // Reset the patch
                    patch.Reset();
                    patch.SetVisibility(eyeX, eyeY, leftX, leftY, rightX, rightY);

                    // Check to see if this patch has been deformed since last frame.
                    // If so, recompute the varience tree for it.
                    if (patch.m_VarianceDirty)
                        patch.ComputeVariance();

                    if (patch.m_isVisible) {
                        // Link all the patches together.
                        if (X > 0)
                            patch.GetBaseLeft().LeftNeighbor = this.m_Patches[Y][X - 1].GetBaseRight();
                        else
                            patch.GetBaseLeft().LeftNeighbor = undefined;		// Link to bordering Landscape here..

                        if (X < (NUM_PATCHES_PER_SIDE - 1))
                            patch.GetBaseRight().LeftNeighbor = this.m_Patches[Y][X + 1].GetBaseLeft();
                        else
                            patch.GetBaseRight().LeftNeighbor = undefined;		// Link to bordering Landscape here..

                        if (Y > 0)
                            patch.GetBaseLeft().RightNeighbor = this.m_Patches[Y - 1][X].GetBaseRight();
                        else
                            patch.GetBaseLeft().RightNeighbor = undefined;		// Link to bordering Landscape here..

                        if (Y < (NUM_PATCHES_PER_SIDE - 1))
                            patch.GetBaseRight().RightNeighbor = this.m_Patches[Y + 1][X].GetBaseLeft();
                        else
                            patch.GetBaseRight().RightNeighbor = undefined;	// Link to bordering Landscape here..
                    }
                }
            }
        }

        var patch;
        proto.Tessellate = function () {

            for (Y = 0; Y < NUM_PATCHES_PER_SIDE; Y++) {
                for (X = 0; X < NUM_PATCHES_PER_SIDE; X++) {
                    patch = this.m_Patches[Y][X];
                    if (patch.m_isVisible) patch.Tessellate();
                }
            }
        };

        proto.Render = function () {

            vertices.length = 0;
            for (Y = 0; Y < NUM_PATCHES_PER_SIDE; Y++) {
                for (X = 0; X < NUM_PATCHES_PER_SIDE; X++) {
                    patch = this.m_Patches[Y][X];
                    if (patch.m_isVisible) patch.Render();
                }
            }

            console.log(vertices);



    
        };



        function Landscape(m_HeightMap) {
            this.m_HeightMap = m_HeightMap;
            this.m_Patches = [];

            this.H = function (i) {
                return this.m_HeightMap[i];
            }
            
            for (var Y = 0; Y < NUM_PATCHES_PER_SIDE; Y++) {
                this.m_Patches[Y] = this.m_Patches[Y] || [];
                for (var X = 0; X < NUM_PATCHES_PER_SIDE; X++) {
                    var patch = new Patch();
                    this.m_Patches[Y][X] = patch;
                    patch.L = this;
                    patch.Init(X * PATCH_SIZE, Y * PATCH_SIZE, X * PATCH_SIZE, Y * PATCH_SIZE);
                    patch.ComputeVariance();
                }
            }
        }
        
	    
        Landscape.m_TriPool=[];
        var tri;
        Landscape.AllocateTri = function () {
            if (this.m_TriPool.length > 0)
                tri = this.m_TriPool.pop();
            else
               tri = new TriTreeNode();
            tri.LeftChild = tri.RightChild = null;
            return tri;

        };
        
        return Landscape;


    });
    









    var geo = tge.geometry.plane({ size: 100, divs: 32 });
    function terrain_mesh(gridSize, data) {
        _super.apply(this, [undefined, new tge.material()]);
        this.terrain = new Float32Array(gridSize * gridSize);
        this.tileSize = gridSize ;
        for (let y = 0; y < this.tileSize; y++) {
            for (let x = 0; x < this.tileSize; x++) {
                const k = (y * this.tileSize + x) * 4;
                const r = data[k + 0];
                const g = data[k + 1];
                const b = data[k + 2];
                this.terrain[y * gridSize + x] = r/30;
               // this.terrain[y * gridSize + x] = (r * 256 * 256 + g * 256.0 + b) / 9988;
            }
        }

        this.land = new Landscape(this.terrain);
        this.geo = geo;
        this.land.Reset();
        this.land.Tessellate();
        this.land.Render();

        
        
        /*
        var g = tge.geometry.plane({ size: 100, divs: 64 });
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 64; x++) {
                var k = (((y * 4) * gridSize) + (x * 4))*4;
                g.attributes.tge_a_position.data[((y * 64 + x) * 3) + 2] = data[k + 0] / 30; //this.terrain[(y * 2) * gridSize + (x * 2)];
                //vertices.push(x, this.terrain[y * gridSize + x], y);
            }
        }
        */
        
        var g = new tge.geometry();
        g.addAttribute("tge_a_position", {
            data: new Float32Array(vertices),
            itemSize: 3, offset: 0
        });
        g.numItems = vertices.length / 3;        
        
        this.geo = g;
        return this;
    }








    return terrain_mesh;

}, tge.mesh);


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


/*./camera.js*/





tge.camera = $extend(function (proto, _super) {


    proto.getDisplay = function () {
        var g = tge.geometry.cube();
        g.scaleAndPosition(0, 0, 0,0.5, 0.5, 0.5);
        var mod = new tge.model(g);
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


    proto.getDisplay = (function (proto_getDisplay) {
        return function () {
            var mod = proto_getDisplay.apply(this);


            var halfHeight = Math.tan( (this.fov / 2.0));
            var halfWidth = halfHeight * this.aspect;
            var xn = halfWidth * this.near;
            var xf = halfWidth * this.far;
            var yn = halfHeight * this.near;
            var yf = halfHeight * this.far;


            var b = tge.geometry.line_geometry_builder;
            b.clear();
            b.add(-xn, -yn, -this.near).add(-xf, -yf, -this.far);
            b.add(xn, -yn, -this.near).add(xf, -yf, -this.far);

            b.add(-xn, yn, -this.near).add(-xf, yf, -this.far);
            b.add(xn, yn, -this.near).add(xf, yf, -this.far);
            
            b.add(-xf, yf, -this.far).add(xf, yf, -this.far);
            b.add(-xf, -yf, -this.far).add(xf, -yf, -this.far);


            b.add(-xf, -yf, -this.far).add(-xf, yf, -this.far);
            b.add(xf, -yf, -this.far).add(xf, yf, -this.far);
            
                            
                

            mod.addMesh(new tge.mesh(b.build(), tge.material.LinesSelected));

            return mod;
        }
    })(proto.getDisplay);



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

    proto.setOrthoProjection = function (left, right, bottom, top, near, far) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;

        this.aspect = Math.abs((this.right - this.left) / (this.top - this.bottom));
        tge.mat4.ortho(this.matrixProjection, this.left, this.right, this.bottom, this.top, this.near, this.far);
        return this;
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
        this.shadowOpacity = 0.5;
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


    light.colored_shadows = tge.shader.createChunksLib(`/*chunk-map*/
<?=chunk('precision')?>

uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;
uniform mat4 tge_u_objectMaterial;
uniform vec4 tge_u_shadowColor;

void fragment(void) {
vec4 c=texture2D(tge_u_ambientTexture, tge_v_uv);
if(c.w<0.02) discard;
gl_FragColor=mix(vec4(1.0),1.0-tge_u_shadowColor,1.0-tge_u_shadowColor.a);
gl_FragColor=mix(gl_FragColor,1.0-c,1.0-c.a);

gl_FragColor.a=c.a*tge_u_shadowColor.a;
}

/*chunk-receiver*/
uniform mat4 tge_u_light_camera_matrix;
varying vec4 tge_v_shadow_light_vertex;

void vertex(){
super_vertex();

tge_v_shadow_light_vertex = tge_u_light_camera_matrix * tge_v_shadow_vertex;
//tge_v_shadow_light_vertex.xyz/=tge_v_shadow_light_vertex.w;
//tge_v_shadow_light_vertex.xyz = tge_v_shadow_light_vertex.xyz * 0.5 + 0.5;

}


<?=chunk('precision')?>
<?=chunk('shadow-sampling')?>


varying vec3 tge_v_normal;
varying vec4 tge_v_shadow_light_vertex;

varying vec4 tge_v_shadow_vertex;

uniform sampler2D tge_u_shadow_map;
uniform sampler2D tge_u_shadow_map_color;
uniform vec3 tge_u_shadow_params;
uniform vec3 tge_u_light_pos;
uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;

vec4 shadowColor;

float getShadowSample() {

float f=texture2D(tge_u_ambientTexture, tge_v_uv).a;

vec3 shadowMapCoords =tge_v_shadow_light_vertex.xyz/tge_v_shadow_light_vertex.w;
f*=step(-(dot(tge_v_normal,normalize(tge_u_light_pos - shadowMapCoords.xyz))),0.0);

shadowMapCoords.xyz = shadowMapCoords.xyz * 0.5 + 0.5;

shadowColor=texture2D(tge_u_shadow_map_color, shadowMapCoords.xy);
f*=step(shadowMapCoords.x,1.0)*step(shadowMapCoords.y,1.0)*step(shadowMapCoords.z,1.0);
f*=step(0.0,shadowMapCoords.x)*step(0.0,shadowMapCoords.y)*step(0.0,shadowMapCoords.y);

return (0.5*f)-SampleShadowMapPCF(tge_u_shadow_map, shadowMapCoords.xy,shadowMapCoords.z-tge_u_shadow_params.z ,vec2(tge_u_shadow_params.y))*f;


}


void fragment(void) {
gl_FragColor = (getShadowSample()*tge_u_shadow_params.x)*shadowColor;


}`);
    light.default_shadows = tge.shader.createChunksLib(`/*chunk-map*/
<?=chunk('precision')?>

uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;

void fragment(void) {
if(texture2D(tge_u_ambientTexture, tge_v_uv).a<0.02) discard;
gl_FragColor=vec4(1.0);
}

/*chunk-receiver*/
uniform mat4 tge_u_light_camera_matrix;
varying vec4 tge_v_shadow_light_vertex;

void vertex(){
super_vertex();
tge_v_shadow_light_vertex = tge_u_light_camera_matrix * tge_v_shadow_vertex;
}


<?=chunk('precision')?>
<?=chunk('shadow-sampling')?>


varying vec3 tge_v_normal;
varying vec4 tge_v_shadow_light_vertex;

varying vec4 tge_v_shadow_vertex;

uniform sampler2D tge_u_shadow_map;
uniform vec3 tge_u_shadow_params;
uniform vec3 tge_u_light_pos;
uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;



float getShadowSample() {

float f=texture2D(tge_u_ambientTexture, tge_v_uv).a;

vec3 shadowMapCoords =tge_v_shadow_light_vertex.xyz/tge_v_shadow_light_vertex.w;
f*=step(-(dot(tge_v_normal,normalize(tge_u_light_pos - shadowMapCoords.xyz))),0.0);

shadowMapCoords.xyz = shadowMapCoords.xyz * 0.5 + 0.5;

f*=step(shadowMapCoords.x,1.0)*step(shadowMapCoords.y,1.0)*step(shadowMapCoords.z,1.0);
f*=step(0.0,shadowMapCoords.x)*step(0.0,shadowMapCoords.y)*step(0.0,shadowMapCoords.y);

return (0.5*f)-SampleShadowMapPCF(tge_u_shadow_map, shadowMapCoords.xy,shadowMapCoords.z-tge_u_shadow_params.z ,vec2(tge_u_shadow_params.y))*f;


}


void fragment(void) {
gl_FragColor = vec4((getShadowSample()*tge_u_shadow_params.x));


}`);



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


/*./post_process.js*/


tge.post_process = $extend(function (proto) {


    function post_process(on_apply, shader) {
        this.uuid = $guidi();
        this.shader = shader || tge.post_process.shader;
        this.enabled = true;
       
    }
      
    proto.resize = function (width, height) {

    }
    proto.bind_output = function (engine,output) {
        if (output === null) {
            engine.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
            engine.gl.viewport(0, 0, engine.gl.canvas.width, engine.gl.canvas.height);
        }
        else {
            output.bind();
        }
    }

    var on_apply_params = [null, null, null];
    proto.apply = function (engine, input, output) {        
        engine.useShader(this.shader);
        this.bind_output(engine,output);
        if (this.on_apply !== null) {
            on_apply_params[0] = engine;
            on_apply_params[1] = input;
            on_apply_params[2] = output;
            input = this.on_apply.apply(this, on_apply_params);

        }
        if (this.shader.setUniform("tge_u_texture_input", 0)) {
            engine.useTexture(input, 0);
        }
        
        engine.renderFullScreenQuad();
    }

    return post_process;

});





tge.post_process.shader = tge.pipleline_shader.parse(tge.shader.$str("<?=chunk('post_process_flat')?>"));
tge.post_process.flat = function (engine, input, output) {
    engine.useShader(tge.post_process.shader);
    if (output === null) {
        engine.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
        engine.gl.viewport(0, 0, engine.gl.canvas.width, engine.gl.canvas.height);
    }
    else {
        output.bind();
    }    
    if (tge.post_process.shader.setUniform("tge_u_texture_input", 0)) {
        engine.useTexture(input, 0);
    }

    engine.renderFullScreenQuad();
}


tge.post_process.fxaa = $extend(function (proto, _super) {
    function fxaa(params) {
        _super.apply(this);



        this.spanMax = 8;
        this.reduceMin = (1 / 256);
        this.reduceMul = (1 / 8);

        $merge(params || {}, this);

        this.shader = tge.post_process.fxaa.shader;


    }

    var tge_u_inverseFilterTextureSize = tge.vec3();
    var tge_u_fxaa_params = tge.vec3();
    proto.on_apply = function (engine, input, output) {
        tge_u_inverseFilterTextureSize[0] = 1 / input.width;
        tge_u_inverseFilterTextureSize[1] = 1 / input.height;
        this.shader.setUniform("tge_u_inverseFilterTextureSize", tge_u_inverseFilterTextureSize);

        tge_u_fxaa_params[0] = this.spanMax;
        tge_u_fxaa_params[1] = this.reduceMin;
        tge_u_fxaa_params[2] = this.reduceMul;


        this.shader.setUniform("tge_u_fxaa_params", tge_u_fxaa_params);
        return input;
    };

    fxaa.shader = tge.post_process.shader.extend(`uniform vec3 tge_u_inverseFilterTextureSize;
uniform vec3 tge_u_fxaa_params;
void fragment()
{

float R_fxaaSpanMax=tge_u_fxaa_params.x;
float R_fxaaReduceMin=tge_u_fxaa_params.y;
float R_fxaaReduceMul=tge_u_fxaa_params.z;
vec2 texCoordOffset = tge_u_inverseFilterTextureSize.xy;
vec3 luma = vec3(0.299, 0.587, 0.114);
float lumaTL = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(-1.0, -1.0) * texCoordOffset)).xyz);
float lumaTR = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(1.0, -1.0) * texCoordOffset)).xyz);
float lumaBL = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(-1.0, 1.0) * texCoordOffset)).xyz);
float lumaBR = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(1.0, 1.0) * texCoordOffset)).xyz);
float lumaM = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy).xyz);

vec2 dir;
dir.x = -((lumaTL + lumaTR) - (lumaBL + lumaBR));
dir.y = ((lumaTL + lumaBL) - (lumaTR + lumaBR));

float dirReduce = max((lumaTL + lumaTR + lumaBL + lumaBR) * (R_fxaaReduceMul * 0.25), R_fxaaReduceMin);
float inverseDirAdjustment = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);

dir = min(vec2(R_fxaaSpanMax, R_fxaaSpanMax), 
max(vec2(-R_fxaaSpanMax, -R_fxaaSpanMax), dir * inverseDirAdjustment)) * texCoordOffset;

vec3 result1 = (1.0/2.0) * (
texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(1.0/3.0 - 0.5))).xyz +
texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(2.0/3.0 - 0.5))).xyz);

vec3 result2 = result1 * (1.0/2.0) + (1.0/4.0) * (
texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(0.0/3.0 - 0.5))).xyz +
texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(3.0/3.0 - 0.5))).xyz);

float lumaMin = min(lumaM, min(min(lumaTL, lumaTR), min(lumaBL, lumaBR)));
float lumaMax = max(lumaM, max(max(lumaTL, lumaTR), max(lumaBL, lumaBR)));
float lumaResult2 = dot(luma, result2);

if(lumaResult2 < lumaMin || lumaResult2 > lumaMax)
gl_FragColor = vec4(result1, 1.0);
else
gl_FragColor = vec4(result2, 1.0);
}
`);


    return fxaa;

}, tge.post_process);


tge.post_process.picture_adjustment = $extend(function (proto, _super) {
    function picture_adjustment(params) {
        params = params || {};
        _super.apply(this);
        this.shader = tge.post_process.picture_adjustment.shader;      
        this.gamma=1;
        this.contrast= 1;
        this.saturation= 1;
        this.brightness= 1;
        this.red= 1;
        this.green= 1;
        this.blue =1;
        this.alpha = 1;
        $merge(params, this);

    }
    picture_adjustment.shader = tge.post_process.shader.extend(`uniform mat3 tge_u_pa_params;

void fragment(){
vec4 c = texture2D(tge_u_texture_input, tge_v_uv);
  if (c.a > 0.0) {

float gamma=tge_u_pa_params[0].x;
float contrast=tge_u_pa_params[0].y;
float saturation=tge_u_pa_params[0].z;
float brightness=tge_u_pa_params[1].x;
float red=tge_u_pa_params[1].y;
float green=tge_u_pa_params[1].z;
float blue=tge_u_pa_params[2].x;

    c.rgb /= c.a;

    vec3 rgb = pow(c.rgb, vec3(1. / gamma));
    rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
    rgb.r *= red;
    rgb.g *= green;
    rgb.b *= blue;
    c.rgb = rgb * brightness;

    c.rgb *= c.a;
  }
float alpha=tge_u_pa_params[2].y;
  gl_FragColor = c * alpha;
}
`);

    var tge_u_pa_params = tge.mat3();
    proto.on_apply = function (engine, input, output) {
        tge_u_pa_params[0] = this.gamma;
        tge_u_pa_params[1] = this.contrast;
        tge_u_pa_params[2] = this.saturation;
        tge_u_pa_params[3] = this.brightness;
        tge_u_pa_params[4] = this.red;
        tge_u_pa_params[5] = this.green;
        tge_u_pa_params[6] = this.blue;
        tge_u_pa_params[7] = this.alpha;
        this.shader.setUniform("tge_u_pa_params", tge_u_pa_params);
        return input;
    };

    return picture_adjustment;

}, tge.post_process);



tge.post_process.glow = $extend(function (proto, _super) {



    function glow(params) {
        _super.apply(this);
        params = params || {};

        this.resolution = params.resolution || 0.5;
        this.resolution_last = this.resolution;
        this.blurQuality = params.blurQuality || 10;                
        this.brightThreshold = tge.vec4(params.brightThreshold || [0.2627, 0.6780, 0.0593, -0.5]);
        this.blendExposure = params.blendExposure || 1;
        this.blendGamma = params.blendGamma || 1;
        this.blendFactor = params.blendFactor || 3.0;
        this.tge_u_offset = tge.vec2();
        this.blurKernel = tge.vec3([5.0 / 16.0, 6 / 16.0, 5 / 16.0]);

        if (params.enabled !== undefined) this.enabled = params.enabled;

        
    }

    var chunks = tge.shader.createChunksLib(`/*chunk-emission-filter*/
uniform vec4 tge_u_brightThreshold;
void fragment(){
 vec4 color = texture2D(tge_u_texture_input, tge_v_uv);    
 float luminance = dot(color.rgb, tge_u_brightThreshold.xyz );
 luminance+=(color.a+tge_u_brightThreshold.w);
 gl_FragColor = luminance* color;
}

/*chunk-blur*/

uniform vec2 tge_u_offset;
uniform vec3 tge_u_blurKernel;
void fragment(){
vec3 A = tge_u_blurKernel.x* texture2D(tge_u_texture_input, tge_v_uv - tge_u_offset).xyz;
vec3 B = tge_u_blurKernel.y* texture2D(tge_u_texture_input, tge_v_uv).xyz;
vec3 C = tge_u_blurKernel.z* texture2D(tge_u_texture_input, tge_v_uv + tge_u_offset).xyz;
vec3 color = A + B + C;
gl_FragColor = vec4(color, 1);

}



/*chunk-merge*/
uniform sampler2D tge_u_glow_emission;
uniform vec3 tge_u_glow_params;
void fragment(){
vec4 cBase = texture2D(tge_u_texture_input, tge_v_uv);
vec4 cOver = texture2D(tge_u_glow_emission, tge_v_uv);
vec4 blend = cBase + cOver * tge_u_glow_params.z;
  blend = vec4(1.0) - exp(-blend * tge_u_glow_params.x);
  blend = pow(blend, vec4(1.0 / tge_u_glow_params.y));
gl_FragColor =blend;
}`)


    glow.emission_shader = tge.post_process.shader.extend(chunks["emission-filter"]);
    glow.merge_shader = tge.post_process.shader.extend(chunks["merge"]);
    glow.blur_shader = tge.post_process.shader.extend(chunks["blur"]);


    proto.resize = function () {
        this.resolution_last = -1;
    };



    var i = 0, t = 0;
    var tge_u_glow_params = tge.vec3();
    proto.apply = function (engine, input, output) {

        if (!this.targets) {
            
            this.targets = [new tge.rendertarget(engine.gl,
                input.width * this.resolution, input.height * this.resolution),
            new tge.rendertarget(engine.gl,
                input.width * this.resolution, input.height * this.resolution)];

            this.targets[0].colorTexture.P("TEXTURE_MAG_FILTER", GL_LINEAR)
                .P("TEXTURE_MIN_FILTER", GL_LINEAR);

            this.targets[1].colorTexture.P("TEXTURE_MAG_FILTER", GL_LINEAR)
                .P("TEXTURE_MIN_FILTER", GL_LINEAR);

        }

        else {

            if (this.resolution_last !== this.resolution) {
                this.targets[0].resize(input.width * this.resolution, input.height * this.resolution);
                this.targets[1].resize(input.width * this.resolution, input.height * this.resolution);
                
            }


        }
        this.resolution_last = this.resolution;
        

        engine.useShader(tge.post_process.glow.emission_shader);
        engine.activeShader.setUniform("tge_u_brightThreshold", this.brightThreshold);
        this.targets[0].bind();        
        engine.useTexture(input, 0);
        engine.renderFullScreenQuad();


        engine.useShader(tge.post_process.glow.blur_shader);
        engine.activeShader.setUniform("tge_u_blurKernel", this.blurKernel);
      
        t=0;
        for (i = 1; i < this.blurQuality; i++) {
            t = i % 2;
            this.targets[t].bind();
            engine.useTexture(this.targets[(t === 0 ? 1 : 0)].colorTexture, 0);
            if (t === 0)
                tge.vec2.set(this.tge_u_offset, (1 / (input.width/i)), 0);
            else
                tge.vec2.set(this.tge_u_offset, 0, (1 / (input.height/i)));


            engine.activeShader.setUniform("tge_u_offset", this.tge_u_offset);
            engine.renderFullScreenQuad();
        }

                
        this.bind_output(engine, output);
        engine.useTexture(input, 0);
        engine.useShader(tge.post_process.glow.merge_shader);
        tge_u_glow_params[0] = this.blendExposure;
        tge_u_glow_params[1] = this.blendGamma;
        tge_u_glow_params[2] = this.blendFactor;
        engine.activeShader.setUniform("tge_u_glow_params", tge_u_glow_params);
        engine.activeShader.setUniform("tge_u_glow_emission", 1)
        engine.useTexture(this.targets[t].colorTexture, 1);
        engine.renderFullScreenQuad();

    }




    return glow;

}, tge.post_process);

/*src/engine.js*/








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
        geos.push(tge.geometry.sphere({ divs:16}));
        material = material || tge.phong_material;
        var cc = 0;
        for (var x = -range; x <= range; x += step) {
            for (var z = -range; z <= range; z += step) {
                scene.addModel(new tge.model(geos[Math.floor(Math.random() * geos.length)], new material()), function (md, mesh) {
                    md.setPosition(x, 0, z);
                    mesh.material.setAmbientRandom().setDiffuseRandom();
                    onModel(md, cc);
                    cc++;
                });
            }
        }
    }

    console.log(scene);



    var camera = new tge.perspective_camera(70, window.innerWidth / window.innerHeight, 0.1, 1500);
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








