import type { FreebieRepository, Freebie } from '../../domain';

export type ListFreebies = () => Promise<Freebie[]>;

export function makeListFreebies(freebies: FreebieRepository): ListFreebies {
  return async () => {
    return freebies.list();
  };
}
