
<?=chunk('precision')?>
<?=chunk('mesh-attributes-flat')?>

uniform mat4 tge_u_viewProjectionMatrix;

void vertex(){
    gl_Position = tge_u_viewProjectionMatrix* tge_v_shadow_vertex;
	
}

<?=chunk('precision')?>
uniform mat4 tge_u_objectMaterial;
void fragment(void) {
	vec4 color=tge_u_objectMaterial[0];
	gl_FragColor = (color.rgb*color.a,1.0);
}