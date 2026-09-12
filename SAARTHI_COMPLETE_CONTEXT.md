# SAARTHI

## IDEATION ROUND • AI IN BANKING

**Your bank should understand your situation before it offers you a
solution.**

Saarthi is an AI-powered personal banking layer that continuously
understands a customer's real financial life and decides what they need
next, when they need it, and how the bank should say it --- in the
customer's own language, and always with their wellbeing ahead of the
sale.

**Ideation Round • AI in Banking • Problem Understanding, Solution,
Approach & Key Features**

------------------------------------------------------------------------

# 1. Problem Understanding

> **Digital banking has reached almost everyone in India --- but it
> still doesn't understand anyone.**

Banks already hold a goldmine of information: every salary credit, every
EMI, every UPI payment. Yet most customers get the same generic message
--- "Apply for a personal loan!", "You're pre-approved!" --- no matter
what their money is actually telling the bank. The system is built to
ask "What can we sell this customer?" instead of "What is happening in
this person's financial life, and what would genuinely help?"

### This creates three real gaps:

  -----------------------------------------------------------------------
  GAP 01                  GAP 02                  GAP 03
  ----------------------- ----------------------- -----------------------
  **No real               **A language &          **No safety net**
  personalization**       complexity wall**       

  A struggling family and First-time and rural    Banks miss early signs
  a wealthy saver get the users face English,     of financial stress and
  same offers.            jargon (KYC,            fraud. Worse, they
  Recommendations are     eligibility, FOIR) and  sometimes push new
  based on broad          confusing menus. The    loans onto people who
  demographics, not on    barrier isn't access    are already drowning
  what a customer's own   --- it's that the app   --- the opposite of
  transactions reveal.    is too hard to          help.
                          understand and          
                          navigate.               
  -----------------------------------------------------------------------

### THE CORE PROBLEM IN ONE LINE

**Banking is generic, hard to understand, and blind to the customer's
real situation --- because it is designed to sell products, not to
understand people.**

**SAARTHI • AI IN BANKING --- Problem Understanding --- 02**

------------------------------------------------------------------------

# 2. Proposed Solution

Saarthi is not three separate tools bolted together. It is one
intelligent banking layer that sits on top of the customer's data and
does four things, in order:

**Understand → Decide → Assist → Protect**

-   **Understand:** Read the customer's money
-   **Decide:** What do they need now?
-   **Assist:** Help, guide, recommend
-   **Protect:** Catch stress & fraud

### The same brain shows up as three capabilities the customer can feel:

**Opportunity** --- recommends the right product at the right moment
(and only when it truly helps).

**Risk** --- spots financial stress and fraud early, then protects or
supports the customer.

**Interaction** --- talks to the customer naturally, in their own
language, and walks them through banking step by step.

### THE ONE DECISION THAT DEFINES SAARTHI

Saarthi does not always sell something. A good banking guide should
sometimes say, "There is no product you need right now." If the customer
is under financial stress, the loan-upsell is blocked --- even if they
would likely say yes. The customer's wellbeing has higher priority than
product conversion.

Tying it all together is a single Ethics & Consent Guardrail that sits
across every decision --- checking consent, eligibility, whether the
action is non-predatory, and whether Saarthi can explain why in plain
words. This is part of the product's brain, not a side feature.

**SAARTHI • AI IN BANKING --- Proposed Solution --- 03**

------------------------------------------------------------------------

# 3. Approach --- How Saarthi Thinks

Every customer is treated as a financial story over time, not a static
profile. Saarthi runs the same six-step loop for everyone:

### 1. Read the transactions

Salary, rent, EMIs, UPI, groceries, withdrawals --- the raw account
activity.

### 2. Turn data into meaning

Convert raw numbers into signals: income stability, savings rate, EMI
burden (FOIR), spending mix, balance trend, life-stage hints, stress and
fraud signals.

### 3. Decide the customer's state

Place the customer in one of four states (below) --- this decides
Saarthi's whole behaviour.

### 4. Pick the Next Best Action

Choose one: Recommend, Guide, Support, Warn, Verify, Escalate --- or Do
Nothing.

### 5. Run it through the guardrail

Consent? Eligible? Safe? Non-predatory? Explainable? If not --- block
it.

### 6. Communicate & learn

Say it in the customer's language and channel, then learn from what
happens next.

