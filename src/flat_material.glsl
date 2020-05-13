<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('mesh-attributes-flat')?>

uniform mat4 tge_u_viewProjectionMatrix;
uniform mat4 tge_u_modelMatrix;

varying vec4 tge_v_shadow_vertex;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;

void vertex(){
	initPipelineParams();
	tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
    gl_Position = tge_u_viewProjectionMatrix* tge_v_shadow_vertex;
	tge_v_color= tge_a_color;
	tge_v_uv= tge_a_uv;
	
}


<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
uniform mat4 tge_u_objectMaterial;
uniform sampler2D tge_u_ambientTexture;
varying vec4 tge_v_color;
varying vec2 tge_v_uv;
varying vec4 tge_v_shadow_vertex;
void fragment(void) {
	initPipelineParams();
	gl_FragColor = texture2D(tge_u_ambientTexture, tge_v_uv) * tge_v_color * tge_u_objectMaterial[0];
}