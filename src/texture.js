
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
            this.depthTexture = this.bindTexture(new tge.texture(null, gl.DEPTH_COMPONENT, tge.TEXTURE_FORMAT_TYPE.UNSIGNED_SHORT ,false, width, height), gl.DEPTH_ATTACHMENT);
            this.depthTexture.targetId = this.uuid;

          //  this.depthTexture.P("TEXTURE_MAG_FILTER", tge.TEXTURE_FORMAT_TYPE.LINEAR);
           // this.depthTexture.P("TEXTURE_MIN_FILTER", tge.TEXTURE_FORMAT_TYPE.LINEAR_MIPMAP_LINEAR);

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