## The four customer states

### 🟢 Healthy

Recommend relevant products, help plan, spot opportunities.

### 🟡 Vulnerable

Ease off selling, show budgeting help and upcoming dues.

### 🔴 Stressed

Block new-loan upsell. Offer support & a human callback.

### 🚨 Fraud-risk

Flag unusual activity, verify, and protect the account.

**SAARTHI • AI IN BANKING --- Approach --- How Saarthi Thinks --- 04**

------------------------------------------------------------------------

# 3. Approach --- Part 2

## When two signals clash, safety always wins

What if a customer asks for a loan but Saarthi also sees rising EMIs and
a missed payment? Saarthi follows a fixed priority so business goals
never override customer welfare:

    Priority Principle
  ---------- ------------------------------------------------
       **1** **Consent** --- customer permission first
       **2** **Fraud / security** --- protect the account
       **3** **Financial distress** --- help, don't sell
       **4** **Essential financial assistance**
       **5** **Eligibility**
       **6** **Customer benefit**
       **7** **Product recommendation**
       **8** **Commercial opportunity --- LOWEST PRIORITY**

### WHY THIS IS BUILDABLE, NOT JUST A NICE IDEA

Start with transparent rules first, add lightweight ML only where it
clearly helps (product ranking, anomaly-based fraud). Prove the
behaviour with synthetic customer personas and 12--24 months of
transaction history that we can inject events into (a missed EMI, an
income drop, a suspicious debit). Philosophy: start explainable →
validate → add ML where it improves the decision.

**SAARTHI • AI IN BANKING --- Governance & Feasibility --- 05**

------------------------------------------------------------------------

# 4. Key Features

### ★ Anti-predatory guardrail

Automatically blocks loan and upsell recommendations for stressed
customers, and switches into support mode instead. Our strongest, most
demo-able ethical feature.

### Next Best Action engine

Doesn't just push products --- decides the single most helpful action
right now, and can choose to do nothing.

### Live financial-state detection

Continuously scores each customer as Healthy, Vulnerable, Stressed or
Fraud-risk from their transactions.

### Vernacular conversational guide

Talk or type in Hindi, Gujarati and more. It navigates the full banking
journey (loan, KYC, documents) --- not just Q&A.

### Separate stress & fraud detection

Two distinct alarms --- "this person needs help" vs "this transaction
looks wrong" --- never confused for each other.

### Plain-language "Why"

Every recommendation and alert comes with a simple, honest reason the
customer can actually understand.

### Right-moment personalization

Acts on behavioural change + timing (e.g. a salary rise, new school
fees) --- not one-size-fits-all demographics.

### Adaptive dashboard

The screen itself changes with the customer's state --- offers when
healthy, support tools when stressed.

## What the prototype will demonstrate --- one customer, one changing story

-   **Act 1 --- Healthy:** Saarthi understands a stable customer and
    makes one well-explained recommendation.
-   **Act 2 --- Stress hits:** we inject a missed EMI; the state flips
    to red, the loan offer disappears, and support appears.
-   **Act 3 --- Vernacular:** the customer switches to Gujarati/Hindi
    and is guided through a banking task naturally.
-   **Act 4 --- Fraud:** an unusual late-night debit triggers an anomaly
    alert and a protection workflow.

### WHY IT MATTERS

One coherent system that makes banking personal (right product, right
time), understandable (any language, plain "why"), and safe (protects
instead of exploiting) --- turning the customer's own data into genuine
help for Bharat.

**SAARTHI • AI IN BANKING --- Key Features --- 06**

------------------------------------------------------------------------

# 5. Conceptual Architecture (data sources → AI engine → action)

Data flows top to bottom through four layers. Nothing reaches the
customer until it clears the guardrail; every action feeds back into the
customer's profile so Saarthi keeps learning.

## ① Data Sources --- consent-gated, inside the bank's environment

-   Transaction history
-   Salary / income credits
-   EMI & repayment records
-   Savings & balance trend
-   Account behaviour
-   KYC / profile
-   Customer chat inputs

↓

## ② Understanding Engine --- turns raw data into meaning

-   Income regularity
-   Savings rate
-   Spending mix
-   EMI burden (FOIR)
-   Balance trend
-   Life-stage signals
-   Stress signals
-   Anomaly signals

↓

## ③ AI Decision Engine --- assigns state & picks the Next Best Action

