
uniform mat3 tge_u_blur_params;

const int MAX_KERNEL_SIZE = 512;
void fragment(){	
	 vec4 color = texture2D(tge_u_texture_input, tge_v_uv);        

    vec2 filterArea=vec2(tge_u_blur_params[0].x,tge_u_blur_params[0].y);
    vec2 uCenter=vec2(tge_u_blur_params[1].y,tge_u_blur_params[1].z);
    float uRadian=tge_u_blur_params[2].x;
    float uRadius=tge_u_blur_params[2].y;
    int k = int(tge_u_blur_params[2].z - 1.0);

    float aspect = filterArea.y / filterArea.x;
    vec2 center = uCenter.xy / filterArea.xy;
    float gradient = uRadius / filterArea.x * 0.3;
    float radius = uRadius / filterArea.x - gradient * 0.5;
    

    vec2 coord = tge_v_uv;
    vec2 dir = vec2(center - coord);
    float dist = length(vec2(dir.x, dir.y * aspect));

    float radianStep = uRadian;
    if (radius >= 0.0 && dist > radius) {
        float delta = dist - radius;
        float gap = gradient;
        float scale = 1.0 - abs(delta / gap);
        if (scale <= 0.0) {
            gl_FragColor = color;
            return;
        }
        radianStep *= scale;
    }
    radianStep /= float(k);

    float s = sin(radianStep);
    float c = cos(radianStep);
    mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));

    for(int i = 0; i < MAX_KERNEL_SIZE - 1; i++) {
        if (i == k) {
            break;
        }

        coord -= center;
        coord.y *= aspect;
        coord = rotationMatrix * coord;
        coord.y /= aspect;
        coord += center;

        vec4 sample = texture2D(tge_u_texture_input, coord);

        // switch to pre-multiplied alpha to correctly blur transparent images
        // sample.rgb *= sample.a;

        color += sample;
    }

    gl_FragColor = color / tge_u_blur_params[2].z;
}
