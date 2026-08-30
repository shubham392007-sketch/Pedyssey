import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from core.constants import ResponseMode, ActionMode, ExplainLevel

logger = logging.getLogger(__name__)


class ModeService:
    """Centralized service for multi-mode parameters, prompt templates,
    structured output post-processing, and conversational follow-ups.
    """

    @staticmethod
    def get_mode_config(
        mode: str = ResponseMode.QUICK.value,
        action: Optional[str] = None,
        explain_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """Returns retrieval depths, generation budgets, temperatures, and stage labels."""
        from services.hardware_service import HardwareService
        mode_lower = (mode or "quick").lower()
        limits = HardwareService.get_mode_limits(mode_lower)
        
        configs = {
            ResponseMode.QUICK.value: {
                "num_ctx": limits.get("num_ctx", 32768),
                "num_predict": limits.get("num_predict", 4096),
                "top_k": 20,
                "rerank_top_k": 5,
                "temperature": 0.10,
                "stages": [
                    "Searching FAISS & BM25 indices...",
                    "Cross-Encoder neural reranking...",
                    "Synthesizing direct grounded answer..."
                ],
                "stage_label": "Retrieving from your document..."
            },
            ResponseMode.THINK.value: {
                "num_ctx": limits.get("num_ctx", 65536),
                "num_predict": limits.get("num_predict", 12288),
                "top_k": 40,
                "rerank_top_k": 10,
                "temperature": 0.15,
                "stages": [
                    "Understanding core question & query expansion...",
                    "Searching vector space & lexical indices across sections...",
                    "Cross-referencing evidence & analyzing multi-step logic...",
                    "Formulating careful, reasoned synthesis..."
                ],
                "stage_label": "Thinking through the document..."
            },
            ResponseMode.DEEP_RESEARCH.value: {
                "num_ctx": limits.get("num_ctx", 65536),
                "num_predict": limits.get("num_predict", 16384),
                "top_k": 60,
                "rerank_top_k": 18,
                "temperature": 0.20,
                "stages": [
                    "Understanding question & decomposing facets...",
                    "Searching document (Multi-pass retrieval)...",
                    "Analyzing evidence & grouping sections...",
                    "Cross-checking sections & experimental setup...",
                    "Generating comprehensive research report...",
                    "Checking completeness & verifying citations..."
                ],
                "stage_label": "Researching your document..."
            },
            ResponseMode.STUDY.value: {
                "top_k": 40,
                "rerank_top_k": 10,
                "num_predict": 2560,
                "temperature": 0.15,
                "stages": [
                    "Scanning document for key definitions & concepts...",
                    "Structuring revision outlines & learning checkpoints...",
                    "Generating interactive study materials..."
                ],
                "stage_label": "Building study materials..."
            },
            ResponseMode.RESEARCH.value: {
                "top_k": 45,
                "rerank_top_k": 12,
                "num_predict": 3072,
                "temperature": 0.15,
                "stages": [
                    "Extracting research problem & theoretical background...",
                    "Auditing methodology, architectures & datasets...",
                    "Cataloging metrics, experimental results & references..."
                ],
                "stage_label": "Analyzing research structure..."
            },
            ResponseMode.EXPLAIN.value: {
                "top_k": 30,
                "rerank_top_k": 8,
                "num_predict": 2048,
                "temperature": 0.15,
                "stages": [
                    "Extracting core mechanisms & definitions...",
                    f"Calibrating explanation for {explain_level or 'technical'} depth...",
                    "Synthesizing clear pedagogical explanation..."
                ],
                "stage_label": "Simplifying concept..."
            },
            ResponseMode.COMPARE.value: {
                "top_k": 50,
                "rerank_top_k": 14,
                "num_predict": 3072,
                "temperature": 0.15,
                "stages": [
                    "Retrieving comparative passages across documents...",
                    "Aligning metrics, methods, strengths & trade-offs...",
                    "Structuring comprehensive comparison matrix..."
                ],
                "stage_label": "Comparing documents & sections..."
            },
            ResponseMode.ANALYZE.value: {
                "top_k": 40,
                "rerank_top_k": 10,
                "num_predict": 2560,
                "temperature": 0.15,
                "stages": [
                    "Extracting primary author claims & assumptions...",
                    "Cross-checking supporting evidence vs experimental validation...",
                    "Synthesizing critical evaluation & potential biases..."
                ],
                "stage_label": "Evaluating evidence & claims..."
            },
            ResponseMode.VERIFY.value: {
                "top_k": 45,
                "rerank_top_k": 12,
                "num_predict": 2048,
                "temperature": 0.10,
                "stages": [
                    "Isolating target claim...",
                    "Scanning full document index for supporting and contradictory evidence...",
                    "Comparing claim against retrieved factual passages...",
                    "Determining verification verdict & citation audit..."
                ],
                "stage_label": "Verifying against document..."
            },
        }

        config = configs.get(mode_lower, configs[ResponseMode.QUICK.value])
        
        # Action-specific adjustments
        if action == ActionMode.FLASHCARDS.value:
            config["num_predict"] = 2048
            config["stages"] = ["Extracting core Q&A concepts...", "Structuring interactive flashcards..."]
        elif action == ActionMode.QUIZ.value:
            config["num_predict"] = 2560
            config["stages"] = ["Formulating multiple-choice questions...", "Verifying answer keys against source pages..."]
        elif action == ActionMode.SUMMARIZE.value:
            config["top_k"] = 50
            config["rerank_top_k"] = 12
            config["num_predict"] = 2560
            config["stages"] = ["Reading full document sections...", "Synthesizing executive summary & key findings..."]

        return config

    @staticmethod
    def get_mode_prompt_instruction(
        mode: str = ResponseMode.QUICK.value,
        action: Optional[str] = None,
        explain_level: Optional[str] = None,
        target_language: Optional[str] = None,
        quiz_config: Optional[dict] = None
    ) -> str:
        """Returns specific instruction guidance to be injected into the prompt."""
        mode_lower = (mode or "quick").lower()

        # 1. Action-specific instructions
        if action == ActionMode.FLASHCARDS.value:
            return """
### MODE INSTRUCTION: FLASHCARDS GENERATION
Create 4 to 8 high-yield flashcards covering key concepts from the document.
Output format MUST strictly include a JSON block enclosed in ```json ... ``` with this exact structure:
```json
[
  {
    "front": "Clear question or term to test understanding",
    "back": "Concise, grounded explanation strictly derived from the document",
    "page": 12,
    "topic": "Core Concept Name"
  }
]
```
Also provide a brief introductory study tip before the JSON block.
"""

        if action == ActionMode.QUIZ.value:
            q_count = quiz_config.get("count", 5) if quiz_config else 5
            q_diff = quiz_config.get("difficulty", "medium") if quiz_config else "medium"
            return f"""
### MODE INSTRUCTION: INTERACTIVE QUIZ GENERATION
Generate an interactive {q_diff} difficulty quiz with {q_count} questions based strictly on the retrieved document evidence.
Output format MUST include a valid JSON block enclosed in ```json ... ``` with this exact structure:
```json
[
  {{
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Detailed explanation grounded in the text",
    "page": 7,
    "topic": "Topic Name"
  }}
]
```
Ensure all questions have exactly 4 options and `correct_index` is an integer from 0 to 3.
"""

        if action == ActionMode.SUMMARIZE.value:
            return """
### MODE INSTRUCTION: COMPREHENSIVE DOCUMENT SUMMARY
Provide a structured executive summary strictly using the retrieved evidence:
1. **TL;DR**: 2-3 sentence overview.
2. **Key Objectives & Core Problem**: What problem is addressed.
3. **Core Methodology & Architecture**: Primary mechanisms and techniques.
4. **Key Findings & Results**: Validated metrics and outcomes.
5. **Limitations & Future Work**: Known constraints.
Include exact page citations for each section.
"""

        if action == ActionMode.TUTOR.value:
            return """
### MODE INSTRUCTION: INTERACTIVE LOCAL TUTOR
Act as an encouraging, rigorous local Socratic tutor:
1. Break down the user's question into intuitive, progressive conceptual steps.
2. Explain the foundational concept first with an intuitive analogy or clear definition.
3. Ask a brief check-for-understanding question at the end: *"Ready for the next concept or would you like to explore this further?"*
4. Keep all explanations grounded in the uploaded document with page citations.
"""

        if action == ActionMode.TRANSLATE.value:
            lang = target_language or "Hindi"
            return f"""
### MODE INSTRUCTION: DOCUMENT TRANSLATION ({lang.upper()})
1. Translate the relevant retrieved document content and answer into {lang}.
2. Preserve technical names, equations, acronyms, and model names in their standard form.
3. Provide the grounded response in {lang}, followed by a brief bilingual summary with page citations.
"""

        if action == ActionMode.WRITE.value:
            return """
### MODE INSTRUCTION: STRUCTURED WRITING ASSISTANT
Generate polished, publication-grade written material based strictly on the document evidence (e.g. study notes, literature review draft, executive brief). Maintain rigorous citation integrity.
"""

        if action == ActionMode.REVIEW.value:
            return """
### MODE INSTRUCTION: DOCUMENT AUDIT & CONSISTENCY REVIEW
Review the retrieved document evidence for potential inconsistencies, conflicting numbers, methodological gaps, unsupported assertions, or terminology variations. If an inconsistency is detected, cite both conflicting passages with their page numbers.
"""

        if action == ActionMode.EXTRACT.value:
            return """
### MODE INSTRUCTION: STRUCTURED INFORMATION EXTRACTION
Extract structured entities from the retrieved document context.
Organize into categorized Markdown tables:
- **Models & Architectures** (Name, Purpose, Page)
- **Datasets & Benchmarks** (Dataset, Size/Type, Page)
- **Algorithms & Equations** (Name, Formula/Details, Page)
- **Key Metrics & Results** (Metric, Baseline, Proposed, Page)
"""

        # 2. Primary & Explore Mode Instructions
        if mode_lower == ResponseMode.QUICK.value:
            return """
### MODE INSTRUCTION: QUICK MODE
- Provide a direct, concise, factual response.
- Answer the specific question immediately in the first paragraph.
- Reference verified page numbers (e.g., [Page 4]).
"""

        if mode_lower == ResponseMode.THINK.value:
            return """
### MODE INSTRUCTION: THINK MODE (REASONING & SYNTHESIS)
- Synthesize evidence logically across multiple sections.
- Provide a structured step-by-step reasoning summary before stating the conclusion.
- If comparison or trade-offs are involved, detail the advantages, disadvantages, and rationales documented in the paper.
- Never output raw chain-of-thought tokens; provide a clean, articulated explanation with explicit page citations.
"""

        if mode_lower == ResponseMode.DEEP_RESEARCH.value:
            return """
### MODE INSTRUCTION: DEEP RESEARCH MODE (COMPREHENSIVE MULTI-SECTION REPORT)
Conduct an exhaustive, publication-grade document research investigation strictly derived from the retrieved evidence across all pages.
You MUST format your comprehensive answer with the following structured sections (include all that are relevant to the inquiry):
## Executive Summary
## Research Problem & Objectives
## Theoretical Background
## Methodology & Architecture
## Experimental Setup & Datasets
## Key Findings & Results (use Markdown tables for quantitative comparisons & benchmarks)
## Strengths & Innovations
## Limitations & Threats to Validity
## Critical Observations
## Conclusion
## Sources & Verified Page Citations (list verified page numbers and corresponding concepts)

Do not truncate or stop halfway; synthesize a complete, rigorous investigation grounded strictly in the document evidence.
"""

        if mode_lower == ResponseMode.STUDY.value:
            return """
### MODE INSTRUCTION: STUDY MODE
- Format the response as high-yield educational study notes.
- Use clear bullet points, bold key terms, and define essential concepts.
- Include a **Key Takeaways** section and a **Self-Test Review Question** with page references.
"""

        if mode_lower == ResponseMode.RESEARCH.value:
            return """
### MODE INSTRUCTION: ACADEMIC RESEARCH ANALYSIS
- Structure the analysis in standard academic review format:
  1. **Research Problem & Motivation**
  2. **Proposed Innovation & Theoretical Contribution**
  3. **Methodology, Algorithms & Architecture**
  4. **Empirical Results, Datasets & Baselines**
  5. **Limitations, Unaddressed Questions & Future Work**
  6. **Key References & Cited Works** (if present in context)
"""

        if mode_lower == ResponseMode.EXPLAIN.value:
            lvl = (explain_level or "technical").lower()
            if lvl == "beginner":
                return """
### MODE INSTRUCTION: EXPLAIN (BEGINNER LEVEL)
- Explain the concept in clear, accessible language using an intuitive real-world analogy.
- Avoid heavy jargon where simple explanations suffice, while maintaining conceptual truth to the document.
- Cite the source page where the concept is introduced.
"""
            elif lvl == "intermediate":
                return """
### MODE INSTRUCTION: EXPLAIN (INTERMEDIATE LEVEL)
- Explain the concept clearly for an undergraduate or technical reader without excessive mathematics.
- Walk through the high-level system components and why they are structured this way.
- Include page citations for all core mechanisms.
"""
            elif lvl == "expert":
                return """
### MODE INSTRUCTION: EXPLAIN (EXPERT LEVEL)
- Provide deep architectural, mathematical, and algorithmic rigor strictly supported by the document.
- Detail equations, hyper-parameters, loss functions, or system invariants present in the text.
- Analyze edge cases and trade-offs documented by the authors.
"""
            else:
                return """
### MODE INSTRUCTION: EXPLAIN (TECHNICAL LEVEL)
- Explain with standard technical vocabulary, component diagrams, and formal definitions.
- Detail the input, processing steps, and output transformations.
- Cite exact pages for each stage.
"""

        if mode_lower == ResponseMode.COMPARE.value:
            return """
### MODE INSTRUCTION: COMPARATIVE ANALYSIS
- Compare the requested concepts, models, or documents side-by-side.
- You MUST provide a structured GitHub-Flavored Markdown comparison table with columns:
  | Dimension / Aspect | Approach A | Approach B | Page Citations |
  | --- | --- | --- | --- |
- Highlight distinct trade-offs, performance differences, and limitations.
"""

        if mode_lower == ResponseMode.ANALYZE.value:
            return """
### MODE INSTRUCTION: CRITICAL ANALYSIS
- Perform a critical audit of the methodology, claims, and conclusions:
  - **Core Claims vs Verified Evidence**: Are assertions supported by data?
  - **Methodological Soundness**: Are baselines appropriate?
  - **Potential Threats to Validity**: Confounders, dataset limitations, or synthetic data reliance.
  - **Strengths & Weaknesses**: Objective breakdown.
"""

        if mode_lower == ResponseMode.VERIFY.value:
            return """
### MODE INSTRUCTION: FACT VERIFICATION
- Verify the specific claim against the uploaded document.
- Structure your response exactly as follows:
  ### VERDICT: [SUPPORTED | PARTIALLY SUPPORTED | CONTRADICTED | INSUFFICIENT EVIDENCE]
  **Target Claim**: <restatement of claim>
  **Primary Source**: [Page X]
  **Supporting Evidence**: <verbatim passage or summary of relevant text>
  **Contradictory / Qualifying Evidence**: <any caveats, limitations, or differing results in text>
  **Analysis**: <clear objective conclusion explaining why the verdict was chosen>
"""

        return ""

    @staticmethod
    def evaluate_evidence_quality(reranked_chunks: List[Any]) -> str:
        """Evaluates evidence quality into STRONG, MODERATE, LIMITED, or INSUFFICIENT EVIDENCE."""
        if not reranked_chunks:
            return "INSUFFICIENT EVIDENCE"
        
        scores = [getattr(c, 'rerank_score', 0.0) or 0.0 for c in reranked_chunks]
        high_quality_count = sum(1 for s in scores if s >= 0.25)
        
        if high_quality_count >= 3 or (len(scores) >= 3 and max(scores) >= 0.5):
            return "STRONG EVIDENCE"
        elif high_quality_count >= 1 or (scores and max(scores) >= 0.15):
            return "MODERATE EVIDENCE"
        elif scores and max(scores) > 0.0:
            return "LIMITED EVIDENCE"
        else:
            return "INSUFFICIENT EVIDENCE"

    @staticmethod
    def generate_follow_ups(question: str, answer: str, mode: str) -> List[str]:
        """Generates 2-4 contextual follow-up questions."""
        q_lower = question.lower()
        follow_ups = []

        if "method" in q_lower or "architecture" in q_lower or "how" in q_lower:
            follow_ups.append("What are the main limitations of this approach?")
            follow_ups.append("What experimental datasets and baselines were evaluated?")
            follow_ups.append("Summarize the key results in a comparison table.")
        elif "result" in q_lower or "accuracy" in q_lower or "benchmark" in q_lower:
            follow_ups.append("How does this compare against baseline models?")
            follow_ups.append("What are the potential failure cases or trade-offs?")
            follow_ups.append("What future research directions are suggested?")
        elif "dataset" in q_lower or "training" in q_lower:
            follow_ups.append("What were the key evaluation metrics used?")
            follow_ups.append("How was the dataset preprocessed and partitioned?")
        elif mode == ResponseMode.STUDY.value:
            follow_ups.append("Generate flashcards for this topic.")
            follow_ups.append("Create a 5-question quiz on key concepts.")
            follow_ups.append("Explain the core formula in beginner terms.")
        elif mode == ResponseMode.VERIFY.value:
            follow_ups.append("Verify the experimental methodology.")
            follow_ups.append("Check if any contradictory results are mentioned.")
        else:
            follow_ups.append("Explain the core methodology in detail.")
            follow_ups.append("What are the primary strengths and weaknesses?")
            follow_ups.append("List all references and cited authors.")

        return follow_ups[:4]

    @staticmethod
    def parse_structured_data(content: str, mode: str, action: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Extracts JSON blocks for quizzes, flashcards, or verification badges if present."""
        if not content:
            return None
        
        # 1. Parse JSON blocks for Flashcards or Quizzes (fenced or raw)
        json_matches = [
            re.search(r'```(?:json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```', content, re.DOTALL),
            re.search(r'(\[\s*\{[\s\S]*?\}\s*\])', content, re.DOTALL)
        ]
        
        for match in json_matches:
            if match:
                try:
                    parsed_json = json.loads(match.group(1))
                    if isinstance(parsed_json, list) and len(parsed_json) > 0:
                        first = parsed_json[0]
                        if isinstance(first, dict):
                            # Flashcards detection
                            if "front" in first or "back" in first or action == ActionMode.FLASHCARDS.value:
                                return {"type": "flashcards", "items": parsed_json}
                            
                            # Quiz detection & normalization
                            if "options" in first or "question" in first or action == ActionMode.QUIZ.value:
                                normalized_questions = []
                                for idx, q in enumerate(parsed_json):
                                    if not isinstance(q, dict):
                                        continue
                                    opts = q.get("options") or q.get("choices") or q.get("answers") or []
                                    c_idx = q.get("correct_index", q.get("answer_index", 0))
                                    # Convert 1-indexed or string letters ('A', 'B') to 0-3 int
                                    if isinstance(c_idx, str):
                                        c_idx = ord(c_idx.upper()) - 65 if c_idx.upper() in 'ABCD' else 0
                                    elif isinstance(c_idx, int) and c_idx >= 1 and c_idx > len(opts) - 1:
                                        c_idx = c_idx - 1  # 1-indexed fallback
                                    c_idx = max(0, min(len(opts) - 1 if opts else 3, int(c_idx)))
                                    
                                    normalized_questions.append({
                                        "id": q.get("id", idx + 1),
                                        "question": q.get("question", f"Question {idx + 1}"),
                                        "options": opts if len(opts) >= 2 else ["Option A", "Option B", "Option C", "Option D"],
                                        "correct_index": c_idx,
                                        "explanation": q.get("explanation", ""),
                                        "page": q.get("page", 1),
                                        "topic": q.get("topic", "Core Concept")
                                    })
                                if normalized_questions:
                                    return {"type": "quiz", "questions": normalized_questions}
                except Exception as e:
                    logger.debug(f"JSON parse attempt failed: {e}")

        # 2. Parse Verification Verdict
        if mode == ResponseMode.VERIFY.value or "### VERDICT:" in content:
            verdict_match = re.search(r'###\s*VERDICT:\s*\[?(SUPPORTED|PARTIALLY SUPPORTED|CONTRADICTED|INSUFFICIENT EVIDENCE)\]?', content, re.IGNORECASE)
            if verdict_match:
                verdict = verdict_match.group(1).upper()
                return {"type": "verification", "verdict": verdict}

        return None