-   Behavioural segmentation
-   Recommendation engine
-   Stress detection
-   Fraud anomaly detection
-   Vernacular NLP / intent
-   Next-Best-Action selector

↓

## ④ Ethics & Compliance Guardrail --- every action must pass

-   Consent check
-   Eligibility & affordability
-   Anti-predatory rule
-   Bias audit
-   Explainability (the "why")

↓

## ⑤ Personalized Output / Action --- in the customer's language & channel

-   Adaptive dashboard
-   One recommendation + reason
-   Support intervention
-   Fraud alert & verify
-   Conversational guide
-   Human escalation

↺ **Customer action & new transactions feed back into ① --- Saarthi
re-learns continuously.**

**SAARTHI • AI IN BANKING --- Conceptual Architecture --- 07**

------------------------------------------------------------------------

# 6. Prototype Wireframes --- the Customer Journey

## A. Adaptive dashboard --- the same customer, before & after stress

### Healthy state

**Namaste, Ramesh 👋**

**Your financial picture**

  Metric                   Value
  ------------------ -----------
  Income                 ₹42,000
  Essential spend        ₹21,500
  Savings                 ₹8,200
  EMIs                    ₹6,500
  Financial health     🟢 Stable

**Start a long-term savings plan**

**Why?** Your income rose recently and savings stayed steady.

**Learn more**

**🎤 Talk to Saarthi**

### Stressed state

**Namaste, Ramesh 👋**

**Your financial picture**

  Metric                            Value
  ------------------ --------------------
  Income                          ₹42,000
  Essential spend                 ₹28,500
  Savings                          ₹2,100
  EMIs                            ₹11,500
  Financial health     🔴 Needs attention

**Saarthi noticed rising dues**

Your obligations went up and balance is falling. Let's work through it.

**Review spending**\
**Get support**

**✕ No new-loan offers shown**

The interface itself changes with the customer's state --- offers when
healthy, support tools when stressed. That visible switch is the
anti-predatory rule in action.

## B. Vernacular chatbot flow

### 🤖 Saarthi --- Gujarati

**Saarthi:** Namaste, hu Saarthi chu. Tamne shu madad joie?

**Customer:** Mare ghar repair mate loan joiye chhe.

**Saarthi:** Samjyo --- home loan.

**Intent / journey metadata:** intent: loan · lang: Gujarati · journey
started

**Saarthi:** Pehla tamari repayment situation joi lau, pachhi best
option batavu.

### Not a Q&A bot --- a journey navigator

It detects language and intent, loads the customer's context, checks
eligibility & stress before answering, and moves the customer through a
fixed, safe sequence rather than free-wheeling.

If the customer is stressed, the same chat pivots to support instead of
pushing the loan --- one interface, a different decision.

## C. Guided loan journey --- only necessary steps, in plain language

  ----------------------------------------------------------------------------
  1              2           3             4           5           6
  -------------- ----------- ------------- ----------- ----------- -----------
  **Understand   **Ask only  **Check       **Explain   **Guide     **Apply**
  intent**       what's      eligibility & suitable    documents & 
                 needed**    stress**      options**   KYC**       

  ----------------------------------------------------------------------------

Replaces the usual 8-menu maze (Dashboard → Loans → Eligibility →
Documents → KYC → Form...) with a single guided conversation --- cutting
drop-offs for first-time digital users.

**SAARTHI • AI IN BANKING --- Prototype Wireframes --- 08**

------------------------------------------------------------------------

# 7. The AI/ML Approach

