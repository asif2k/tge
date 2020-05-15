<?=chunk('precision')?>
<?=chunk('pipelineParams')?>

const vec2 madd=vec2(0.5,0.5);
varying vec2 textureCoord;
attribute vec2 tge_a_position;


void vertex(){
	initPipelineParams();	
	gl_Position = vec4(tge_a_position.xy,0.0,1.0);	
	textureCoord = tge_a_position.xy*madd+madd;   
}

<?=chunk('precision')?>
<?=chunk('pipelineParams')?>

uniform sampler2D tge_u_texture;
varying vec2 textureCoord;


void fragment(void) {
	initPipelineParams();
	
	gl_FragColor = texture2D(tge_u_texture, textureCoord) ;
	if(textureCoord.x<0.5){
	gl_FragColor +=0.05;
	}
	




}