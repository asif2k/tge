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
                // Output the LEFT VERTEX for the triangle
                this.O.vert(leftX, leftZ, leftY);
                // Output the RIGHT VERTEX for the triangle
                this.O.vert(rightX, rightZ, rightY);

                // Output the APEX VERTEX for the triangle
                this.O.vert(apexX, apexZ, apexY);

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
        var vc = this.vertices.length / 3;
        var indices = [];
        for (var i = 0; i < vc*3; i+=3) {
            indices.push(i, i + 1, i + 2);
        }
        this.geo.attributes.tge_a_position.data = new Float32Array(this.vertices);
        this.geo.attributes.tge_a_position.needsUpdate = true;
        this.geo.numItems = this.vertices.length / 3;
        this.geo.setIndices(indices);
        this.geo.indexNeedsUpdate = true;

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
