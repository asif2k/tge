﻿/*chunk-map*/
<?=chunk('precision')?>

uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;
uniform mat4 tge_u_objectMaterial;
uniform vec4 tge_u_shadowColor;

void fragment(void) {	
	vec4 c=texture2D(tge_u_ambientTexture, tge_v_uv);
	if(c.w<0.02) discard;	
	gl_FragColor=mix(vec4(1.0),1.0-tge_u_shadowColor,1.0-tge_u_shadowColor.a);
	gl_FragColor=mix(gl_FragColor,1.0-c,1.0-c.a);

	gl_FragColor.a=c.a*tge_u_shadowColor.a;
}

/*chunk-receiver*/
uniform mat4 tge_u_light_camera_matrix;
varying vec4 tge_v_shadow_light_vertex;

void vertex(){
	super_vertex();
	
	tge_v_shadow_light_vertex = tge_u_light_camera_matrix * tge_v_shadow_vertex;	
	//tge_v_shadow_light_vertex.xyz/=tge_v_shadow_light_vertex.w;
	//tge_v_shadow_light_vertex.xyz = tge_v_shadow_light_vertex.xyz * 0.5 + 0.5;	

}


<?=chunk('precision')?>
<?=chunk('shadow-sampling')?>


varying vec3 tge_v_normal;
varying vec4 tge_v_shadow_light_vertex;

varying vec4 tge_v_shadow_vertex;

uniform sampler2D tge_u_shadow_map;
uniform sampler2D tge_u_shadow_map_color;
uniform vec3 tge_u_shadow_params;
uniform vec3 tge_u_light_pos;
uniform sampler2D tge_u_ambientTexture;
varying vec2 tge_v_uv;

vec4 shadowColor;

float getShadowSample() {		

	float f=texture2D(tge_u_ambientTexture, tge_v_uv).a;		

	vec3 shadowMapCoords =tge_v_shadow_light_vertex.xyz/tge_v_shadow_light_vertex.w;
	f*=step(-(dot(tge_v_normal,normalize(tge_u_light_pos - shadowMapCoords.xyz))),0.0);

	shadowMapCoords.xyz = shadowMapCoords.xyz * 0.5 + 0.5;

	shadowColor=texture2D(tge_u_shadow_map_color, shadowMapCoords.xy);
	f*=step(shadowMapCoords.x,1.0)*step(shadowMapCoords.y,1.0)*step(shadowMapCoords.z,1.0);
	f*=step(0.0,shadowMapCoords.x)*step(0.0,shadowMapCoords.y)*step(0.0,shadowMapCoords.y);
	
	return (0.5*f)-SampleShadowMapPCF(tge_u_shadow_map, shadowMapCoords.xy,shadowMapCoords.z-tge_u_shadow_params.z ,vec2(tge_u_shadow_params.y))*f;

		
}


void fragment(void) {	
gl_FragColor = (getShadowSample()*tge_u_shadow_params.x)*shadowColor;


}