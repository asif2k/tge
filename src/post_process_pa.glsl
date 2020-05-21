uniform mat3 tge_u_pa_params;

void fragment(){	
	vec4 c = texture2D(tge_u_texture_input, tge_v_uv);
    if (c.a > 0.0) {

		float gamma=tge_u_pa_params[0].x;
		float contrast=tge_u_pa_params[0].y;
		float saturation=tge_u_pa_params[0].z;
		float brightness=tge_u_pa_params[1].x;
		float red=tge_u_pa_params[1].y;
		float green=tge_u_pa_params[1].z;
		float blue=tge_u_pa_params[2].x;
		
        c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1. / gamma));
        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;
        c.rgb = rgb * brightness;

        c.rgb *= c.a;
    }
	float alpha=tge_u_pa_params[2].y;
    gl_FragColor = c * alpha;
}
