
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