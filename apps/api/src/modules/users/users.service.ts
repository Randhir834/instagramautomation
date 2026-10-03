import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import type { AuthUser } from '@repo/shared';
import { PrismaService } from '../../prisma/prisma.service';

const AUTH_USER_FIELDS = { id: true, email: true, name: true, username: true, plan: true } as const;

/** "Meera K." -> "meerak" */
function slugifyUsername(source: string): string {
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 20);
  return slug.length >= 3 ? slug : `creator${slug}`;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async getAuthUser(id: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: AUTH_USER_FIELDS });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Creates a user with a unique username derived from their name. */
  async create(data: {
    email: string;
    name: string;
    passwordHash?: string;
    googleId?: string;
  }): Promise<AuthUser> {
    const base = slugifyUsername(data.name || data.email.split('@')[0] || 'creator');
    for (let attempt = 0; attempt < 6; attempt++) {
      const username = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        return await this.prisma.user.create({
          data: { ...data, username },
          select: AUTH_USER_FIELDS,
        });
      } catch (err) {
        if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
          throw err;
        }
        const target = String(err.meta?.target ?? '');
        if (target.includes('email')) {
          throw new ConflictException('An account with this email already exists');
        }
        // username taken: try again with a suffix
      }
    }
    throw new ConflictException('Could not pick a username, please try again');
  }

  linkGoogle(userId: string, googleId: string): Promise<AuthUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
      select: AUTH_USER_FIELDS,
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; username?: string },
  ): Promise<AuthUser> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data,
        select: AUTH_USER_FIELDS,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('That username is taken');
      }
      throw err;
    }
  }
}
