<?=chunk('precision')?>
attribute vec4 tge_a_position;
varying vec4 tge_v_uv;

void vertex(){


 tge_v_uv = tge_a_position;
  gl_Position = tge_a_position;
  gl_Position.z = 1.0;

}


<?=chunk('precision')?>

uniform samplerCube tge_u_ambientTexture;
uniform mat4 tge_u_viewProjectionMatrix;
uniform vec4 tge_u_skytop_color;
uniform vec4 tge_u_skyhorizon_color;

varying vec4 tge_v_uv;

void fragment(void) {	
    
	vec4 t = tge_u_viewProjectionMatrix * tge_v_uv;
    gl_FragColor = textureCube(tge_u_ambientTexture, normalize(t.xyz / t.w));
    

    gl_FragColor *= mix(tge_u_skyhorizon_color,  tge_u_skytop_color, t.y);

   

}