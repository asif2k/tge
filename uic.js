var EventSystem = function () {
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
function createCanvasObject(w, h) {
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
var uic = (function () {
    var head = document.head || document.getElementsByTagName('head')[0];
    function _uic(id, text, extend_id) {
        if (_uic.components[id]) return;
        var func;
        var proto = { html$: "", extension: [] };
        if (extend_id) {
            uic.components[extend_id].extension.forEach(function (ex) {
                uic.components.prototype[ex](proto, $$);
                proto.extension.push(ex);
            });
            uic.components.prototype[extend_id](proto, $$);
            proto.extension.push(extend_id);
        }

        proto.id = id;

        if (isFunction(text)) {
            func = text;
        }
        else {
            $$.rgMatch(text.match(/<style>[\s\S]*?<\/style>/g), function (m) {
                text = text.replace(m, "");
                m = m.replace('<style>', '').replace('<\/style>', '');
                _uic.CSS(m);
            });
            text = text.split('<script>');
            proto.html$ = text[0].replace(/\r?\n|\r/g, '').replace(/\t/g, '').trim();
            func = new Function('proto', '$$', '_super', text[1]);
        }




        uic.components.prototype[id] = func;
        _uic.components[id] = proto;
        proto.create = (function (id, create) {
            return function (node, proto, params) {
                if (this.init) {
                    this.init();
                    delete this.init;

                }
                node = create(node, proto || uic.components[id], params);
                node.classList.add(id);
                node.componentId = id;
                node.proto = proto;
                node._class = function () {
                    return uic.components[this.componentId];
                }

                return node;
            }
        })(id, func(proto, $$, extend_id ?
            (function (superDef, childDef) {
                return function (node, proto) {
                    return superDef.create.apply(superDef, arguments);
                }
            })(uic.components[extend_id], proto)
            : undefined));



        return proto;

    }

    var $$ = (function () {
        var temp = [], i;
        return function () {
            temp.length = 0;
            for (i = 0; i < arguments.length; i++)
                temp[i] = arguments[i];

            return temp.join("");
        }
    })();

    Object.assign($$, {
        parseData: function (data) {
            if (data) return JSON.parse(data);
            return undefined;
        },
        createElm: function (tag, proto, callback) {
            var e = document.createElement(tag);
            Object.assign(e, proto);
            e = _uic.bindComponents(e);
            if (callback) callback(e);
            return (e);
        },
        createElm2: function (tag, proto, callback) {
            var e = document.createElement(tag);
            Object.assign(e, proto);
            if (callback) callback(e);
            return (e);
        },
        createHtmlElm: function (html, proto, callback) {
            var e = document.createElement('div');
            e.innerHTML = html.trim();
            e = e.firstChild;
            Object.assign(e, proto || {});
            e = uic.bindComponents(e);
            if (callback) callback(e);
            return (e);
        },
        moveChildren: (function () {
            var children = [];
            return function (source, dest) {
                children.length = 0;
                source.childNodes.forEach(function (c) {
                    children.push(c);
                });
                children.forEach(function (c) {
                    dest.appendChild(c);
                });
                children.length = 0;
                return dest;
            };
        })(),
        prependElm: function (parent, node) {
            if (parent.childNodes.length > 0) {
                parent.insertBefore(node, parent.childNodes[0]);
            }
            else parent.appendChild(node);
        },
        enumElements: function (container) {
            var a;
            container.querySelectorAll("*[enum]").forEach(function (node) {
                a = node.getAttribute('enum');
                container[a] = node;

                node.classList.add(a);
                node.removeAttribute(a);
            });
            return container;
        },
        dataAssign: (function () {
            var a;
            return function (container) {
                container.querySelectorAll("*[data-assign]").forEach(function (node) {
                    a = node.getAttribute('data-assign');
                    node.removeAttribute(a);
                    Object.assign(node, JSON.parse('{' + a + '}'));
                });
                return container;
            }
        })(),
        rgMatch: function (match, func) {
            if (match !== null) match.forEach(func);
        },
        qs: function (e$, sel, cb) {
            if (cb) return cb(e$.querySelector(sel), e$);
            return e$.querySelector(sel);
        },
        cssClass: function (e$, classes) {
            classes.split(" ").forEach(function (c) {
                c = c.trim();
                if (c.length > 0) e$.classList.add(c);
            });
            return e$;
        },
        _cssClass: function (e$, classes) {
            classes.split(" ").forEach(function (c) {
                c = c.trim();
                if (c.length > 0) e$.classList.remove(c);
            });
            return e$;
        },
        offset: (function () {
            var rect, win;
            return function (e$) {
                if (!e$.getClientRects().length) {
                    return { top: 0, left: 0 };
                }
                rect = e$.getBoundingClientRect();
                win = e$.ownerDocument.defaultView;

                return {
                    top: rect.top + win.pageYOffset,
                    left: rect.left + win.pageXOffset
                };
            }
        })(),
        outerHeight: (function () {
            var list = [
                'margin-top',
                'margin-bottom',
                'border-top',
                'border-bottom',
                'height'
            ];
            var style;
            return function (e$) {
                style = window.getComputedStyle(e$);

                return list
                    .map(k => parseInt("0" + style.getPropertyValue(k), 10))
                    .reduce((prev, cur) => prev + cur)
            }

        })(),
        outerWidth: (function () {
            var list = [
                'margin-left',
                'margin-right',
                'border-left',
                'border-right',
                'width'
            ];
            var style;
            return function (e$) {
                style = window.getComputedStyle(e$);
                return list
                    .map(k => parseInt("0" + style.getPropertyValue(k), 10))
                    .reduce((prev, cur) => prev + cur)
            }

        })(),
        button: function (text) {
            return $$.cssClass($$.createElm2("button", {}, function (b$) {
                b$.innerHTML = text;
                b$.style.pointerEvents = "fill";
            }), "btn btn-xs");
        },
        label: function (text) {
            return $$.createElm2("label", {}, function (b$) {
                b$.innerHTML = text;
            });
        },
        fixMousePos: function (e) {
            e.offset = $$.offset(e.target);
            e.xx = e.offsetX || e.clientX - e.offset.left;
            e.yy = e.offsetY || e.clientY - e.offset.top;


            return (e);
        },
        btn_group_list: function (arr, css) {
            css = css || 'btn-sm btn-default';
            return htlm$(arr.reduce(function (a, b) {
                return (a + '<button class="btn ' + css + '">' + b + '</button>');
            }, '<div class="btn-group-vertical">') + '</div>');
        }



    });

    function isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }


    _uic.$$ = $$;
    _uic.components = {};
    _uic.components.prototype = {};
    console.log(_uic.components);
    _uic.bindComponents = function (container, onCreate) {
        var next, comp$;

        for (var c in _uic.components) {
            container.querySelectorAll("*[uic='" + c + "']").forEach(function (node) {
                next = node.nextSibling;
                node.removeAttribute("uic");
                comp$ = _uic.components[c].create(node);
                node.parentNode.insertBefore(comp$, next);
                if (onCreate) onCreate(comp$);

            });
        }
        return container;
    };

    _uic.create = function (comp, params) {
        return this.components[comp].create($$.createElm2("div"), params);
    }

    _uic.CSS = function (css) {
        var style = $$.createElm('style', { type: 'text/css' });
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }

    _uic.arrayToRGBA = function (arr) {
        return 'rgba(' + arr[0] + ',' + arr[1] + ',' + arr[2] + ',' + (arr[3] / 100) + ')';
    };



    _uic.popups$ = [];

    _uic.popups$.zIndex = -1;
    _uic.popups$.get = function () {

        if (_uic.popups$.zIndex === -1) {
            _uic.popups$.zIndex = 9990;
            _uic.CSS($$(
                '.uic-pupup-panel-overlay {position:fixed;display:block;left:0;right:0;top:0;bottom:0;background-color:rgba(10,10,10);opacity:0.05;}',
                '.uic-pupup-panel-panel {position:absolute;display:inline-block;}',
                ''
            ));
        }
        var popup$
        if (_uic.popups$.length > 0)
            popup$ = _uic.popups$.pop();
        else {
            popup$ = $$.createElm2("div");
            popup$.classList.add("uic-pupup-panel-panel");
            popup$.overlay$ = $$.createElm2("div");
            popup$.overlay$.classList.add("uic-pupup-panel-overlay");
            popup$.overlay$.ownerPopup$ = popup$;
            popup$.overlay$.onmousedown = function () {
                if (!this.ownerPopup$.isModal) {
                    _uic.popups$.free(this.ownerPopup$);
                }

            };
            popup$.dismiss = function () {
                _uic.popups$.free(this);
            };

        }

        popup$.overlay$.style.zIndex = _uic.popups$.zIndex + 1;
        popup$.style.zIndex = _uic.popups$.zIndex + 2;
        popup$.isModal = false;
        document.body.appendChild(popup$.overlay$);
        document.body.appendChild(popup$);
        _uic.popups$.zIndex += 2;
        //  console.log("_uic.popups$.zIndex+", _uic.popups$.zIndex);
        return popup$;
    }

    _uic.popups$.free = function (popup$) {
        if (popup$.free) popup$.free(popup$);
        _uic.popups$.push(popup$);
        if (popup$.firstChild) popup$.removeChild(popup$.firstChild);
        document.body.removeChild(popup$);
        document.body.removeChild(popup$.overlay$);

        _uic.popups$.zIndex -= 2;

        //console.log("_uic.popups$.zIndex-", _uic.popups$.zIndex);

    };

    _uic.popups$.dismiss_active = function () {
        if (this.active_popup$) this.active_popup$.dismiss();
    };

    _uic.popups$.show = (function () {
        var off, ow,top,left;
        return function (content$, re$, upward) {
            var popup$ = _uic.popups$.get();
            popup$.appendChild(content$);
            if (re$) {
                off = $$.offset(re$);               
                top = off.top;
                left = off.left;
                if (re$.classList.contains("popup-up-dir") | upward) {
                    top = off.top - $$.outerHeight(popup$);
                    if (top < 0) top = off.top + $$.outerHeight(re$);;
                }
                else {
                    top = off.top + $$.outerHeight(re$);;
                }
                ow = $$.outerWidth(popup$);
                if (left + ow > window.innerWidth) {
                    ///off.left -= (ow - $$.outerWidth(re$));
                    left -= ((left + ow) - window.innerWidth);
                }
                popup$.style.left = left + "px";
                popup$.style.top = top + "px";
            }
            else {
                popup$.style.left = ((window.innerWidth * 0.5) - ($$.outerWidth(popup$) * 0.5)) + "px";
                popup$.style.top = ((window.innerHeight * 0.5) - ($$.outerHeight(popup$) * 0.5)) + "px";

            }
            _uic.popups$.active_popup$ = popup$;
            return popup$;

        }
    })();

    $$.fillUploadify = (function () {
        _uic.CSS($$(
            '.file-uploadify {overflow:hidden;}',
            '.file-uploadify > input{position:absolute;left:0;right:0;top:0;bottom:0;opacity:0;cursor:pointer;}',
        ));
        return function (e$, options) {
            options = options || {};
            e$.input = $$.createElm2("input");
            e$.input.setAttribute("type", "file");
            e$.classList.add('file-uploadify');
            e$.appendChild(e$.input);

            e$.setAccept = function (accept) {
                this.input.setAttribute("accept", accept);
                return this;
            };
            e$.allowMultiple = function (allow) {
                if (allow)
                    this.input.setAttribute("multiple", "multiple");
                else
                    this.input.removeAttribute("multiple");
            };

            e$.onUpdate = function (files) {

            }
            e$.input.onchange = function () {
                e$.files = this.files;
                e$.onUpdate(e$.files);
                return this;
            };

            e$.readAsDataURL = function (file) {
                if (!file) return {};
                var reader = new FileReader();
                reader.readAsDataURL(file);
                return reader;
            };
            e$.onclick = function (e) {
                e.stopPropagation();
                //e.preventDefault();
            };

            return e$;
        }
    })();


    _uic.dragable = (function () {

        function _fixMousePos(e) {
            e.offset = $$.offset(e.target);
            //e.xx =  e.clientX - e.offset.left;
            //e.yy = e.clientY - e.offset.top;
            //e.offset = $(e.target).offset();
            e.xx = e.pageX || e.clientX;
            e.yy = e.pageY || e.clientY;


            return (e);
        };
        return function (host, options) {
            if (!options) options = {};
            host.draging = {};
            var target;
            host.touchstart = function (e) {
                if (e.target.dragable && e.target) {
                    target = e.target;
                    e = _fixMousePos(e);
                    host.draging.startX = e.xx - e.offset.left;
                    host.draging.startY = e.yy - e.offset.top;
                    // grab the clicked element's position
                    host.draging.offsetX = e.offset.left;
                    host.draging.offsetY = e.offset.top;
                    if (isNaN(host.draging.offsetX)) host.draging.offsetX = 0;
                    if (isNaN(host.draging.offsetY)) host.draging.offsetY = 0;
                    // we need to access the element in OnMouseMove
                    host.draging.element = target;
                    if (options.dragStart) options.dragStart(target, host.draging);
                    if (target.ondragstart) target.ondragstart(e, host.draging);

                    host.addEventListener('mousemove', host.touchmove);
                    host.draging.lastX = false;
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
            host.touchmove = function (e) {
                if (host.draging.element != null && host.draging.element.dragable) {
                    e = _fixMousePos(e);
                    var x = (host.draging.offsetX + e.xx - host.draging.startX);
                    var y = (host.draging.offsetY + e.yy - host.draging.startY);
                    var dx = 0, dy = 0;
                    if (host.draging.lastX) {
                        dx = x - host.draging.lastX;
                        dy = y - host.draging.lastY;
                    }
                    if (options.dragElement) options.dragElement(host.draging.element, x, y, dx, dy);
                    if (host.draging.element.ondragging) host.draging.element.ondragging(x, y, dx, dy, host.draging);


                    host.draging.lastX = x;
                    host.draging.lastY = y;
                    e.preventDefault();
                    e.stopPropagation();
                }

            };
            host.touchend = function (e) {
                host.removeEventListener('mousemove', host.touchmove);
                if (options.dragEnd) options.dragEnd(host.draging.element, host.draging);
                if (host.draging.element && host.draging.element.ondragend) host.draging.element.ondragend(e);
                host.draging.element = null;

            };



            host.onmousedown = host.touchstart;
            host.onmouseup = host.touchend;


            return (host);
        }
    })();


    _uic.init = function () {
        this.dragable(document.body);
        this.bindComponents(document.body);
    };
    return _uic;

})();


uic("uic-value-spinner", function (proto, $$) {
    uic.CSS($$(
        '.uic-value-spinner {position:relative;background-color:silver} uic-value-spinner >input{border:0;margin:1px;text-align:center; width:calc(100% - 16px)}',
        '.uic-value-spinner >a{position:absolute;right:2px;height:10px;top:50%;margin-top:-15px;}',
        '.uic-value-spinner >a >span{pointer-events:none;}',
        '.uic-value-spinner >input {width:calc(100% - 16px);text-align:center;}',
        '.uic-value-spinner >a:last-child{top:unset;margin-top:unset; bottom:50%;margin-bottom:-8px;}'
    ));
    proto.html$ = '<input type="text" class="btn-xs" /><a><span class="icon-chevron-up">+</span></a><a><span class="icon-chevron-down">-</span></a>';

    return function (div) {

        div.innerHTML = proto.html$;
        div.input = div.querySelector('input');
        div.style.backgroundColor = "silver";

        div.input.value = div.getAttribute("value") || 0;

        div.buttons = div.querySelectorAll('a');
        div.valueDecimal = parseInt(div.getAttribute("value-decimal")) || 2;
        var inc = parseFloat(div.getAttribute("value-inc")) || 0.25;
        div.buttons[0].inc = inc;
        div.buttons[1].inc = -inc;

        div.maxValue = Number.MAX_VALUE * 0.5;

        div.minValue = -div.maxValue;


        div.onUpdate = function (v) {

        };

        div.input.oninput = function () {
            div.onUpdate(div.validateValue(parseFloat(div.input.value)));
        }

        div.setValue = function (v) {
            this.value = this.validateValue(v);
            this.input.value = this.value.toFixed(this.valueDecimal);
            return (this);
        };


        div.prop = function (prop, item) {

            if (prop.increment) {
                div.buttons[0].inc = prop.increment;
                div.buttons[1].inc = -prop.increment;
                if (prop.increment === 1) div.valueDecimal = 0;
            }
            if (prop.min !== undefined) {
                div.minValue = prop.min;
            }
            if (prop.max !== undefined) {
                div.maxValue = prop.max;
            }


        };

        div.validateValue = function (v) {
            if (v < this.minValue) v = this.minValue;
            if (v > this.maxValue) v = this.maxValue;
            this.input.value = v.toFixed(this.valueDecimal);
            return v;
        }
        div.onmousedown = function (e) {
            if (isNaN(e.target.inc)) return;
            var self = this;
            self.value = parseFloat(self.input.value) + e.target.inc;
            self.startTime = Date.now();
            self.working = true;
            self.spinSpeed = 100;
            function work() {
                self.input.focus();
                if (Date.now() - self.startTime > 600) self.value += e.target.inc;
                self.input.value = self.value.toFixed(self.valueDecimal);
                div.onUpdate(div.validateValue(parseFloat(self.input.value)));
                if (Date.now() - self.startTime > 2000) {
                    self.spinSpeed = 50;
                }
                if (self.working) {
                    setTimeout(work, self.spinSpeed);
                }
            }
            work();
        };
        div.onmouseup = div.onclick = div.onmouseout = function () {
            this.working = false;
        };

        return div;






    }
});

uic("uic-value-slider", function (proto, $$) {
    uic.CSS($$(
        '.uic-value-slider {user-select: none;font-size: 100%;display: inline-block;min-height: 16px;position:relative;}',
        '.uic-value-slider > input[type=range] {width: calc(100% - 35px) !important; position: absolute;float: right;-webkit-appearance: none; background-color: gray; margin-top: -1px;height: 2px;right: 2px;top: 50%;}',
        '.uic-value-slider > input[type=range]::-webkit-slider-thumb {-webkit-appearance: none;height: 10px;width: 8px;border-radius: 2px;background-color: #a8a8a8;cursor: pointer;}',
        '.uic-value-slider > input[type=text] {width: 30px;float: left;text-align: center;}',
        '.uic-value-slider.vertical > input[type=range] {transform: translate(-18px,-15px) rotate(-90deg);transform-origin: left top;}',
    ));
    proto.html$ = '<input type="text" class="btn btn-xs" /><input type="range" min="0" max="100" />';
    return function (div) {
        div = div || $$.createElm('div');
        div.innerHTML = proto.html$;
        div.input = div.querySelector('input[type="text"]');
        div.range = div.querySelector('input[type="range"]');
        div.input.value = div.getAttribute("value") || 0;

        div.onUpdate = function () {

        };
        div.range.oninput = function () {
            div.input.value = this.value;
            div.onUpdate(parseInt(this.value));
        }
        div.input.oninput = function () {
            div.range.value = this.value;
            this.value = div.range.value;
            div.onUpdate(parseInt(this.value));
        }
        div.setValue = function (v) {
            this.range.value = v;
            this.input.value = this.range.value;
            return (this);
        };
        div.prop = function (prop) {
            if (prop.min) {
                this.range.min = prop.min;
            }
            if (prop.max) {
                this.range.max = prop.max;
            }
            if (prop.value) {
                this.setValue(prop.value);
            }
        };
        div.range.oninput();
        return div;

    }
});

uic("uic-dropdown", function (proto, $$) {
    uic.CSS($$('.uic-dropdown > select{width:100%;padding:0;}'));
    proto.fillData = (function () {
        var i, type, item;
        return function (select, data) {
            select.innerHTML = "";

            if (!data) return;
            type = Object.prototype.toString.call(data).toLocaleLowerCase();
            if (type === "[object array]") {
                for (i = 0; i < data.length; i++) {
                    item = data[i];
                    type = Object.prototype.toString.call(item).toLocaleLowerCase();
                    if (type == "[object array]") {
                        select.appendChild($$.createElm('option', {
                            value: item[0], innerHTML: item[1]
                        }));
                    } else {
                        select.appendChild($$.createElm('option', {
                            value: item, innerHTML: item
                        }));
                    }
                }
            }
            else {
                for (i in data) {
                    item = data[i];
                    select.appendChild($$.createElm('option', {
                        value: i, innerHTML: item
                    }));
                }
            }
        }
    })();

    proto.html$ = '<select></select>';

    return function (div) {
        div.innerHTML = proto.html$;
        div.select = div.querySelector("select");

        div.select.classList.add("form-control");

        proto.fillData(div.select, $$.parseData(div.getAttribute('data')));


        div.setData = function (data) {
            proto.fillData(this.select, data);
            return this;
        };

        div.setValue = function (value) {
            this.select.value = value;
            return this;
        };

        div.onUpdate = function (value) {
            return this;
        };

        div.prop = function (prop) {
            if (prop.data) {
                this.setData(prop.data);
            }
        };

        div.select.onchange = div.select.oninput = function () {
            div.onUpdate(this.value);
        };

        return div;
    }
});




uic("uic-checkbox", function (proto, $$) {
    uic.CSS($$(
        '.uic-checkbox > label{padding-left: 16px;margin:0;position:relative;user-select:none;}',
        '.uic-checkbox> label >input{position:absolute;top:3px;left:0px;margin: 0;}',
    ));
    proto.html$ = '<label><span></span><input type="checkbox" /></label>';

    return function (div) {
        div.innerHTML = proto.html$;
        div.label = div.querySelector("label");
        div.input = div.querySelector("input");
        div.setText = function (text) {
            this.label.firstChild.innerHTML = text;
            return this;
        };

        div.setValue = function (v) {
            this.input.checked = v;
            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }
        div.input.oninput = function () {
            div.onUpdate(this.checked);
        };
        return div;
    }
});



uic("uic-textbox", function (proto, $$) {
    uic.CSS($$(
        '.uic-textbox > input{width:100%}',
    ));

    proto.html$ = '<input type="text" />';

    return function (div) {
        div.innerHTML = proto.html$;
        div.input = div.querySelector("input");
        div.setValue = function (v) {
            this.input.value = v;
            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }
        div.input.oninput = function () {
            div.onUpdate(this.value);
        };
        return div;
    }
});


uic("uic-button", function (proto, $$) {
    uic.CSS($$(
        '.uic-button > input{width:auto !important;}',
    ));

    return function (div) {
        $$.cssClass(div, 'btn');
        div.setValue = function (v) {
            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }

        div.onAction = function (v) {
            return this;
        }
        div.onclick = function () {
            this.onAction();
        };

        div.prop = function (prop, item) {
            //  this.onclick = prop.onclick;
            item.label.innerHTML = "&nbsp;";
            this.classList.remove("prop_input");
            this.innerHTML = prop.title;

        };

        return div;
    }
});


uic("uic-color-picker", function (proto, $$) {
    uic.CSS($$(
        '.uic-color-picker {position:relative;width:290px;height:130px;border: outset 1px #e6e6e6;background-color:#e6e6e6}.uic-color-picker canvas{position:absolute;left:0px;top:0px;}',
        '.uic-color-picker > span{position:absolute;pointer-events:none;}',
        '.uic-color-picker-button {width:22px !important; height:22px; }',
        '.uic-color-picker .uic-value-slider{position:absolute;min-width:128px;left:135px;top:100px;}',
        '.uic-color-picker .uic-value-slider input[type=text]{color:white;border: solid 1px silver;}',
    ));


    var canv = createCanvasObject(128, 128);

    function createPallette() {
        var gradient = canv.ctx.createLinearGradient(0, 0, canv.width, 0);
        // Create color gradient
        gradient.addColorStop(0, "rgb(255,   0,   0)");
        gradient.addColorStop(0.15, "rgb(255,   0, 255)");
        gradient.addColorStop(0.33, "rgb(0,     0, 255)");
        gradient.addColorStop(0.49, "rgb(0,   255, 255)");
        gradient.addColorStop(0.67, "rgb(0,   255,   0)");
        gradient.addColorStop(0.84, "rgb(255, 255,   0)");
        gradient.addColorStop(1, "rgb(255,   0,   0)");
        // Apply gradient to canvas
        canv.ctx.fillStyle = gradient;
        canv.ctx.fillRect(0, 0, canv.width, canv.height);
    }
    createPallette();

    var picker = $$.createElm('div');
    picker.classList.add('uic-color-picker');
    picker.width = '290px';
    picker.height = '130px';

    picker._r = uic.create('uic-value-slider');
    picker._r.classList.add('vertical');
    picker._r.input.style.backgroundColor = "red";
    picker._r.range.max = 255;
    picker._r.style.left = '185px';

    picker._g = uic.create('uic-value-slider');
    picker._g.classList.add('vertical');
    picker._g.input.style.backgroundColor = "green";
    picker._g.range.max = 255;
    picker._g.style.left = '220px';


    picker._b = uic.create('uic-value-slider');
    picker._b.classList.add('vertical');
    picker._b.range.max = 255;
    picker._b.input.style.backgroundColor = "blue";
    picker._b.style.left = '255px';


    picker._a = uic.create('uic-value-slider');
    picker._a.classList.add('vertical');
    picker._a.range.max = 255;
    picker._a.setValue(255);
    picker._a.input.style.color = "black";
    picker._p = $$.createElm('span');
    picker._p.classList.add('icon-plus');

    picker.appendChild(canv);
    picker.appendChild(picker._a);
    picker.appendChild(picker._r);
    picker.appendChild(picker._g);
    picker.appendChild(picker._b);
    picker.appendChild(picker._p);

    picker.onUpdate = function () { }

    picker._r.onUpdate = picker._g.onUpdate = picker._b.onUpdate = picker._a.onUpdate = function () {
        picker.onUpdate(
            parseInt(picker._r.range.value),
            parseInt(picker._g.range.value),
            parseInt(picker._b.range.value),
            parseInt(picker._a.range.value)
        );
    };
    var imageData;
    canv.onmousemove = canv.onmousedown = canv.onmouseup = canv.onclick = function (e) {
        if (e.buttons === 1) {
            e = $$.fixMousePos(e);
            picker._p.style.left = (e.xx - 5) + "px";
            picker._p.style.top = (e.yy - 5) + "px";
            imageData = canv.ctx.getImageData(e.xx, e.yy, 1, 1);
            picker._r.setValue(imageData.data[0]);
            picker._g.setValue(imageData.data[1]);
            picker._b.setValue(imageData.data[2]);
            picker.onUpdate(
                parseInt(picker._r.range.value),
                parseInt(picker._g.range.value),
                parseInt(picker._b.range.value),
                parseInt(picker._a.range.value)
            );
        };




        e.stopPropagation();
        e.preventDefault();
    }

    proto.getColorNumberFromRgb = function (r, g, b) {
        return (r << 16) | (g << 8) | (b);
    };

    function setColor(c) {
        picker._r.setValue(c[0]);
        picker._g.setValue(c[1]);
        picker._b.setValue(c[2]);
        picker._a.setValue(c[3]);
    }

    proto.show = function (e$, value, upward) {
        setColor(value);
        uic.popups$.show(picker, e$, upward);
        return picker;
    }

    return function (div, proto) {
        $$.cssClass(div, 'btn popup-up-dir uic-color-picker-button');

        div.onUpdate = function (value) {

            return this;
        };

        div.setValue = function (value) {
            this.currentValue = value;


            setColor(this.currentValue);
            div.style.backgroundColor = 'rgba(' + picker._r.range.value +
                ',' + picker._g.range.value + ',' + picker._b.range.value + ',' + (picker._a.range.value / 255) + ')';

            div.style.color = div.style.backgroundColor;

            return this;
        };


        div.currentValue = [255, 255, 255, 255];
        div.onclick = function (e) {
            picker.onUpdate = function () {
                div.style.backgroundColor = 'rgba(' + picker._r.range.value +
                    ',' + picker._g.range.value + ',' + picker._b.range.value + ',' + (picker._a.range.value / 255) + ')';

                div.currentValue[0] = parseInt(picker._r.range.value);
                div.currentValue[1] = parseInt(picker._g.range.value);
                div.currentValue[2] = parseInt(picker._b.range.value);
                div.currentValue[3] = parseInt(picker._a.range.value);


                div.onUpdate(div.currentValue);

            };
            setColor(div.currentValue);

            uic.popups$.show(picker, div);
        };
        return div;
    }
});


uic("uic-props", function (proto, $$) {
    uic.CSS($$(
        'body{overflow:hidden} :focus {outline: 0;}',
        '.prop_container{width:100%;margin:0;padding:0;height:auto;}',
        '.prop_container >li {margin-bottom: 0px !important;display: inline-block;width: 100%;float:left;}',
        '.prop_container >li >*{float: left;}',
        '.prop_container > li > div.prop_title{width: 30%; display: block; margin: 0;position:relative}',
        '.prop_container > li > div.prop_input {width: 70%; display: block; margin: 0;}',
        '.uic-props .prop_container > li.full-width > * {width: 100%; display: block; margin: 0;}',
        '.prop_container_title {cursor:pointer; width: 100%;padding: 3px;border: outset 1px #d6d6d6;font-size: 90%;font-weight: 800;margin:0;user-select:none;}',
        '.prop_container.with-border {border:solid 1px #d6d6d6;padding-top:6px;position:relative;}',
        '.uic-props .prop_container_prop {float:left}',
        '.uic-props .floating-fields .prop_container_prop {width:auto;margin-right:3px;}',
        '.uic-props .floating-html li {width:auto;margin-right:3px;float:left;}',
        '.uic-props .full-width >.prop_container >li >* {width: 100%; display: block; margin: 0;}',
        '.uic-props .no-titles >.prop_container> li > div.prop_title,.prop_container> li.no-title > div.prop_title {display:none;}',
        '.uic-props .no-titles >.prop_container> li > div.prop_input,.prop_container> li.no-title > div.prop_input {width:100%}',
        '.prop_container.collapsed  {height:0px !important;overflow: hidden;border:none !important;padding:0;position:relative; }',

        '.uic-props .prop_container_prop.prop_not_active {display:none;}',
    ));
    proto.html$ = '<ul enum="prop_container" ></ul>';

    return function (div) {
        div = div || $$.createElm('div');


        div.innerHTML = proto.html$;
        $$.enumElements(div);
        div.events = new EventSystem();



        div.buildUI = (function () {
            var inputTUIC = {
                "text": "uic-textbox",
                "button": "uic-button",
                "buttons-popup": "uic-buttons-popup",
                "percent": "uic-value-slider",
                "numeric": "uic-value-spinner",
                "file": "uic-file-upload",
                "image": "uic-image-upload",
                "dropdown": "uic-dropdown",
                "checkbox": "uic-checkbox",
                "color": "uic-color-picker",
                "popup-menu": "uic-popup-menu",
                "popup-props": "uic-popup-uic-props",
                "multi-slider": "uic-multi-slider"
            };

            function buildUI(props, pc, cb) {
                var item, type;
                props.forEach(function (prop) {
                    type = Object.prototype.toString.call(prop).toLocaleLowerCase();
                    item = $$.createElm2("li");
                    if (type === "[object array]") {
                        item.innerHTML = '<ul class="prop_container"></ul>';
                        pc.appendChild(item);
                        buildUI(prop, item.firstChild, cb);
                    }
                    else {
                        if (type === "[object string]") {
                            item.innerHTML = prop;
                        }
                        else if (prop.input && inputTUIC[prop.input]) {
                            prop.id = prop.id || (prop.name || "unnamed" + guid());
                            if (prop.title !== undefined) {
                                item.innerHTML = '<div class="prop_title" enum="' + prop.id + '_label">&nbsp;</div><div class="prop_input" enum="' + prop.id + '_input" uic="' + inputTUIC[prop.input] + '"></div>';
                            }
                            else {
                                item.innerHTML = '<div class="prop_input" enum="' + prop.id + '_input" uic="' + inputTUIC[prop.input] + '"></div>';
                            }
                            item.setAttribute("prop", prop.id);
                            item.classList.add("prop_container_" + prop.input);
                            item.classList.add("prop_container_prop");
                            item.prop = prop;

                        }
                        else if (prop.custom) {
                            prop.id = prop.id || (prop.name || "unnamed" + guid());
                            item.setAttribute("prop", prop.id);
                            item.classList.add("prop_container_custom");
                            item.classList.add("prop_container_prop");
                            item.prop = prop;
                        }
                        else if (prop.props) {
                            if (prop.title) {
                                item.innerHTML = '<h5 class="prop_container_title">' + prop.title + '</h5><ul class="prop_container"></ul>';
                                item.querySelector(".prop_container_title").onclick = function () {
                                    this.nextSibling.classList.toggle("collapsed");
                                }

                            }
                            else {
                                item.innerHTML = '<ul class="prop_container"></ul>';
                            }
                            pc.appendChild(item);
                            buildUI(prop.props,
                                $$.cssClass(item.querySelector(".prop_container"), prop.title ? 'with-border' : ''), cb);


                        }

                        pc.appendChild(item);

                        if (prop.style) {
                            Object.assign(item.style, prop.style);
                        }
                        if (prop.cssClass) {
                            $$.cssClass(item, prop.cssClass);
                        }



                    }


                });
            }

            return function (props, cb) {
                var pc = div.prop_container;


                div.all_props = {};
                buildUI(props, pc, cb);
                uic.bindComponents(pc);
                $$.enumElements(pc);
                var p, prop;
                pc.querySelectorAll(".prop_container_prop").forEach(function (item) {

                    p = item.getAttribute("prop");
                    prop = item.prop;
                    if (prop) {
                        item.input = pc[p + '_input'];
                        item.label = pc[p + '_label'];
                        if (item.input && item.input.prop) item.input.prop(prop, item);
                        if (prop.input === "checkbox") {
                            if (prop.title) item.input.setText(prop.title);
                        }
                        else {
                            if (prop.title) item.label.innerHTML = prop.title;
                        }
                        if (prop.icssClass) {
                            $$.cssClass(item.input, prop.icssClass);
                        }
                        if (cb) cb(item, prop);
                        if (prop.onitemcreated) prop.onitemcreated(item, pc);

                        div.all_props[prop.id] = item;
                    }
                });

                return this;
            }
        })();


        div.deactivateProps = function (props) {
            var div = this;
            props.forEach(function (p) {
                div.all_props[p].classList.add("prop_not_active");
            });
            return this;
        };

        div.activateProps = function (props) {
            var div = this;
            props.forEach(function (p) {
                div.all_props[p].classList.remove("prop_not_active");
            });
            return this;
        }

        div.runUI = (function () {
            var prop;
            return function (object, so$) {
                div.events("OnRun", [object, so$, div]);
                this.onUpdated = function () {

                };
                div.prop_container.querySelectorAll(".prop_container_prop").forEach(function (item) {
                    if (item.classList.contains('prop_not_active')) return;

                    prop = item.prop;
                    if (object[prop.name] !== undefined) {
                        item.input.setValue(prop.get ? prop.get(object, item, so$) : object[prop.name])
                            .onUpdate = function (value) {
                                var item = this.parentNode;
                                if (item.prop.set) {
                                    if (item.prop.set(value, object, item, so$)) {
                                        object[item.prop.name] = value;
                                    }
                                }
                                else object[item.prop.name] = value;

                                div.onUpdated(object, item, so$);
                                div.events("PropUpdated", [object, item, so$]);

                            };
                    }
                    else if (prop.get) {
                        item.input.setValue(prop.get(object, item, so$)).onUpdate = function (value) {
                            var item = this.parentNode;
                            if (item.prop.set) {
                                if (item.prop.set(value, object, item, so$)) {
                                    object[item.prop.name] = value;
                                }
                                div.onUpdated(object, item, so$);
                                div.events("PropUpdated", [object, item, so$]);
                            }
                        };
                    }
                    else if (item.prop.set) {
                        item.input.onUpdate = function (v) {
                            var item = this.parentNode;
                            if (item.prop.set) {
                                if (item.prop.set(v, object, item, so$)) {
                                    object[item.prop.name] = value;
                                }
                                div.onUpdated(object, item, so$);
                                div.events("PropUpdated", [object, item, so$]);
                            }
                        };
                    }
                    else if (prop.action) {
                        item.input.onclick = function () {
                            this.parentNode.prop.action(object, so$, item);
                        };
                    }
                    else if (prop.onAction) {
                        item.input.onAction = function () {
                            this.parentNode.prop.onAction(object, so$, item);
                        };
                    }
                    else if (prop.custom) {
                        prop.custom(object, so$, item);
                    }

                });
                return this;
            }
        })();
        return div;
    }
});

uic("uic-popup-dialog", function (proto, $$) {
    uic.CSS($$(
        '.uic-popup-dialog {overflow:hidden;}',
        '.uic-popup-dialog > .panel-heading{padding: 2px 5px;min-height:26px;}',
        '.uic-popup-dialog  .panel-body{overflow-y:auto;height:100%;padding:0;}',
        '.uic-popup-dialog >.panel-heading > .dialog_actions{position:absolute;right:6px;top:4px;}',
        '.uic-popup-dialog >.panel-heading > .dialog_toolbar{position:absolute;left:2px;top:2px; cursor:pointer;}',
        '.uic-popup-dialog  .glyphicon-remove{color:red;cursor:pointer;}',
        '.uic-popup-dialog  .glyphicon-ok{color:green;margin-right:10px;cursor:pointer;}',
    ));


    var html = $$(
        '<div class="panel-heading"><div enum="dialog_toolbar"></div><div enum="dialog_actions"><span class="glyphicon glyphicon-ok"></span><span class="glyphicon glyphicon-remove"></span></div></div>',
        '<div class="panel-body" enum="popup_body">',
        '</div>');

    return function (div) {
        $$.cssClass(div, 'panel panel-default');
        div.innerHTML = html;
        $$.enumElements(div);


        var popup$;

        div.querySelector(".glyphicon-remove").onclick = function () {
            popup$.dismiss();
        };

        div.confirm = function () {
            return true;
        }
        div.querySelector(".glyphicon-ok").onclick = function () {
            if (div.confirm()) {
                popup$.dismiss();
            }
        };

        div.show = function () {
            popup$ = uic.popups$.show(this);
            popup$.isModal = true;
            return popup$;
        };
        return div;
    }
});


uic("uic-multi-slider", function (proto, $$) {
    uic.CSS($$(
        '.uic-multi-slider{width:100%;height:2px;background-color:#2e2e2e;display:block;position:relative;margin-top:10px !important;}',
        '.uic-multi-slider > div {position:absolute;top:50%;height:8px;width:8px;margin-left:-4px; margin-top:-4px;background-color:gray}',
    ));


    return function (div) {

        div.min = 0;
        div.max = 100;
        div.knobs = [];

        var i = 0, w;
        div.setValue = function (values) {

            this.values = values;

            setTimeout(function (div) {
                w = $$.outerWidth(div);
                for (i = 0; i < div.values.length; i++) {
                    if (i < div.knobs.length) {
                        div.knobs[i].style.left = (w * (div.values[i] / (div.max - div.min))) + "px";
                    }
                }

            }, 10, this);



            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }

        div.add_knob = function (v) {
            var kn$ = $$.createElm2('div');
            kn$.dragable = true;

            kn$.ki = this.knobs.length;
            this.knobs[this.knobs.length] = kn$;

            w = $$.outerWidth(this);
            kn$.ondragging = function (x, y, dx, dy) {
                w = $$.outerWidth(this.parentNode);
                x = parseInt(this.style.left);
                x += dx;

                if (x < 4) x = 4;
                if (x + 4 > w) x = w - 4;

                if (this.previousSibling) {
                    if (x - 8 < parseInt(this.previousSibling.style.left)) {
                        x = parseInt(this.previousSibling.style.left) + 8;
                    }
                }

                if (this.nextSibling) {
                    if (x + 8 > parseInt(this.nextSibling.style.left)) {
                        x = parseInt(this.nextSibling.style.left) - 8;
                    }
                }
                this.style.left = x + "px";
                this.parentNode.values[this.ki] = this.parentNode.min +
                    (Math.floor(((x - 4) / (w - 8)) * (this.parentNode.max - this.parentNode.min)));

                this.parentNode.onUpdate(this.parentNode.values);

            };
            kn$.style.left = (w * (v / (this.max - this.min))) + "px";
            this.appendChild(kn$);
            return this;
        };

        div.prop = function (prop, item) {
            this.min = prop.min || 0;
            this.max = prop.max || 100;

            if (prop.knobs) {
                prop.knobs.forEach(function (k) {
                    div.add_knob(k);
                });
            }
            return this;

        };
        return div;
    }
});


uic("uic-popup-menu", function (proto, $$) {
    uic.CSS($$(
        '.popup-menu {display: block;width: 120px;padding: 5px;height:auto;list-style: none;list-style-type: none;padding: 0;margin: 0;position: absolute;border: outset 1px rgba(210,210,210,0.3);}',
        '.popup-menu >li {position:relative;background-color:#e2e2e2;cursor:pointer;}',
        '.popup-menu >li >a {padding: 2px;color: black;font-size: 90%;line-height: 18px;display:block;pointer-events:none;}',
        '.popup-menu >li:hover >a {color: black;background-color:rgba(10,10,10,0.3);}',
        '.popup-menu >li .popup-menu {position:absolute;display:none;left: 100%;top:0;}',
        '.popup-menu >li:hover > .popup-menu {display:unset;}',
        '.popup-menu >li.has-sub-menu > a:after {font-family: "appfont" !important;content: "\\e930";position: absolute;right: 3px;}',
    ));

    return function (div) {
        //div.innerHTML = '<ul class="menu"></ul>';
        $$.cssClass(div, 'btn');
        div.buildMenu = (function () {

            function build(menu, pc, menuClass) {
                var item$, type, a$;
                $$.cssClass(pc, "popup-menu " + menuClass);
                menu.forEach(function (item) {
                    type = Object.prototype.toString.call(item).toLocaleLowerCase();
                    item$ = $$.createElm2("li");
                    if (type === "[object array]") {
                        if (Object.prototype.toString.call(item[0]).toLocaleLowerCase() === "[object string]") {
                            item$.innerHTML = '<a>' + item[0] + '</a>';
                        }
                        else {
                            a$ = $$.createElm2("a", { innerHTML: item[0].title });
                            item$.setAttribute('value', item[0].value);
                            item$.appendChild(a$);
                            if (item[0].cssClass) {
                                $$.cssClass(item$, item[0].cssClass);
                            }
                        }

                        item$.classList.add("has-sub-menu");
                        item$.appendChild(build(item[1], $$.createElm2("ul")));
                    }
                    else {
                        if (type === "[object string]") {
                            item$.innerHTML = item;
                        }
                        else {
                            a$ = $$.createElm2("a", { innerHTML: item.title });
                            item$.setAttribute('value', item.value);
                            if (item.cssClass) {
                                $$.cssClass(item$, item.cssClass);
                            }
                            item$.appendChild(a$);
                        }
                    }

                    pc.appendChild(item$);
                });

                return pc;
            }

            return function (menu, menuClass) {
                this.menu$ = build(menu, $$.createElm2("ul"), menuClass || "");
                this.menu$.style.position = "absolute";
                this.menu$.style.left = (-50000) + "px";
                setTimeout(function (menu$) { document.body.appendChild(menu$); }, 100, this.menu$);

            }

        })();
        div.setValue = function (v) {
            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }

        div.prop = function (prop, item) {
            if (prop.data) {
                this.buildMenu(prop.data, prop.menuClass);
            }
            this.dropDown = prop.dropDown;
            if (prop.onclick) this.onclick = prop.onclick;
            div.onPopup = prop.onPopup;
            item.label.innerHTML = "&nbsp;";
            this.classList.remove("prop_input");
            this.innerHTML = prop.title;
        };

        div.onclick = function () {
            this.menu$.style.position = "relative";
            this.menu$.style.left = "unset";
            if (div.onPopup) div.onPopup(div.menu$);
            var popup$ = uic.popups$.show(div.menu$, this, !this.dropDown);
            div.menu$.onclick = function (e) {
                uic.popups$.free(popup$);
                div.onUpdate(e.target.getAttribute("value"));

            };
        };

        return div;
    }
});


uic("uic-popup-uic-props", function (proto, $$) {
    uic.CSS($$(
        '.uic-popup-props {background-color: #cfcfcf;padding: 3px;border: outset 1px #cfcfcf;width: 250px;display:inline-block;}',
        '.uic-popup-props .prop_container_prop {margin-bottom: 8px !important;}'
    ));

    return function (div) {

        $$.cssClass(div, 'btn');

        div.setValue = function (v) {
            return this;
        }
        div.onUpdate = function (v) {
            return this;
        }

        div.prop = function (prop, item) {
            if (prop.props) {
                div.ui$ = uic.create('uic-props').buildUI(prop.props);
                div.ui$.classList.add("uic-popup-props");
            }
            this.dropDown = prop.dropDown;
            if (prop.onclick) this.onclick = prop.onclick;
            div.onPopup = prop.onPopup;
            item.label.innerHTML = "&nbsp;";
            this.classList.remove("prop_input");
            this.innerHTML = prop.title;
        };
        div.onAction = function (v) {
            return this;
        }
        div.onclick = function () {
            if (div.onPopup) div.onPopup(div.ui$);
            div.onAction();
            uic.popups$.show(div.ui$, this, !this.dropDown);


        };

        return div;
    }
});

