/*chunk-emission-filter*/
uniform vec4 tge_u_brightThreshold;
void fragment(){	
	 vec4 color = texture2D(tge_u_texture_input, tge_v_uv);        		
	 float luminance = dot(color.rgb, tge_u_brightThreshold.xyz );
	 luminance+=(color.a+tge_u_brightThreshold.w);	
	 gl_FragColor = luminance* color;
}

/*chunk-blur*/

uniform vec2 tge_u_offset;
uniform vec3 tge_u_blurKernel;
void fragment(){	
	vec3 A = tge_u_blurKernel.x* texture2D(tge_u_texture_input, tge_v_uv - tge_u_offset).xyz;
	vec3 B = tge_u_blurKernel.y* texture2D(tge_u_texture_input, tge_v_uv).xyz;
	vec3 C = tge_u_blurKernel.z* texture2D(tge_u_texture_input, tge_v_uv + tge_u_offset).xyz;
	vec3 color = A + B + C;
	gl_FragColor = vec4(color, 1);	
	
}



/*chunk-merge*/
uniform sampler2D tge_u_glow_emission;
uniform vec3 tge_u_glow_params;
void fragment(){
	vec4 cBase = texture2D(tge_u_texture_input, tge_v_uv);
	vec4 cOver = texture2D(tge_u_glow_emission, tge_v_uv);			
	vec4 blend = cBase + cOver * tge_u_glow_params.z;
    blend = vec4(1.0) - exp(-blend * tge_u_glow_params.x);
    blend = pow(blend, vec4(1.0 / tge_u_glow_params.y));
	gl_FragColor =blend;
}