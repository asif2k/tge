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
<?for(var i= 0;i<params.fws_lightsCount;i++) {?>
	uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

/*chunk-lights-material-all*/
<?for(var i = 0;i < params.fws_lightsCount;i++){?>
	uniform mat4 tge_u_lightMaterial<?=i?>;
<?}?>



/*chunk-forward-shading*/
<?for (var i = 0;i < params.fws_lightsCount;i++) {?>
	uniform mat4 tge_u_lightMaterial<?=i?>;
	uniform mat4 tge_u_lightMatrix<?=i?>;
<?}?>

float fws_distanceToLight;
float fws_lambertian;
float fws_specular;
float fws_attenuation;
float fws_intensity;
float fws_spotLightCalc;
float fws_spotTheta;
float fws_spotLightStatus;
vec3 fws_totalLight;
vec3 fws_directionToLight;
vec3 fws_lightValue;
vec3 directionToEye;
void applyLight(mat4 objectMaterial,mat4 lightMaterial, mat4 lightMatrix,vec3 vertexPosition,vec3 vertexNormal) {

	fws_directionToLight = (lightMatrix[3].xyz - vertexPosition);
	fws_distanceToLight = length(fws_directionToLight);
	fws_directionToLight = normalize(fws_directionToLight);
	fws_lambertian = max(dot(fws_directionToLight.xyz, vertexNormal), 0.0);	
	fws_intensity = lightMaterial[0].w;
	fws_attenuation = (lightMaterial[3].x + lightMaterial[3].y * fws_distanceToLight
		+ lightMaterial[3].z * (fws_distanceToLight * fws_distanceToLight)) + lightMaterial[3].w;
	

	fws_spotLightStatus = step(0.000001, lightMaterial[1].w);
	fws_spotTheta = dot(fws_directionToLight, normalize(lightMatrix[2].xyz));
	fws_spotLightCalc = clamp((fws_spotTheta - lightMaterial[2].w) / (lightMaterial[1].w - lightMaterial[2].w), 0.0, 1.0);
	fws_intensity *= (fws_spotLightStatus * (step(lightMaterial[1].w, fws_spotTheta) * fws_spotLightCalc))
		+ abs(1.0 - fws_spotLightStatus);
		
	

	fws_specular = pow(max(dot(normalize(fws_directionToLight.xyz + directionToEye), vertexNormal), 0.0), objectMaterial[2].w) * fws_lambertian;
	fws_specular *= fws_intensity * step(0.0, fws_lambertian);
		

	fws_lightValue = (lightMaterial[0].xyz * objectMaterial[0].xyz) +
		(objectMaterial[1].xyz * fws_lambertian * lightMaterial[1].xyz * fws_intensity) +
		(objectMaterial[2].xyz * fws_specular * lightMaterial[2].xyz);

	

	fws_totalLight +=(fws_lightValue / fws_attenuation);


}



vec4 applyForwardShading(mat4 objectMaterial, vec4 eyePosition, vec3 vertexPosition, vec3 vertexNormal){

    directionToEye = normalize((eyePosition.xyz - vertexPosition));
	
	vertexNormal = normalize(vertexNormal);
	<? for (var i = 0;i < params.fws_lightsCount;i++) {?>
		applyLight(objectMaterial, tge_u_lightMaterial<?=i?>, tge_u_lightMatrix<?=i?>,vertexPosition,vertexNormal);
	<?}?>
	
	return vec4(fws_totalLight,objectMaterial[0].w);
}


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
/*chunk-temp*/

float snoise(vec4 v)
{
	const vec4  C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);


	vec4 i = floor(v + dot(v, vec4(F4)));
	vec4 x0 = v - i + dot(i, C.xxxx);



	vec4 i0;
	vec3 isX = step(x0.yzw, x0.xxx);
	vec3 isYZ = step(x0.zww, x0.yyz);

	i0.x = isX.x + isX.y + isX.z;
	i0.yzw = 1.0 - isX;

	i0.y += isYZ.x + isYZ.y;
	i0.zw += 1.0 - isYZ.xy;
	i0.z += isYZ.z;
	i0.w += 1.0 - isYZ.z;


	vec4 i3 = clamp(i0, 0.0, 1.0);
	vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
	vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);


	vec4 x1 = x0 - i1 + C.xxxx;
	vec4 x2 = x0 - i2 + C.yyyy;
	vec4 x3 = x0 - i3 + C.zzzz;
	vec4 x4 = x0 + C.wwww;


	i = mod289(i);
	float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
	vec4 j1 = permute(permute(permute(permute(
		i.w + vec4(i1.w, i2.w, i3.w, 1.0))
		+ i.z + vec4(i1.z, i2.z, i3.z, 1.0))
		+ i.y + vec4(i1.y, i2.y, i3.y, 1.0))
		+ i.x + vec4(i1.x, i2.x, i3.x, 1.0));


	vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

	vec4 p0 = grad4(j0, ip);
	vec4 p1 = grad4(j1.x, ip);
	vec4 p2 = grad4(j1.y, ip);
	vec4 p3 = grad4(j1.z, ip);
	vec4 p4 = grad4(j1.w, ip);


	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	p4 *= taylorInvSqrt(dot(p4, p4));


	vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
	vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
	m0 = m0 * m0;
	m1 = m1 * m1;
	return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
		+ dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));

}

