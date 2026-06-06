import type { StartHereRepository, StartHereConfig } from '../../domain';

export type GetStartHere = () => Promise<StartHereConfig>;

export function makeGetStartHere(startHere: StartHereRepository): GetStartHere {
  return async () => {
    return startHere.get();
  };
}
