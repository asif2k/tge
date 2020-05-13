varying mat3 tge_v_tbnMatrix;

void vertex(){
	super_vertex();
    vec3 t = normalize((tge_u_modelMatrix * tge_a_tangent).xyz);
    t = normalize(t - dot(t, tge_v_normal) * tge_v_normal);    
    tge_v_tbnMatrix = mat3(t, cross(tge_v_normal, t), tge_v_normal);
}

varying mat3 tge_v_tbnMatrix;
uniform sampler2D tge_u_normalMap;
uniform sampler2D tge_u_dispMap;


uniform vec4 tge_u_dispParams;
void fragment(){
   initPipelineParams();

vec3 fws_directionToEye = normalize(tge_u_eyePosition.xyz - tge_v_shadow_vertex.xyz);

float baseBias = tge_u_dispParams.x/2.0;
float bias =-baseBias + baseBias * tge_u_dispParams.y;

  vec2 uv=tge_v_uv+(fws_directionToEye*tge_v_tbnMatrix).xy* (texture2D(tge_u_dispMap, tge_v_uv).r * tge_u_dispParams.x + bias);;

vec3 normal = normalize(tge_v_tbnMatrix * (2.0 * texture2D(tge_u_normalMap, uv).xyz - 1.0));

	vec4 amb=texture2D(tge_u_ambientTexture, uv);
	<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
			fws_totalLight += fws_lighting(
				tge_u_objectMaterial,
				tge_u_lightMaterial<?=i?>,
				tge_v_shadow_vertex.xyz, normal, fws_directionToEye,
				tge_u_lightMatrix<?=i?>[3].xyz - tge_v_shadow_vertex.xyz,
				tge_u_lightMatrix<?=i?>[2].xyz);
	<?}?>
	gl_FragColor = vec4(fws_totalLight, tge_u_objectMaterial[0].w) * amb;
	gl_FragColor.w *= tge_u_objectMaterial[0].w;


}












