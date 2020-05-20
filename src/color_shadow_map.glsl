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