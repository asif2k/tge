
void fragment(){	
	vec4 c = texture2D(tge_u_texture_input, tge_v_uv);        
	float bright = dot(c.rgb, vec3(0.2627, 0.6780, 0.0593));
    gl_FragColor =   (bright > 0.85) ? c : vec4(0.0);
}
