import * from './geometry.js'
import * from './material.js'


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
