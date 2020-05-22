/*chunk-precision*/
#extension GL_OES_standard_derivatives : enable 
#if GL_FRAGMENT_PRECISION_HIGH == 1 
    precision highp float;
#else
    precision mediump float;
#endif


/*chunk-common-varying*/
varying vec4 tge_v_unprojected_vertex;

/*chunk-pipelineParams*/
uniform vec4 tge_u_pipelineParams;
uniform vec4 tge_u_shadingParams;

float tge_u_frameTime;
float tge_u_frameTimeDelta;



void initPipelineParams() {
	tge_u_frameTime = tge_u_pipelineParams.x;
	tge_u_frameTimeDelta = tge_u_pipelineParams.y;
}


/*chunk-temp*/

const int MAX_BONES=10;
uniform vec4 tarray[MAX_BONES];
uniform float u_float;
uniform vec2 u_vec2;
uniform vec3 u_vec3;
uniform vec4 u_vec4;
uniform mat3 u_mat3;
uniform mat4 u_mat4;
uniform sampler2D u_sampler;
	tge_u_frameTime=u_float;
	tge_u_frameTime=u_vec3.x;
	tge_u_frameTime=u_vec4.x;
	tge_u_frameTime=u_mat3[0].x;
	tge_u_frameTime=u_mat4[0].x;
	vec4 v1= texture2D(u_sampler,u_vec2);


/*chunk-mesh-attributes-all*/
attribute vec3 tge_a_position;
attribute vec3 tge_a_normal;
attribute vec4 tge_a_tangent;
attribute vec2 tge_a_uv;


/*chunk-mesh-attributes-flat*/
attribute vec3 tge_a_position;
attribute vec4 tge_a_color;
attribute vec2 tge_a_uv;



/*chunk-camera-matrix-all*/
uniform mat4 tge_u_viewMatrix;
uniform mat4 tge_u_viewMatrixInv;
uniform mat4 tge_u_projectionMatrix;
uniform mat4 tge_u_viewProjectionMatrix;

/*chunk-model-matrix-all*/
uniform mat3 tge_u_normalMatrix;
uniform mat4 tge_u_modelMatrix;
uniform mat4 tge_u_modelViewMatrix;
uniform mat3 tge_u_textureMatrix;


