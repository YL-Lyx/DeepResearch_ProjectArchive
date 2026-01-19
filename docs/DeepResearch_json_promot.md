Deep Research Prompt — JSON Output Version
For Automatic Website Generation of Discrete & Combinatorial Architecture Projects


Prompt:

You are a research assistant specialized in discrete and combinatorial architecture, computational design, and digital fabrication.

Conduct a comprehensive deep research survey on architectural projects, built works, platforms, tools, and experimental systems related to:

- Discrete architecture
- Combinatorial architecture
- Digital materials
- Kit-of-parts systems
- Interlocking and reversible assemblies
- Robotic or automated discrete construction
- Game-engine-based architectural systems

Return the results as VALID JSON ONLY.
Do not use Markdown.
Do not add explanations or commentary.
Output only a single JSON object that strictly follows the schema below.


Required JSON Schema:

{
  "schemaVersion": "1.0.0",
  "generatedAt": "YYYY-MM-DD",
  "source": {
    "generator": "Gemini 3",
    "notes": "Deep research on discrete and combinatorial architecture"
  },
  "projects": [
    {
      "id": "",
      "title": "",
      "year": 0,
      "authors": [""],
      "institutionOrPractice": "",
      "location": "",
      "projectType": "",
      "tags": [""],

      "summary": "",
      "analyticalCaption": "",

      "methods": {
        "computational": [""],
        "assemblyFabrication": [""]
      },

      "images": [
        {
          "url": "",
          "alt": "",
          "role": "overall",
          "sourceName": "",
          "sourceUrl": "",
          "licenseHint": "unknown"
        },
        {
          "url": "",
          "alt": "",
          "role": "detail",
          "sourceName": "",
          "sourceUrl": "",
          "licenseHint": "unknown"
        },
        {
          "url": "",
          "alt": "",
          "role": "diagram",
          "sourceName": "",
          "sourceUrl": "",
          "licenseHint": "unknown"
        }
      ],

      "references": [
        {
          "type": "paper",
          "citation": "",
          "url": ""
        }
      ]
    }
  ]
}


Strict Rules:

1) Include only real, verifiable projects and systems.
2) For each project, provide exactly 3 representative and deduplicated images.
3) Each image must include a direct image URL and a source URL.
4) Do not invent projects, images, citations, or URLs.
5) Prefer projects from 2008–present.
6) Use formal academic English in all text fields.
7) Ensure the JSON is syntactically valid and directly parseable.


Usage:

This JSON will be imported directly into a React / Vite website as a dataset
and rendered automatically as project blocks without manual data entry.
