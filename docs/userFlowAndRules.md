# User Flow and Model Rules

# Preference Elicitation User Flow

This document defines the interaction flow and behavioral rules for the preference elicitation experience.

The purpose of this flow is to collect meaningful user information through a guided and adaptive conversation before repository recommendations are generated.

Refer to `preferenceElicitationStrategy.md` for the complete elicitation strategy and conversational framework.

---

# Flow Overview

The preference elicitation experience begins immediately after the user enters the onboarding flow.

The interaction should feel lightweight, conversational, and progressive.

Avoid making the experience feel like a traditional survey or multi-step form.

---

# Step 1 — Entry Point

When the user clicks the **"Get Started"** button on the home page:

* transition into the preference elicitation flow
* display the first question defined in `preferenceElicitationStrategy.md`
* initialize a new conversation state for storing responses

The interaction begins with the opening question and progresses adaptively from there.

---

# Step 2 — Question Interface Behavior

Each question screen should contain:

* question text
* user input field
* primary action button

The primary action button must use the label:

**Continue**

Maintain this label consistently throughout the elicitation flow.

Do not change button wording between steps.

---

# Step 3 — Input Validation

The **Continue** button should remain in a disabled state until the user provides input.

Rules:

* empty submissions are not allowed
* whitespace-only responses are not allowed
* user must provide a valid response before progressing

The system should encourage thoughtful responses without forcing excessive length.

Users should be able to respond naturally using short or long answers.

---

# Step 4 — Question Progression

When the user clicks **Continue**:

1. Save the current response
2. Append the response to conversation history
3. Send all previously collected responses to the model
4. Request the next question from the model
5. Render the next question

The model must receive the **full elicitation context**, not only the most recent response.

This ensures:

* conversational continuity
* contextual follow-up questions
* stronger personalization
* reduced repetition

The conversation should evolve progressively based on cumulative understanding.

---

# Step 5 — Adaptive Question Generation

The model determines whether additional questions are needed.

Question generation must follow the strategy defined in:

`preferenceElicitationStrategy.md`

The model should:

* analyze all collected responses
* identify remaining uncertainty
* ask only necessary follow-up questions
* avoid redundant questioning
* maintain conversational flow

Questioning should remain concise and purposeful.

The system should avoid over-interviewing users.

Maximum flow:

* 1 opening question
* 3–4 adaptive follow-up questions

The model may finish earlier if sufficient information has already been collected.

---

# Step 6 — Completion State

When the model determines that preference elicitation is complete:

* Stop question generation
* Finalize the preference elicitation conversation
* Transition into repository matchmaking

Do not transition to a temporary completion screen.

Do not display:

**Completed.**

Instead, immediately begin repository recommendation generation.
Reference the matchMakingEngine.md file.

---

# Conversation State Requirements

Maintain conversation state throughout the flow.

Store:

* all user responses
* question history
* model-generated follow-ups
* completion status

The model should always operate with full conversational memory for the current session.

Do not treat questions as isolated interactions.

This is a single evolving conversation.

---

# Model Rules

These rules govern model behavior during preference elicitation.

---

## Model Selection

Use:

**OpenAI gpt-5.4-nano**

This model is responsible for:

* interpreting user responses
* identifying uncertainty
* generating adaptive follow-up questions
* determining completion readiness

---

## Model Input Requirements

The model must receive:

* current user response
* all prior user responses
* question history
* relevant system instructions
* `preferenceElicitationStrategy.md`

Do not send only the most recent answer.

Adaptive questioning depends on full conversational context.

---

## Model Responsibilities

The model must:

1. Interpret user intent and preferences
2. Generate context-aware follow-up questions
3. Follow the adaptive questioning strategy
4. Avoid generic survey behavior
5. Determine when sufficient information has been collected
6. Signal completion when questioning is no longer necessary

The model should behave as a conversational guide rather than a questionnaire engine.

---

# Success Criteria

The elicitation flow is successful when:

* users feel guided rather than surveyed
* questions feel personalized
* redundant questioning is avoided
* sufficient information is collected efficiently
* completion occurs within a short conversational flow
* the interaction produces a strong foundation for matchmaking
