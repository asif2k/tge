import * from './geometry.js'
import * from './material.js'
import * from './scene.js'

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
        var cc = 0;
        for (var x = -range; x <= range; x += step) {
            for (var z = -range; z <= range; z += step) {
                scene.addModel(new tge.model(geos[Math.floor(Math.random() * geos.length)], new material()), function (md, mesh) {
                    md.setPosition(x, 0, z);
                    mesh.material.setAmbientRandom();
                    onModel(md, cc);
                    cc++;
                });
            }
        }
    }

    console.log(scene);



    var camera = new tge.perspective_camera(80, window.innerWidth / window.innerHeight, 0.1, 500);
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