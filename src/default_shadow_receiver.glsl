
<?=chunk('precision')?>
uniform sampler2D tge_u_shadowMap;
uniform sampler2D ambientTexture;
uniform mat4 tge_u_viewMatrixInv;
varying vec4 tge_v_shadow_vertex;
uniform mat4 tge_u_lightCameraMatrix;

uniform vec4 tge_u_shadow_params;

<?=chunk('shadow-sampling')?>

float getShadowSampleVariance( mat4 lightMatrix) {

    float shadowmap_size=tge_u_shadow_params.z;
	float shadow_bias=tge_u_shadow_params.x;
	vec4 projCoords = lightMatrix * tge_v_shadow_vertex;
	projCoords.xyz = projCoords.xyz / projCoords.w;
	projCoords.xyz = projCoords.xyz * 0.5 + 0.5;
    if (projCoords.y > 1.0 || projCoords.x > 1.0 || projCoords.z > 1.0) return (0.0);
    if (projCoords.y < 0.0 || projCoords.x < 0.0 || projCoords.z < 0.0) return (0.0);
	float bias = projCoords.z - (1.0/shadowmap_size) * shadow_bias;
	return 0.5 - SampleVarianceShadowMap(tge_u_shadowMap, projCoords.xy, bias, 0.00000001,0.0);

}


void fragment(){
    float shadowOpacity  =tge_u_shadow_params.y;
	gl_FragColor = vec4(shadowOpacity)* getShadowSampleVariance(tge_u_lightCameraMatrix) ;
}