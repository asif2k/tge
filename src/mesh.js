import * from './geometry.js'
import * from './material.js'

tge.mesh = $extend(function (proto) {


    var defaultModel = null;
    function mesh(geo,material) {
        this.uuid = $guidi();
        this.geo = geo;
        this.drawOffset = 0;        
        this.material = material || new tge.material();  
        if (defaultModel === null && tge.model) {
            defaultModel = new tge.model();
        }

        this.model = defaultModel;
    }


    return mesh;

});
