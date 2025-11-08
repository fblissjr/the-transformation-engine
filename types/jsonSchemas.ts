// ==================== JSON Schemas for LLM JSON Mode ====================
// OpenAI-compatible JSON Schema for structured output generation
// Used with responseFormat: { type: "json_schema", schema: ... }

/**
 * JSON Schema for IntermediateStructure v2.0
 * Use this when calling LLM APIs with JSON mode
 */
export const IntermediateStructureJSONSchema = {
  type: "object",
  properties: {
    format: {
      type: "string",
      enum: ["structured"],
      description: "Always 'structured' for v2.0"
    },
    version: {
      type: "string",
      enum: ["2.0.0"],
      description: "Intermediate format version"
    },
    sceneType: {
      type: "string",
      enum: [
        "dialogue",
        "cinematic",
        "animation",
        "music-video",
        "action",
        "establishing",
        "product",
        "abstract"
      ],
      description: "Type of scene being described"
    },
    sections: {
      type: "object",
      properties: {
        visual: {
          type: "object",
          properties: {
            subject: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              description: "Who or what is in the scene (e.g., ['woman walking', 'dog running'])"
            },
            setting: {
              type: "string",
              description: "Where the scene takes place (e.g., 'beach at sunset')"
            },
            environment: {
              type: "string",
              description: "Environmental details (e.g., 'sandy shore with gentle waves')"
            },
            colors: {
              type: "string",
              description: "Dominant color palette (e.g., 'warm golden orange, deep blue')"
            },
            lighting: {
              type: "string",
              description: "Lighting characteristics (e.g., 'natural golden hour backlighting')"
            },
            composition: {
              type: "string",
              description: "Framing and arrangement (e.g., 'subject in left third')"
            },
            style: {
              type: "string",
              description: "Visual aesthetic (e.g., 'cinematic naturalism')"
            }
          },
          required: ["subject", "setting", "environment", "colors", "lighting", "composition", "style"],
          additionalProperties: false
        },
        temporal: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: {
                type: "string",
                pattern: "^\\d+-\\d+s$",
                description: "Time range (e.g., '0-3s', '3-7s')"
              },
              description: {
                type: "string",
                description: "What happens during this segment"
              },
              camera: {
                type: "string",
                description: "Camera behavior (optional)"
              },
              visual: {
                type: "string",
                description: "Visual changes (optional)"
              },
              audio: {
                type: "string",
                description: "Audio changes (optional)"
              }
            },
            required: ["time", "description"],
            additionalProperties: false
          },
          description: "Optional: Time-based progression for scenes with temporal changes"
        },
        audio: {
          type: "object",
          properties: {
            dialogue: {
              type: "array",
              items: { type: "string" },
              description: "Quoted speech (e.g., ['Hello', 'How are you?'])"
            },
            ambient: {
              type: "array",
              items: { type: "string" },
              description: "Background environmental sounds (e.g., ['ocean waves', 'wind'])"
            },
            soundEffects: {
              type: "array",
              items: { type: "string" },
              description: "Specific sound effects (e.g., ['footsteps', 'door closing'])"
            },
            music: {
              type: "string",
              description: "Musical elements description"
            }
          },
          additionalProperties: false,
          description: "Optional: Audio elements for scenes with notable sound"
        },
        camera: {
          type: "object",
          properties: {
            movement: {
              type: "string",
              description: "Camera motion (e.g., 'slow dolly forward')"
            },
            angles: {
              type: "array",
              items: { type: "string" },
              description: "Camera angles/shots (e.g., ['wide shot', 'close-up'])"
            },
            techniques: {
              type: "string",
              description: "Cinematic techniques (e.g., 'shallow depth of field')"
            },
            lensDetails: {
              type: "string",
              description: "Lens specs (e.g., '50mm f/1.8')"
            }
          },
          additionalProperties: false,
          description: "Optional: Camera work for cinematic scenes"
        }
      },
      required: ["visual"],
      additionalProperties: false
    },
    metadata: {
      type: "object",
      properties: {
        generatedAt: {
          type: "string",
          format: "date-time",
          description: "ISO timestamp of generation"
        },
        transformationType: {
          type: "string",
          description: "Type of transformation applied (e.g., 'mix', 'extend')"
        },
        transformationParams: {
          type: "object",
          description: "Parameters used for transformation"
        },
        parentId: {
          type: "string",
          description: "Parent intermediate ID (for transformations)"
        }
      },
      additionalProperties: false,
      description: "Optional: Metadata about generation/transformation"
    }
  },
  required: ["format", "version", "sceneType", "sections"],
  additionalProperties: false
};

