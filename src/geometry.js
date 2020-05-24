
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
                geo.wireframe_index_data = new Uint16Array(geo.indexData.length * 2);
            } else if (geo.wireframe_index_data.length < geo.indexData.length * 2) {
                geo.wireframe_index_data = new Uint16Array(geo.indexData.length * 2);
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

        return function (gl, geo,is_wireframe) {

            if (geo.indexData !== null) {


                if (is_wireframe) {
                    if (geo.wireframe_index_buffer===null) {
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




                tge.vec3.subtract(v1v2, v2, v1);
                tge.vec3.subtract(v1v3, v3, v1);
                tge.vec3.normalize(v1v2, v1v2);
                tge.vec3.normalize(v1v3, v1v3);
                tge.vec3.cross(normal, v1v2, v1v3);
                tge.vec3.normalize(normal, normal);

                weight1 = Math.acos(Math.max(-1, Math.min(1, tge.vec3.dot(v1v2, v1v3))));
                tge.vec3.subtract(v2v3Alias, v3, v2);
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


    geometry.quad2D = function () {
        var g = new geometry();
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
        var g = new geometry();
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

    return geometry;

});
