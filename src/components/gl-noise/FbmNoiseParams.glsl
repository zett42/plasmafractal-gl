struct FbmNoiseParams {
	int   octaves;           // number of octaves for fractal noise
	float octavesFract;      // fractional part of octaves value
	float frequency;         // noise frequency
	float gain;              // amplitude factor per octave
	float angle;             // rotation per octave
	float lacunarity;        // frequency factor per octave
	float turbulence;        // Z coordinate factor per octave  
};

struct NoiseParams {
	FbmNoiseParams basic;    // basic params
	float anim;              // Z-position in 3D noise, for animation
	float amplitude;         // noise amplitude
};

struct WarpParams {
	FbmNoiseParams basic;
	float anim;              // Z-position in 3D noise, for animation
	float amplitude;         // directional amplitude
	float rotation;          // rotational amplitude
};