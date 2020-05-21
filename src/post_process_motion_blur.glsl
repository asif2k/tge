
uniform mat3 tge_u_blur_params;

const int MAX_KERNEL_SIZE = 512;
void fragment(){	
	 vec4 color = texture2D(tge_u_texture_input, tge_v_uv);        

    vec2 filterArea=vec2(tge_u_blur_params[0].x,tge_u_blur_params[0].y);
    vec2 uVelocity=vec2(tge_u_blur_params[1].y,tge_u_blur_params[1].z);
    float uOffset=tge_u_blur_params[2].x;
    int k = int(tge_u_blur_params[2].z - 1.0);

   
    vec2 velocity = uVelocity / filterArea.xy;
    float offset = -uOffset / length(uVelocity) - 0.5;
   
    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }
        vec2 bias = velocity * (float(i) / float(k) + offset);
        color += texture2D(tge_u_texture_input, tge_v_uv + bias);
    }

    gl_FragColor = color / tge_u_blur_params[2].z;
}
