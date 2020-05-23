<?=chunk('precision')?>
attribute vec4 tge_a_position;
varying vec4 tge_v_uv;

void vertex(){


 tge_v_uv = tge_a_position;
  gl_Position = tge_a_position;
  gl_Position.z = 1.0;

}


<?=chunk('precision')?>

uniform mat4 tge_u_viewProjectionMatrix;
uniform vec4 sun_params;


varying vec4 tge_v_uv;

vec3 fragPosition;

const float turbidity = 10.0;
const float reileigh = 2.0;
const float mieCoefficient = 0.005;
const float mieDirectionalG = 0.8;

const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003;// refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
											
const float pn = 0.035;
// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0;

float sunAngularDiameterCos =sun_params.w; // 0.999956;

const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

vec3 simplifiedRayleigh() {
	return 0.0005 / vec3(94, 40, 18);
}

float rayleighPhase(float cosTheta) {
	return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T) {
	float c = (0.2 * T ) * 10E-18;
	return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g) {
	return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos) {	
	return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x) {
   return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

void fragment(void) {
	
   fragPosition=(tge_u_viewProjectionMatrix * tge_v_uv).xyz;
	vec3 sunPosition=sun_params.xyz;
	float sunfade = 1.0 - clamp(1.0 - exp(sunPosition.y), 0.0, 1.0);
	float reileighCoefficient = reileigh - (1.0 * (1.0-sunfade));
	vec3 sunDirection = normalize(sunPosition);
	float sunE = sunIntensity(dot(sunDirection, up));
	vec3 betaR = simplifiedRayleigh() * reileighCoefficient;

	// mie coefficients
	vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = acos(max(0.0, dot(up, normalize(fragPosition))));
	float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
	float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));

	// combined extinction factor
	vec3 Fex = exp(-(betaR * sR + betaM * sM));

	// in scattering
	float cosTheta = dot(normalize(fragPosition), sunDirection);

	float rPhase = rayleighPhase(cosTheta * 0.5+0.5);
	vec3 betaRTheta = betaR * rPhase;

	float mPhase = hgPhase(cosTheta, mieDirectionalG);
	vec3 betaMTheta = betaM * mPhase;

	vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));
	Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));

	//nightsky
	vec3 direction = normalize(fragPosition);
	float theta = acos(direction.y); // elevation --> y-axis, [-pi/2, pi/2]
	float phi = atan(direction.z, direction.x); // azimuth --> x-axis [-pi/2, pi/2]
	vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
	vec3 L0 = vec3(0.1) * Fex;

	// composition + solar disc
	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);
	L0 += (sunE * 19000.0 * Fex)*sundisk;

	vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));

	vec3 texColor = (Lin+L0);
	texColor *= 0.04 ;
	texColor += vec3(0.0,0.001,0.0025)*0.3;

	vec3 curr = Uncharted2Tonemap(texColor);
	vec3 color = curr*whiteScale;

	vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));

	gl_FragColor = vec4(retColor, 1.0);
}