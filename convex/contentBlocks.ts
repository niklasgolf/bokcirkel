import { mutation, query } from "./_generated/server";

import { v } from "convex/values";

export const createContentBlock = mutation({
  args: {
    pageId: v.id("pages"),
    text: v.string(),
    order: v.number(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("contentBlocks", {
      pageId: args.pageId,
      text: args.text,
      order: args.order,
    });
  },
});

export const getContentBlocks = query({
  args: {
    pageId: v.id("pages"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentBlocks")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .collect();
  },
});

export const deleteContentBlock = mutation({
  args: {
    contentBlockId: v.id("contentBlocks"),
  },

  handler: async (ctx, args) => {
    await ctx.db.delete(args.contentBlockId);
  },
});