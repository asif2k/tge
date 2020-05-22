uniform sampler2D tge_u_glow_emission;
<?=chunk('shadow-sampling')?>
vec4 blurOther(sampler2D image, vec2 uv, vec2 dir, float h){
		vec4 sum = vec4(0.0);
		
		sum += texture2D(image, uv - 3.2307 * h * dir) * 0.0702;
		sum += texture2D(image, uv - 1.3846 * h * dir) * 0.3162;
		sum += texture2D(image, uv) * 0.2270;
		sum += texture2D(image, uv + 1.3846 * h * dir) * 0.3162;
		sum += texture2D(image, uv + 3.2307 * h * dir) * 0.0702;

		return sum;
	}

	vec4 FungiBlur(sampler2D tex, vec2 uv, vec2 dir){
		vec2 pxSize = 1.0 / vec2(2505.0,1907.0) * dir; //Pixel Size
		vec4 c = vec4(0.0);
		
		c += texture2D(tex, uv - pxSize * 5.5) * 0.00598;
		c += texture2D(tex, uv - pxSize * 3.5) * 0.060626;
		c += texture2D(tex, uv - pxSize * 1.5) * 0.241843;
		c += texture2D(tex, uv) * 0.383103;
		c += texture2D(tex, uv + pxSize * 1.5) * 0.241843;
		c += texture2D(tex, uv + pxSize * 3.5) * 0.060626;
		c += texture2D(tex, uv + pxSize * 5.5) * 0.00598;

		return c;
	}

void fragment(){	


		vec2 pxSize = 1.0 / vec2(2505.0,1907.0) ;
	
	vec4 cBase = texture2D(tge_u_texture_input, tge_v_uv);
	vec4 cOver = texture2D(tge_u_glow_emission, tge_v_uv);

	 vec4 cOver1=FungiBlur(tge_u_glow_emission,tge_v_uv,vec2(14.0,0.0));
	 vec4 cOver2=FungiBlur(tge_u_glow_emission,tge_v_uv,vec2(0.0,14.0));
	 cOver=cOver1*cOver2;
	cOver.a=1.0;
	
	float exposure = 1.0;
		float gamma = 1.0;

		vec4 blend = cBase + cOver * 3.0;
    	blend = vec4(1.0) - exp(-blend * exposure); // tone mapping
    	blend = pow(blend, vec4(1.0 / gamma)); // gamma correct

		gl_FragColor =cBase+cOver*20.0;


}
