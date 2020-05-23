
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

