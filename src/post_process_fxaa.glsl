﻿uniform vec3 tge_u_inverseFilterTextureSize;
uniform vec3 tge_u_fxaa_params;
void fragment()
{

	float R_fxaaSpanMax=tge_u_fxaa_params.x;
	float R_fxaaReduceMin=tge_u_fxaa_params.y;
	float R_fxaaReduceMul=tge_u_fxaa_params.z;	
	vec2 texCoordOffset = tge_u_inverseFilterTextureSize.xy;
	vec3 luma = vec3(0.299, 0.587, 0.114);	
	float lumaTL = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(-1.0, -1.0) * texCoordOffset)).xyz);
	float lumaTR = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(1.0, -1.0) * texCoordOffset)).xyz);
	float lumaBL = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(-1.0, 1.0) * texCoordOffset)).xyz);
	float lumaBR = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy + (vec2(1.0, 1.0) * texCoordOffset)).xyz);
	float lumaM  = dot(luma, texture2D(tge_u_texture_input, tge_v_uv.xy).xyz);

	vec2 dir;
	dir.x = -((lumaTL + lumaTR) - (lumaBL + lumaBR));
	dir.y = ((lumaTL + lumaBL) - (lumaTR + lumaBR));
	
	float dirReduce = max((lumaTL + lumaTR + lumaBL + lumaBR) * (R_fxaaReduceMul * 0.25), R_fxaaReduceMin);
	float inverseDirAdjustment = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
	
	dir = min(vec2(R_fxaaSpanMax, R_fxaaSpanMax), 
		max(vec2(-R_fxaaSpanMax, -R_fxaaSpanMax), dir * inverseDirAdjustment)) * texCoordOffset;

	vec3 result1 = (1.0/2.0) * (
		texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(1.0/3.0 - 0.5))).xyz +
		texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(2.0/3.0 - 0.5))).xyz);

	vec3 result2 = result1 * (1.0/2.0) + (1.0/4.0) * (
		texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(0.0/3.0 - 0.5))).xyz +
		texture2D(tge_u_texture_input, tge_v_uv.xy + (dir * vec2(3.0/3.0 - 0.5))).xyz);

	float lumaMin = min(lumaM, min(min(lumaTL, lumaTR), min(lumaBL, lumaBR)));
	float lumaMax = max(lumaM, max(max(lumaTL, lumaTR), max(lumaBL, lumaBR)));
	float lumaResult2 = dot(luma, result2);
	
	if(lumaResult2 < lumaMin || lumaResult2 > lumaMax)
		gl_FragColor = vec4(result1, 1.0);
	else
		gl_FragColor = vec4(result2, 1.0);
}
