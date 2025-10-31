# Landing Page Documentation

## Purpose
Documentation for Pendl landing page - separate from main platform documentation.

## Structure
```
docs/
├── core/              # Essential landing page docs
│   ├── README.md      # This file
│   ├── PRIORITIES.md  # Landing page priorities
│   └── CHANGELOG.md   # Landing page changes
├── sessions/          # Daily work on landing page
│   ├── current/       # Active sessions
│   └── archive/       # Old sessions
└── reference/         # Stable landing page knowledge
```

## Key Files
- **PENDL_LANDING.md** (root) - Strategic narrative and context
- **docs/core/** - Day-to-day operational docs
- **docs/sessions/** - Working notes

## Separation from Platform
This repository maintains its own documentation. Platform documentation lives in:
`/Users/nathanthomas/cashflow-analysis-python/docs/`

## Anti-Patterns to Avoid

1. **File Creation Sprawl**: Creating new files instead of updating existing ones
2. **Documentation Redundancy**: Writing permanent docs for simple changes  
3. **Analysis Paralysis**: Endless exploration without implementation
4. **Premature Success Declaration**: Claiming fixes without browser verification
5. **Priority Duplication**: Adding priorities anywhere except PRIORITIES.md
6. **Context Confusion**: Using outdated information or ignoring recent changes
7. **Over-Proactive Actions**: Doing too much without explicit user request

## File Limits & Guidelines

- **Core files**: 6 maximum (currently at limit)
- **Session files**: Unlimited in current/, archive after 7 days
- **Active sprints**: 1 maximum 
- **Sprint file length**: <100 lines
- **Most other files**: <200 lines
- **ACTIVE_ISSUES.md**: <50 lines (keep minimal)

**Never mix landing page and platform documentation.**