/**
 * Strict mode schema - requires all optional sections
 * Use when you want to ensure complete intermediate generation
 */
export const IntermediateStructureJSONSchemaStrict = {
  ...IntermediateStructureJSONSchema,
  properties: {
    ...IntermediateStructureJSONSchema.properties,
    sections: {
      ...IntermediateStructureJSONSchema.properties.sections,
      required: ["visual", "temporal", "audio", "camera"], // All sections required
    }
  }
};

/**
 * Helper: Get schema for specific scene type
 * Customizes required/optional sections based on scene type
 */
export function getSchemaForSceneType(sceneType: string) {
  const baseSchema = { ...IntermediateStructureJSONSchema };

  // Customize based on scene type
  switch (sceneType) {
    case 'dialogue':
      // Dialogue scenes: require audio, optional temporal
      baseSchema.properties.sections.required = ["visual", "audio"];
      break;

    case 'cinematic':
    case 'action':
      // Cinematic/action: require temporal and camera
      baseSchema.properties.sections.required = ["visual", "temporal", "camera"];
      break;

    case 'music-video':
      // Music videos: require temporal and audio
      baseSchema.properties.sections.required = ["visual", "temporal", "audio"];
      break;

    case 'establishing':
    case 'product':
      // Establishing/product shots: visual only (usually static)
      baseSchema.properties.sections.required = ["visual"];
      break;

    case 'animation':
    case 'abstract':
      // Animation/abstract: flexible, only visual required
      baseSchema.properties.sections.required = ["visual"];
      break;

    default:
      // Default: only visual required
      baseSchema.properties.sections.required = ["visual"];
  }

  return baseSchema;
}

/**
 * Example usage object for documentation
 */
export const IntermediateStructureExample = {
  format: "structured",
  version: "2.0.0",
  sceneType: "cinematic",
  sections: {
    visual: {
      subject: ["woman walking"],
      setting: "beach at sunset",
      environment: "sandy shore with gentle waves lapping, open horizon with scattered clouds",
      colors: "warm golden orange from setting sun, deep blue ocean, soft purple sky",
      lighting: "natural golden hour backlighting from setting sun, warm rim light on subject",
      composition: "subject in left third of frame, walking toward right, ocean filling background",
      style: "cinematic naturalism with warm color grading, shallow depth of field"
    },
    temporal: [
      {
        time: "0-3s",
        description: "Woman walks steadily along the beach as the sun sets on the horizon",
        camera: "Slow dolly forward following the subject",
        visual: "Sunlight gradually dims, colors shift from golden to deep orange",
        audio: "Ocean waves grow slightly louder as camera approaches"
      },
      {
        time: "3-7s",
        description: "Woman continues walking, footsteps visible in wet sand",
        camera: "Camera maintains steady dolly forward",
        visual: "Sunset deepens, shadows lengthen",
        audio: "Waves consistent, gentle breeze audible"
      }
    ],
    audio: {
      dialogue: [],
      ambient: ["gentle ocean waves", "soft breeze"],
      soundEffects: ["footsteps on wet sand"],
      music: undefined
    },
    camera: {
      movement: "slow dolly forward tracking the subject",
      angles: ["medium shot", "slightly low angle"],
      techniques: "shallow depth of field (f/2.8), natural light cinematography",
      lensDetails: "35mm focal length, f/2.8 aperture"
    }
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    transformationType: undefined,
    transformationParams: undefined,
    parentId: undefined
  }
};
