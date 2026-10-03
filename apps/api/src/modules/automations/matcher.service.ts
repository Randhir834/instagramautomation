import { Injectable } from '@nestjs/common';
import type { Automation, AutomationStep, MatchType, TriggerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AutomationWithSteps = Automation & { steps: AutomationStep[] };

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Pure keyword check, exported for unit tests. */
export function matchesKeywords(text: string, keywords: string[], matchType: MatchType): boolean {
  const haystack = normalize(text);
  return keywords.some((raw) => {
    const keyword = normalize(raw);
    if (!keyword) return false;
    return matchType === 'EXACT' ? haystack === keyword : haystack.includes(keyword);
  });
}

/**
 * Picks the one automation that should answer.
 * A rule written for this exact post beats an "all posts" rule; ties go to the oldest.
 */
export function pickBest<T extends Pick<Automation, 'postId' | 'createdAt'>>(
  matches: T[],
): T | undefined {
  return [...matches].sort((a, b) => {
    const specific = Number(b.postId !== null) - Number(a.postId !== null);
    return specific !== 0 ? specific : a.createdAt.getTime() - b.createdAt.getTime();
  })[0];
}

@Injectable()
export class MatcherService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds the active automation on an account that matches an incoming text.
   * `postId` is the media the comment was left on (undefined for DMs).
   * An automation with postId = null applies to all posts.
   */
  async findMatch(params: {
    igAccountId: string;
    triggerType: TriggerType;
    text: string;
    postId?: string;
  }): Promise<AutomationWithSteps | undefined> {
    const candidates = await this.prisma.automation.findMany({
      where: {
        igAccountId: params.igAccountId,
        isActive: true,
        triggerType: params.triggerType,
        ...(params.triggerType === 'COMMENT'
          ? { OR: [{ postId: null }, ...(params.postId ? [{ postId: params.postId }] : [])] }
          : {}),
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    return pickBest(
      candidates.filter((a) => matchesKeywords(params.text, a.keywords, a.matchType)),
    );
  }
}
