
uniform vec2 tge_u_offset;

void fragment(){	
	vec4 color = vec4(0.0);
    color += texture2D(tge_u_texture_input, vec2(tge_v_uv.x - tge_u_offset.x, tge_v_uv.y + tge_u_offset.y));
    color += texture2D(tge_u_texture_input, vec2(tge_v_uv.x + tge_u_offset.x, tge_v_uv.y + tge_u_offset.y));
    color += texture2D(tge_u_texture_input, vec2(tge_v_uv.x + tge_u_offset.x, tge_v_uv.y - tge_u_offset.y));
    color += texture2D(tge_u_texture_input, vec2(tge_v_uv.x - tge_u_offset.x, tge_v_uv.y - tge_u_offset.y));
    color *= 0.25;
    color.r+=tge_u_offset.x;
    color.y+=tge_u_offset.x;
    gl_FragColor = color;
}
