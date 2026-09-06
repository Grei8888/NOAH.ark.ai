# NOAH Intelligence — Product Principles

## 1. Product definition

NOAH Intelligence is not a news aggregation service and not a conventional summarizer.

Its purpose is to identify the small number of real-world changes that matter, explain why they matter, connect them to the user, and support the next decision or action.

Core flow:

`INFORMATION FLOOD → SIGNAL DETECTION → EVENT → SIGNIFICANCE → PERSONAL RELEVANCE → ARK → INTELLIGENCE → ACTION`

## 2. Article is not Event

An Article is a document. An Event is a change in the real world.

Multiple articles may describe the same Event. The primary user-facing unit should therefore be the Event, not the Article.

Articles are evidence and sources. Events are intelligence objects.

## 3. Reduce decision cost

NOAH should not maximize the number of items displayed.

If only four Events matter today, four is better than ten weak items.

Every feature should be judged by this question:

> Does this reduce information overload and improve decision quality, or does it create more noise?

## 4. Intelligence must answer five questions

A useful Event should help the user understand:

1. What changed?
2. Why does it matter?
3. Why is it relevant to me?
4. What opportunity or risk does it create?
5. What should I verify, monitor, or do next?

## 5. AI and Code have different jobs

AI is responsible for semantic judgment:

- meaning
- classification
- impact
- novelty
- significance
- personal relevance
- summary
- opportunity
- risk
- follow-up recommendations

Code is responsible for deterministic operations:

- dates and time windows
- URL normalization
- exact deduplication
- counts
- velocity metrics
- score arithmetic
- grade thresholds
- sorting
- persistence
- idempotency
- scheduling

Do not use AI where deterministic code is more reliable. Do not force deterministic code to imitate semantic judgment.

## 6. Evidence hierarchy

For policy, regulation, administration, public projects, and government programs, official primary sources should be preferred for factual confirmation.

Typical evidence order:

1. Government / public-agency original material
2. Statutes, regulations, notices, implementation rules, official announcements
3. Research or corporate primary material where relevant
4. Reputable reporting
5. Secondary commentary

News reporting can be a strong signal-discovery layer, but it should not automatically be treated as final confirmation of a policy fact.

## 7. Public significance and personal relevance are different

A globally important Event may have low personal relevance. A moderately important Event may be highly relevant to one user.

NOAH should preserve this distinction rather than collapsing both concepts into a single opaque judgment.

Current v0.1 scoring uses Importance and Relevance as separate inputs before Final Score.

## 8. Ark is selective by design

Today's Ark is the set of Events that survive the day's filtering and ranking process.

Ark should:

- contain only sufficiently meaningful Events
- avoid redundant variants of the same Event
- preserve useful category diversity
- never fill a quota merely for visual completeness

## 9. From news to action

The long-term value of NOAH is not better summarization alone.

The system should evolve toward:

- detecting meaningful change early
- explaining implications
- linking related developments across time
- identifying opportunities and risks
- recommending what to verify next
- remembering prior Events and user context
- supporting concrete decisions

## 10. Product test

Before adding a feature, ask:

- Is this showing Articles or understanding Events?
- Does it improve signal quality?
- Does it reduce the user's reading burden?
- Does it make significance or relevance clearer?
- Does it support a decision or next action?

If not, the feature may belong outside the core NOAH experience.

## Principle

**LESS NEWS. MORE SIGNAL. BETTER DECISIONS.**
