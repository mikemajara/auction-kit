# Next Steps - Moving to Week 1

## ✅ Week 0.5 Complete!

The POC is done and all tests are passing. The core settlement algorithm is validated.

## 🚀 Ready to Start Week 1

### Quick Start for Week 1, Day 1

```bash
cd /Users/miguel/github/mikemajara/auction-kit/packages/core
```

Create these files in order:

1. **`src/types.ts`** - Start here!
   - Copy types from `pm/plan.md` (lines 94-139)
   - Already well-defined in the plan
   - No budget constraint fields

2. **`src/types.test.ts`** - Validate types work
   - Basic type checking tests
   - Ensure all fields are required/optional correctly

3. **`src/ranker.ts`** - Expand POC ranking
   - Start with `poc.ts` `rankBids()` function
   - Add random tie-breaking support
   - Keep timestamp tie-breaking

4. **`src/ranker.test.ts`** - Test both tie-break methods
   - Timestamp tests (already have these in POC)
   - Random tests (new)
   - Edge cases

### Week 1 Implementation Order

**Day 1-2: Types & Ranking**

```
types.ts → types.test.ts → ranker.ts → ranker.test.ts
```

**Day 3-4: Settlement & Validation**

```
settler.ts → settler.test.ts → validator.ts → validator.test.ts
```

**Day 5-7: Database**

```
../drizzle/src/schema.ts → queries.ts → integration.test.ts
```

### What to Copy from POC

The POC has working implementations you can expand:

- `poc.ts` `rankBids()` → `ranker.ts` `rankBids()`
- `poc.ts` `settleBidsSimple()` → `settler.ts` `settleBids()`
- POC tests → Expanded test suites

### New Features to Add

1. **Random tie-breaking** (in addition to timestamp)
2. **Comprehensive validation** (new validator.ts)

### Code Templates Ready

Check `pm/plan.md` for:

- Full type definitions (lines 94-139)
- `settleBids()` implementation skeleton (lines 200-247)
- Database schema (lines 146-192)
- API routes (lines 252-296)

### Testing Strategy

Week 0.5: 10 tests ✅
Week 1 Target: 100+ tests

Test categories:

- Empty/null cases
- Single bidder
- Multiple bidders
- Tie-breaking (timestamp & random)
- First-price vs second-price
- Multi-unit scenarios
- Edge cases (same bid same time, etc.)

## Commands You'll Use

```bash
# Watch tests during development
pnpm test:watch

# Run all tests
pnpm test

# Type check
pnpm type-check

# Build
pnpm build
```

## Questions to Answer in Week 1

1. **Multi-unit: All tied bidders win, or still break ties?**
   - Suggest: Still break ties, just allow N winners

2. **Random tie-breaking: Seed for reproducibility?**
   - Suggest: Accept optional seed parameter

3. **Validation: Throw errors or return results with errors array?**
   - Already decided: Return `ResolutionResult` with `errors[]`

## File to Create First

**packages/core/src/types.ts**

Just copy from the plan and remove budget constraint references:

- Remove `budgetConstraints` from `AuctionConfig`
- Remove `balance` from `Bidder`
- Remove `refunds` from `Settlement`

## When You're Ready

```bash
cd /Users/miguel/github/mikemajara/auction-kit
code packages/core/src/types.ts  # or your editor
```

Then run tests continuously:

```bash
cd packages/core && pnpm test:watch
```

---

**Current Status:** Week 0.5 ✅ Complete
**Next:** Week 1, Day 1 - Create `types.ts`
**Goal:** Full core implementation by end of Week 1
