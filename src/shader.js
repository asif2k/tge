import * from './geometry.js'

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
                35664: ['uniform2fv', 2],// 'vec2',                
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
            tge.shader.context_param = {}

            
            $assign(tge.shader.context_param, _params);

            $assign(tge.shader.context_param, shdr.params);

            shdr.vs =tge.shader.$str(shdr.vs,true);
            shdr.fs = tge.shader.$str(shdr.fs,true);
            shdr.gl = gl;


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

    shader.loadChunks(import('shader_chunks.glsl'));
    
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
