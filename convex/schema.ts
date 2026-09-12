import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    title: v.string(),
    slug: v.string(),
    order: v.number(),
  }),

  contentBlocks: defineTable({
    pageId: v.id("pages"),
    text: v.string(),
    order: v.number(),
  }),
});