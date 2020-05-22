/*chunk-emission-filter*/

void fragment(){	
	 vec4 color = texture2D(tge_u_texture_input, tge_v_uv);        		
	 float luminance = dot(color.rgb, vec3(0.2627, 0.6780, 0.0593)*0.75 );
	 //gl_FragColor = (luminance > 0.5) ? color : vec4(0);
	 gl_FragColor = luminance* color;
}

/*chunk-blur*/

uniform vec2 tge_u_offset;
uniform vec3 tge_u_blur;
void fragment(){	
	vec3 A = tge_u_blur.x* texture2D(tge_u_texture_input, tge_v_uv - tge_u_offset).xyz;
	vec3 B = tge_u_blur.y* texture2D(tge_u_texture_input, tge_v_uv).xyz;
	vec3 C = tge_u_blur.z* texture2D(tge_u_texture_input, tge_v_uv + tge_u_offset).xyz;
	vec3 color = A + B + C;
	gl_FragColor = vec4(color, 1);	
	
}

/*chunk-temp*/


float weight[5];


	weight[0]=0.227027;
weight[1]=0.1945946;
weight[2]=0.1216216;
weight[3]=0.054054;
weight[4]=0.016216;

	  vec3 result = texture2D(tge_u_glow_emission, tge_v_uv).rgb * weight[0];
	float ii=0.0;
	for(int i = 1; i < 5; ++i)
    {
		ii=float(i);
        result += texture2D(tge_u_glow_emission, tge_v_uv + (tge_u_offset*ii)).rgb * weight[i];
        result += texture2D(tge_u_glow_emission, tge_v_uv - (tge_u_offset*ii)).rgb * weight[i];
    }
	gl_FragColor = vec4(result, 1.0);

	vec4 c = vec4(0.0);
	c += texture2D(tge_u_glow_emission, tge_v_uv - tge_u_offset * 5.5) * 0.00598;
	c += texture2D(tge_u_glow_emission, tge_v_uv - tge_u_offset * 3.5) * 0.060626;
	c += texture2D(tge_u_glow_emission, tge_v_uv - tge_u_offset * 1.5) * 0.241843;
	c += texture2D(tge_u_glow_emission, tge_v_uv) * 0.383103;
	c += texture2D(tge_u_glow_emission, tge_v_uv + tge_u_offset * 1.5) * 0.241843;
	c += texture2D(tge_u_glow_emission, tge_v_uv + tge_u_offset * 3.5) * 0.060626;
	c += texture2D(tge_u_glow_emission, tge_v_uv + tge_u_offset * 5.5) * 0.00598;

    gl_FragColor =  c;

 vec3 A =  texture2D(tge_u_glow_emission, tge_v_uv - Offset).xyz;
	 vec3 B =  texture2D(tge_u_glow_emission, tge_v_uv).xyz;
	 vec3 C =  texture2D(tge_u_glow_emission, tge_v_uv + Offset).xyz;
	 vec3 color = A + B + C;
	 gl_FragColor = vec4(color, 1);	
	
	

/*chunk-merge*/
uniform sampler2D tge_u_glow_emission;

void fragment(){
	vec4 cBase = texture2D(tge_u_texture_input, tge_v_uv);
	vec4 cOver = texture2D(tge_u_glow_emission, tge_v_uv);		
	float exposure = 1.0;
	float gamma = 1.0;
	vec4 blend = cBase + cOver * 3.0;
    blend = vec4(1.0) - exp(-blend * exposure); // tone mapping
    blend = pow(blend, vec4(1.0 / gamma)); // gamma correct
	gl_FragColor =blend;
}