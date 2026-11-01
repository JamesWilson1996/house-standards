# Writing

Applies to everything we write: code comments, READMEs, ADRs, commit messages, PR descriptions, docs, error messages and UI copy.

Write plain statements of fact. Say what the thing is, what it does, or what to do. A reader should get the point from the first sentence.

## Patterns to avoid

These patterns read as generated text. Rewrite them as direct statements.

| Pattern | Example | Write instead |
| --- | --- | --- |
| Contrast framing ("X, not Y", "it's not X, it's Y") | "This is a migration tool, not a backup system." | "This tool runs schema migrations." |
| Negation before the point | "It's not about speed. It's about safety." | "It prevents partial writes." |
| Throat-clearing | "It's worth noting that…", "Importantly,…", "Let's dive in" | Delete it and start with the fact. |
| Inflated words | robust, seamless, powerful, leverage, crucial, delve, elevate, unlock, streamline | Name the concrete property: "retries 3 times", "starts in 200 ms". |
| Groups of three for rhythm | "fast, reliable and scalable" | List only the properties that are true and relevant. |
| Recaps and sign-offs | "In summary,…", "Hope this helps!" | Stop when the content ends. |
| Rhetorical questions | "Why does this matter?" | State why it matters. |
| Hedging stacks | "This could potentially help to improve…" | "This reduces p95 latency by 40 ms." |
| Em-dash chains and colon reveals | "One thing matters: speed." | "Speed matters most." |
| Emoji and exclamation marks | "Done! 🎉" | "Done." |

Use contrast only when the rejected option is a specific mistake the reader is likely to make, and show it concretely, as in a code example: `OrderStatus.Shipped`, never `"shipped"`.

## Habits to keep

- Lead with the fact, decision or instruction. Background comes after, if at all.
- Use numbers, names and units instead of adjectives.
- One idea per sentence; sentences under about 25 words.
- Prefer common words and active verbs: "the service rejects the request", "use", "start", "check".
- Cut any sentence that would leave the meaning unchanged if deleted.
- Match the length to the content. A one-line change gets a one-line commit message.

## Per format

- **Code comments:** the reason the code is this way, in one or two lines (see `practice.md`).
- **Commit messages:** imperative summary under 72 characters ("Add idempotency keys to order commands"), then a short body only if the reason isn't obvious.
- **PR descriptions:** what changed, why, and how it was tested. No headings for a small PR.
- **ADRs:** context, decision, consequences, each in a few plain sentences.
- **Error messages:** what happened and what to do next ("Sync failed. The billing service didn't respond. Try again in a minute.").
- **UI copy:** see the Voice section of the design-system brand book.
