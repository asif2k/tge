<?=chunk('precision')?>

attribute vec3 tge_a_position;
attribute vec4 tge_a_color;
attribute vec2 tge_a_uv;

uniform mat4 tge_u_viewProjectionMatrix;
uniform mat4 tge_u_modelMatrix;
uniform mat3 tge_u_textureMatrix;
varying vec4 tge_v_shadow_vertex;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;

void vertex(){
	tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
    gl_Position = tge_u_viewProjectionMatrix* tge_v_shadow_vertex;
	tge_v_color= tge_a_color;	
	tge_v_uv = (tge_u_textureMatrix * vec3(tge_a_uv, 1.0)).xy;
	gl_PointSize=10.0;
}


<?=chunk('precision')?>

uniform mat4 tge_u_objectMaterial;
uniform sampler2D tge_u_ambientTexture;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;
varying vec4 tge_v_shadow_vertex;
void fragment(void) {	
	gl_FragColor = texture2D(tge_u_ambientTexture, tge_v_uv) * tge_v_color * tge_u_objectMaterial[0];
	gl_FragColor.w*=tge_u_objectMaterial[0].w;
}