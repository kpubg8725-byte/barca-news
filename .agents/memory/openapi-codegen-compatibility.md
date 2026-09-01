---
name: OpenAPI codegen compatibility
description: Compatibility constraint between the repository's Orval generator and its installed Zod version.
---

The generated Zod package currently uses Zod 3, while the installed Orval version can emit `zod.int()` for OpenAPI response fields declared as `integer`. Keep generated response schemas compatible with Zod 3, or deliberately upgrade the Zod generation/runtime pair together.

**Why:** Codegen can complete successfully but fail the TypeScript build when generated response schemas call APIs only available in Zod 4.

**How to apply:** After changing OpenAPI schemas, run the API codegen and the library typecheck before implementing routes; inspect generated Zod output if integer response fields are added.