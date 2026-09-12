import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPage = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    order: v.number(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("pages", {
      title: args.title,
      slug: args.slug,
      order: args.order,
    });
  },
});

export const getPages = query({
  args: {},

  handler: async (ctx) => {
    return await ctx.db.query("pages").collect();
  },
});