**Philosophy:** start explainable, add ML where it measurably helps. A
transparent rules base runs first (so every decision can be justified to
a customer and a regulator); lightweight ML improves ranking and
detection over time. No black box makes an unexplainable customer-facing
call.

  ------------------------------------------------------------------------
  Module                  Technique                What it does for the
                                                   customer
  ----------------------- ------------------------ -----------------------
  **Customer              Behavioural clustering   Groups by real
  segmentation**          (e.g. K-Means) on        behaviour, not
                          spending & income        demographics --- so
                          signals                  advice fits how a
                                                   person actually banks.

  **Product               Rules + eligibility      Picks the one product
  recommendation**        filter, with optional    that genuinely fits, at
                          propensity/ranking model the right moment ---
                                                   not a generic pop-up.

  **Right-moment timing** Trend detection on       Acts when something
                          life-stage signals       changes, so the nudge
                          (salary rise, new school is relevant instead of
                          fees, EMI changes)       random.

  **Financial-stress      Trend/threshold rules on Catches trouble early
  detection**             FOIR, balance decline,   and switches to help
                          missed EMIs              before a default
                                                   happens.

  **Fraud detection**     Anomaly detection vs the Flags unusual activity
                          customer's own normal    and verifies --- kept
                          pattern (amount, time,   fully separate from
                          velocity, merchant)      stress.

  **Vernacular            NLP intent detection +   Understands natural
  assistant**             guided state machine +   speech/text in Indian
                          speech                   languages and guides
                          (Bhashini/Sarvam-class   the journey safely.
                          Indic models)            

  **Explainability**      Reason traces from the   Every recommendation
                          rules +                  and alert carries a
                          feature-attribution      plain-language "why".
                          (e.g. SHAP) on ML parts  
  ------------------------------------------------------------------------

## FEASIBILITY & DATA

For the prototype we use synthetic customer personas with 12--24 months
of transaction history and injectable events (missed EMI, income drop,
suspicious debit) --- no real bank data needed to prove the behaviour.
The same transaction/customer data model plugs into a bank's existing
channels, so it scales without re-plumbing core systems.

**SAARTHI • AI IN BANKING --- AI/ML Approach --- 09**

------------------------------------------------------------------------

# 8. Ethical Safeguards & Regulatory Readiness

Compliance is built into the guardrail (Layer ④), not added afterwards.

  -----------------------------------------------------------------------
  Area                                How Saarthi handles it
  ----------------------------------- -----------------------------------
  **Consent & privacy (DPDP Act       Explicit, purpose-bound consent
  2023)**                             before any data use; customer can
                                      see what's used and withdraw it.
                                      Data minimisation --- only the
                                      signals needed for a decision.

  **Data localization (RBI norms)**   All customer & transaction data
                                      stays and is processed within the
                                      bank's environment in India;
                                      Saarthi runs as a layer inside that
                                      boundary, not an external data
                                      drain.

  **Anti-predatory nudging**          Hard rule: a financially stressed
                                      customer is never shown loan/upsell
                                      offers, even if likely to accept.
                                      Customer welfare outranks
                                      conversion in the decision
                                      priority.

  **Algorithmic bias**                Decisions checked across personas
                                      (income level, region, language,
                                      gender-neutral logic); segmentation
                                      uses behaviour, not protected
                                      attributes. Regular bias audits.

  **Explainability**                  Every customer-facing action has a
                                      human-readable reason and an
                                      internal reason trace ---
                                      supporting fair-lending and RBI
                                      explainability expectations.

  **Empathetic (not punitive)         Stress triggers support, budgeting
  intervention**                      help and restructuring options ---
                                      not an immediate default flag.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 9. How Saarthi Meets the Judging Criteria

  -----------------------------------------------------------------------
  Criterion                           Where Saarthi delivers
  ----------------------------------- -----------------------------------
  **Innovation & technical            One "Next Best Action" brain across
  feasibility**                       three capabilities; rules-first +
                                      light ML on synthetic personas ---
                                      buildable and demoable.

  **Personalization vs genuine        Behaviour-based, right-moment
  benefit**                           advice --- and the willingness to
                                      recommend nothing or offer support
                                      instead of upselling.

  **Explainability & RBI compliance** Plain-language "why" on every
                                      action; consent, DPDP, data
                                      localization and bias audits inside
                                      the guardrail.

  **Usability for vernacular /        Voice + text in Indian languages,
  non-tech users**                    guided journeys, and a dashboard
                                      that speaks in outcomes, not
                                      jargon.

  **Scalability & impact**            Common data model plugs into
                                      existing bank channels; protects
                                      and includes underserved Bharat
                                      customers.
  -----------------------------------------------------------------------

**SAARTHI • Understand → Decide → Assist → Protect • The customer's
wellbeing comes before the sale.**

**SAARTHI • AI IN BANKING --- Ethical Safeguards & Judging Criteria ---
10**

------------------------------------------------------------------------

## END OF SOURCE CONTENT

This Markdown version preserves the source document's textual content,
section order, examples, tables, labels, terminology, and prototype
flows, with the original PDF's visual layout translated into Markdown
structure.
