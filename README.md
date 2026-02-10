# whisk

**_whisk_** is an AI-powered language companion that transforms the media you love into immersive, personalized speaking practice. By weaving the **Gemini 3** ecosystem directly into its DNA, **_whisk_** moves beyond rote memorization into true linguistic fluency.

The integration is anchored by two specialized models:
### Gemini 3 Flash (The Context Engine): 
- **Gemini Structured Outputs**: Speed and context are everything. We utilized this feature to analyze YouTube transcripts in seconds, extract level-appropriate vocabulary, and ensure consistent output format
- We utilized Gemini Live API through Pipecat (which internally uses the Flash model) to implement the bi-directional streaming that drives the **AI Roleplay Persona**. Using the video context, Gemini crafts a conversation that is directly relevant to its theme and the user’s interest.
With function calling and connection parameters passing between the frontend and backend, Gemini can steer the conversation dynamically towards the target words and cross them out as it hears them.

### Nano Banana (The Visual Artist): 
To bridge the gap between "studying" and "experiencing," Nano Banana generates high-fidelity, first-person POV illustrations of the video's setting, providing the vital visual immersion needed for effective roleplay.

By combining these features, **_whisk_** creates a gamified feedback loop where users don't just learn words—they live them. Whether you’re ordering food in Ameyoko Market or buying souvenirs in Takayama, Gemini ensures the world you’re practicing in feels remarkably real.

Note: Please refer to frontend and backend READMEs for instructions on how to run

## Gemini Hackathon Devpost

https://gemini3.devpost.com/

## FigJam Brainstorning

https://www.figma.com/board/aduArXBmgmKPzy6tMLyQNa/Gemini-3-Hackathon?node-id=128-193&t=MXIF1KZeTaXcH1KP-1