/*chunk-lights-matrix-all*/
<?for(var i= 0;i<param('fws_lightsCount');i++) {?>
	uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

/*chunk-lights-material-all*/
<?for(var i = 0;i < param('fws_lightsCount');i++){?>
	uniform mat4 tge_u_lightMaterial<?=i?>;
<?}?>



/*chunk-fws_lighting*/

float fws_distanceToLight;
float fws_lambertian;
float fws_specular;
float fws_attenuation;
float fws_intensity;
float fws_spotLightCalc;
float fws_spotTheta;
float fws_spotLightStatus;

vec3 fws_totalLight;
vec3 fws_lightValue;

vec3 fws_lighting(mat4 fws_objectMaterial, mat4 fws_lightMaterial,
	vec3 fws_vertexPosition, vec3 fws_vertexNormal,
	vec3 fws_directionToEye,vec3 fws_directionToLight, vec3 fws_directionFromLight) {

	fws_distanceToLight = length(fws_directionToLight);

	

	fws_directionToLight = normalize(fws_directionToLight);
	fws_lambertian = max(dot(fws_directionToLight, fws_vertexNormal), 0.0);
	fws_intensity = fws_lightMaterial[0].w;
	fws_attenuation = (fws_lightMaterial[3].x + fws_lightMaterial[3].y * fws_distanceToLight
		+ fws_lightMaterial[3].z * (fws_distanceToLight * fws_distanceToLight)) + fws_lightMaterial[3].w;

	fws_spotLightStatus = step(0.000001, fws_lightMaterial[1].w);
	fws_spotTheta = dot(fws_directionToLight, fws_directionFromLight);
	fws_spotLightCalc = clamp((fws_spotTheta - fws_lightMaterial[2].w) / (fws_lightMaterial[1].w - fws_lightMaterial[2].w), 0.0, 1.0);
	fws_intensity *= (fws_spotLightStatus * (step(fws_lightMaterial[1].w, fws_spotTheta) * fws_spotLightCalc))
		+ abs(1.0 - fws_spotLightStatus);

	
	fws_specular = pow(max(dot(normalize(fws_directionToLight.xyz + fws_directionToEye), fws_vertexNormal), 0.0), fws_objectMaterial[2].w) * fws_lambertian;
	fws_specular *= fws_intensity * step(0.0, fws_lambertian);


	fws_lightValue = (fws_lightMaterial[0].xyz * fws_objectMaterial[0].xyz) +
		(fws_objectMaterial[1].xyz * fws_lambertian * fws_lightMaterial[1].xyz * fws_intensity) +
		(fws_objectMaterial[2].xyz * fws_specular * fws_lightMaterial[2].xyz);



	return (fws_lightValue / fws_attenuation);


}


/*chunk-shadow-sampling*/

float SampleShadowMap(sampler2D shadowMap, vec2 coords, float compare)
{
	return step(compare, texture2D(shadowMap, coords.xy).r);
}

float SampleShadowMapLinear(sampler2D shadowMap, vec2 coords, float compare, vec2 texelSize)
{
	vec2 pixelPos = coords / texelSize + vec2(0.5);
	vec2 fracPart = fract(pixelPos);
	vec2 startTexel = (pixelPos - fracPart) * texelSize;

	float blTexel = SampleShadowMap(shadowMap, startTexel, compare);
	float brTexel = SampleShadowMap(shadowMap, startTexel + vec2(texelSize.x, 0.0), compare);
	float tlTexel = SampleShadowMap(shadowMap, startTexel + vec2(0.0, texelSize.y), compare);
	float trTexel = SampleShadowMap(shadowMap, startTexel + texelSize, compare);

	float mixA = mix(blTexel, tlTexel, fracPart.y);
	float mixB = mix(brTexel, trTexel, fracPart.y);

	return mix(mixA, mixB, fracPart.x);
}

float SampleShadowMapPCF(sampler2D shadowMap, vec2 coords, float compare, vec2 texelSize)
{
	const float NUM_SAMPLES = 3.0;
	const float SAMPLES_START = (NUM_SAMPLES - 1.0) / 2.0;
	const float NUM_SAMPLES_SQUARED = NUM_SAMPLES * NUM_SAMPLES;

	float result = 0.0;
	for (float y = -SAMPLES_START; y <= SAMPLES_START; y += 1.0)
	{
		for (float x = -SAMPLES_START; x <= SAMPLES_START; x += 1.0)
		{
			vec2 coordsOffset = vec2(x, y) * texelSize;
			result += SampleShadowMapLinear(shadowMap, coords + coordsOffset, compare, texelSize);
		}
	}
	return result / NUM_SAMPLES_SQUARED;
}

float linstep(float low, float high, float v)
{
	return clamp((v - low) / (high - low), 0.0, 1.0);
}

float SampleVarianceShadowMap(sampler2D shadowMap, vec2 coords, float compare, float varianceMin, float lightBleedReductionAmount)
{
	float depth = texture2D(shadowMap, coords.xy).r;


	float dx = dFdx(depth);
	float dy = dFdy(depth);
	float moment2 = depth * depth + 0.25 * (dx * dx + dy * dy);
	vec2 moments = vec2(depth, moment2);


	float p = step(compare, moments.x);
	float variance = max(moments.y - moments.x * moments.x, varianceMin);

	float d = compare - moments.x;
	float pMax = linstep(lightBleedReductionAmount, 1.0, variance / (variance + d * d));

	return min(max(p, pMax), 1.0);
}


/*chunk-post_process_flat*/
<?=chunk('precision')?>
<?=chunk('pipelineParams')?>

const vec2 madd=vec2(0.5,0.5);
varying vec2 tge_v_uv;
attribute vec2 tge_a_position;


void vertex(){
	initPipelineParams();	
	gl_Position = vec4(tge_a_position.xy,0.0,1.0);	
	tge_v_uv = tge_a_position.xy*madd+madd;   
}

<?=chunk('precision')?>
<?=chunk('pipelineParams')?>

uniform sampler2D tge_u_texture_input;
varying vec2 tge_v_uv;


void fragment(void) {
	initPipelineParams();	
	gl_FragColor = texture2D(tge_u_texture_input, tge_v_uv) ;	
}





/*chunk-variance-cascade-shadow-receiver*/

<?for(var i = 0;i <param('count');i++){?>
	uniform mat4 tge_u_lightCameraMatrix<?=i?>;
	varying vec4 tge_v_shadow_light_vertex<?=i?>;	
<?}?>

void vertex(){
	super_vertex();

	<?for(var i = 0;i <param('count');i++){?>
	tge_v_shadow_light_vertex<?=i?> = tge_u_lightCameraMatrix<?=i?> * tge_v_shadow_vertex;
		
	<?}?>
	
}

<?=chunk('precision')?>
<?=chunk('variance-shadow-sampling')?>

<?for(var i = 0;i <param('count');i++){?>	
	varying vec4 tge_v_shadow_light_vertex<?=i?>;	
<?}?>


uniform sampler2D tge_u_shadowMap;
uniform vec4 tge_u_shadow_params;

float vpSize=<?=(1/param('count')).toFixed(3)?>;


float bias = 0.0;

float getShadowSample(float i,vec4 shadow_light_vertex,float s) {

if(s>0.0) return s;
	vec3 shadowMapCoords = (shadow_light_vertex.xyz/shadow_light_vertex.w);	


	shadow_light_vertex.xyz = shadow_light_vertex.xyz * 0.5 + 0.5;

	shadowMapCoords.y *= vpSize;
	shadowMapCoords.y += i * vpSize;


	if (shadowMapCoords.y > 1.0 || shadowMapCoords.x > 1.0 || shadowMapCoords.z > 1.0) return (0.0);  
	if (shadowMapCoords.y < 0.0 || shadowMapCoords.x < 0.0 || shadowMapCoords.z < 0.0) return (0.0);
	
   
   return 0.2- SampleVarianceShadowMap(tge_u_shadowMap,shadowMapCoords.xy,shadowMapCoords.z,
    0.000000005,0.000000);
		
}


void fragment(void) {	
float s=0.0;
bias= (1.0/tge_u_shadow_params.z)*tge_u_shadow_params.x;
<?for(var i =param('count')-1;i>-1;i--){?>	
	s=getShadowSample(<?=(i.toFixed(2))?>,tge_v_shadow_light_vertex<?=i?>,s);
<?}?>

 gl_FragColor = vec4(tge_u_shadow_params.y)* s;
}
