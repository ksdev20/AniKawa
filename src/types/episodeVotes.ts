export type Vote = -1 | 0 | 1;

export interface EpisodeVotesResponse {
  likes: number;

  dislikes: number;

  myVote: Vote;
}