/*chunk-wireframe-feature*/




vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

const float F4 = 0.309016994374947451;

const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);

float snoise(vec4 v)
{
	


	
		
	vec4 i = floor(v + dot(v, vec4(F4)));
	vec4 x0 = v - i + dot(i, C.xxxx);

	vec4 i0;
	vec3 isX = step(x0.yzw, x0.xxx);
	vec3 isYZ = step(x0.zww, x0.yyz);

	i0.x = isX.x + isX.y + isX.z;
	i0.yzw = 1.0 - isX;

	i0.y += isYZ.x + isYZ.y;
	i0.zw += 1.0 - isYZ.xy;
	i0.z += isYZ.z;
	i0.w += 1.0 - isYZ.z;


	vec4 i3 = clamp(i0, 0.0, 1.0);
	vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
	vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);


	vec4 x1 = x0 - i1 + C.xxxx;
	vec4 x2 = x0 - i2 + C.yyyy;
	vec4 x3 = x0 - i3 + C.zzzz;
	vec4 x4 = x0 + C.wwww;


	i = mod289(i);
	float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
	vec4 j1 = permute(permute(permute(permute(
		i.w + vec4(i1.w, i2.w, i3.w, 1.0))
		+ i.z + vec4(i1.z, i2.z, i3.z, 1.0))
		+ i.y + vec4(i1.y, i2.y, i3.y, 1.0))
		+ i.x + vec4(i1.x, i2.x, i3.x, 1.0));


	vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

	vec4 p0 = grad4(j0, ip);
	vec4 p1 = grad4(j1.x, ip);
	vec4 p2 = grad4(j1.y, ip);
	vec4 p3 = grad4(j1.z, ip);
	vec4 p4 = grad4(j1.w, ip);


	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	p4 *= taylorInvSqrt(dot(p4, p4));


	vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
	vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
	m0 = m0 * m0;
	m1 = m1 * m1;
	return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
		+ dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));

}

const float PI = 3.14159265359;

float aastep (float threshold, float dist) {
  float afwidth = fwidth(dist) * 0.5;
  return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}



vec4 getStyledWireframe (vec3 barycentric,vec3 position) {
  float d = min(min(barycentric.x, barycentric.y), barycentric.z);
  float noiseOff = 0.0;
  
  
  
  noiseOff = snoise(vec4(position.xyz * 1.0,  0.35)) * 0.15;
  noiseOff = noiseOff+ snoise(vec4(position.xyz * 80.0,  0.5)) * 0.12;
  
  
  
  
  

  d += noiseOff;

  float positionAlong = max(barycentric.x, barycentric.y);
  if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
    positionAlong = 1.0 - positionAlong;
  }

  float computedThickness = 0.01;

  // create the repeating dash pattern

  float dashRepeats = 2.0;
  float dashLength = 0.55;

  float offset = 1.0 / dashRepeats * dashLength / 2.0;
  


  float pattern = fract((positionAlong + offset) * dashRepeats);
  computedThickness *= 1.0 - aastep(dashLength, pattern);

   
  float edge = 1.0 - aastep(computedThickness, d);
  vec4 outColor = vec4(0.0);
  outColor.rgb=mix(vec3(1.0,0.0,0.0), vec3(1.0), vec3(edge));
    outColor.a = 0.5;
  return outColor;
}