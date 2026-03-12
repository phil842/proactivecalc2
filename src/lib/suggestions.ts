/**
 * Suggestion generation pipeline.
 *
 * Combines: user interests + context + templates + scoring + LLM fill-in
 * to produce a list of ActivityInstances to surface to the user.
 */

import { prisma } from "./prisma";
import { buildContext, type AppContext } from "./context";
import {
  ACTIVITY_TEMPLATES,
  type TemplateDefinition,
  templateFitsTime,
} from "./templates";
import {
  rankCandidates,
  type CandidateSuggestion,
} from "./scoring";
import { fillTemplateWithLLM } from "./openai";

/** Build a human-readable title by substituting [interest] in the template name */
function fillTitle(template: TemplateDefinition, interest: string): string {
  return template.name.replace(/\[interest\]/gi, interest);
}

/** Build a human-readable description */
function fillDescription(template: TemplateDefinition, interest: string): string {
  return template.description.replace(/\[interest\]/gi, interest);
}

/**
 * Generate or refresh the suggestion feed for a user.
 *
 * Steps:
 * 1. Load user + their interests
 * 2. Build current context
 * 3. Build candidates: all (template × interest) pairs that fit the context
 * 4. Score and rank candidates
 * 5. For LLM templates, optionally enrich the top suggestions
 * 6. Persist as ActivityInstances and return them
 */
export async function generateSuggestions(
  userId: string,
  ctx?: AppContext
): Promise<string[]> { // returns array of ActivityInstance IDs
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const interests: string[] = JSON.parse(user.interests);
  if (interests.length === 0) return [];

  const context = ctx ?? buildContext();

  // Fetch recent activity instances to penalise repeat templates
  const recentActivities = await prisma.activityInstance.findMany({
    where: {
      userId,
      suggestedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { templateId: true },
    orderBy: { suggestedAt: "desc" },
    take: 20,
  });
  const recentTemplateIds = recentActivities.map((a) => a.templateId);

  // Mark any currently-pending suggestions as stale (archived) so we get a fresh feed
  await prisma.activityInstance.updateMany({
    where: { userId, status: "pending" },
    data: { status: "stale" as string },
  });

  // Build candidate list
  const candidates: CandidateSuggestion[] = [];
  for (const interest of interests) {
    for (const template of ACTIVITY_TEMPLATES) {
      const appliesTo =
        template.interestTags.includes("*") ||
        template.interestTags.includes(interest.toLowerCase());
      if (!appliesTo) continue;
      if (!templateFitsTime(template, context.availableMinutes)) continue;
      candidates.push({ templateId: template.id, interest, template });
    }
  }

  // Score and rank (get top 10)
  const ranked = rankCandidates(candidates, context, recentTemplateIds, 10);

  // Deduplicate: keep only one interest per template type for diversity
  const seenTemplates = new Set<string>();
  const diversified: typeof ranked = [];
  for (const item of ranked) {
    if (!seenTemplates.has(item.template.id)) {
      diversified.push(item);
      seenTemplates.add(item.template.id);
    }
    if (diversified.length >= 7) break;
  }

  // Create ActivityInstances
  const createdIds: string[] = [];
  for (const item of diversified) {
    const estimatedTime = Math.min(
      item.template.maxDuration,
      Math.max(item.template.minDuration, context.availableMinutes)
    );

    let title = fillTitle(item.template, item.interest);
    let description = fillDescription(item.template, item.interest);
    let resourceUrl: string | undefined;

    // Attempt LLM enrichment for llm-type templates
    if (item.template.generatorType === "llm") {
      const llmFill = await fillTemplateWithLLM(
        item.template.name,
        item.template.description,
        item.interest,
        estimatedTime
      );
      if (llmFill) {
        title = llmFill.title;
        description = llmFill.description;
        resourceUrl = llmFill.resourceUrl;
      }
    }

    const instance = await prisma.activityInstance.create({
      data: {
        userId,
        templateId: item.template.id,
        title,
        description,
        estimatedTime,
        resourceUrl: resourceUrl ?? null,
        status: "pending",
      },
    });
    createdIds.push(instance.id);
  }

  return createdIds;
}
