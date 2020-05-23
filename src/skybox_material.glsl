<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
attribute vec4 tge_a_position;

varying vec4 tge_v_uv;

void vertex(){
	initPipelineParams();

 tge_v_uv = tge_a_position;
  gl_Position = tge_a_position;
  gl_Position.z = 1.0;

}


<?=chunk('precision')?>
<?=chunk('pipelineParams')?>
uniform samplerCube tge_u_ambientTexture;
uniform mat4 viewDirectionProjectionInverseMatrix;
varying vec4 tge_v_uv;

void fragment(void) {
	initPipelineParams();	
	vec4 t = viewDirectionProjectionInverseMatrix * tge_v_uv;
    gl_FragColor = textureCube(tge_u_ambientTexture, normalize(t.xyz / t.w));
   

}