import { PostModel, ProfileModel } from "@/domain/models";
import { CountPostLikes, CountProfileLikes, LoadPostsByAuthor, LoadProfile } from "@/domain/usecases";
import { CustomParamError } from "@/presentation/errors";
import { httpResponse } from "@/presentation/helpers";
import { Controller, HttpResponse } from "@/presentation/protocols";

export class LoadProfileWithPostsController implements Controller {
    constructor(
        private readonly loadProfile: LoadProfile,
        private readonly loadPostsByAuthor: LoadPostsByAuthor,
        private readonly countProfileLikes: CountProfileLikes,
        private readonly countPostLikes: CountPostLikes
    ) {}

    async handle(request: LoadProfileWithPostsController.Request): Promise<LoadProfileWithPostsController.Result> {
        const profile = await this.loadProfile.perform({ profileId: request.profileId });
        if (!profile) return httpResponse.badRequest([new CustomParamError(`Profile with id ${request.profileId} not found.`)]);

        const profileLikesCount = await this.countProfileLikes.perform({ profileId: request.profileId });

        const posts = await this.loadPostsByAuthor.perform({ authorId: request.profileId });
        const postsWithLikes: Array<PostModel & { likesCount: number }> = await Promise.all(
            posts.map(async (post) => {
                const postLikesCount = await this.countPostLikes.perform({ postId: post.id });
                return { ...post, likesCount: postLikesCount };
            })
        );
        return httpResponse.ok({ ...profile, likesCount: profileLikesCount, posts: postsWithLikes });
    }
}

export namespace LoadProfileWithPostsController {
    export type Request = { profileId: string };
    export type Result = HttpResponse<ProfileModel & { likesCount: number; posts: Array<PostModel & { likesCount: number }> }>;
}
