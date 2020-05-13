
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