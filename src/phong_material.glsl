<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('mesh-attributes-all')?>
<?=chunk('camera-matrix-all')?>
<?=chunk('model-matrix-all')?>


varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;


void vertex(){
	initPipelineParams();
	tge_v_shadow_vertex = tge_u_modelMatrix * vec4(tge_a_position,1.0);
	gl_Position = tge_u_modelMatrix * vec4(tge_a_position, 1.0);
	tge_v_normal = normalize(tge_u_modelMatrix * vec4(tge_a_normal,0.0)).xyz;
	tge_v_uv = (tge_u_textureMatrix * vec3(tge_a_uv, 1.0)).xy;
	gl_Position = tge_u_viewProjectionMatrix * tge_v_shadow_vertex;
}

<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
<?=chunk('lights-material-all')?>
<?=chunk('lights-matrix-all')?>

uniform mat4 tge_u_objectMaterial;
uniform vec4 tge_u_eyePosition;
uniform sampler2D tge_u_ambientTexture;

varying vec4 tge_v_shadow_vertex;
varying vec2 tge_v_uv;
varying vec3 tge_v_normal;

<?=chunk('fws_lighting')?>


void fragment(void) {
	initPipelineParams();
	vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);
	<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
			fws_totalLight += fws_lighting(
				tge_u_objectMaterial,
				tge_u_lightMaterial<?=i?>,
				tge_v_shadow_vertex.xyz, normalize(tge_v_normal), fws_directionToEye,
				tge_u_lightMatrix<?=i?>[3].xyz - tge_v_shadow_vertex.xyz,
				tge_u_lightMatrix<?=i?>[2].xyz);
	<?}?>
	gl_FragColor = vec4(fws_totalLight, tge_u_objectMaterial[0].w) * texture2D(tge_u_ambientTexture, tge_v_uv);
	gl_FragColor.w *= tge_u_objectMaterial[0].w;
}

